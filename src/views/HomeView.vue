<script setup lang="ts">
import { reactive, onMounted } from 'vue';

type Recipe = {
  id: number,
  title: string
}

const state = reactive({
  recipes: [] as Recipe[]
});
onMounted(async () => {
  state.recipes = await (await fetch('/api/recipes')).json();
});
</script>

<template>
  <main class="p-4">
    <div class="text-center text-2xl">Recipes</div>
    <div v-for="recipe in state.recipes" :key="recipe.id">
      {{ recipe.title }} {{ recipe.id }}
    </div>
  </main>
</template>
