<script setup lang="ts">
import { ref, computed } from 'vue';
import { useInfiniteScroll } from '@vueuse/core';
import { listRecipes, setSearchText, getSearchText } from '@/stores/recipes';
import RecipeListItem from '@/components/RecipeListItem.vue';
import Button from '@/components/Button.vue';
import CategoryListWithSelector from '@/components/CategoryListWithSelector.vue';
import IconButton from '@/components/IconButton.vue';
import ErrorState from '@/components/ErrorState.vue';
import EmptyState from '@/components/EmptyState.vue';
import LoadingState from '@/components/LoadingState.vue';
import SearchIcon from '@/assets/icons/search.svg?component';
import CloseIcon from '@/assets/icons/close.svg?component';
import PlusIcon from '@/assets/icons/plus.svg?component';

const initSearchText = getSearchText();
let searchTextForRefetch = ref(initSearchText); // for listRecipes refetch only
let searchText = ref(initSearchText);           // for detect every input change
let selectedCategory = ref('');
let searchInputEl = ref<HTMLInputElement | null>(null);
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

function onSearchTextChange() {
  searchText.value = searchTextForRefetch.value = searchInputEl.value?.value || '';
  setSearchText(searchText.value);
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
  <main class="p-3 md:p-9 max-w-screen-xl mx-auto mt-14 mb-20">
    <div>Greetings! 👋</div>
    <h1 class="mt-3 mb-6 text-3xl">Let's cook something delicious!</h1>
    <div class="mx-auto sm:flex sm:items-center sm:justify-between">
      <div class="sm:flex-1 flex items-center relative sm:mr-3">
        <IconButton
          class="text-stone-300 absolute left-0 ml-1"
          @click="onSearchTextChange"
          aria-label="Search"
        >
          <SearchIcon class="w-5 h-5" />
        </IconButton>
        <input
          ref="searchInputEl"
          enterkeyhint="search"
          :value="searchText"
          class="inputWithIcon"
          @input="onSearchTextInput"
          @change="onSearchTextChange"
          placeholder="Search for recipes..."
        />
        <IconButton
          class="absolute right-0 mr-1 text-stone-400"
          :class="{
            'transition-opacity opacity-100': searchText,
            'opacity-0': !searchText
          }"
          @click="cancelSearch"
          aria-label="Delete search text"
        >
          <CloseIcon class="w-5 h-5"/>
        </IconButton>
      </div>
      <Button primary to="/edit/new" class="hidden sm:inline-flex w-auto mt-3 sm:mt-0">
        <PlusIcon class="w-6 h-6 mr-1"/>
        Create recipe
      </Button>
    </div>
    <!-- <div class="mt-3">Categories</div> -->
    <CategoryListWithSelector  class="mt-3 -mx-3 px-3" @selectedCategoryChange="onCategoryClick" />
    <LoadingState v-if="isLoading" />
    <ErrorState v-if="isError" :error="error" />
    <div v-else>
      <EmptyState v-if="!isLoading && !hasRecipe" message="No recipes found." type="not-found"/>
      <h2 v-if="hasRecipe" class="mt-6 mb-4 text-2xl">Latest recipes</h2>
      <div class="flex flex-row flex-wrap -mx-2 md:-mx-3">
        <template v-if="hasRecipe" v-for="(page, index) in data?.pages" :key="index">
          <div
            v-for="recipe in page.recipes"
            :key="recipe.id"
            class="w-1/2 md:w-1/3 lg:w-1/5 p-2 md:p-3"
          >
            <RouterLink :to="`/recipe/${recipe.id}`">
              <RecipeListItem 
                :recipe="recipe"
                imageRatio="aspect-square"
                img-size-default="h_225,w_225"
                img-size-small="h_225,w_225"
                img-size-large="h_420,w_420"
              />
            </RouterLink>
          </div>
        </template>
      </div>
      <div v-if="hasNextPage" class="text-center text-xl text-yellow-400 mt-6">Loading...</div>
    </div>
  </main>
</template>
