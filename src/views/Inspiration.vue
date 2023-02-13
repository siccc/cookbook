<script setup lang="ts">
import { ref } from 'vue';
import { getThreeRandomRecipes } from '@/stores/recipes';
import Button from '@/components/Button.vue';
import EmptyState from '@/components/EmptyState.vue';
import ErrorState from '@/components/ErrorState.vue';
import LoadingState from '@/components/LoadingState.vue';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
import CategoryListWithSelector from '@/components/CategoryListWithSelector.vue';
import RecipeListItem from '@/components/RecipeListItem.vue';

let selectedCategory = ref('');
const {
  isLoading,
  isError,
  data,
  error,
  isFetching,
  refetch
} = getThreeRandomRecipes(selectedCategory);

function onCategoryClick(value: string) {
  selectedCategory.value = value;
}

function onRefetchClick() {
  refetch.value();
}

</script>

<template>
  <main class="p-3 md:p-9 max-w-screen-xl mx-auto mt-14 mb-20">
    <h1 class="mb-6 text-2xl text-center md:text-left">
      Which category you want to see ideas from? ✨
    </h1>
    <CategoryListWithSelector
      class="mt-6"
      @selectedCategoryChange="onCategoryClick"
    />
    <LoadingState v-if="isLoading" />
    <ErrorState v-else-if="isError" :error="error" />
    <div v-else>
      <EmptyState v-if="data?.length === 0" message="No recipes found." type="not-found"/>
      <div v-if="data">
        <div class="flex flex-row flex-wrap -mx-2 md:-mx-3 mt-6">
          <div
            v-for="recipe in data"
            :key="recipe.id"
            class="w-full sm:w-1/3 p-2 md:p-3"
          >
            <RouterLink :to="`/recipe/${recipe.id}`">
              <RecipeListItem :recipe="recipe" imageRatio="aspect-[4/3]"/>
            </RouterLink>
          </div>
        </div>
        <div v-if="data?.length > 0" class="flex justify-center">
          <Button primary class="mx-auto mt-6" @click="onRefetchClick" :disabled="isFetching">
            <SpinnerIcon v-if="isFetching" class="w-6 h-6 animate-spin mr-1"/>
            Give me another 3
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>