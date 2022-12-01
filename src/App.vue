<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menu from '@/components/Menu.vue';
import { getUser } from './stores/user';
import { useRouter } from 'vue-router';
import { computed, watch } from 'vue';

const router = useRouter();
const { isError } = getUser();

const showMenu = computed(() => {
  return router.currentRoute.value.path !== '/login';
});

watch(isError, (newValue) => {
  if (newValue === true) {
    router.push('/login');
  }
});

</script>

<template>
  <Menu v-if="showMenu" />
  <RouterView :class="{ 'my-14': showMenu }" />
</template>
