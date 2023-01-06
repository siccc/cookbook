<script setup lang="ts">
import CategoryButton from '@/components/CategoryButton.vue';
import Button from '@/components/Button.vue';
import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
import { ref } from 'vue';
import { getThreeRandomRecipes } from '@/stores/recipes';
import LoadingIcon from '@/assets/loading-pot.svg?component';
import LoadingShadow from '@/assets/loading-shadow.svg?component';
import EmptyIcon from '@/assets/empty.svg?component';
import ErrorIcon from '@/assets/error.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';

let selectedCategory = ref('all');
const categories = ['all', 'breakfast', 'soup', 'main dish', 'side dish', 'pasta', 'bread',
  'souce', 'snack', 'dessert'];

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
  <main class="p-3 md:p-9 max-w-screen-xl mx-auto mt-14 mb-14">
    <div class="mt-3 mb-6 text-2xl text-center md:text-left">
      Which category you want to be inspired by? ✨
    </div>
    <div class="flex flex-wrap items-center justify-center md:justify-start gap-3">
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
      <div v-if="data?.length === 0" class="flex justify-center items-center mt-6">
        <EmptyIcon class="w-24 h-24 opacity-80" />
        <span class="text-center font-k2d text-xl text-stone-600">No recipes found.</span>
      </div>
      <div v-if="data">
        <div class="flex flex-row flex-wrap -mx-2 md:-mx-3 mt-6">
          <div
            v-for="recipe in data"
            :key="recipe.id"
            class="w-full sm:w-1/3 p-2 md:p-3"
          >
            <RouterLink :to="`/recipe/${recipe.id}`">
              <img
                v-if="recipe.imageUrl"
                class="object-cover rounded-xl w-full aspect-[4/3]"
                :src="recipe.imageUrl"
              />
              <div v-else class="w-full aspect-[4/3] rounded-xl bg-stone-100 flex items-center
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
        </div>
        <div v-if="data?.length > 0" class="flex justify-center">
          <Button primary class="mx-auto mt-6" @click="onRefetchClick" :disabled="isFetching">
            <SpinnerIcon v-if="isFetching" class="w-6 h-6 animate-spin mr-1"/>
            Give me other ideas
          </Button>
        </div>
      </div>
    </div>
  </main>
</template>