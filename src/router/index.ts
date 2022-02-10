import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/IndexPage/IndexPage.vue'),
  },
  {
    path: '/admin-page',
    name: 'admin-page',
    component: () => import('@/views/AdminPage/AdminPage.vue'),
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
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
