import { useQuery, useMutation } from "vue-query";
import type { User } from '@/types';

// -----------------------------------
// GET USER
// -----------------------------------

const userFetcher = async (userId: string | null): Promise<User|null> => {
  if (!userId) {
    return Promise.resolve(null);
  }
  // fetch would return with 404 when the server is unreachable,
  // so we need to handle that case separately
  if (navigator.onLine === false) {
    throw new Error('503 Service unavailable');
  }
  const response = await fetch(`/api/user/${userId}`);
  if (!response.ok && response.status === 404) {
    localStorage.removeItem('userId');
    throw new Error('401 Unauthorized');
  } else if (!response.ok) {
    throw new Error('An error occurred while getting user.');
  }
  return response.json();
}

export function getUser() {
  const userId = localStorage.getItem('userId');
  const { isLoading, isError, isFetching, data, error, refetch } = useQuery(
    ['user', userId],
    () => userFetcher(userId)
  );
  return { isLoading, isError, isFetching, data, error, refetch };
}

// -----------------------------------
// CREATE USER
// -----------------------------------

const userCreater = async (recaptchaToken: string): Promise<User> => {
  const response = await fetch(`/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      recaptchaToken,
      isDemoUser: true
    })
  });
  if (!response.ok) {
    throw new Error('An error occurred while creating user.');
  }
  return response.json();
}

export function useCreateUserMutation() {
  return useMutation(userCreater, {
    onSuccess: (user) => {
      localStorage.setItem('userId', user.id);
    }
  });
}
