import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

const seedData: Prisma.RecipeCreateInput[] = [
  {
    title: 'Spagetti bolognese sauce',
    servings: '4-5 servings',
    prepTime: 10,
    cookTime: 50,
    ingredients: `
- 1 tablespoon olive oil
- 1 onion, finely chopped
- 500 g italian tomato sauce
- 500 g minced beef/pork
- 1 tbsp dried oregano
- 1 tsp sugar
- 1 tsp salt
- pepper
- chilli powder, to taste
- 2 garlic cloves, finely chopped`,
    steps: `
1. Heat olive oil in a pan over medium high heat. Add onions and cook, stirring occasionally, until translucent.
2. Increase the heat to medium-high, add minced meat and cook until browned.
3. Stir in tomato sauce, finely chopped garlic, season with salt, sugar, chilli and pepper. Reduce heat to low; simmer, stirring occasionally, with lid slightly open. Cook for 40 minutes.
4. Add oregano to the sauce, cook for 10 more minutes and it's all done.
5. In a large pot of boiling salted water, cook pasta according to package instructions; drain well.
6. Serve with pasta and don't forget to put a lot of shredded gouda cheese on top.
`,
    notes: '',
    category: 'lunch'
  }
];

async function main() {
  console.log(`Start seeding ...`);
  for (const data of seedData) {
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