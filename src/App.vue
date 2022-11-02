<script setup lang="ts">
import { RouterView } from 'vue-router';
import Menu from '@/components/Menu.vue';
import Loader from '@/components/Loader.vue';
import { ref, onMounted } from 'vue';

const loading = ref(true);

onMounted(() => {
  setTimeout(() => {
    loading.value = false
  }, 2000);
})
</script>

<template>
  <Loader v-if="loading"/>
  <Menu />
  <RouterView class="my-14" />
</template>

