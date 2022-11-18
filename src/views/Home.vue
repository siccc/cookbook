<script setup lang="ts">
import { listRecipes } from '@/stores/recipes';
import { ref, computed } from 'vue';
import { useInfiniteScroll } from '@vueuse/core';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import Button from '@/components/Button.vue';
import EmptyIcon from '@/assets/empty.svg?component';
import ErrorIcon from '@/assets/error.svg?component';
import CloseIcon from '@/assets/icons/close.svg?component';
import LoadingIcon from '@/assets/loading-pot.svg?component';
import LoadingShadow from '@/assets/loading-shadow.svg?component';

let searchText = ref('');
const {
  isLoading,
  isError,
  data,
  error,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage
} = listRecipes(searchText);

const hasRecipe = computed(() => {
  return !!data.value?.pages[0]?.recipes.length;
});

function search(event: Event) {
  searchText.value = (event.target as HTMLInputElement).value;
}

function cancelSearch() {
  searchText.value = '';
}

useInfiniteScroll(
  window,
  () => {
    if (hasNextPage?.value && !isFetchingNextPage.value) {
      fetchNextPage.value();
    }
  },
  {
    distance: 450
  }
);

</script>

<template>
  <main class="p-4 max-w-screen-xl mx-auto">
    <div v-if="isLoading" class="my-8 text-center font-k2d text-xl text-yellow-400 flex
      flex-col justify-center items-center">
      <LoadingIcon class="w-24 opacity-80 animate-bounce block" />
      <LoadingShadow class="w-24 opacity-80 block" />
      Loading...
    </div>
    <div v-else-if="isError" class="my-8 text-center font-k2d text-xl
    text-red-300 flex justify-center items-center">
      <ErrorIcon class="w-24 h-24 opacity-50" />
      <div>{{ error }}</div>
    </div>
    <div v-else>
      <div class="mx-auto md:px-20 sm:flex sm:items-center sm:justify-between">
        <div class="sm:flex-1 flex items-center relative sm:mr-3">
          <input
            enterkeyhint="search"
            :value="searchText"
            class="px-3 py-1.5 w-full rounded border border-solid border-stone-300
            focus:text-stone-800 focus:bg-white focus:border-yellow-400 focus:outline-none"
            @change="search" placeholder="Search..."
          />
          <CloseIcon
            class="w-4 h-4 text-stone-400 absolute right-0 mr-2 cursor-pointer"
            @click="cancelSearch"
          />
        </div>
        <Button primary to="/edit/new" class="w-full sm:w-auto mt-3 sm:mt-0">
          Create recipe
        </Button>
      </div>
      <div class="flex flex-row flex-wrap justify-center gap-2 md:gap-4 md:mt-6 mt-3">
        <div v-if="!hasRecipe" class="flex justify-center items-center">
          <EmptyIcon class="w-24 h-24 opacity-80" />
          <span class="text-center font-k2d text-xl text-stone-600">No recipes found.</span>
        </div>
        <template v-else-if="hasRecipe" v-for="(page, index) in data?.pages" :key="index">
          <div v-for="recipe in page.recipes" :key="recipe.id">
            <RouterLink :to="`/recipe/${recipe.id}`">
              <img
                v-if="recipe.imageUrl"
                class="h-36 w-36 md:h-72 md:w-60 object-cover rounded-xl"
                :src="recipe.imageUrl"
              />
              <div v-else class="h-32 w-32 md:h-72 md:w-60 rounded-xl bg-stone-100 flex items-center
                justify-center">
                <ImagePlaceholder class="opacity-10 md:w-40 md:h-40 w-20 h-20"/>
              </div>
              <div class="mt-2 uppercase select-none md:w-60 w-36">
                <span class="inline-block text-stone-400 text-sm md:text-base">
                  {{ recipe.category }}
                </span>
                <div class="hover:text-sky-300 hover:transition duration-300 ease-in-out
                  font-k2d md:text-xl">
                  {{ recipe.title }}
                </div>
              </div>
            </RouterLink>
          </div>
        </template>
      </div>
      <div v-if="hasNextPage" class="text-center text-xl text-yellow-400 mt-6">Loading...</div>
    </div>
  </main>
</template>
