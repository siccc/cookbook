import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "vue-query";
import type { Recipe, RecipeExtract } from '@/types';
import type { Ref } from 'vue';

let searchText = '';
let categoryFilter = '';

// -----------------------------------
// LIST & SEARCH RECIPES -- WITH CURSOR
// -----------------------------------

type  infiniteQueryFetcherFnOptions = {
  searchKeywords: Ref<string>,
  category: Ref<string>,
  cursor: string
};

type InfiniteQueryResult = {
  recipes: RecipeExtract[],
  nextId: string | undefined
};

type TransformedInfiniteQueryResult = {
  pages: {
    recipes: RecipeExtract[],
    nextId: string | undefined
  }[],
  pageParams: unknown[]
};


const recipeListFetcher = async (
    { searchKeywords, category, cursor = '' }: infiniteQueryFetcherFnOptions
  ): Promise<InfiniteQueryResult> => {
  const search = searchKeywords.value ?
    searchKeywords.value.replace(/[&\/\\#,+()$~%.'":*?<>{}@]/g, '') : '';
  const cat = category.value === 'all' ? '' : category.value;
  try {
    const response = await fetch(`/api/recipes?search=${search}&category=${cat}&cursor=${cursor}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken()}`
      }
    })
    if (!response.ok) {
      throw new Error('An error occurred while fetching the recipes.');
    }
    return response.json();
  } catch (error) {
    console.log(error);
    throw new Error('An error occurred while fetching the recipes.');
  }
}

export function listRecipes(searchKeywords: Ref<string>, category: Ref<string>) {
  const {
    isLoading,
    isError,
    data,
    error,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useInfiniteQuery(
    ['recipes', searchKeywords, category],
    ({ pageParam }) => recipeListFetcher({
      searchKeywords, category, cursor: pageParam
    }),
    {
      getNextPageParam: (lastPage) => lastPage.nextId ?? false
    }
  );
  return { isLoading, isError, data, error, isFetchingNextPage, fetchNextPage, hasNextPage };
}

// -----------------------------------
// GET RECIPE
// -----------------------------------

const recipeFetcher = async (id: string | 'new'): Promise<Recipe> => {
  if (id === 'new') {
    let recipe:Recipe = {
      title: '',
      id: 'new',
      category: '',
      cookTime: 0,
      prepTime: 0,
      servings: '',
      cookedCount: 0,
      ingredients: '',
      steps: '',
      notes: '',
      imageName: '',
      imagePublicId: ''
    };
    return Promise.resolve(recipe);
  }
  try {
    const response = await fetch(`/api/recipes/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken()}`
      }
    });
    if (!response.ok) {
      throw new Error('An error occurred while fetching a recipe.');
    }
    return response.json();
  } catch (error) {
    console.log(error);
    throw new Error('An error occurred while fetching a recipe.');
  }
}

export function getRecipe(id: string | 'new') {
  const { isLoading, isError, isFetching, data, error, refetch } = useQuery(
    ['recipe', id],
    () => recipeFetcher(id)
  );
  return { isLoading, isError, isFetching, data, error, refetch };
}

// -----------------------------------
// CREATE RECIPE
// -----------------------------------

const recipeCreater = async (newRecipe: Recipe): Promise<Recipe> => {
  const recipe = JSON.parse(JSON.stringify(newRecipe));
  delete recipe.id;
  const response = await fetch(`/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authToken()}`
    },
    body: JSON.stringify(recipe),
  });
  if (!response.ok) {
    throw new Error('An error occurred while updating the recipe. Try again later.');
  }
  return response.json();
}

export function useCreateRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    recipeCreater, {
      onSettled: () => {
        queryClient.invalidateQueries(['recipes', searchText, 'all']);
      }
    }
  );
}

// -----------------------------------
// UPDATE RECIPE
// -----------------------------------

const recipeUpdater = async (updatedRecipe: Recipe): Promise<Recipe> => {
  try {
    const response = await fetch(`/api/recipes/${updatedRecipe.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken()}`
      },
      body: JSON.stringify(updatedRecipe),
    });
    if (!response.ok) {
      throw new Error('An error occurred while updating the recipe. Try again later.');
    }
    return response.json();
  } catch (error) {
    console.log(error);
    throw new Error('An error occurred while updating the recipe. Try again later.');
  }
}

