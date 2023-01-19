import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import fetch from 'cross-fetch';
import { v2 as cloudinary } from 'cloudinary';
import { readFileSync } from 'fs';
import path from 'path';

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
  if (method === 'POST') {
    if (!req.body.recaptchaToken) {
      return res.status(400).json({message: "recaptchaToken is required"});
    }

    // verify recaptcha token
    const verificationRes = await verifyRecaptcha(req.body.recaptchaToken);
    if (!verificationRes.success) {
      console.log(verificationRes['error-codes']);
      return res.status(404).send('');
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
      return res.status(404).send('');
    }
  }
  // GET USER
  else if (method === 'GET' && query.id) {
    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: query.id as string }
      });
      return res.json(user);
    } catch (error) {
      return res.status(404).send('');
    }
  }
  return res.status(404).send('');
};

// -----------------------------------
// HELPERS
// -----------------------------------

type RecaptchaResponse = {
  'success': true|false,
  'challenge_ts': string,
  'hostname': string,
  'error-codes'?: string[]
}
const verifyRecaptcha = async (recaptchaToken: string): Promise<RecaptchaResponse> => {
  const data = new URLSearchParams();
  data.append('secret', process.env.RECAPCHA_SECRET_KEY_INVISIBLE || '');
  data.append('response', recaptchaToken);
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body: data
  });
  return response.json();
}

const generateId = () => {
  return Math.random().toString(16).slice(2);
}

const setCloudinaryFolderForUser = (userId: string) => {
  return cloudinary.api.create_folder(`cookbook/demo/${userId}`);
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
          ...recipe,
          tags: processTags(recipe.tags, userId),
          userId
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
    console.log(`Created shopping list with id: ${shoppingList.id}`);
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