// useMutation, useQueryClient
import { useQuery } from "vue-query";
import type { Recipe } from '@/types';

// const queryClient = useQueryClient(); // use in fn, I need it when I'm using optimistic updates

// -----------------------------------
// LIST RECIPES
// -----------------------------------

const recipeListFetcher = async (): Promise<Recipe[]> =>
  await fetch('/api/recipes').then((response) =>
    response.json()
  );

export function listRecipes() {
  const { isLoading, isError, isFetching, data, error, refetch } = useQuery(
    ['recipes'],
    recipeListFetcher
  );
  return { isLoading, isError, isFetching, data, error, refetch };
}

// -----------------------------------
// GET RECIPE
// -----------------------------------

const recipeFetcher = async (id: string): Promise<Recipe> =>
  await fetch(`/api/recipes/${id}`).then((response) =>
    response.json()
  );

export function getRecipe(id: string) {
  const { isLoading, isError, isFetching, data, error, refetch } = useQuery(
    ['recipes', id],
    () => recipeFetcher(id),
    {
      staleTime: 5 * 60 * 1000
    }
  );
  return { isLoading, isError, isFetching, data, error, refetch };
}

// -----------------------------------
// UPDATE RECIPE
// -----------------------------------


// -----------------------------------
// DELETE RECIPE
// -----------------------------------

