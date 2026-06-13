import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('./pages/DashboardPage.vue'),
    },
    {
      path: '/items',
      name: 'items',
      component: () => import('./pages/ItemsPage.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('./pages/ReportsPage.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('./pages/SettingsPage.vue'),
    },
  ],
})
