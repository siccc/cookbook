<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menu from '@/components/Menu.vue';
import { getUser } from './stores/user';
import { useRouter } from 'vue-router';
import { computed, ref, watch } from 'vue';
import ErrorState from '@/components/ErrorState.vue';

const router = useRouter();
const { isError, error } = getUser();
const errorMessage = ref('');

const showMenu = computed(() => {
  return router.currentRoute.value.path !== '/login';
});

watch(error, (newValue) => {
  if (newValue instanceof Error) {
    if (newValue.message.includes('401')) {
      location.href = '/login';
    } else if (newValue.message.includes('503')) {
      errorMessage.value = `Looks like you're offline.
      Don't worry, you can still access recipes when you're back online.
      Please check your internet connection and try again.`;
    } else {
      errorMessage.value = newValue.message;
    }
  }
});

</script>

<template>
  <Menu v-if="showMenu" />
  <RouterView v-if="!isError" />
  <div v-if="isError && errorMessage" class="p-3 md:p-9 max-w-screen-sm mx-auto mt-14">
    <ErrorState :error="errorMessage" />
  </div>
</template>
