import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, query } = req;
  if (query.resource === 'recipes') {
    if (method === 'GET' && !query.id) {
      const recipes = await prisma.recipe.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.json(recipes);
    }
  }
  return res.status(404).send('');
};
