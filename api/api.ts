import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import fetch from 'cross-fetch';
import { differenceBy, sampleSize } from 'lodash';
import { verifyAuth } from './_auth';
import { generateId } from './_utils';
import { generateRecipes } from './_generateRecipes';

const prisma = new PrismaClient();

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, query } = req;
  const accountId = await verifyAuth(req.headers.cookie, res);
  if (!accountId) {
    return res.status(401).send('Unauthorized');
  }
  if (query.resource === 'recipes' && query.mode === 'crud') {
    // LIST RECIPES
    if (method === 'GET' && !query.id) {
      let recipes;
      const limit = 20;
      const category = query.category as string ?? '';
      const cursor = query.cursor as string ?? '';
      const cursorObj = cursor === '' ? undefined : { id: cursor };
      // SEARCH
      if (query.search && typeof query.search === 'string') {
        recipes = await prisma.recipe.findMany({
          take: limit,
          skip: cursor !== '' ? 1 : 0, // skip the first one if cursor is not empty
          cursor: cursorObj,
          orderBy: { createdAt: 'desc' },
          where: {
            AND: [
              { title: { search: preprocessSearchKeywords(query.search) } },
              { category: { contains: category } },
              { accountId: { equals: accountId } }
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
          skip: cursor !== '' ? 1 : 0, // skip the first one if cursor is not empty
          cursor: cursorObj,
          orderBy: { createdAt: 'desc' },
          where: {
            AND: [
              { category: { contains: category } },
              { accountId: { equals: accountId } }
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
      return res.status(200).json({
        recipes,
        nextId: recipes.length === limit ? recipes[limit - 1].id : undefined
      });
    }
    // CREATE RECIPE
    else if (method === 'POST' && !query.id) {
      try {
        const recipe = await prisma.recipe.create({
          data: {
            id: generateId(),
            ...req.body,
            accountId,
            tags: processTags(accountId, req.body.tags)
          }
        });
        return res.status(200).json(recipe);
      } catch (error) {
        return res.status(500).send('Recipe creation failed.');
      }
    }
    // GET RECIPE BY ID
    else if (method === 'GET' && query.id) {
      try {
        const recipe = await prisma.recipe.findUniqueOrThrow({
          where: {
            id: query.id as string
          },
          include: {
            tags: true,
          },
        });
        return res.status(200).json(recipe);
      } catch (error) {
        return res.status(404).send('Recipe not found.');
      }
    }
    // UPDATE RECIPE
    else if (method === 'PUT' && query.id) {
      let prevRecipe;
      try {
        prevRecipe = await prisma.recipe.findUniqueOrThrow({
          where: { id: query.id as string },
          include: {
            tags: true,
          }
        });
      } catch (error) {
        return res.status(404).send('Recipe not found.');
      }
      if (prevRecipe.accountId !== accountId) {
        return res.status(403).send('Not authorized to update this recipe.');
      }
      // if image was removed or replaced
      if (!!prevRecipe.imagePublicId && !req.body.imagePublicId || 
        (!!prevRecipe.imagePublicId && !!req.body.imagePublicId &&
          prevRecipe.imagePublicId !== req.body.imagePublicId)) {
        // delete prev image from cloudinary
        try {
          if (prevRecipe.imagePublicId) {
            await deleteImage(prevRecipe.imagePublicId);
          }
        } catch (error) {
          return res.status(404).send('An error occurred while updating the recipe.');
        }
      }
      try {
        const recipe = await prisma.recipe.update({
          where: { id: query.id as string },
          data: {
            ...req.body,
            tags: processTags(accountId, req.body.tags, prevRecipe.tags)
          },
          include: {
            tags: true,
          }
        });
        return res.status(200).json(recipe);
      } catch (error) {
        return res.status(404).send('An error occurred while updating the recipe.');
      }
    }
    // DELETE RECIPE
    else if (method === 'DELETE' && query.id) {
      let recipe;
      try {
        recipe = await prisma.recipe.findUniqueOrThrow({
          where: { id: query.id as string },
          include: {
            tags: true
          }
        });
      } catch (error) {
        return res.status(404).send('Recipe not found.');
      }
      if (recipe.accountId !== accountId) {
        return res.status(403).send('Not authorized to delete this recipe.');
      }
      const disconnectTags = prisma.recipe.update({
        where: { id: recipe.id },
        data: {
          ...recipe,
          tags: processTags(accountId, [], recipe.tags)
        },
      });

      const deleteRecipe = prisma.recipe.delete({
        where: { id: recipe.id },
      });

      try {
        const imagePublicId = recipe.imagePublicId;
        await prisma.$transaction([disconnectTags, deleteRecipe]);
        // delete image from cloudinary
        if (imagePublicId) {
          await deleteImage(imagePublicId);
        }
        return res.status(200).json({ message: 'Recipe deleted.'});
      } catch (error) {
        return res.status(404).send('An error occurred while deleting the recipe.');
      }
    }
  } else if (method === 'GET' && query.resource === 'recipes' && query.mode === 'selection') {
    // get ids by category
    const category = query.category as string ?? '';
    const recipeIds = await prisma.recipe.findMany({
      where: {
        AND: [
          { category: { contains: category } },
          { accountId: { equals: accountId } }
        ]
      },
      select: {
        id: true
      }
    });
    // choose 3 random id
    const selectedIds = sampleSize(recipeIds, 3);
    // return with those recipes
    try {
      const recipes = await prisma.recipe.findMany({
        where: {
          id: { in: selectedIds.map(v => v.id) }
        },
        select: {
          id: true,
          title: true,
          category: true,
          imagePublicId: true
        },
      });
      return res.status(200).json(recipes);
    } catch (error) {
      return res.status(404).send('An error occurred while fetching the recipe selection.');
    }
  } else if (method === 'GET' && query.resource === 'recipes' && query.mode === 'generate') {
    try {
      await generateRecipes(accountId);
      return res.status(200).send({ message: 'Recipes generated.'});
    } catch (error) {
      return res.status(404).send('An error occurred while generating recipes.');
    }
  } else if (query.resource === 'shopping-list') {
    // CREATE SHOPPING LIST
    if (method === 'POST' && !query.id) {
      try {
        const shoppingList = await prisma.shoppingList.create({
          data: {
            ...req.body,
            accountId
          }
        });
        return res.status(200).json(shoppingList);
      } catch (error) {
        return res.status(404).send('An error occurred while creating the shopping list.');
      }
    }
    // GET SHOPPING LIST
    else if (method === 'GET' && !query.id) {
      try {
        const shoppingList = await prisma.shoppingList.findFirst({
          where: {
            accountId
          },
          select: {
            id: true,
            items: true
          }
        });
        return res.status(200).json(shoppingList);
      } catch (error) {
        return res.status(404).send('An error occurred while getting the shopping list.');
      }
    }
    // UPDATE SHOPPING LIST
    else if (method === 'PUT' && query.id) {
      let shoppingList;
      try {
        shoppingList = await prisma.shoppingList.findUniqueOrThrow({
          where: { id: query.id as string }
        });
      } catch (error) {
        return res.status(404).send('Shopping list not found.');
      }
      if (shoppingList.accountId !== accountId) {
        return res.status(403).send('Not authorized to update this shopping list.');
      }
      try {
        const shoppingList = await prisma.shoppingList.update({
          where: {
            id: query.id as string
          },
          data: {
            items: req.body
          }
        });
        return res.status(200).json(shoppingList);
      } catch (error) {
        return res.status(404).send('An error occurred while updating the shopping list.');
      }
    }
  }
  return res.status(400).send('The request parameters are invalid.');
};

// -----------------------------------
// HELPERS
// -----------------------------------

const preprocessSearchKeywords = (searchKeywords: string) => {
	const searchText = searchKeywords
    .trim()
		.split(/\s+/)
		.join('* & ');
  // console.log(searchText + '*');
  return searchText + '*';
}

const processTags = (accountId: string, newTags: {id: string, name: string}[], prevTags?: {id: string, name: string}[]) => {
  const tagsToDisconnect = differenceBy(prevTags, newTags, 'name');

  type TagOperations = {
    connectOrCreate?: { where: { id: string}, create: {id: string, name: string, accountId: string }}[],
    disconnect?: { id: string }[]
  }
  const tagOperations: TagOperations = {
  };
  if (newTags && newTags.length > 0) {
    tagOperations['connectOrCreate'] = newTags.map((tag) => {
      return {
        where: { id: `${accountId}:${tag.name}` },
        create: { 
          id: `${accountId}:${tag.name}`,
          name: tag.name,
          accountId
        }
      }
    });
  }
  if (tagsToDisconnect.length > 0){
    tagOperations['disconnect'] = tagsToDisconnect.map(tag => { return { id: tag.id }});
  }
  return tagOperations;
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
