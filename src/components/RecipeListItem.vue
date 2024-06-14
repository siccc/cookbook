<script setup lang="ts">
  import type { RecipeExtract } from '@/types';
  import ImagePlaceholder from '@/assets/image-placeholder.svg?component';
  import Image from '@/components/Image.vue';

  const props = defineProps<{
    recipe: RecipeExtract;
    imgSizeSmall: string;
    imgSizeLarge: string;
    imgSizeDefault: string;
    imageRatio?: string;
  }>();
</script>

<template>
  <Image
    v-if="props.recipe.imagePublicId"
    :imgClass="'object-cover rounded-xl w-full'"
    :imagePublicId="props.recipe.imagePublicId"
    :imgSizeSmall="props.imgSizeSmall"
    :imgSizeLarge="props.imgSizeLarge"
    :imgSizeDefault="props.imgSizeDefault"
    :imageRatio="props.imageRatio"
  />
  <div v-else
    class="w-full rounded-xl bg-stone-100 flex items-center justify-center"
    :class="props.imageRatio || 'aspect-square'"
  >
    <ImagePlaceholder class="opacity-10 w-40 p-3" aria-hidden="true" focusable="false"/>
  </div>
  <div class="mt-1 uppercase select-none w-full">
    <span class="inline-block text-stone-400 text-sm">
      {{ $t(`categories.${props.recipe.category}`) }}
    </span>
    <div class="group-hover:text-sky-300 group-hover:transition duration-300 ease-in-out
      font-k2d md:text-xl cursor-pointer md:leading-tight leading-tight"
    >
      {{ props.recipe.title }}
    </div>
  </div>
</template>