<script setup lang="ts">

const props = defineProps<{
  symbol: string
}>();

</script>
<template>
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <use :href="`foodIconMap.svg#${props.symbol}`"/>
  </svg>
</template>