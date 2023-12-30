<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import isMobile from '@/utils/isMobile';
import { userLogout } from '@/stores/user';
import GroceryIcon from '@/assets/icons/grocery.svg?component';
import IdeaIcon from '@/assets/icons/lightbulb-alt.svg?component';
import SeasonIcon from '@/assets/icons/season.svg?component';
import HomeIcon from '@/assets/icons/home.svg?component';
import PlusIcon from '@/assets/icons/plus.svg?component';
import Logo from '@/assets/vertical-logo.svg?component';
import Modal from '@/components/Modal.vue';

const router = useRouter();
const useMobile = isMobile();
const showLogoutWarningModal = ref(false);
const showMenu = computed(() => {
  return !useMobile
    || router.currentRoute.value.name === 'home'
    || router.currentRoute.value.name === 'inspiration'
    || router.currentRoute.value.name === 'shoppingList'
    || router.currentRoute.value.name === 'seasonalFoods';
});
const menuItems = [
  {
    name: 'Recipes',
    icon: HomeIcon,
    route: '/home'
  },
  {
    name: 'Inspiration',
    icon: IdeaIcon,
    route: '/inspiration'
  },
  {
    name: 'Create',
    icon: PlusIcon,
    route: '/edit/new',
    hideOnDesktop: true
  },
  {
    name: 'Shopping list',
    icon: GroceryIcon,
    route: '/shopping-list'
  },
  {
    name: 'What\'s in season',
    nameOnMobile: 'Seasonal',
    icon: SeasonIcon,
    route: '/seasonal-foods'
  }
];

function onLogoutClick() {
  const isDemoUser = localStorage.getItem('isDemoUser')
  if (!!isDemoUser) {
    showLogoutWarningModal.value = true;
  } else {
    logout();
  }
}

function cancelLogoutWarning() {
  showLogoutWarningModal.value = false;
}

async function logout() {
  await userLogout();
  router.push('/login');
}
</script>

<template>
  <header>
    <!-- DESKTOP MENU -->
    <div v-if="showMenu" class="h-14 px-2 md:px-4 py-2.5 bg-white fixed w-full z-20 top-0 left-0
      border-b border-stone-200 top-menu">
      <div class="container mx-auto px-4 flex justify-center md:justify-between items-center">
        <div class="flex-shrink-0">
          <RouterLink to="/home" aria-label="Cookbook Logo">
            <Logo class="mr-4 h-9 cursor-pointer" aria-hidden="true"/>
          </RouterLink>
        </div>
        <nav class="items-center ml-4 hidden md:flex uppercase leading-relaxed">
          <template v-for="item in menuItems" :key="item.name">
            <RouterLink
              v-if="!item.hideOnDesktop"
              :to="item.route"
              class="ml-4 link-underline link-underline-yellow"
            >
              <div class="flex flex-col items-center">
                {{ item.name }}
              </div>
            </RouterLink>
          </template>
          <div @click="onLogoutClick" class="ml-4 cursor-pointer link-underline link-underline-yellow">
            Logout
          </div>
          <Teleport to="body">
            <Modal
              v-if="showLogoutWarningModal"
              confirm-label="Log out"
              confirm-button-type="danger"
              @close="cancelLogoutWarning"
              @cancel="cancelLogoutWarning"
              @confirm="logout()"
              title="Log out"
            >
              Are you sure you want to log out? Currently you have a demo account and if you log out, your recipes will be lost.
            </Modal>
          </Teleport>
        </nav>
      </div>
    </div>
    <!-- MOBILE MENU -->
    <nav v-if="showMenu" class="w-full fixed bottom-0 z-20 border-t border-stone-200
    bg-white md:hidden bottom-menu">
      <div class="flex justify-around items-center text-stone-500 h-full my-2">
        <RouterLink
          v-for="item in menuItems"
          :key="item.name"
          :to="item.route"
          class="w-1/5 flex flex-col items-center hover:text-yellow-400"
        >
          <component :is=item.icon class="w-6 h-6" aria-hidden="true" focusable="false"/>
          <div class="text-xs">{{ item.nameOnMobile || item.name }}</div>
        </RouterLink>
      </div>
    </nav>
  </header>
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