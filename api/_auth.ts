import cookie, { serialize } from 'cookie';
import {
  verifyGoogleAuth,
  type GoogleTokens,
  type UserInfoResponse,
  exchangeCodeForTokens,
  getUserInfo
} from './_googleAuth';
import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'
import type { VercelResponse } from '@vercel/node';

const libsql = createClient({
  url: `${process.env.DATABASE_URL}`,
  authToken: `${process.env.DB_AUTH_TOKEN}`,
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

type GoogleUserSession = {
  type: 'google'
} & GoogleTokens;

type DemoUserSession = {
  type: 'demo',
  demoUserId: string,
}

type Session = GoogleUserSession | DemoUserSession;

export async function verifyAuth(cookies: string | undefined, res: VercelResponse): Promise<string | undefined> {
  let accountId;
  if (cookies) {
    const cookiesObject = cookie.parse(cookies);
    if (cookiesObject.session) {
      const session = cookiesObject.session;
      const decodedSession = Buffer.from(session, 'base64').toString();
      const parsedSession = JSON.parse(decodedSession);

      // DEMO USER
      if (parsedSession.type === 'demo') {
        accountId = (parsedSession as DemoUserSession).demoUserId;
      }
      // GOOGLE USER
      else if (parsedSession.type === 'google') {
        const { userId: googleUserId, newTokens } = await verifyGoogleAuth(parsedSession as GoogleUserSession);
        // refresh session cookies if needed
        if (newTokens) {
          console.log('refreshing session cookies');
          const sessionCookie = createGoogleSessionCookie(newTokens);
          res.setHeader('Set-Cookie', [sessionCookie]);
        }
        // get user by googleId
        // console.log('googleUserId: ', googleUserId);
        try {
          const account = await prisma.account.findFirstOrThrow({
            where: {
              users: {
                some: {
                  googleId: googleUserId,
                },
              },
            },
            include: {
              users: true,
            },
          });
          accountId = account.id;
        } catch (error) {
          console.log(error);
          throw new Error('User not found.');
        }
      }
    }
  }
  // undefined if cookies or session in cookie are not found
  return accountId;
}

export async function loginWithGoogle(code: string, res: VercelResponse): Promise<UserInfoResponse> {
  const tokens = await exchangeCodeForTokens(code);
  const userInfo = await getUserInfo(tokens.accessToken);
  const sessionCookie = createGoogleSessionCookie(tokens);
  const isAuthCookie = createIsAuthenticatedCookie();
  res.setHeader('Set-Cookie', [sessionCookie, isAuthCookie]);
  return userInfo;
}

export function loginDemoUser(userId: string, res: VercelResponse): void {
  const sessionCookie = createDemoSessionCookie(userId);
  const isAuthCookie = createIsAuthenticatedCookie(); // cookie for isAuth
  res.setHeader('Set-Cookie', [sessionCookie, isAuthCookie]);
}

export function logoutUser (res: VercelResponse): void {
  const sessionCookie = serialize('session', '', {
    httpOnly: true,
    maxAge: -1,
    path: '/'
  });
  const isAuthCookie = serialize('isAuthenticated', 'false', {
    httpOnly: false,
    maxAge: -1,
    path: '/'
  });
  res.setHeader('Set-Cookie', [sessionCookie, isAuthCookie]);
}

// -----------------------------------
// HELPERS
// -----------------------------------

function createGoogleSessionCookie(tokens: GoogleTokens): string {
  const session: Session = {
    type: 'google',
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
    refreshToken: tokens.refreshToken,
    expiresIn: tokens.expiresIn
  };
  const encodedSession = encodeSession(session);
  const sessionCookie = serialize('session', encodedSession, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  });
  return sessionCookie;
}

function createDemoSessionCookie(userId: string): string {
  const session: Session = {
    type: 'demo',
    demoUserId: userId
  };
  const encodedSession = encodeSession(session);
  const sessionCookie = serialize('session', encodedSession, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/'
  });
  return sessionCookie;
}

function createIsAuthenticatedCookie(): string {
  const isAuthCookie = serialize('isAuthenticated', 'true', {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/'
  });
  return isAuthCookie;
}

function encodeSession(session: Session): string {
  const sessionString = JSON.stringify(session);
  const encodedSession = Buffer.from(sessionString).toString('base64');
  return encodedSession;
}