import { PrismaClient, Prisma } from '@prisma/client';
import { seedRecipes } from './recipes';

const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);
  for (const data of seedRecipes) {
    const d = await prisma.recipe.create({
      data
    });
    console.log(`Created recipe with id: ${d.id}`);
  }
  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });