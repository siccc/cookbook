import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0, behavior: 'smooth' }
    }
  },
  routes: [
    {
      path: '/login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/edit/:id',
      component: () => import('@/views/EditRecipe.vue'),
      props: true
    },
    {
      path: '/recipe/:id',
      component: () => import('@/views/Recipe.vue'),
      props: (route) => {
        return { id: Number(route.params.id) }
      },
      beforeEnter: (to, from, next) => {
        const id = Number(to.params.id);
        if (isNaN(id)) {
          next('/');
        } else {
          next();
        }
      },
    },
    { path: "/:pathMatch(.*)*", redirect: '/' }
  ]
});

router.beforeEach(async (to, from, next) => {
  const loggedIn = localStorage.getItem('userId');
  if (to.path !== '/login' && !loggedIn) {
    next('/login');
  } else if (to.path === '/login' && loggedIn) {
    next('/');
  } else {
    next();
  }
});

export default router;
