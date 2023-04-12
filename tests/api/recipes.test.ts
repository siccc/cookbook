import {
  createMockVercelRequest,
  createMockVercelResponse,
  createUser,
  deleteUser,
  createRecipe,
  deleteRecipe,
  type MockRecipe
} from './helpers';
import type { Recipe, User } from '@/types';
import recipesApiHandler from '../../api/api';

vi.mock('../../api/_verifyRecaptcha', () => {
  return {
    default: vi.fn(async (recaptchaToken) => {
      return {
        success: true,
        'error-codes': []
      }
    })
  }
});


describe('recipes api', () => {
  const recaptchaToken = 'test';
  const isDemoUser = false;
  const recipeBody: MockRecipe = {
    title: 'test',
    ingredients: 'test',
    category: 'test',
    steps: 'test',
    notes: '',
    imageName: '',
    imagePublicId: '',
    cookedCount: 0,
    servings: 'test'
  };

  let user: User;
  const fakeEntityId = '123';
  const fakeUserId = '123';

  beforeAll(async () => {
    user = await createUser(recaptchaToken, isDemoUser);
  });

  afterAll(async () => {
    if (user) {
      await deleteUser(user.id);
    }
  });

  // WRONG REQUESTS
  it('should return 401 if no auth header is provided', async () => {
    const req = createMockVercelRequest({
      method: 'POST',
      url: '/api/recipes',
      query: {
        resource: 'recipes'
      },
      body: {
        ...recipeBody,
        userId: user.id
      }
    });
    const res = createMockVercelResponse();

    await recipesApiHandler(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toBeCalledTimes(1);
  });

  it('should return 400 if no resource is provided', async () => {
    const req = createMockVercelRequest({
      method: 'POST',
      url: '/api/recipes',
      headers: {
        'Authorization': `Basic ${ user.id }`
      },
      body: {
        ...recipeBody,
        userId: user.id
      }
    });
    const res = createMockVercelResponse();

    await recipesApiHandler(req, res);

    expect(res.status).toBeCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.send).toBeCalledTimes(1);
  });

  // CREATE RECIPE
  describe('create recipe', () => {
    it('should return 500 if no body is provided for recipe creation', async () => {
      const req = createMockVercelRequest({
        method: 'POST',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'recipes'
        }
      });
      const res = createMockVercelResponse();
  
      await recipesApiHandler(req, res);
  
      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toBeCalledTimes(1);
    });
    
    it('should create a recipe and delete it', async () => {
      const createRecipeReq = createMockVercelRequest({
        method: 'POST',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'recipes'
        },
        body: {
          ...recipeBody,
          userId: user.id
        }
      });
      const createRecipeRes = createMockVercelResponse();
  
      await recipesApiHandler(createRecipeReq, createRecipeRes);
  
      expect(createRecipeRes.status).toBeCalledTimes(1);
      expect(createRecipeRes.status).toHaveBeenCalledWith(200);
      expect(createRecipeRes.json).toBeCalledTimes(1);
      expect(createRecipeRes.json.mock.calls[0][0]).toHaveProperty('id');
  
      const recipe: Recipe = createRecipeRes.json.mock.calls[0][0];
  
      const deleteRecipeReq = createMockVercelRequest({
        method: 'DELETE',
        url: `/api/recipes`,
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'recipes',
          id: recipe.id
        },
      });
      const deleteRecipeRes = createMockVercelResponse();
  
      await recipesApiHandler(deleteRecipeReq, deleteRecipeRes);
  
      expect(deleteRecipeRes.status).toBeCalledTimes(1);
      expect(deleteRecipeRes.status).toHaveBeenCalledWith(200);
      expect(deleteRecipeRes.send).toBeCalledTimes(1);
    });
  
    it('should create and delete a recipe with helpers', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const res = await deleteRecipe(user.id, recipe.id);
        expect(res).toBe('Recipe deleted.');
      }
    });
  });

  // GET RECIPE
  describe('get recipes', () => {
    it('should get a recipe', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            id: recipe.id
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('id');
  
        await deleteRecipe(user.id, recipe.id);
      }
    });
  
    it('should return error if the user tries to get a recipe that does not exist', async () => {
      const req = createMockVercelRequest({
        method: 'GET',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'recipes',
          id: fakeEntityId
        }
      });
      const res = createMockVercelResponse();
  
      await recipesApiHandler(req, res);
  
      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toBeCalledTimes(1);
    });
  
    it('should return error if the user tries to get a recipe that does not belong to them', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ fakeUserId }`
          },
          query: {
            resource: 'recipes',
            id: recipe.id
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.send).toBeCalledTimes(1);

        await deleteRecipe(user.id, recipe.id);
      }
    });
  });

  // UPDATE RECIPE
  describe('update recipes', () => {
    it('should update a recipe', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'PUT',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            id: recipe.id
          },
          body: {
            ...recipeBody,
            userId: user.id,
            title: 'Updated title'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('title');
        expect(res.json.mock.calls[0][0].title).toBe('Updated title');
  
        await deleteRecipe(user.id, recipe.id);
      }
    });
  
    it('should return error if the user tries to update a recipe that does not belong to them', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'PUT',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ fakeUserId }`
          },
          query: {
            resource: 'recipes',
            id: recipe.id
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toBeCalledTimes(1);
  
        await deleteRecipe(user.id, recipe.id);
      }
    });
  
    it('should return error if the user tries to update a recipe that does not exist', async () => {
      const req = createMockVercelRequest({
        method: 'PUT',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'recipes',
          id: fakeEntityId
        }
      });
      const res = createMockVercelResponse();
  
      await recipesApiHandler(req, res);
  
      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toBeCalledTimes(1);
    });

    it('should update a recipe\'s tags', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'PUT',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            id: recipe.id
          },
          body: {
            ...recipeBody,
            userId: user.id,
            tags: [
              { name: 'tag1' },
              { name: 'tag2' }
            ]
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('tags');
        expect(res.json.mock.calls[0][0].tags).toHaveLength(2);
  
        await deleteRecipe(user.id, recipe.id);
      }
    });

    it('should update tags if the user deleted some', async () => {
      const recipe = await createRecipe(user.id, {
        ...recipeBody,
        tags: [
          { name: 'tag1' },
          { name: 'tag2' },
          { name: 'tag3' }
        ]
      });
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'PUT',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            id: recipe.id
          },
          body: {
            ...recipeBody,
            userId: user.id,
            tags: [
              { name: 'tag1' } // tag2 and tag3 are deleted
            ]
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('tags');
        expect(res.json.mock.calls[0][0].tags).toHaveLength(1);
  
        await deleteRecipe(user.id, recipe.id);
      }
    });
  });

  // DELETE RECIPE
  describe('delete recipes', () => {
    it('should return error if the user tries to delete a recipe that does not belong to them', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      expect(recipe).toHaveProperty('id');
  
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'DELETE',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ fakeUserId }`
          },
          query: {
            resource: 'recipes',
            id: recipe.id
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.send).toBeCalledTimes(1);

        await deleteRecipe(user.id, recipe.id);
      }
    });
  
    it('should return error if the user tries to delete a recipe that does not exist', async () => {
      const req = createMockVercelRequest({
        method: 'DELETE',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'recipes',
          id: fakeEntityId
        }
      });
      const res = createMockVercelResponse();
  
      await recipesApiHandler(req, res);
  
      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toBeCalledTimes(1);
    });
  });

  // LIST RECIPES
  describe('list recipes', () => {
    it('should return all recipes by user', async () => {
      const recipe1 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 1'
      });
      const recipe2 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 2'
      });
      const recipe3 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 3'
      });
      if (recipe3) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('recipes');
        expect(res.json.mock.calls[0][0].recipes).toHaveLength(3);
  
        await deleteRecipe(user.id, recipe1.id);
        await deleteRecipe(user.id, recipe2.id);
        await deleteRecipe(user.id, recipe3.id);
      }
    });

    it('should return empty array if the user tries to list recipes that do not belong to them', async () => {
      const recipe = await createRecipe(user.id, recipeBody);
      if (recipe) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ fakeUserId }`
          },
          query: {
            resource: 'recipes'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('recipes');
        expect(res.json.mock.calls[0][0].recipes).toHaveLength(0);

        await deleteRecipe(user.id, recipe.id);
      }
    });

    it('should return with filtered recipe list if the user gives a search query', async () => {
      const recipe1 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'apple'
      });
      const recipe2 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'pear'
      });
      const recipe3 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'orange'
      });
      if (recipe3) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            search: 'apple'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('recipes');
        expect(res.json.mock.calls[0][0].recipes).toHaveLength(1);
        expect(res.json.mock.calls[0][0].recipes[0].title).toBe('apple');
  
        await deleteRecipe(user.id, recipe1.id);
        await deleteRecipe(user.id, recipe2.id);
        await deleteRecipe(user.id, recipe3.id);
      }
    });

    it('should return empty array if there is no recipe with the given search query', async () => {
      const recipe1 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'apple'
      });
      const recipe2 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'pear'
      });
      if (recipe2) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            search: 'orange'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('recipes');
        expect(res.json.mock.calls[0][0].recipes).toHaveLength(0);
  
        await deleteRecipe(user.id, recipe1.id);
        await deleteRecipe(user.id, recipe2.id);
      }
    });

    it('should handle multiple words and treat them as OR', async () => {
      const recipe1 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'apple'
      });
      const recipe2 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'pear'
      });
      if (recipe2) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            search: 'apple pear'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveProperty('recipes');
        expect(res.json.mock.calls[0][0].recipes).toHaveLength(2);
  
        await deleteRecipe(user.id, recipe1.id);
        await deleteRecipe(user.id, recipe2.id);
      }
    });
  });

  // LIST RECIPE SELECTION
  describe('get recipe selection', () => {
    it('should return with recipe selection', async () => {
      const recipe1 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 1'
      });
      const recipe2 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 2'
      });
      const recipe3 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 3'
      });
      if (recipe3) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            mode: 'selection'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveLength(3);
  
        await deleteRecipe(user.id, recipe1.id);
        await deleteRecipe(user.id, recipe2.id);
        await deleteRecipe(user.id, recipe3.id);
      }
    });

    it('should return an empty array if the user does not have any recipes', async () => {
      const req = createMockVercelRequest({
        method: 'GET',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'recipes',
          mode: 'selection'
        }
      });
      const res = createMockVercelResponse();
  
      await recipesApiHandler(req, res);

      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledTimes(1);
      expect(res.json.mock.calls[0][0]).toHaveLength(0);
    });

    it('should return less than 3 recipes if there are less than 3, that match for the given category', async () => {
      const recipe1 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 1',
        category: 'Breakfast'
      });
      const recipe2 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 2',
        category: 'Breakfast'
      });
      const recipe3 = await createRecipe(user.id, {
        ...recipeBody,
        title: 'Recipe 3',
        category: 'test'
      });
      if (recipe3) {
        const req = createMockVercelRequest({
          method: 'GET',
          url: '/api/recipes',
          headers: {
            'Authorization': `Basic ${ user.id }`
          },
          query: {
            resource: 'recipes',
            category: 'Breakfast',
            mode: 'selection'
          }
        });
        const res = createMockVercelResponse();
    
        await recipesApiHandler(req, res);
  
        expect(res.status).toBeCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toBeCalledTimes(1);
        expect(res.json.mock.calls[0][0]).toHaveLength(2);
  
        await deleteRecipe(user.id, recipe1.id);
        await deleteRecipe(user.id, recipe2.id);
        await deleteRecipe(user.id, recipe3.id);
      }
    });
  });

  // SHOPPING LIST
  describe('get shopping list', () => {
    it('should get the shopping list', async () => {
      const req = createMockVercelRequest({
        method: 'GET',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'shopping-list'
        }
      });
      const res = createMockVercelResponse();
  
      await recipesApiHandler(req, res);

      expect(res.status).toBeCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toBeCalledTimes(1);
      expect(res.json.mock.calls[0][0]).toHaveProperty('id');
    });

    it('should update the shopping list', async () => {
      const getShoppingListReq = createMockVercelRequest({
        method: 'GET',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'shopping-list'
        }
      });
      const getShoppingListRes = createMockVercelResponse();

      await recipesApiHandler(getShoppingListReq, getShoppingListRes);

      const shoppingListId = getShoppingListRes.json.mock.calls[0][0].id;

      const newItems = [
        { checked: true, name: 'test' },
        { checked: false, name: 'test2' }
      ];
      const updateShoppingListReq = createMockVercelRequest({
        method: 'PUT',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'shopping-list',
          id: shoppingListId
        },
        body: newItems
      });

      const updateShoppingListRes = createMockVercelResponse();

      await recipesApiHandler(updateShoppingListReq, updateShoppingListRes);

      expect(updateShoppingListRes.status).toBeCalledTimes(1);
      expect(updateShoppingListRes.status).toHaveBeenCalledWith(200);
      expect(updateShoppingListRes.json).toBeCalledTimes(1);
      expect(updateShoppingListRes.json.mock.calls[0][0]).toHaveProperty('items');
      expect(updateShoppingListRes.json.mock.calls[0][0].items).toHaveLength(2);
    });

    it('should return error if the user tries to update a shopping list that does not exist', async () => {
      const updateShoppingListReq = createMockVercelRequest({
        method: 'PUT',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'shopping-list',
          id: fakeEntityId
        },
        body: {
          items: [
            { checked: true, name: 'test' },
            { checked: false, name: 'test2' }
          ]
        }
      });

      const updateShoppingListRes = createMockVercelResponse();

      await recipesApiHandler(updateShoppingListReq, updateShoppingListRes);

      expect(updateShoppingListRes.status).toBeCalledTimes(1);
      expect(updateShoppingListRes.status).toHaveBeenCalledWith(404);
      expect(updateShoppingListRes.send).toBeCalledTimes(1);
    });

    it('should return error if the user tries to update a shopping list that does not belong to them', async () => {
      const getShoppingListReq = createMockVercelRequest({
        method: 'GET',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ user.id }`
        },
        query: {
          resource: 'shopping-list'
        }
      });
      const getShoppingListRes = createMockVercelResponse();

      await recipesApiHandler(getShoppingListReq, getShoppingListRes);

      const shoppingListId = getShoppingListRes.json.mock.calls[0][0].id;

      const updateShoppingListReq = createMockVercelRequest({
        method: 'PUT',
        url: '/api/recipes',
        headers: {
          'Authorization': `Basic ${ fakeUserId }}`
        },
        query: {
          resource: 'shopping-list',
          id: shoppingListId
        },
        body: {
          items: [
            { checked: true, name: 'test' },
            { checked: false, name: 'test2' }
          ]
        }
      });

      const updateShoppingListRes = createMockVercelResponse();

      await recipesApiHandler(updateShoppingListReq, updateShoppingListRes);

      expect(updateShoppingListRes.status).toBeCalledTimes(1);
      expect(updateShoppingListRes.status).toHaveBeenCalledWith(403);
      expect(updateShoppingListRes.send).toBeCalledTimes(1);
    });
  });
});
