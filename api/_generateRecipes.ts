import { readFileSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { generateId } from './_utils';

const prisma = new PrismaClient();

export async function generateRecipes(accountId: string):Promise<void> {
  const file = path.join(process.cwd(), 'prisma', 'recipes.json');
  const seedStr = readFileSync(file, 'utf8');
  const seedData = JSON.parse(seedStr);
  try {
    for (const recipe of seedData.recipes) {
      const d = await prisma.recipe.create({
        data: {
          id: generateId(),
          ...recipe,
          accountId,
          tags: processTags(recipe.tags, accountId)
        },
        include: {
          tags: true,
        }
      });
      console.log(`Created recipe with id: ${d.id}`);
    }
  } catch (err) {
    console.log(err);
  }
  await prisma.$disconnect();
}

const processTags = (tags: { name: string }[], accountId: string) => {
  if (tags && tags.length > 0) {
    return {
      connectOrCreate: tags.map((tag) => {
        return {
          where: { id: `${accountId}:${tag.name}` },
          create: { 
            id: `${accountId}:${tag.name}`,
            name: tag.name,
            accountId
          }
        }
      })
    }
  }
}