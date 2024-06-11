import { readFileSync } from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { generateId } from './_utils';

const libsql = createClient({
  url: `${process.env.DATABASE_URL}`,
  authToken: `${process.env.DB_AUTH_TOKEN}`,
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

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