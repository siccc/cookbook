import { PrismaClient, Prisma } from '@prisma/client';
import { seedRecipes } from './recipes';

const prisma = new PrismaClient();

async function main() {
  const recipeForBulk = {
    title: 'Test recipe',
    servings: '1',
    prepTime: 5,
    cookTime: 0,
    ingredients: '- 1 ingredient',
    notes: '',
    category: 'snack',
    steps: 'Mix all ingredients.',
    imageName: ''
  }
  console.log(`Start seeding ...`);
  for (const data of seedRecipes) {
    const d = await prisma.recipe.create({
      data
    });
    console.log(`Created recipe with id: ${d.id}`);
  }
  for (let i = 0; i < 100; i++) {
    const d = await prisma.recipe.create({
      data: recipeForBulk
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