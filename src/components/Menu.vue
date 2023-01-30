<script setup lang="ts">
import GroceryIcon from '@/assets/icons/grocery.svg?component';
import FridgeIcon from '@/assets/icons/fridge.svg?component';
import IdeaIcon from '@/assets/icons/lightbulb-alt.svg?component';
import SeasonIcon from '@/assets/icons/season.svg?component';
import HomeIcon from '@/assets/icons/home.svg?component';
import PlusIcon from '@/assets/icons/plus.svg?component';
import Logo from '@/assets/vertical-logo.svg?component';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import { isMobile } from '@/stores/utility';

const router = useRouter();
const useMobile = isMobile();
const showMenu = computed(() => {
  return !useMobile
    || router.currentRoute.value.name === 'home'
    || router.currentRoute.value.name === 'inspiration'
    || router.currentRoute.value.name === 'shoppingList'
    || router.currentRoute.value.name === 'seasonalFoods';
});

</script>

<template>
  <!-- DESKTOP MENU -->
  <div v-if="showMenu" class="h-14 px-2 md:px-4 py-2.5 bg-white fixed w-full z-20 top-0 left-0 border-b border-stone-200 top-menu">
    <div class="container mx-auto px-4 flex justify-center md:justify-between items-center">
      <div class="flex-shrink-0">
        <RouterLink to="/">
          <Logo class="mr-4 h-9 cursor-pointer" alt="Cookbook Logo" />
        </RouterLink>
      </div>
      <div class="items-center ml-4 hidden md:flex uppercase leading-relaxed">
        <RouterLink to="/" class="ml-4 link-underline link-underline-yellow">Home</RouterLink>
        <RouterLink to="/inspiration" class="ml-4 link-underline link-underline-yellow">Inspiration</RouterLink>
        <RouterLink to="/shopping-list" class="ml-4 link-underline link-underline-yellow">Shopping list</RouterLink>
        <RouterLink to="/seasonal-foods" class="ml-4 link-underline link-underline-yellow">What's in season</RouterLink>
      </div>
    </div>
  </div>
  <!-- MOBILE MENU -->
  <div v-if="showMenu" class="w-full fixed bottom-0 z-20 border-t border-stone-200 bg-white md:hidden bottom-menu">
    <div class="flex justify-around items-center text-stone-500 h-full my-1">
      <RouterLink to="/" class="w-1/5">
        <div class="flex flex-col items-center">
          <HomeIcon class="w-6 h-6" />
          <div class="text-xs">Home</div>
        </div>
      </RouterLink>
      <RouterLink to="/inspiration" class="w-1/5">
        <div class="flex flex-col items-center">
          <IdeaIcon class="w-6 h-6"/>
          <div class="text-xs">Inspo</div>
        </div>
      </RouterLink>
      <RouterLink to="/edit/new" class="w-1/5">
        <div class="flex flex-col items-center">
          <PlusIcon class="w-6 h-6"/>
          <div class="text-xs">Create</div>
        </div>
      </RouterLink>
      <RouterLink to="/shopping-list" class="w-1/5">
        <div class="flex flex-col items-center">
          <GroceryIcon class="w-6 h-6"/>
          <div class="text-xs">Shopping list</div>
        </div>
      </RouterLink>
      <RouterLink to="/seasonal-foods" class="w-1/5">
        <div class="flex flex-col items-center">
          <SeasonIcon class="w-6 h-6"/>
          <div class="text-xs">Seasonal</div>
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
  background-image: linear-gradient(transparent, transparent), linear-gradient(#facc15, #facc15);
}

.link-underline:hover {
  background-size: 100% 3px;
  background-position: 0 100%;
}

.bottom-menu {
  @apply text-stone-400;
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-menu .router-link-active {
  @apply text-yellow-400;
}

.top-menu .router-link-active {
  border-bottom-width: 0;
  background-size: 100% 3px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-image: linear-gradient(transparent, transparent), linear-gradient(#facc15, #facc15);
  color: #facc15
}
</style>