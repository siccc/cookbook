<script setup lang="ts">
// @ts-ignore
import Markdown from 'vue3-markdown-it';

const props = defineProps<{
  content: string
}>();

</script>

<template>
  <Markdown :source="content" class="prose markdown-content" />
</template>

<style>
.markdown-content ul {
  padding-left: 0;
}

.markdown-content ul li {
  padding-left: 0;
  list-style-position: inside;
}

.markdown-content ol {
  list-style: none;
  counter-reset: list-number;
  padding-left: 0;
  line-height: 1.6;
}

.markdown-content ol li {
  counter-increment: list-number;
  @apply relative pl-8;
}

.markdown-content ol li:before {
  content: counter(list-number);
  @apply absolute text-xl left-0 top-0.5 font-k2d font-medium text-white bg-sky-200 rounded-lg w-6 h-6 inline-block text-center leading-6;
}

</style>