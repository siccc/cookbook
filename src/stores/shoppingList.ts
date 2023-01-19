import { useQuery, useMutation, useQueryClient } from "vue-query";
import type { ShoppingList, ShoppingListItem } from '@/types';
import type { Ref } from "vue";

// -----------------------------------
// GET SHOPPING LIST
// -----------------------------------

const shoppingListFetcher = async (): Promise<ShoppingList|null> => {
  const response = await fetch(`/api/shopping-list`, {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${authToken()}`
    }
  });
  if (!response.ok) {
    throw new Error('An error occurred while getting the shopping list.');
  }
  return response.json();
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
  const response = await fetch(`/api/shopping-list/${shoppingList.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${authToken()}`
    },
    body: JSON.stringify(shoppingList.items),
  });
  if (!response.ok) {
    throw new Error('An error occurred while updating the shopping list. Try again later.');
  }
  return response.json();
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

function authToken() {
  return localStorage.getItem('userId') || '';
}
