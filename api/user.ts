import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import path from 'path';
import verifyRecaptcha from './_verifyRecaptcha';

const prisma = new PrismaClient();
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, query } = req;
  // CREATE USER
  if (method === 'POST' && req.body.isDemoUser) {
    if (!req.body.recaptchaToken) {
      return res.status(400).send('Recaptcha token is required.');
    }

    // verify recaptcha token
    const verificationRes = await verifyRecaptcha(req.body.recaptchaToken);
    if (!verificationRes.success) {
      return res.status(403).send('Recaptcha verification failed.');
    }

    // generate userId
    try {
      const userId = generateId();
      const user = await prisma.user.create({
        data: { id: userId }
      });

      await setCloudinaryFolderForUser(userId);
      await createShoppingList(userId);
      await generateRecipes(userId);
      return res.json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).send('User creation failed.');
    }
  }
  // CREATE EMPTY USER
  else if (method === 'POST' && !req.body.isDemoUser) {
    if (!req.body.recaptchaToken) {
      return res.status(400).send('Recaptcha token is required.');
    }
    // verify recaptcha token
    const verificationRes = await verifyRecaptcha(req.body.recaptchaToken);
    if (!verificationRes.success) {
      return res.status(403).send('Recaptcha verification failed.');
    }
    try {
      const userId = generateId();

      const user = await prisma.user.create({
        data: { id: userId }
      });
      await setCloudinaryFolderForUser(userId);
      await createShoppingList(userId);

      return res.status(200).json(user);
    } catch (error) {
      console.log(error);
      return res.status(500).send('User creation failed.');
    }
  }
  // GET USER
  else if (method === 'GET' && query.id) {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: query.id as string }
      });
      return res.status(200).json(user);
    } catch (error) {
      return res.status(404).send('The requested user could not be found.');
    }
  }
  // DELETE USER
  else if (method === 'DELETE' && query.id) {
    const userId = query.id as string;
    try {
      await deleteCloudinaryFolderForUser(userId);
      const deleteUser = prisma.user.delete({
        where: { id: userId }
      });
      const deleteRecipes = prisma.recipe.deleteMany({
        where: { userId: userId }
      });
      const deleteShoppingList = prisma.shoppingList.deleteMany({
        where: { userId: userId }
      });
      const deleteTags = prisma.tag.deleteMany({
        where: { userId: userId }
      });
      await prisma.$transaction([deleteTags, deleteShoppingList, deleteRecipes, deleteUser]);
      return res.status(200).send('User deleted.');
    } catch (error) {
      return res.status(404).send('An error occurred while deleting the user.');
    }
  }
  return res.status(500).send('The request parameters are invalid.');
};

// -----------------------------------
// HELPERS
// -----------------------------------

const generateId = () => {
  return Math.random().toString(16).slice(2);
}

const setCloudinaryFolderForUser = (userId: string) => {
  return cloudinary.api.create_folder(`cookbook/demo/${userId}`);
}

const deleteCloudinaryFolderForUser = (userId: string) => {
  return cloudinary.api.delete_folder(`cookbook/demo/${userId}`);
}

// For demo purposes 
const generateRecipes = async (userId: string) => {
  const file = path.join(process.cwd(), 'prisma', 'recipes.json');
  const seedStr = readFileSync(file, 'utf8');
  const seedData = JSON.parse(seedStr);
  try {
    for (const recipe of seedData.recipes) {
      const d = await prisma.recipe.create({
        data: {
          id: generateId(),
          ...recipe,
          userId,
          tags: processTags(recipe.tags, userId)
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

const createShoppingList = async (userId: string) => {
  try {
    const id = generateId();
    const shoppingList = await prisma.shoppingList.create({
      data: {
        id: `sl${id}`,
        userId
      }
    });
  } catch (err) {
    console.log(err);
  }
  await prisma.$disconnect();
}

const processTags = (tags: { name: string }[], userId: string) => {
  if (tags && tags.length > 0) {
    return {
      connectOrCreate: tags.map((tag) => {
        return {
          where: { id: `${userId}:${tag.name}` },
          create: { 
            id: `${userId}:${tag.name}`,
            name: tag.name,
            userId
          }
        }
      })
    }
  }
}