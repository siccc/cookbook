<script setup lang="ts">
import { computed } from 'vue';
import CheckIcon from '@/assets/icons/check.svg?component';

const props = defineProps<{
  value: boolean,
  disabled?: boolean,
  label?: string,
  lineThroughIfChecked?: boolean
}>();

const id = String(Math.random()).slice(2);

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
  <div class="flex items-center relative">
    <div
      class="box"
      :class="{
        'bg-yellow-400 border-yellow-400': props.value,
        'bg-white border-stone-300': !props.value
      }"
    >
      <CheckIcon class="w-5 h-5 text-white" v-if="props.value"></CheckIcon>
    </div>
    <input
      type="checkbox"
      class="opacity-0 absolute z-10 inset-0 w-full appearance-none cursor-pointer"
      :id="`checkbox-${id}`"
      v-on="computedListeners"
    />
    <label
      v-if="label"
      class="inline-block cursor-pointer flex-1 transition duration-300"
      :class="{ 'line-through text-stone-200': lineThroughIfChecked && props.value }"
      :for="`checkbox-${id}`"
    >
      {{ label }}
    </label>
  </div>
</template>

<style scoped>

.box {
  @apply h-6 w-6 border rounded-full transition duration-200 mr-3 cursor-pointer flex items-center justify-center;
}

</style>
