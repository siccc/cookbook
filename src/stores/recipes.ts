// useMutation, useQueryClient
import { useQuery, useMutation, useQueryClient } from "vue-query";
import type { Recipe } from '@/types';
import type { Ref } from 'vue';
import { reactive, computed } from 'vue';

// -----------------------------------
// LIST & SEARCH RECIPES
// -----------------------------------

const recipeListFetcher = async (searchKeywords: Ref<string>): Promise<Recipe[]> => {
  const response = await fetch(`/api/recipes?search=${searchKeywords.value ? searchKeywords.value : ''}`)
  if (!response.ok) {
    throw new Error('An error occurred while fetching a recipe.');
  }
  return response.json();
}

export function listRecipes(searchKeywords: Ref<string>) {
  const { isLoading, isError, isFetching, data, error, refetch } = useQuery(
    ['recipes', searchKeywords],
    () => recipeListFetcher(searchKeywords)
  );
  console.log('refetch recipe list');
  return { isLoading, isError, isFetching, data, error, refetch };
}

// -----------------------------------
// GET RECIPE
// -----------------------------------

const recipeFetcher = async (id: number): Promise<Recipe> => {
  const response = await fetch(`/api/recipes/${id}`);
  if (!response.ok) {
    throw new Error('An error occurred while fetching a recipe.');
  }
  return response.json();
}

function transformRecipe(recipe: Recipe) {
  recipe.totalTime = computed<number>(() => {
    return recipe.cookTime + (recipe.prepTime || 0);
  });
  return recipe;
}

export function getRecipe(id: number) {
  const { isLoading, isError, isFetching, data, error, refetch } = useQuery(
    ['recipe', id],
    () => recipeFetcher(id), {
      select: transformRecipe,
    }
  );
  return { isLoading, isError, isFetching, data, error, refetch };
}

// -----------------------------------
// UPDATE RECIPE
// -----------------------------------

const recipeUpdater = async (updatedRecipe: Recipe): Promise<Recipe> => {
  const dbRecipe = { ...updatedRecipe };
  delete dbRecipe.totalTime;
  const response = await fetch(`/api/recipes/${updatedRecipe.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(dbRecipe),
  });
  if (!response.ok) {
    throw new Error('An error occurred while updating the recipe. Try again later.');
  }
  return response.json();
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    recipeUpdater, {
      onMutate: async (updatedRecipe: Recipe) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['recipes']);
        // Snapshot the previous value
        const previousRecipes = queryClient.getQueryData<Recipe[]>(['recipes', '']);
        // Optimistically update to the new value
        if (previousRecipes) {
          queryClient.setQueryData<Recipe[]>(
            ['recipes', ''],
            previousRecipes.map((recipe: Recipe) => {
              if (recipe.id === updatedRecipe.id) {
                return updatedRecipe;
              }
              return recipe;
            })
          );
        }
        queryClient.setQueryData(['recipe', updatedRecipe.id], updatedRecipe);
        console.log('optimistic update on recipe list');
        return { previousRecipes, updatedRecipe };
      },
      onSuccess: (newData, recipe) => {
        queryClient.setQueryData(['recipe', recipe.id], newData);
      } ,
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, variables, context) => {
        console.log('rolling back optimistic update', err);
        if (context?.previousRecipes) {
          queryClient.setQueryData<Recipe[]>(['recipes', ''], context.previousRecipes);
        }
      },
      // Always refetch after error or success:
      onSettled: () => {
        // TODO
        // queryClient.invalidateQueries(['recipes', '']);
        // queryClient.invalidateQueries();
      }
    }
  );
}

// -----------------------------------
// DELETE RECIPE
// -----------------------------------

const recipeDeleter = async (deletedRecipe: Recipe): Promise<Recipe> => {
  const response = await fetch(`/api/recipes/${deletedRecipe.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(deletedRecipe),
  });
  if (!response.ok) {
    throw new Error('An error occurred while deleting the recipe. Try again later.');
  }
  return response.json();
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    recipeDeleter, {
      // When mutate is called:
      onMutate: async (deletedRecipe: Recipe) => {
        // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
        await queryClient.cancelQueries(['recipes']);
        // Snapshot the previous value
        const previousRecipes = queryClient.getQueryData<Recipe[]>(['recipes', '']);
        // Optimistically update to the new value
        if (previousRecipes) {
          queryClient.setQueryData<Recipe[]>(
            ['recipes', ''],
            previousRecipes.filter((recipe: Recipe) => {
              return recipe.id !== deletedRecipe.id;
            })
          );
        }
        console.log('optimistic update on recipe list');
        return { previousRecipes };
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, variables, context) => {
        console.log('rolling back optimistic update', err);
        if (context?.previousRecipes) {
          queryClient.setQueryData<Recipe[]>(['recipes', ''], context.previousRecipes);
        }
      },
      // Always refetch after error or success:
      onSettled: () => {
        // TODO: This messes up the list
        // console.log('Invalidate recipe list');
        // queryClient.invalidateQueries(['recipes', '']);
      }
    }
  );
}