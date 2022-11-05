<script setup lang="ts">
import GroceryIcon from '@/assets/icons/grocery.svg?component';
import FridgeIcon from '@/assets/icons/fridge.svg?component';
import SeasonIcon from '@/assets/icons/season.svg?component';
import HomeIcon from '@/assets/icons/home.svg?component';
import Logo from '@/assets/vertical-logo.svg?component';

</script>

<template>
  <div class="h-14 px-2 md:px-4 py-2.5 bg-white fixed w-full z-20 top-0 left-0 border-b border-stone-200">
    <div class="container mx-auto px-4 flex justify-center md:justify-between items-center">
      <div class="flex-shrink-0">
        <RouterLink to="/">
          <Logo class="mr-4 h-9" alt="Cookbook Logo" />
        </RouterLink>
      </div>
      <div class="items-center ml-4 hidden md:flex">
        <RouterLink to="/" class="ml-4 link-underline link-underline-yellow uppercase">Home</RouterLink>
        <RouterLink to="/" class="ml-4 uppercase cursor-default text-stone-400">Grocery list
        </RouterLink>
        <RouterLink to="/" class="ml-4 uppercase cursor-default text-stone-400">What's in the fridge
        </RouterLink>
        <RouterLink to="/" class="ml-4 uppercase cursor-default text-stone-400">In season</RouterLink>
      </div>
    </div>
  </div>
  <div class="w-full fixed bottom-0 z-20 border-t border-stone-200 h-12 bg-white md:hidden">
    <div class="flex justify-around items-center text-stone-500 h-full">
      <RouterLink to="/">
        <div class="flex flex-col items-center text-yellow-400">
          <HomeIcon class="w-5 h-5" />
          <div class="text-xs">Home</div>
        </div>
      </RouterLink>
      <RouterLink to="/">
        <div class="flex flex-col items-center text-stone-200">
          <GroceryIcon class="w-5 h-5"/>
          <div class="text-xs">Grocery</div>
        </div>
      </RouterLink>
      <RouterLink to="/">
        <div class="flex flex-col items-center text-stone-200">
          <FridgeIcon class="w-5 h-5"/>
          <div class="text-xs">Fridge</div>
        </div>
      </RouterLink>
      <RouterLink to="/">
        <div class="flex flex-col items-center text-stone-200">
          <SeasonIcon class="w-5 h-5"/>
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

.link-underline-yellow {
  background-image: linear-gradient(transparent, transparent), linear-gradient(#facc15, #facc15)
}

.link-underline:hover {
  background-size: 100% 3px;
  background-position: 0 100%
}
</style>