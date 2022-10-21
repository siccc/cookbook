import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/recipe/:id',
      component: () => import('@/views/Recipe.vue'),
      props: true
    }
  ]
});

export default router;
