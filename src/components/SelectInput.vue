<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

type OptionPair = {
  value: string,
  label: string
}
type OptionsAsObject = {[key: string]: string};

const props = defineProps<{
  value: string,
  options: string[] | OptionPair[] | OptionsAsObject,
  disabled?: boolean,
  label?: string,
  i18nOptions?: boolean
}>();
const { rt } = useI18n();

const normalizedOptions = computed(() => {
  if(Array.isArray(props.options)) {
    return props.options.map((option) => {
      return typeof option === 'string' ? { value: option, label: option } : option
    })
  } else {
    const newOptions = [];
    for (const [key, value] of Object.entries(props.options)) {
      newOptions.push({ value: key, label: props.i18nOptions ? rt(value) : value });
    }
    return newOptions;
  }
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
    <option v-for="option in normalizedOptions" :key="option.value" :value="option.value">
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
