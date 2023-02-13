<script setup lang="ts">

const props = defineProps<{
  value: string,
  disabled?: boolean,
  label?: string,
  options: string[],
}>();

const emit = defineEmits<{
  (e: 'click', event: Event): void
  (e: 'focusout', event: Event): void
}>();

function onChange(event: Event) {
  emit('click', event);
}
function onFocusout(event: Event) {
  emit('focusout', event);
}

</script>

<template>
  <select :value="value" @change="onChange" class="selectInput">
    <option v-for="option in options" :key="option" :value="option">
      {{ option }}
    </option>
  </select>
</template>

<style scoped>

.selectInput {
  @apply appearance-none bg-white px-3 md:py-1.5 py-2 outline-none cursor-pointer border-stone-300 border rounded-lg;
  transition: opacity 200ms ease-in-out, box-shadow 200ms ease-in-out;
  background-image: url('@/assets/icons/angle-down.svg?data');
  background-repeat: no-repeat, repeat;
  background-position: right 0.5rem top 50%, 0 0;
  background-size: 1.25rem 1.25rem, 100%;
}
.selectInput:focus {
  @apply text-stone-800 bg-white border-yellow-400 outline-none ring-1 ring-yellow-400;
}

</style>
