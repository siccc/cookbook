import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, query } = req;
  if (query.resource === 'recipes') {
    // LIST RECIPES
    if (method === 'GET' && !query.id) {
      let recipes;
      // SEARCH
      if (query.search && typeof query.search === 'string') {
        recipes = await prisma.recipe.findMany({
          orderBy: { createdAt: 'asc' },
          where: {
            title: {
              search: preprocessSearchKeywords(query.search),
            }
          },
          select: {
            id: true,
            title: true,
            category: true,
            imageName: true
          },
        });
      } 
      // LIST ALL
      else {
        recipes = await prisma.recipe.findMany({
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            title: true,
            category: true,
            imageName: true
          },
        });
      }
      return res.json(recipes);
    }
    // CREATE RECIPE
    else if (method === 'POST' && !query.id) {
      try {
        const recipe = await prisma.recipe.create({
          data: {
            ...req.body,
            tags: createTags(req.body.tags)
          }
        });
        return res.json(recipe);
      } catch (error) {
        return res.status(404).send('');
      }
    }
    // GET RECIPE BY ID
    else if (method === 'GET' && query.id) {
      const id = Number(query.id);
      if (isNaN(id)) {
        return res.status(404).send('');
      }
      try {
        const recipe = await prisma.recipe.findUniqueOrThrow({
          where: { id },
          include: {
            tags: true,
          },
        });
        return res.json(recipe);
      } catch (error) {
        return res.status(404).send('');
      }
    }
    // UPDATE RECIPE
    else if (method === 'PUT' && query.id) {
      const id = Number(query.id);
      if (isNaN(id)) {
        return res.status(404).send('');
      }
      try {
        const recipe = await prisma.recipe.update({
          where: { id },
          data: {
            ...req.body,
            tags: processTags(req.body.tags)
          },
        });
        return res.json(recipe);
      } catch (error) {
        console.log(error)
        return res.status(404).send('');
      }
    }
    // DELETE RECIPE
    else if (method === 'DELETE' && query.id) {
      const id = Number(query.id);
      if (isNaN(id)) {
        return res.status(404).send('');
      }
      try {
        await prisma.recipe.delete({
          where: { id },
        });
        return res.json({ status: "ok" });
      } catch (error) {
        return res.status(404).send('');
      }
    }
  }
  return res.status(404).send('');
};

const preprocessSearchKeywords = (searchKeywords: string) => {
	return searchKeywords
    .trim()
		.split(/\s+/)
		.join(' & ');
}

const processTags = (tags: {id: string, name: string}[]) => {
  if (tags && tags.length > 0) {
    return {
      connectOrCreate: tags.map((tag) => {
        return {
          where: { id: tag.id || 0 },
          create: { name: tag.name }
        }
      })
    }
  } else {
    return {
      deleteMany: {}
    }
  }
}

const createTags = (tags: {name: string}[]) => {
  if (tags && tags.length > 0) {
    return {
      create: [
        ...tags
      ]
    };
  }
}