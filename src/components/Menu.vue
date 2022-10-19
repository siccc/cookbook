<script setup lang="ts">
import GroceryIcon from '@/assets/icons/GroceryIcon.vue';
import FridgeIcon from '@/assets/icons/FridgeIcon.vue';
import SeasonIcon from '@/assets/icons/SeasonIcon.vue';
import HomeIcon from '@/assets/icons/HomeIcon.vue';

</script>

<template>
  <div class="h-14 px-2 md:px-4 py-2.5 bg-white fixed w-full z-20 top-0 left-0 border-b border-gray-200">
    <div class="container mx-auto px-4 flex justify-center md:justify-between items-center">
      <div class="flex-shrink-0">
        <img src="@/assets/vertical-logo.svg" class="mr-4 h-9" alt="Cookbook Logo" />
      </div>
      <div class="items-center ml-4 hidden md:flex">
        <RouterLink to="/" class="ml-4 link-underline link-underline-black text-black uppercase">Home</RouterLink>
        <RouterLink to="/" class="ml-4 link-underline link-underline-black text-black uppercase">Grocery list
        </RouterLink>
        <RouterLink to="/" class="ml-4 link-underline link-underline-black text-black uppercase">What's in the fridge
        </RouterLink>
        <RouterLink to="/" class="ml-4 link-underline link-underline-black text-black uppercase">In season</RouterLink>
      </div>
    </div>
  </div>
  <div class="w-full fixed bottom-0 z-20 border-t border-gray-200 h-12 bg-white md:hidden">
    <div class="flex justify-around items-center text-gray-500 h-full">
      <RouterLink to="/">
        <div class="flex flex-col items-center text-yellow-400">
          <HomeIcon class="" />
          <div class="text-xs">Home</div>
        </div>
      </RouterLink>
      <RouterLink to="/">
        <div class="flex flex-col items-center">
          <GroceryIcon />
          <div class="text-xs">Grocery</div>
        </div>
      </RouterLink>
      <RouterLink to="/">
        <div class="flex flex-col items-center">
          <FridgeIcon />
          <div class="text-xs">Fridge</div>
        </div>
      </RouterLink>
      <RouterLink to="/">
        <div class="flex flex-col items-center">
          <SeasonIcon />
          <div class="text-xs">Season</div>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.link-underline {
  border-bottom-width: 0;
  background-image: linear-gradient(transparent, transparent), linear-gradient(#fff, #fff);
  background-size: 0 3px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  transition: background-size .3s ease-in-out;
}

.link-underline-black {
  background-image: linear-gradient(transparent, transparent), linear-gradient(#F2DE2C, #F2DE2C)
}

.link-underline:hover {
  background-size: 100% 3px;
  background-position: 0 100%
}
</style>