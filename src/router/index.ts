import { createWebHistory, createRouter, RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/IndexPage/IndexPage.vue'),
  },
  {
    path: '/admin-page',
    name: 'admin-page',
    component: () => import('@/views/AdminPage/AdminPage.vue'),
    beforeEnter: () => {
      if (
        localStorage.THE_PASSWORD !== import.meta.env.VITE_SECRET &&
        sessionStorage.THE_PASSWORD !== import.meta.env.VITE_SECRET
      )
        return '/login';
    },
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutPage/AboutPage.vue'),
  },
  {
    path: '/rms-testing',
    name: 'rms-testing',
    component: () => import('@/views/RMSTestingPage/RMSTestingPage.vue'),
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginPage/LoginPage.vue'),
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
