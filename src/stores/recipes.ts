import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "vue-query";
import type { Recipe, RecipeExtract, DBRecipeExtract, DBRecipe } from '@/types';
import type { Ref } from 'vue';
import { reactive, computed } from 'vue';
import { useCloudinary } from '@/stores/cloudinary';
import { fill } from '@cloudinary/url-gen/actions/resize';

const cloudinary = useCloudinary();

// -----------------------------------
// LIST & SEARCH RECIPES -- WITH CURSOR
// -----------------------------------

type  recipeFetcherOptions = {
  searchKeywords: Ref<string>,
  cursor: string
}

type DBQueryResult = {
  recipes: DBRecipeExtract[],
  nextId: number | undefined
};
const recipeListFetcher = async ({ searchKeywords, cursor = '' }: recipeFetcherOptions): Promise<DBQueryResult> => {
  const response = await fetch(`/api/recipes?search=${searchKeywords.value ? searchKeywords.value : ''}&cursor=${cursor}`)
  if (!response.ok) {
    throw new Error('An error occurred while fetching a recipe.');
  }
  return response.json();
}

type TransformRecipeOptions = {
  pages: DBQueryResult[],
  pageParams: unknown[]
}

type TransformedQueryResult = {
  pages: {
    recipes: RecipeExtract[],
    nextId: number | undefined
  }[],
  pageParams: unknown[]
};
function transformRecipeExtracts(data: TransformRecipeOptions): TransformedQueryResult {
  const transformedRecipeExtracts = data.pages.map(page => {
    return {
      recipes: page.recipes.map(extract => {
        return {
          ...extract,
          imageUrl: getImageUrl(extract.imageName)
        };
      }),
      nextId: page.nextId
    }
    
  });
  return { pages: transformedRecipeExtracts, pageParams: data.pageParams };
}

export function listRecipes(searchKeywords: Ref<string>) {
  const { isLoading, isError, data, error, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery(
    ['recipes', searchKeywords],
    ({ pageParam }) => recipeListFetcher({searchKeywords, cursor: pageParam}),
    {
      select: transformRecipeExtracts,
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
  const response = await fetch(`/api/recipes/${id}`);
  if (!response.ok) {
    throw new Error('An error occurred while fetching a recipe.');
  }
  return response.json();
}

function transformRecipe(dbRecipe: DBRecipe): Recipe {
  const recipe = JSON.parse(JSON.stringify(dbRecipe)); // deep copy because of tags
  recipe.imageUrl = getImageUrl(recipe.imageName);
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
      'Content-Type': 'application/json'
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
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, variables, context) => {
        console.log('Error', err);
      },
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
        await queryClient.cancelQueries(['recipes', '']);
        await queryClient.cancelQueries(['recipe', updatedRecipe.id]);
        // Snapshot the previous value
        const previousRecipes = queryClient.getQueryData<Recipe[]>(['recipes', '']);
        const previousRecipe = queryClient.getQueryData<Recipe>(['recipe', updatedRecipe.id]);
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
        return { previousRecipes, previousRecipe };
      },
      // If the mutation fails, use the context returned from onMutate to roll back
      onError: (err, variables, context) => {
        console.log('rolling back optimistic update', err);
        if (context?.previousRecipes) {
          queryClient.setQueryData<Recipe[]>(['recipes', ''], context.previousRecipes);
        }
        if (context?.previousRecipe) {
          queryClient.setQueryData(['recipe', variables.id], context.previousRecipe);
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
        await queryClient.cancelQueries(['recipes', '']);
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
        // TODO: This mess up the list
        // console.log('Invalidate recipe list');
        // queryClient.invalidateQueries(['recipes', '']);
      }
    }
  );
}

// -----------------------------------
// HELPERS
// -----------------------------------

function getImageUrl(imageName?: string) {
  let url:string = '';
  if (imageName) {
    url = cloudinary.image(`cookbook/${imageName}`)
      .resize(
        fill().width(700).height(700)
      )
      .toURL();
  }
  return url;
}