export function useUpdateRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    recipeUpdater, {
      onMutate: async (updatedRecipe: Recipe) => {
        await queryClient.cancelQueries(['recipe', updatedRecipe.id]);

        const previousRecipe = queryClient.getQueryData<Recipe>(['recipe', updatedRecipe.id]);

        queryClient.setQueryData(['recipe', updatedRecipe.id], updatedRecipe);
        return { previousRecipe };
      },
      onError: (err, variables, context) => {
        if (context?.previousRecipe) {
          queryClient.setQueryData(['recipe', variables.id], context.previousRecipe);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['recipes', searchText, 'all']);
      }
    }
  );
}

// -----------------------------------
// DELETE RECIPE
// -----------------------------------

const recipeDeleter = async (deletedRecipe: Recipe): Promise<Recipe> => {
  try {
    const response = await fetch(`/api/recipes/${deletedRecipe.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${authToken()}`
      },
      body: JSON.stringify(deletedRecipe),
    });
    if (!response.ok) {
      throw new Error('An error occurred while deleting the recipe. Try again later.');
    }
    return Promise.resolve(deletedRecipe);
  } catch (error) {
    console.log(error);
    throw new Error('An error occurred while deleting the recipe. Try again later.');
  }
}

export function useDeleteRecipeMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    recipeDeleter, {
      onMutate: async (deletedRecipe: Recipe) => {
        await queryClient.cancelQueries(['recipes', searchText, categoryFilter]);
        const previousRecipes = queryClient.getQueryData<TransformedInfiniteQueryResult>(
          ['recipes', searchText, categoryFilter]
        );
        queryClient.setQueryData<TransformedInfiniteQueryResult|undefined>(
          ['recipes', searchText, categoryFilter], (prevData) => {
          if (!prevData) {
            return prevData;
          }
          return {
            ...prevData,
            pages: prevData.pages.map((page) => ({
              ...page,
              recipes: page.recipes.filter((recipe: RecipeExtract) => {
                return recipe.id !== deletedRecipe.id;
              })
            }))
          };
        });
        return { previousRecipes };
      },
      onError: (err, variables, context) => {
        if (context?.previousRecipes) {
          queryClient.setQueryData<TransformedInfiniteQueryResult>(
            ['recipes', searchText, categoryFilter], context.previousRecipes
          );
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['recipes', searchText, 'all']);
      }
    }
  );
}

// -----------------------------------
// GET RECIPE INSPIRATION
// -----------------------------------

const threeRandomRecipesFetcher = async (category: Ref<string>): Promise<Recipe[]> => {
  const cat = category.value === 'all' ? '' : category.value;
  try {
    const response = await fetch(`/api/recipe-selection?category=${cat}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authToken()}`
      }
    })
    if (!response.ok) {
      throw new Error('An error occurred while fetching the recipes.');
    }
    return response.json();
  } catch (error) {
    console.log(error);
    throw new Error('An error occurred while fetching the recipes.');
  }
}

export function getThreeRandomRecipes(category: Ref<string>) {
  const { isLoading, isError, data, error, isFetching, refetch } = useQuery(
    ['randomRecipes', category],
    () => threeRandomRecipesFetcher(category), {
      staleTime: Infinity
    }
  );
  return { isLoading, isError, data, error, isFetching, refetch };
}

// -----------------------------------
// SEARCH TEXT MEMO
// -----------------------------------

export function setSearchText(text: string) {
  searchText = text;
}

export function getSearchText(): string {
  return searchText;
}

// -----------------------------------
// CATEGORY FILTER MEMO
// -----------------------------------

export function setCategoryFilter(text: string) {
  categoryFilter = text;
}

export function getCategoryFilter(): string {
  return categoryFilter;
}

// -----------------------------------
// HELPERS
// -----------------------------------

function authToken() {
  return localStorage.getItem('userId') || '';
}
