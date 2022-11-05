<script setup lang="ts">
import { listRecipes } from '@/stores/recipes';
import { ref, computed } from 'vue';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import Button from '@/components/Button.vue';
import EmptyIcon from '@/assets/empty.svg?component';

let searchText = ref('');
let { isLoading, isError, data: recipeList, error } = listRecipes(searchText);

const recipeListLength = computed(() => recipeList.value ? recipeList.value.length : 0);

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
      <div class="mx-auto md:px-20 sm:flex sm:items-center sm:justify-between">
        <input
          :value="searchText"
          class="px-3 py-1.5 w-full sm:flex-1 rounded border border-solid border-stone-300 focus:text-stone-800 focus:bg-white focus:border-yellow-400 focus:outline-none mr-3"
          @change="search" placeholder="Search..."
        />
        <Button primary to="/edit/new" class="w-full sm:w-auto mt-3 sm:mt-0">
          Create recipe
        </Button>
      </div>
      <div class="sm:flex sm:flex-row sm:flex-wrap sm:justify-center md:mt-8 mt-2">
        <div v-if="recipeListLength === 0" class="flex justify-center items-center">
          <EmptyIcon class="w-24 h-24 opacity-80" />
          <span class="text-center font-k2d text-xl text-stone-600">No recipes found.</span>
        </div>
        <div v-if="recipeListLength > 0" class="sm:p-4 py-4" v-for="recipe in recipeList" :key="recipe.id">
          <RouterLink :to="`/recipe/${recipe.id}`">
            <img
              v-if="recipe.imageUrl"
              class="w-full h-72 md:w-60 object-cover rounded-xl"
              :src="recipe.imageUrl"
            />
            <div v-else class="w-full h-72 md:w-60 rounded-xl bg-stone-100 flex items-center justify-center">
              <ImagePlaceholder class="opacity-10 w-40 h-40"/>
            </div>
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
