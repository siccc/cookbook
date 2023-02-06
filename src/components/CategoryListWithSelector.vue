<script setup lang="ts">
import { ref } from 'vue';

let selectedCategory = ref('all');
const categories = ['all', 'breakfast', 'soup', 'main dish', 'side dish', 'pasta', 'bread',
  'sauce', 'snack', 'dessert'];

const emit = defineEmits<{
  (event: 'selectedCategoryChange', value: string): void;
}>();

// emit initial value
emit('selectedCategoryChange', selectedCategory.value);

function onCategoryClick(value: string) {
  selectedCategory.value = value;
  emit('selectedCategoryChange', value);
}

</script>

<template>
  <section
    aria-label="category selector to filter recipe list"
    class="flex items-center md:justify-start gap-3 overflow-x-auto
      snap-x no-scrollbar"
  >
    <button class="border border-stone-300 uppercase px-3 py-2 md:py-1.5 rounded-lg cursor-pointer
    hover:border-sky-300 hover:text-sky-400 shrink-0"
      v-for="category in categories"
      :class="{
        'bg-sky-300 border-sky-300 text-white hover:border-sky-300 hover:text-white': selectedCategory === category
      }"
      @click="onCategoryClick(category)"
    >
      {{ category }}
    </button>
  </section>
</template>