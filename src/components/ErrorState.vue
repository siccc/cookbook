<script setup lang="ts">
  import ErrorIcon from '@/assets/error.svg?component';
  import { computed } from 'vue';

  const props = defineProps<{
    error: any;
  }>();
  const message = computed(() => {
    if (props.error instanceof Error) {
      return props.error.message;
    } else if (typeof props.error === 'string') {
      return props.error;
    }
    return 'An unknown error occurred.';
  });
</script>

<template>
  <div role="alert" class="py-9 text-center flex flex-col justify-center items-center opacity-70" >
    <ErrorIcon class="w-24 h-24" aria-hidden="true" focusable="false"/>
    <div>{{ message }}</div>
  </div>
</template>