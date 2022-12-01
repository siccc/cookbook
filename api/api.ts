import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import fetch from 'cross-fetch';

const prisma = new PrismaClient();

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, query } = req;
  const userId = processAuthToken(req.headers.authorization);
  if (!userId) {
    return res.status(403);
  }
  // TODO: check if user existing?
  if (query.resource === 'recipes') {
    // LIST RECIPES
    if (method === 'GET' && !query.id) {
      let recipes;
      const limit = 16;
      const cursor = query.cursor as string ?? '';
      const cursorObj = cursor === '' ? undefined : { id: Number(cursor) };
      // SEARCH
      if (query.search && typeof query.search === 'string') {
        recipes = await prisma.recipe.findMany({
          take: limit,
          skip: query.cursor !== '' ? 1 : 0,
          cursor: cursorObj,
          orderBy: { id: 'asc' },
          where: {
            AND: [
              {
                title: {
                  search: preprocessSearchKeywords(query.search)
                }
              },
              {
                userId: { equals: userId }
              }
            ]
          },
          select: {
            id: true,
            title: true,
            category: true,
            imagePublicId: true
          },
        });
      } 
      // LIST ALL
      else {
        recipes = await prisma.recipe.findMany({
          take: limit,
          skip: query.cursor !== '' ? 1 : 0,
          cursor: cursorObj,
          orderBy: { id: 'asc' },
          where: {
            userId: { equals: userId }
          },
          select: {
            id: true,
            title: true,
            category: true,
            imagePublicId: true
          },
        });
      }
      return res.json({
        recipes,
        nextId: recipes.length === limit ? recipes[limit - 1].id : undefined
      });
    }
    // CREATE RECIPE
    else if (method === 'POST' && !query.id) {
      try {
        const recipe = await prisma.recipe.create({
          data: {
            ...req.body,
            userId,
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
          where: {
            id,
            userId
          },
          include: {
            tags: true,
          },
        });
        return res.json(recipe);
      } catch (error) {
        console.log(error);
        return res.status(404).send('');
      }
    }
    // UPDATE RECIPE
    else if (method === 'PUT' && query.id) {
      const id = Number(query.id);
      if (isNaN(id)) {
        return res.status(404).send('');
      }
      const recipe = await prisma.recipe.findUniqueOrThrow({
        where: { id }
      });
      if (recipe.userId !== userId) {
        return res.status(403);
      }
      // if image was removed or replaced
      if (!!recipe.imagePublicId && !req.body.imagePublicId || 
        (!!recipe.imagePublicId && !!req.body.imagePublicId && recipe.imagePublicId !== req.body.imagePublicId)) {
        // delete prev image from cloudinary
        try {
          if (recipe.imagePublicId) {
            await deleteImage(recipe.imagePublicId);
          }
        } catch (error) {
          return res.status(404).send('');
        }
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
        return res.status(404).send('');
      }
    }
    // DELETE RECIPE
    else if (method === 'DELETE' && query.id) {
      const id = Number(query.id);
      if (isNaN(id)) {
        return res.status(404).send('');
      }
      const recipe = await prisma.recipe.findUniqueOrThrow({
        where: { id }
      });
      if (recipe.userId !== userId) {
        return res.status(403);
      }
      // delete image from cloudinary
      try {
        if (recipe.imagePublicId) {
          await deleteImage(recipe.imagePublicId);
        }
      } catch (error) {
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

// -----------------------------------
// HELPERS
// -----------------------------------

const processAuthToken = (authHeader: string | undefined) => {
  let userId = '';
  if (authHeader && authHeader.startsWith('Basic ') && authHeader.length > 6){
    userId = authHeader.substring(6, authHeader.length);
  }
  return userId;
}

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

const deleteImage = async (publicId: string) => {
  // For demo purposes 
  // I don't want to upload these demo images for every user. I use these as common images and they can't be deleted.
  // -------------------
  if (publicId.includes('cookbook/default/')) {
    return Promise.resolve(null);
  }
  // -------------------
  const data = new URLSearchParams();
  data.append('public_ids', publicId);
  const response = await fetch(`https://${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}@api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/resources/image/upload`, {
    method: 'DELETE',
    body: data
  });
  return response;
}
