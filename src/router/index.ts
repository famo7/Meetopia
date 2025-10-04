// create basic router that usesx only App.vue as the main component
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Landing from '../views/Landing.vue';
import Register from '../views/Register.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import DashboardHome from '../views/DashboardHome.vue';
import Meetings from '../views/Meetings.vue';
import Profile from '../views/Profile.vue';

const routes = [
  {
    path: "/",
    name: "home",
    component: Landing,
    meta: { requiresGuest: true },
  },
  {
    path: "/register",
    name: "register",
    component: Register,
    meta: { requiresGuest: true },
  },
  {
    path: "/login",
    name: "login",
    component: Login,
    meta: { requiresGuest: true },
  },
  {
    path: "/dashboard",
    component: Dashboard,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: DashboardHome,
      },
      {
        path: "meetings",
        name: "meetings",
        component: Meetings,
      },
      {
        path: "action-items",
        name: "action-items",
        component: () => import('../views/DashboardHome.vue'),
      },
      {
        path: "history",
        name: "history",
        component: () => import('../views/DashboardHome.vue'),
      },
      {
        path: "profile",
        name: "profile",
        component: Profile,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
