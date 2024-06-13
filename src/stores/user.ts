import { useQuery, useMutation, useQueryClient } from "vue-query";
import type { UserSettings, User } from '@/types';
import fetchFromApi from "@/utils/fetchFromApi";
import type { CallbackTypes } from "vue3-google-login";

// -----------------------------------
// GET USER
// -----------------------------------

type UserResult = Omit<User, 'settings'> & {
  settings: string
}

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
  const user: UserResult = await response.json();
  return deserializeUser(user);
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

type UserCreaterOptions = {
  type: 'demo'|'google',
  recaptchaToken?: string,
  googleCode?: CallbackTypes.CodePopupResponse
}

const userCreater = async (option: UserCreaterOptions): Promise<User|null> => {
  const { type, recaptchaToken, googleCode } = option;
  let body;
  if (type === 'google' && googleCode) {
    body = {
      googleCode: googleCode.code,
      settings: getDefaultUserSettings()
    };
  } else if (type === 'demo' && recaptchaToken) {
    body = {
      recaptchaToken,
      isDemoUser: true,
      userId: localStorage.getItem('userId') || '',
      settings: getDefaultUserSettings()
    };
    localStorage.setItem('isDemoUser', 'true');
  }
  const response = await fetch(`/api/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!response.ok && response.status === 403) {
    throw new Error('Unknown email address. Please request access for your Google account from the creator.');
  } else if (!response.ok) {
    throw new Error('An error occurred while creating user.');
  }
  const user: UserResult = await response.json();
  return deserializeUser(user);
}

export function useCreateUserMutation() {
  return useMutation(userCreater, {
    onSuccess: (user) => {
      if (user) {
        localStorage.setItem('userId', user.userId);
      }
    }
  });
}

// -----------------------------------
// UPDATE USER
// -----------------------------------

const userUpdater = async (updatedUser: User): Promise<User> => {
  return fetchFromApi<User>({
      url: `/api/user/${updatedUser.userId}`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(JSON.stringify(updatedUser.settings)) // serialize user settings
    },
    'An error occurred while updating the user. Try again later.'
  );
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();
  return useMutation(
    userUpdater, {
      onMutate: async (user: User) => {
        await queryClient.cancelQueries(['user', user.userId]);
        const previousUserData = queryClient.getQueryData<User>(['user', user.userId]);
        queryClient.setQueryData(['user', user.userId], user);
        return { previousUserData };
      },
      onError: (err, variables, context) => {
        if (context?.previousUserData) {
          queryClient.setQueryData(['user', variables.userId], context.previousUserData);
        }
      }
    }
  );
}

// -----------------------------------
// LOGOUT USER
// -----------------------------------

export async function userLogout(): Promise<void> {
  localStorage.removeItem('isDemoUser');
  const response = await fetch(`/api/user-logout`);
  if (!response.ok) {
    throw new Error('An error occurred while logging out user.');
  }
}

export function isDemoUser(): boolean {
  return localStorage.getItem('isDemoUser') === 'true';
}

// -----------------------------------
// SERIALIZATION
// -----------------------------------

const deserializeUser = (data: UserResult|null): User|null => {
  if (!data) {
    return null;
  }
  const parsedSettings: UserSettings = JSON.parse(data.settings);
  return {
    ...data,
    settings: parsedSettings
  }
}

// TODO: set better defaults
const getDefaultUserSettings = () => {
  return JSON.stringify({ lang: 'en', location: 'hu'})
}
