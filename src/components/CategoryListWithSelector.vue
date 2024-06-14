<script setup lang="ts">
import SvgSprite from '@/components/SvgSprite.vue';
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
    class="flex items-center md:justify-start gap-2 overflow-x-auto snap-x no-scrollbar snap-center"
  >
    <button
      class="group border-2 border-stone-200 uppercase p-2 rounded-lg
        cursor-pointer hover:border-sky-100 shrink-0 flex flex-col items-center justify-center
        w-[6.5rem] transition"
      v-for="category in categories"
      :class="{
        'bg-sky-100 border-sky-100 hover:border-sky-100': selectedCategory === category
      }"
      @click="onCategoryClick(category)"
    >
      <SvgSprite
        :symbol="category"
        class="w-10 h-10 transition"
        :class="{
          'text-sky-800/50': selectedCategory === category,
          'text-stone-400 group-hover:text-sky-800/50': selectedCategory !== category
        }"
      />
      <span
        class="transition text-sm font-medium"
        :class="{
          'text-sky-800': selectedCategory === category,
          'text-stone-600 group-hover:text-sky-800': selectedCategory !== category
        }"
      >
        {{ $t(`categories.${category}`) }}
      </span>
    </button>
  </section>
</template>