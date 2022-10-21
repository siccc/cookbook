import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, query } = req;
  if (query.resource === 'recipes') {
    // LIST RECIPES
    if (method === 'GET' && !query.id) {
      const recipes = await prisma.recipe.findMany({
        orderBy: { createdAt: "asc" },
      });
      return res.json(recipes);
    }
    // GET RECIPE BY ID
    else if (method === 'GET' && query.id) {
      if (typeof query.id === 'string') {
        const id = Number(query.id); // TODO: handle non-convertable string values
        const recipe = await prisma.recipe.findUnique({
          where: { id },
          include: {
            tags: true,
          },
        });
        return res.json(recipe);
      }
    }
  }
  return res.status(404).send('');
};
