import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient, type Account, type User } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import { v2 as cloudinary } from 'cloudinary';
import verifyRecaptcha from './_verifyRecaptcha';
import { loginWithGoogle, loginDemoUser, logoutUser, verifyAuth } from './_auth';
import { generateRecipes } from './_generateRecipes'
import { generateId } from './_utils';

const libsql = createClient({
  url: `${process.env.DATABASE_URL}`,
  authToken: `${process.env.DB_AUTH_TOKEN}`,
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export default async (req: VercelRequest, res: VercelResponse) => {
  const { method, query } = req;
  console.log("USER", query)
  if (method === 'GET' && query.logout) {
    logoutUser(res);
    return res.status(200).send('OK');
  }
  // CREATE DEMO USER
  else if (method === 'POST' && req.body.isDemoUser) {
    if (!req.body.recaptchaToken) {
      return res.status(400).send('Recaptcha token is required.');
    }

    // verify recaptcha token
    const verificationRes = await verifyRecaptcha(req.body.recaptchaToken);
    if (!verificationRes.success) {
      return res.status(403).send('Recaptcha verification failed.');
    }

    try {
      const accountId = generateId();
      const account = await prisma.account.create({
        data: {
          id: accountId,
          users: {
            create: {
              id: generateId('user'),
              settings: req.body.settings
            }
          }
        },
        include: {
          users: true,
        },
      });

      await setCloudinaryFolderForUser(accountId);
      await createShoppingList(accountId);
      await generateRecipes(accountId);

      loginDemoUser(accountId, res);
      const userResponse = await createUserResponse(account, req, res);
      return res.status(200).json(userResponse);
    } catch (error) {
      console.log(error);
      return res.status(500).send('User creation failed.');
    }
  }
  // CREATE EMPTY DEMO USER (for testing)
  else if (method === 'POST' && !req.body.isDemoUser && !req.body.googleCode) {
    if (!req.body.recaptchaToken) {
      return res.status(400).send('Recaptcha token is required.');
    }
    // verify recaptcha token
    const verificationRes = await verifyRecaptcha(req.body.recaptchaToken);
    if (!verificationRes.success) {
      return res.status(403).send('Recaptcha verification failed.');
    }
    // check if has accountId in query -> if so, check if user exists -> set session cookie
    try {
      const accountId = generateId();

      const account = await prisma.account.create({
        data: {
          id: accountId,
          users: {
            create: {
              id: generateId('user'),
              settings: req.body.settings
            }
          }
        },
        include: {
          users: true,
        }
      });
      await setCloudinaryFolderForUser(accountId);
      await createShoppingList(accountId);
      const userResponse = await createUserResponse(account, req, res);
      return res.status(200).json(userResponse);
    } catch (error) {
      console.log(error);
      return res.status(500).send('User creation failed.');
    }
  }
  // INIT GOOGLE USER
  else if (method === 'POST' && !req.body.isDemoUser && req.body.googleCode) {
    try {
      const userInfo = await loginWithGoogle(req.body.googleCode, res);

      // check if the user is already in the database (added manually) = whitelisted
      const account = await prisma.account.findFirstOrThrow({
        where: {
          users: {
            some: {
              email: userInfo.email,
            },
          },
        }
      });

      const updatedAccount = await prisma.account.update({
        where: {
          id: account.id,
        },
        data: {
          users: {
            updateMany: {
              where: {
                email: userInfo.email,
              },
              data: {
                email: userInfo.email,
                firstName: userInfo.given_name,
                lastName: userInfo.family_name,
                displayName: userInfo.name,
                profileImage: userInfo.picture,
                googleId: userInfo.sub,
                settings: req.body.settings
              },
            },
          },
        },
        include: {
          users: true,
        },
      });

      await setCloudinaryFolderForUser(account.id);
      await createShoppingList(account.id);
      // -----------------------------------
      const userResponse = await createUserResponse(updatedAccount, req, res);
      return res.status(200).json(userResponse);
    } catch (error) {
      console.log(error);
      return res.status(403).send('User verification failed.');
    }
  }
  // GET USER
  else if (method === 'GET' && query.id) {
    try {
      const account = await prisma.account.findUniqueOrThrow({
        where: { id: query.id as string },
        include: {
          users: true,
        }
      });
      const userResponse = await createUserResponse(account, req, res);
      return res.status(200).json(userResponse);
    } catch (error) {
      return res.status(404).send('The requested user could not be found.');
    }
  }
  // UPDATE USER
  else if (method === 'PUT' && query.id) {
    const accountId = query.id as string;
    try {
      const account = await prisma.account.findUniqueOrThrow({
        where: { id: accountId },
        include: {
          users: true,
        }
      });
      const updatedUserResponse = await updateUserResponse(account, req, res);
      return res.status(200).json(updatedUserResponse);
    } catch (error) {
      return res.status(404).send('An error occurred while updating the user.');
    }
  }
  // DELETE ACCOUNT
  else if (method === 'DELETE' && query.id) {
    const accountId = query.id as string;
    try {
      await deleteCloudinaryFolderForUser(accountId);
      const deleteAccount = prisma.account.delete({
        where: { id: accountId }
      });
      const deleteRecipes = prisma.recipe.deleteMany({
        where: { accountId: accountId }
      });
      const deleteShoppingList = prisma.shoppingList.deleteMany({
        where: { accountId: accountId }
      });
      const deleteTags = prisma.tag.deleteMany({
        where: { accountId: accountId }
      });
      await prisma.$transaction([deleteTags, deleteShoppingList, deleteRecipes, deleteAccount]);
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

const setCloudinaryFolderForUser = async (accountId: string) => {
  // won't create a new folder if this one exists already
  return cloudinary.api.create_folder(`cookbook/demo/${accountId}`);
}

const deleteCloudinaryFolderForUser = (accountId: string) => {
  return cloudinary.api.delete_folder(`cookbook/demo/${accountId}`);
}

const createShoppingList = async (accountId: string) => {
  try {
    const shoppingListFound = await prisma.shoppingList.findFirst({
      where: { accountId }
    });
    if (!shoppingListFound) {
      const id = generateId();
      await prisma.shoppingList.create({
        data: {
          id: `sl${id}`,
          accountId
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
  await prisma.$disconnect();
}

type ExtendedAccount = {
  users?: User[]
} & Account;

const createUserResponse = async (account: ExtendedAccount, req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await getUserByAccount(account, req, res);
    if (!user || !account.users) {
      throw new Error();
    }
    return {
      userId: account.id,
      isMultiAccount: account.users.length > 1,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: user.displayName,
      profileImage: user.profileImage,
      settings: user.settings
    };
  } catch {
    throw new Error();
  }
}

const updateUserResponse = async (account: ExtendedAccount, req: VercelRequest, res: VercelResponse) => {
  try {
    const user = await getUserByAccount(account, req, res);
    if (!user || !account.users) {
      throw new Error();
    }
    const newUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        settings: req.body
      },
    });
    return {
      userId: account.id,
      isMultiAccount: account.users.length > 1,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      displayName: newUser.displayName,
      profileImage: newUser.profileImage,
      settings: newUser.settings
    };
  } catch {
    throw new Error();
  }
}

const getUserByAccount = async (account: ExtendedAccount, req: VercelRequest, res: VercelResponse) => {
  const { googleUserId } = await verifyAuth(req.headers.cookie, res);
  let user;
  if (!account.users || account.users.length === 0) {
    throw new Error();
  }
  if (googleUserId) {
    user = account.users?.find(u => u.googleId === googleUserId)
  } else {
    user = account.users[0]
  }
  return user;
}
