import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes: [
    {
      name: 'login',
      path: '/login',
      component: () => import('@/views/Login.vue')
    },
    {
      name: 'home',
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      name: 'editRecipe',
      path: '/edit/:id',
      component: () => import('@/views/EditRecipe.vue'),
      props: true
    },
    {
      name: 'inspiration',
      path: '/inspiration',
      component: () => import('@/views/Inspiration.vue')
    },
    {
      name: 'shoppingList',
      path: '/shopping-list',
      component: () => import('@/views/ShoppingList.vue')
    },
    {
      name: 'seasonalFoods',
      path: '/seasonal-foods',
      component: () => import('@/views/Seasonal.vue')
    },
    {
      name: 'openRecipe',
      path: '/recipe/:id',
      component: () => import('@/views/Recipe.vue'),
      props: true
    },
    {
      name: 'settings',
      path: '/settings',
      component: () => import('@/views/Settings.vue')
    },
    { path: "/:pathMatch(.*)*", redirect: '/' }
  ]
});

router.beforeEach(async (to, from, next) => {
  const loggedIn = document.cookie.includes('isAuthenticated=true');
  if (to.path !== '/login' && !loggedIn) {
    next('/login');
  } else if (to.path === '/login' && loggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;
