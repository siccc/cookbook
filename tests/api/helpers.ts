import { createRequest, createResponse, type MockResponse } from 'node-mocks-http';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Mock } from 'vitest';
import userApiHandler from '../../api/user';
import recipesApiHandler from '../../api/api';
import type { Recipe, User } from '@/types';

//-------------------------- VERCEL HELPERS --------------------------

export function createMockVercelRequest(
  ...args: Parameters<typeof createRequest<VercelRequest>>
) {
  const req = createRequest<VercelRequest>(...args);
  return req;
}

export function createMockVercelResponse(
  ...args: Parameters<typeof createResponse<VercelResponse>>
) {
  const res = createResponse<VercelResponse>(...args);
  res.send = vi.fn(() => res);
  res.status = vi.fn(() => res);
  res.json = vi.fn((...args) => {
    return res.send(...args);
  });
  return res as MockResponse<VercelResponse> & {
    send: Mock;
    status: Mock;
    json: Mock;
  };
}

//-------------------------- USER HELPERS --------------------------

export async function createUser(recaptchaToken: string, isDemoUser: boolean) {
  const req = createMockVercelRequest({
    method: 'POST',
    url: '/api/user',
    body: {
      recaptchaToken: recaptchaToken,
      isDemoUser: isDemoUser
    }
  });
  const res = createMockVercelResponse();

  await userApiHandler(req, res);
  return res.json.mock.calls[0][0];
}

export async function deleteUser(userId: string) {
  const req = createMockVercelRequest({
    method: 'DELETE',
    url: '/api/user',
    query: {
      id: userId
    }
  });
  const res = createMockVercelResponse();

  await userApiHandler(req, res);
  return res.send.mock.calls[0][0];
}


//-------------------------- RECIPE HELPERS --------------------------


export type MockRecipe = Omit<Recipe, 'id'>;

export async function createRecipe(userId: string, recipe: MockRecipe) {
  const req = createMockVercelRequest({
    method: 'POST',
    url: '/api/recipes?resource=recipes',
    headers: {
      'Authorization': `Basic ${ userId }`
    },
    body: {
      ...recipe,
      userId: userId
    }
  });
  const res = createMockVercelResponse();

  await recipesApiHandler(req, res);
  return res.json.mock.calls[0][0];
}

export async function deleteRecipe(userId: string, recipeId: string) {
  const req = createMockVercelRequest({
    method: 'DELETE',
    url: `/api/recipes`,
    query: {
      resource: 'recipes',
      id: recipeId
    },
    headers: {
      'Authorization': `Basic ${ userId }`
    }
  });
  const res = createMockVercelResponse();

  await recipesApiHandler(req, res);
  return res.send.mock.calls[0][0];
}

