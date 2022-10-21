<script setup lang="ts">
import { listRecipes } from '@/stores/recipes';

const { isLoading, isError, isFetching, data, error, refetch } = listRecipes();
</script>

<template>
  <main class="p-4 max-w-screen-xl mx-auto">
    <div class="flex flex-row flex-wrap justify-center">
      <div v-if="isLoading" class="mt-8">Loading...</div>
      <div class="bg-white p-4" v-for="recipe in data" :key="recipe.id">
        <RouterLink :to="`/recipe/${recipe.id}`">
          <div class="h-72 w-60 bg-slate-100" />
          <div class="my-3">
            <span class="text-yellow-400 border-2 border-yellow-400 rounded-lg px-1 py-0.5">{{ recipe.category }}</span>
          </div>
          <div class="uppercase w-60">{{ recipe.title }}</div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
