<script setup lang="ts">
import { computed } from 'vue';

type Option = {
  value: string,
  label: string
}
const props = defineProps<{
  value: string,
  disabled?: boolean,
  label?: string,
  options: string[] | Option[],
}>();

const selectOptions = computed(() => {
  return props.options.map((option) => {
    return typeof option === 'string' ? { value: option, label: option } : option
  })
})

const emit = defineEmits<{
  (e: 'change', event: Event): void
  (e: 'focusout', event: Event): void
}>();

function onChange(event: Event) {
  emit('change', event);
}
function onFocusout(event: Event) {
  emit('focusout', event);
}

</script>

<template>
  <select :value="value" @change="onChange" class="selectInput" @blur="onFocusout">
    <option v-for="option in selectOptions" :key="option.value" :value="option.value">
      {{ option.label }}
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
