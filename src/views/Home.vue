<script setup lang="ts">
import { listRecipes } from '@/stores/recipes';
import { ref } from 'vue';

let searchText = ref('');
let { isLoading, isError, isFetching, data, error, refetch } = listRecipes(searchText);

function search(event: Event) {
  searchText.value = (event.target as HTMLInputElement).value;
}

</script>

<template>
  <main class="p-4 max-w-screen-xl mx-auto">
    <div v-if="isLoading" class="my-8 text-center font-k2d text-2xl text-yellow-400">
      Loading...
    </div>
    <div v-else>
      <div class="mx-auto md:px-20 px-1">
        <input
          :value="searchText"
          class="ring-1 rounded-lg px-2 ring-gray-300 p-1 outline-none w-full"
          @change="search" placeholder="Search..."
        />
      </div>
      <div class="flex flex-row flex-wrap justify-center md:mt-8 mt-2">
        <div class="bg-white p-4" v-for="recipe in data" :key="recipe.id">
          <RouterLink :to="`/recipe/${recipe.id}`">
            <div class="h-72 w-60 bg-slate-100" />
            <div class="my-3">
              <span class="text-yellow-400 border-2 border-yellow-400 rounded-lg px-1 py-0.5">
                {{ recipe.category }}
              </span>
            </div>
            <div class="uppercase w-60 hover:text-sky-300 hover:transition duration-300 ease-in-out font-k2d">
              {{ recipe.title }}
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
