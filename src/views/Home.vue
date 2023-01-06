<script setup lang="ts">
import { listRecipes, setSearchText, getSearchText } from '@/stores/recipes';
import { ref, computed } from 'vue';
import { useInfiniteScroll } from '@vueuse/core';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import Button from '@/components/Button.vue';
import CategoryButton from '@/components/CategoryButton.vue';
import EmptyIcon from '@/assets/empty.svg?component';
import ErrorIcon from '@/assets/error.svg?component';
import SearchIcon from '@/assets/icons/search.svg?component';
import CloseIcon from '@/assets/icons/close.svg?component';
import PlusIcon from '@/assets/icons/plus.svg?component';
import LoadingIcon from '@/assets/loading-pot.svg?component';
import LoadingShadow from '@/assets/loading-shadow.svg?component';

const initSearchText = getSearchText();
let searchTextForRefetch = ref(initSearchText); // for listRecipes refetch only
let searchText = ref(initSearchText);           // for detect every input change
let selectedCategory = ref('all');
const categories = ['all', 'breakfast', 'soup', 'main dish', 'side dish', 'pasta', 'bread',
  'sauce', 'snack', 'dessert'];
const {
  isLoading,
  isError,
  data,
  error,
  isFetchingNextPage,
  fetchNextPage,
  hasNextPage
} = listRecipes(searchTextForRefetch, selectedCategory);

const hasRecipe = computed(() => {
  return !!data.value?.pages[0]?.recipes.length;
});

function onSearchTextInput(event: Event) {
  searchText.value = (event.target as HTMLInputElement).value;
}

function onSearchTextChange(event: Event) {
  searchText.value = searchTextForRefetch.value = (event.target as HTMLInputElement).value;
  setSearchText(searchTextForRefetch.value);
}

function onCategoryClick(value: string) {
  selectedCategory.value = value;
}

function cancelSearch() {
  searchText.value = '';
  searchTextForRefetch.value = '';
  setSearchText(searchTextForRefetch.value);
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
  <main class="p-3 md:p-9 max-w-screen-xl mx-auto my-14">
    <div>Greetings! 👋</div>
    <div class="mt-3 mb-6 text-4xl">Let's cook something delicious!</div>
    <div class="mx-auto sm:flex sm:items-center sm:justify-between">
      <div class="sm:flex-1 flex items-center relative sm:mr-3">
        <SearchIcon class="w-5 h-5 text-stone-300 absolute left-0 ml-3" />
        <input
          enterkeyhint="search"
          :value="searchText"
          class="px-9 py-3 md:py-1.5 w-full border-2 border-stone-100
          bg-stone-100 focus:bg-stone-100 focus:text-stone-800"
          @input="onSearchTextInput"
          @change="onSearchTextChange"
          placeholder="Search for recipes..."
        />
        <CloseIcon
          class="w-5 h-5 text-stone-400 absolute right-0 mr-3 cursor-pointer"
          :class="{
            'transition-opacity opacity-100': searchText,
            'opacity-0': !searchText
          }"
          @click="cancelSearch"
        />
      </div>
      <Button primary to="/edit/new" class="hidden sm:inline-flex w-auto mt-3 sm:mt-0">
        <PlusIcon class="w-6 h-6 mr-1"/>
        Create recipe
      </Button>
    </div>
    <div class="flex flex-nowrap items-center gap-3 overflow-x-auto mt-6 snap-x no-scrollbar">
      <CategoryButton
        class="shrink-0 snap-center"
        :class="{
          'bg-sky-300 border-sky-300 text-white hover:border-sky-300 hover:text-white': selectedCategory === category
        }"
        v-for="category in categories"
        @click="onCategoryClick(category)"
      >
        {{ category }}
      </CategoryButton>
    </div>
    <div v-if="isLoading" class="my-9 text-center font-k2d text-xl text-yellow-400 flex
      flex-col justify-center items-center">
      <LoadingIcon class="w-24 opacity-80 animate-bounce block" />
      <LoadingShadow class="w-24 opacity-80 block" />
      Loading...
    </div>
    <div v-else-if="isError" class="my-9 text-center font-k2d text-xl
    text-red-300 flex justify-center items-center"
    >
      <ErrorIcon class="w-24 h-24 opacity-50" />
      <div>{{ error }}</div>
    </div>
    <div v-else>
      <div v-if="!hasRecipe" class="flex justify-center items-center mt-3">
        <EmptyIcon class="w-24 h-24 opacity-80" />
        <span class="text-center font-k2d text-xl text-stone-600">No recipes found.</span>
      </div>
      <div v-if="hasRecipe" class="mt-6 mb-4 text-2xl">Latest recipes</div>
      <div class="flex flex-row flex-wrap -mx-2 md:-mx-3">
        <template v-if="hasRecipe" v-for="(page, index) in data?.pages" :key="index">
          <div
            v-for="recipe in page.recipes"
            :key="recipe.id"
            class="w-1/2 md:w-1/3 lg:w-1/5 p-2 md:p-3"
          >
            <RouterLink :to="`/recipe/${recipe.id}`">
              <img
                v-if="recipe.imageUrl"
                class="object-cover rounded-xl w-full"
                :src="recipe.imageUrl"
              />
              <div v-else class="w-full aspect-square rounded-xl bg-stone-100 flex items-center
                justify-center"
              >
                <ImagePlaceholder class="opacity-10 w-40 p-3"/>
              </div>
              <div class="mt-1 uppercase select-none w-full">
                <span class="inline-block text-stone-400 text-sm md:text-base">
                  {{ recipe.category }}
                </span>
                <div class="hover:text-sky-300 hover:transition duration-300 ease-in-out
                  font-k2d md:text-xl cursor-pointer md:leading-tight leading-tight"
                >
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
