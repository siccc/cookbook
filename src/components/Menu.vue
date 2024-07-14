<script setup lang="ts">
import { useRouter } from 'vue-router';
import { computed, ref } from 'vue';
import isMobile from '@/utils/isMobile';
import { userLogout, isDemoUser } from '@/stores/user';
import GroceryIcon from '@/assets/icons/grocery.svg?component';
import IdeaIcon from '@/assets/icons/lightbulb-alt.svg?component';
import SeasonIcon from '@/assets/icons/season.svg?component';
import HomeIcon from '@/assets/icons/home.svg?component';
import PlusIcon from '@/assets/icons/plus.svg?component';
import CogIcon from '@/assets/icons/cog.svg?component';
import SignoutIcon from '@/assets/icons/signout.svg?component';
import Logo from '@/assets/vertical-logo.svg?component';
import Modal from '@/components/Modal.vue';

const isDemo = isDemoUser();
const router = useRouter();
const useMobile = isMobile();
const showLogoutWarningModal = ref(false);
const hideMenu = computed(() => {
  return useMobile
    && (router.currentRoute.value.name === 'login'
    || router.currentRoute.value.name === 'openRecipe'
    || router.currentRoute.value.name === 'editRecipe');
});

type MenuItem = {
  name: string;
  icon: any;
  route: string;
  hideOnDesktop?: boolean;
};

const menuItems: Record<string, MenuItem> = {
  'home': {
    name: 'recipes',
    icon: HomeIcon,
    route: '/home'
  },
  'inspiration': {
    name: 'inspiration',
    icon: IdeaIcon,
    route: '/inspiration'
  },
  'create': {
    name: 'create',
    icon: PlusIcon,
    route: '/edit/new',
    hideOnDesktop: true
  },
  'shoppingList': {
    name: 'shoppingList',
    icon: GroceryIcon,
    route: '/shopping-list'
  },
  'seasonalFoods':{
    name: 'seasonal', // What's in season
    icon: SeasonIcon,
    route: '/seasonal-foods'
  },
  'logout': {
    name: 'logout',
    icon: SignoutIcon,
    route: '/logout'
  },
  'settings': {
    name: 'settings',
    icon: CogIcon,
    route: '/settings'
  }
};

// removed inspiration menu item from desktopTopItems for testing purposes
const desktopTopItems = ['home', 'create', 'shoppingList', 'seasonalFoods', 'settings'];
const mobileTopItems = ['settings'];
const mobileBottomItems = ['home', 'inspiration', 'create', 'shoppingList', 'seasonalFoods'];

function onLogoutClick() {
  if (isDemo) {
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
    <div v-if="!hideMenu" class="h-14 px-2 md:px-4 py-2.5 bg-white w-full z-20 top-0 left-0
      border-b border-stone-200 desktop-menu hidden md:block md:fixed">
      <div class="lg:container mx-auto px-4 flex justify-center md:justify-between items-center">
        <div class="flex-shrink-0">
          <RouterLink to="/home" aria-label="Cookbook Logo">
            <Logo class="mr-4 h-9 cursor-pointer" aria-hidden="true"/>
          </RouterLink>
        </div>
        <nav class="items-center hidden md:flex uppercase leading-relaxed">
          <template v-for="item in desktopTopItems" :key="item">
            <RouterLink
              v-if="!menuItems[item].hideOnDesktop"
              :to="menuItems[item].route"
              class="ml-4 link-underline link-underline-yellow"
            >
              <div class="flex flex-col items-center">
                {{ $t(`menu.${menuItems[item].name}`) }}
              </div>
            </RouterLink>
          </template>
          <div @click="onLogoutClick" class="ml-4 cursor-pointer link-underline link-underline-yellow">
            {{ $t("menu.logout") }}
          </div>
        </nav>
      </div>
    </div>
    <!-- MOBILE MENU -->
    <!-- TOP -->
    <nav v-if="!hideMenu" class="h-14 md:hidden py-2.5 bg-white fixed w-full z-20 top-0 left-0
      border-b border-stone-200 mobile-menu">
      <div class="px-3 flex items-center justify-between">
        <div class="flex-shrink-0">
          <RouterLink to="/home" aria-label="Cookbook Logo">
            <Logo class="mr-4 h-9 cursor-pointer" aria-hidden="true"/>
          </RouterLink>
        </div>
        <div class="flex justify-around items-center text-stone-500 h-full gap-3">
          <RouterLink
            v-for="item in mobileTopItems"
            :key="menuItems[item].name"
            :to="menuItems[item].route"
            class="w-1/5 flex flex-col items-center hover:text-yellow-400"
            :aria-label="menuItems[item].name"
          >
            <component :is=menuItems[item].icon class="w-6 h-6" aria-hidden="true" focusable="false"/>
          </RouterLink>
          <div @click="onLogoutClick">
            <SignoutIcon class="hover:text-yellow-400 w-6 h-6" aria-hidden="true" focusable="false"/>
          </div>
        </div>
      </div>
    </nav>
    <!-- BOTTOM -->
    <nav v-if="!hideMenu" class="w-full fixed bottom-0 z-20 border-t border-stone-200
    bg-white md:hidden mobile-menu">
      <div class="flex justify-around items-center text-stone-500 h-full my-2">
        <RouterLink
          v-for="item in mobileBottomItems"
          :key="menuItems[item].name"
          :to="menuItems[item].route"
          class="w-1/5 flex flex-col items-center hover:text-yellow-400"
        >
          <component :is=menuItems[item].icon class="w-6 h-6" aria-hidden="true" focusable="false"/>
          <div class="text-xs">
            {{ $t(`menu.${menuItems[item].name}`) }}
          </div>
        </RouterLink>
      </div>
    </nav>
    <Teleport to="body">
      <Modal
        v-if="showLogoutWarningModal"
        :confirm-label="$t('logout.logoutModal.confirmLabel')"
        confirm-button-type="danger"
        @close="cancelLogoutWarning"
        @cancel="cancelLogoutWarning"
        @confirm="logout()"
        :title="$t('logout.logoutModal.title')"
      >
        {{ $t("logout.logoutModal.description") }}
      </Modal>
    </Teleport>
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

.mobile-menu {
  @apply text-stone-400;
  padding-bottom: env(safe-area-inset-bottom);
}
.mobile-menu .router-link-active {
  @apply text-yellow-400;
}

.desktop-menu .router-link-active {
  border-bottom-width: 0;
  background-size: 100% 3px;
  background-position: 0 100%;
  background-repeat: no-repeat;
  background-image: linear-gradient(transparent, transparent), linear-gradient(#facc15, #facc15);
  color: #facc15
}
</style>