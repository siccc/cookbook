<script setup lang="ts">
import { listRecipes } from '../stores/recipes';

const { isLoading, isError, isFetching, data, error, refetch } = listRecipes();
</script>

<template>
  <main class="p-4 max-w-screen-xl mx-auto">
    <div class="text-center text-2xl">Recipes</div>
    <div class="flex flex-row flex-wrap justify-center">
      <div v-if="isLoading" class="mt-8">Loading...</div>
      <div class="bg-white p-4" v-for="recipe in data" :key="recipe.id">
        <RouterLink :to="`/recipe/${recipe.id}`">
          <div class="h-72 w-60 bg-slate-100" />
          <div class="flex flex-row justify-between my-2">
            <span class="text-yellow-400 font-medium">{{ recipe.category }}</span>
            <span class="text-gray-400">{{ recipe.cookTime }} min</span>
          </div>
          <div class="uppercase my-2">{{ recipe.title }} {{ recipe.id }}</div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>
