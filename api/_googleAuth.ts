import { OAuth2Client, type Credentials } from 'google-auth-library';

const clientOptions = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: 'postmessage',
};

export type UserInfoResponse = {
  sub: string,
  name: string,
  given_name: string,
  family_name: string,
  picture: string,
  email: string,
}

export type GoogleTokens = {
  accessToken: string,
  idToken: string,
  refreshToken: string,
  expiresIn: number,
}

// Exchange code for tokens when user logs in with Google
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const client = new OAuth2Client(clientOptions);
  try {
    const { tokens } = await client.getToken(code);
    return convertCredentialsToTokens(tokens);
  } catch (error) {
    console.log(error);
    throw new Error('Google code verification failed.');
  }
}

type GoogleAuthResponse = {
  userId: string,
  newTokens?: GoogleTokens,
}
// Verify id token and refresh tokens when needed
export async function verifyGoogleAuth(session: GoogleTokens): Promise<GoogleAuthResponse> {
  const client = new OAuth2Client(clientOptions);
  client.setCredentials({
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
  });
  let idToken = session.idToken;
  let tokens: GoogleTokens | undefined;

  // If token is expiring, refresh it
  if (isTokenExpiring(session.expiresIn)) {
    try {
      // google-auth-library -> oauth2client
      const refreshAccessTokenRes = await client.refreshAccessToken();
      // set new id token
      tokens = convertCredentialsToTokens(refreshAccessTokenRes.credentials);
      idToken = tokens.idToken;
      console.log('refreshed tokens');
    } catch (error) {
      console.log(error);
      throw new Error('Google id token verification failed.');
    }
  }
  if (!idToken) throw new Error('Google id token verification failed.');
  const userId = await verifyIdToken(idToken);
  return { userId, newTokens: tokens };
}


// Get user data from Google
export async function getUserInfo(accessToken: string): Promise<UserInfoResponse> {
  const client = new OAuth2Client(clientOptions);
  try {
    client.setCredentials({ access_token: accessToken });
    const userinfo = await client.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });
    return userinfo.data as UserInfoResponse;
  } catch (error) {
    console.log(error);
    throw new Error('Google get user info request failed.');
  }
}

// -----------------------------------
// HELPERS
// -----------------------------------

async function verifyIdToken(idToken: string): Promise<string> {
  const client = new OAuth2Client(clientOptions);
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload) throw new Error('Google id token verification failed.');
    const userId = payload['sub'];
    return userId;
  } catch (error) {
    console.log(error);
    throw new Error('Google id token verification failed.');
  }
}

function isTokenExpiring(expiry_date: number | null | undefined): boolean {
  // 5 mins before expiry
  return expiry_date ? expiry_date - new Date().getTime() < 5 * 60 * 1000 : false;
}

function convertCredentialsToTokens(credentials: Credentials): GoogleTokens {
  if (!credentials.access_token || !credentials.id_token
    || !credentials.refresh_token || !credentials.expiry_date) {
    throw new Error('Google credentials missing.');
  }
  return {
    accessToken: credentials.access_token,
    idToken: credentials.id_token,
    refreshToken: credentials.refresh_token,
    expiresIn: credentials.expiry_date
  }
}
