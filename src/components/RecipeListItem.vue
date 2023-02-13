<script setup lang="ts">
  import type { RecipeExtract } from '@/types';
  import ImagePlaceholder from '@/assets/image-placeholder.svg?component';

  const props = defineProps<{
    recipe: RecipeExtract;
    imageRatio?: string;
  }>();
</script>

<template>
  <img
    v-if="props.recipe.imageUrl"
    class="object-cover rounded-xl w-full"
    :class="props.imageRatio || 'aspect-square'"
    :src="props.recipe.imageUrl"
    alt=""
  />
  <div v-else
    class="w-full rounded-xl bg-stone-100 flex items-center justify-center"
    :class="props.imageRatio || 'aspect-square'"
  >
    <ImagePlaceholder class="opacity-10 w-40 p-3" aria-hidden="true" focusable="false"/>
  </div>
  <div class="mt-1 uppercase select-none w-full">
    <span class="inline-block text-stone-400 text-sm md:text-base">
      {{ props.recipe.category }}
    </span>
    <div class="hover:text-sky-300 hover:transition duration-300 ease-in-out
      font-k2d md:text-xl cursor-pointer md:leading-tight leading-tight"
    >
      {{ props.recipe.title }}
    </div>
  </div>
</template>