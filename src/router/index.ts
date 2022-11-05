import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    }
  ]
});

export default router;
