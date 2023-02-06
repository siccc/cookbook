<script setup lang="ts">
  import LoadingIcon from '@/assets/loading-pot.svg?component';
  import LoadingShadow from '@/assets/loading-shadow.svg?component';
</script>

<template>
  <div class="my-9 text-center text-xl text-yellow-400 flex flex-col justify-center items-center">
    <LoadingIcon class="w-24 animate-bounce opacity-70" aria-hidden="true" focusable="false" />
    <LoadingShadow class="w-24 opacity-70" aria-hidden="true" focusable="false" />
    Loading...
  </div>
</template>