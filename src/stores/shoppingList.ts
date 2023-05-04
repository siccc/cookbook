import { useQuery, useMutation, useQueryClient } from "vue-query";
import type { ShoppingList } from '@/types';
import fetchFromApi from "@/utils/fetchFromApi";

// -----------------------------------
// GET SHOPPING LIST
// -----------------------------------

const shoppingListFetcher = async (): Promise<ShoppingList|null> => {
  return fetchFromApi<ShoppingList|null>({
      url: `/api/shopping-list`,
      method: 'GET'
    },
    'An error occurred while getting the shopping list.'
  );
}

export function getShoppingList() {
  const { isLoading, isError, data, error } = useQuery(
    ['shopping-list'],
    () => shoppingListFetcher()
  );
  return { isLoading, isError, data, error };
}

// -----------------------------------
// UPDATE SHOPPING LIST
// -----------------------------------

const shoppingListUpdater = async (shoppingList: ShoppingList): Promise<ShoppingList> => {
  return fetchFromApi<ShoppingList>({
      url: `/api/shopping-list/${shoppingList.id}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(shoppingList.items),
    },
    'An error occurred while updating the shopping list. Try again later.'
  );
}

export function useUpdateShoppingListMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    shoppingListUpdater, {
      onMutate: async (updatedShoppingList: ShoppingList) => {
        await queryClient.cancelQueries(['shopping-list']);
        const previousShoppingList = queryClient.getQueryData<ShoppingList>(['shopping-list']);
        queryClient.setQueryData(['shopping-list'], updatedShoppingList);
        return { previousShoppingList };
      },
      onError: (err, variables, context) => {
        if (context?.previousShoppingList) {
          queryClient.setQueryData(['shopping-list'], context.previousShoppingList);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(['shopping-list']);
      }
    }
  );
}
