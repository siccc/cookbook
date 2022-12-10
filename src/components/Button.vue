<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to?: string,
  disabled?: boolean,
  primary?: boolean
}>();

const emit = defineEmits<{
  (e: 'click', event: Event): void
  (e: 'focusout', event: Event): void
}>();

const type = computed(() => {
  if (props.disabled) {
    return 'button';
  }
  if (props.to) {
    return 'router-link';
  }
  return 'button';
});

const computedListeners = computed(() => {
  return {
    click: onClick,
    focusout: onFocusout
  };
});

function onClick(event: Event) {
  emit('click', event);
}
function onFocusout(event: Event) {
  emit('focusout', event);
}
</script>

<template>
  <component
    :is="type"
    class="button inline-flex"
    :to="to"
    :disabled="disabled"
    :class="{ primary }"
    v-on="computedListeners"
  >
    <slot />
  </component>
</template>

<style scoped>
.button {
  @apply items-center justify-center border-2 border-yellow-400 text-center font-medium
  text-yellow-400 rounded-lg cursor-pointer px-3 py-1.5 md:py-1 select-none;
}
.button:disabled {
  @apply text-stone-300 border-stone-300 cursor-default;
}
.button:hover:not(:disabled), .button:active {
  @apply bg-yellow-50;
}
.button.primary {
  @apply bg-yellow-400 border-yellow-400 text-center font-medium text-white
  rounded-lg cursor-pointer px-3 py-1.5 md:py-1 select-none;
}
.button.primary:disabled {
  @apply text-stone-300 bg-stone-100 border-stone-100 cursor-default;
}
.button.primary:hover:not(:disabled), .button:active {
  @apply bg-amber-300;
}
</style>
