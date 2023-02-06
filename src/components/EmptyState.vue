<script setup lang="ts">
  import LoadingIcon from '@/assets/loading-pot.svg?component';
  import LoadingShadow from '@/assets/loading-shadow.svg?component';
  import NotFoundIcon from '@/assets/empty.svg?component';
  import { defineProps } from 'vue';

  const props = defineProps<{
    message: string;
    type: 'default' | 'not-found';
  }>();
</script>

<template>
  <div class="mx-auto max-w-sm px-6 py-9 text-center flex flex-col justify-center items-center
    opacity-70 leading-tight"
  >
    <div v-if="props.type === 'default'">
      <LoadingIcon class="w-24" aria-hidden="true" focusable="false"/>
      <LoadingShadow class="w-24" aria-hidden="true" focusable="false"/>
    </div>
    <div v-else-if="props.type === 'not-found'">
      <NotFoundIcon class="w-24" aria-hidden="true" focusable="false"/>
    </div>
    {{ props.message }}
  </div>
</template>