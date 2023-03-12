<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  disabled?: boolean
}>();

const emit = defineEmits<{
  (e: 'click', event: Event): void
  (e: 'focusout', event: Event): void
}>();

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
  <button
    class="iconButton"
    :disabled="disabled"
    v-on="computedListeners"
  >
    <slot aria-hidden focusable="false" />
  </button>
</template>

<style scoped>

.iconButton {
  @apply leading-none cursor-pointer flex justify-center items-center select-none p-2 text-stone-400;
}
.iconButton:disabled {
  @apply cursor-default opacity-50;
}
.iconButton:hover:not(:disabled), .button:active {
  @apply text-amber-400;
}


</style>
