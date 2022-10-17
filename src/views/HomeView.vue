<script setup lang="ts">
import { reactive, onMounted } from 'vue';

const state = reactive({
  recipes: null
});
onMounted(async () => {
  state.recipes = await (await fetch('/api/recipes')).json();
});
</script>

<template>
  <main>
    <div class="text-center p-4 text-2xl">Hello</div>
  </main>
</template>
