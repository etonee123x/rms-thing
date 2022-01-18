import { createWebHistory, createRouter } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'index',
    component: () => import('@/views/IndexPage/IndexPage.vue'),
  },
  {
    path: '/admin-panel',
    name: 'admin-panel',
    component: () => import('@/views/AdminPage/AdminPage.vue'),
  },
];
export default createRouter({
  history: createWebHistory(),
  routes,
});
