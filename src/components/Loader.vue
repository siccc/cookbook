<script setup lang="ts">
import SplashLogo from '@/assets/splash-logo.svg?component';
import SpinnerIcon from '@/assets/icons/spinner.svg?component';
</script>

<template>
  <div class="w-full h-full bg-sky-100 absolute inset-0 z-50 flex items-center justify-center">
    <div>
      <SplashLogo class="w-32 h-32 md:w-48 md:h-48" />
      <div class="flex items-center justify-center mt-4">
        <SpinnerIcon class="w-8 h-8 animate-spin mr-2"/>
        <span class="md:text-lg">LOADING</span>
      </div>
    </div>
  </div>
</template>
