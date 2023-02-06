<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  to?: string,
  disabled?: boolean,
  primary?: boolean,
  white?: boolean,
  danger?: boolean
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
    :to="to"
    class="button inline-flex"
    :disabled="disabled"
    :class="{ primary, danger, white }"
    v-on="computedListeners"
  >
    <slot />
  </component>
</template>

<style scoped>

/* DEFAULT - YELLOW OUTLINED */
.button {
  @apply items-center justify-center border-2 border-yellow-400 text-center font-medium
  text-amber-400 rounded-lg cursor-pointer px-2 py-2 md:py-1.5 select-none;
}
.button:disabled {
  @apply text-stone-300 border-stone-300 cursor-default;
}
.button:hover:not(:disabled), .button:active:not(:disabled) {
  @apply bg-amber-100;
}

/* PRIMARY - YELLOW FULL */

.button.primary {
  @apply bg-yellow-400 border-yellow-400 text-white;
}
.button.primary:disabled {
  @apply text-stone-300 bg-stone-100 border-stone-100;
}
.button.primary:hover:not(:disabled), .button.primary:active:not(:disabled) {
  @apply bg-amber-400 border-amber-400;
}

/* DANGER - RED */

.button.danger {
  @apply bg-red-400 border-red-400 text-white;
}
.button.danger:disabled {
  @apply text-stone-300 bg-stone-100 border-stone-100;
}
.button.danger:hover:not(:disabled), .button.danger:active:not(:disabled) {
  @apply bg-red-500 border-red-500;
}

/* SIMPLE - WHITE */

.button.white {
  @apply bg-white shadow shadow-stone-900/20 border-none text-stone-700;
}
.button.white:disabled {
  @apply text-stone-300 bg-stone-100 border-stone-100;
}
.button.white:hover:not(:disabled), .button.white:active {
  @apply bg-yellow-400 text-white;
}

</style>
