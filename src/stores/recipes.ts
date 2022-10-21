// useMutation, useQueryClient
import { useQuery } from "vue-query";
import type { Recipe } from '@/types';
import { reactive, computed } from 'vue';

// const queryClient = useQueryClient(); // use in fn, I need it when I'm using optimistic updates

// -----------------------------------
// LIST RECIPES
// -----------------------------------

const recipeListFetcher = async (): Promise<Recipe[]> => {
  const result = await fetch('/api/recipes').then((response) =>
    response.json()
  );
  return await result.map((recipe: Recipe) => {
    // transform data if needed
    console.log(recipe);
    return recipe;
  });
}

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

const recipeFetcher = async (id: string): Promise<Recipe> => {
  const recipe = await fetch(`/api/recipes/${id}`).then((response) =>
    response.json()
  );
  recipe.totalTime = computed<number>(() => {
    return recipe.cookTime + (recipe.prepTime || 0);
  });
  return recipe;
}

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

