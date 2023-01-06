import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "vue-query";
import type { Recipe, RecipeExtract, DBRecipeExtract, DBRecipe } from '@/types';
import type { Ref } from 'vue';
import { useCloudinary } from '@/stores/cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';

const cloudinary = useCloudinary();
let searchText = '';

// -----------------------------------
// LIST & SEARCH RECIPES -- WITH CURSOR
// -----------------------------------

type  infiniteQueryFetcherFnOptions = {
  searchKeywords: Ref<string>,
  category: Ref<string>,
  cursor: string
};

type TransformDBRecipeExtractsFnOptions = {
  pages: DBInfiniteQueryResult[],
  pageParams: unknown[]
};

type DBInfiniteQueryResult = {
  recipes: DBRecipeExtract[],
  nextId: number | undefined
};

type TransformedInfiniteQueryResult = {
  pages: {
    recipes: RecipeExtract[],
    nextId: number | undefined
  }[],
  pageParams: unknown[]
};


const recipeListFetcher = async ({ searchKeywords, category, cursor = '' }: infiniteQueryFetcherFnOptions): Promise<DBInfiniteQueryResult> => {
  const search = searchKeywords.value ? searchKeywords.value : '';
  const cat = category.value === 'all' ? '' : category.value;
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
}

function transformDBRecipeExtractsForInfiniteList(data: TransformDBRecipeExtractsFnOptions): TransformedInfiniteQueryResult {
  const transformedRecipeExtracts = data.pages.map(page => {
    return {
      recipes: page.recipes.map(extract => {
        return {
          ...extract,
          imageUrl: getImageUrl(extract.imagePublicId)
        };
      }),
      nextId: page.nextId
    }
  });
  return { pages: transformedRecipeExtracts, pageParams: data.pageParams };
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
      select: transformDBRecipeExtractsForInfiniteList,
      getNextPageParam: (lastPage) => lastPage.nextId ?? false
    }
  );
  return { isLoading, isError, data, error, isFetchingNextPage, fetchNextPage, hasNextPage };
}

// -----------------------------------
// GET RECIPE
// -----------------------------------

const recipeFetcher = async (id: number | 'new'): Promise<DBRecipe> => {
  if (id === 'new') {
    let recipe:DBRecipe = {
      title: '',
      id: 0,
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
}

function transformRecipe(dbRecipe: DBRecipe): Recipe {
  const recipe = JSON.parse(JSON.stringify(dbRecipe)); // deep copy because of tags
  recipe.imageUrl = getImageUrl(recipe.imagePublicId);
  return recipe;
}

export function getRecipe(id: number | 'new') {
  const { isLoading, isError, isFetching, data, error, refetch } = useQuery(
    ['recipe', id],
    () => recipeFetcher(id), {
      select: transformRecipe
    }
  );
  return { isLoading, isError, isFetching, data, error, refetch };
}

// -----------------------------------
// CREATE RECIPE
// -----------------------------------

const recipeCreater = async (newRecipe: Recipe): Promise<Recipe> => {
  const dbRecipe = JSON.parse(JSON.stringify(newRecipe));
  delete dbRecipe.imageUrl;
  delete dbRecipe.id;
  const response = await fetch(`/api/recipes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authToken()}`
    },
    body: JSON.stringify(dbRecipe),
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
        queryClient.invalidateQueries(['recipes', '']);
      }
    }
  );
}

// -----------------------------------
// UPDATE RECIPE
// -----------------------------------

const recipeUpdater = async (updatedRecipe: Recipe): Promise<Recipe> => {
  const dbRecipe = JSON.parse(JSON.stringify(updatedRecipe));
  delete dbRecipe.imageUrl;
  const response = await fetch(`/api/recipes/${updatedRecipe.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authToken()}`
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
        queryClient.invalidateQueries(['recipes', '']);
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
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authToken()}`
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
      onMutate: async (deletedRecipe: Recipe) => {
        await queryClient.cancelQueries(['recipes', '']);
        const previousRecipes = queryClient.getQueryData<TransformedInfiniteQueryResult>(['recipes', '']);
        queryClient.setQueryData<TransformedInfiniteQueryResult|undefined>(['recipes', ''], (prevData) => {
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
          queryClient.setQueryData<TransformedInfiniteQueryResult>(['recipes', ''], context.previousRecipes);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['recipes', '']);
      }
    }
  );
}

// -----------------------------------
// GET RECIPE INSPIRATION
// -----------------------------------

const threeRandomRecipesFetcher = async (category: Ref<string>): Promise<DBRecipe[]> => {
  const cat = category.value === 'all' ? '' : category.value;
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
}

function transformRecipes(dbRecipes: DBRecipe[]): Recipe[] {
  return dbRecipes.map(dbRecipe => transformRecipe(dbRecipe));
}

export function getThreeRandomRecipes(category: Ref<string>) {
  const { isLoading, isError, data, error, isFetching, refetch } = useQuery(
    ['randomRecipes', category],
    () => threeRandomRecipesFetcher(category), {
      select: transformRecipes,
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
// HELPERS
// -----------------------------------

function getImageUrl(imagePublicId?: string) {
  let url:string = '';
  if (imagePublicId) {
    url = cloudinary.image(imagePublicId)
      .resize(
        fill().width(700).height(700)
      )
      .toURL();
  }
  return url;
}

function authToken() {
  return localStorage.getItem('userId') || '';
}
