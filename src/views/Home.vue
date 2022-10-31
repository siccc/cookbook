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
          class="ring-1 rounded-lg px-2 ring-stone-300 p-1 outline-none w-full"
          @change="search" placeholder="Search..."
        />
      </div>
      <div class="sm:flex sm:flex-row sm:flex-wrap sm:justify-center md:mt-8 mt-2">
        <div class="sm:p-4 py-4" v-for="recipe in data" :key="recipe.id">
          <RouterLink :to="`/recipe/${recipe.id}`">
            <img v-if="recipe.imageUrl" class="w-full h-72 md:w-60 object-cover rounded-lg bg-stone-100" :src="recipe.imageUrl" />
            <div v-else class="w-full h-72 md:w-60 rounded-lg bg-stone-100" />
            <div class="mt-2 uppercase select-none md:w-60 w-72">
              <span class="inline-block text-stone-400">
                {{ recipe.category }}
              </span>
              <div class="hover:text-sky-300 hover:transition duration-300 ease-in-out font-k2d text-xl">
                {{ recipe.title }}
              </div>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </main>
</template>
