// create basic router that usesx only App.vue as the main component
import { createRouter, createWebHistory } from 'vue-router'
import Landing from '../views/Landing.vue';
const routes = [
  {
    path: "/",
    name: "home",
    component: Landing,
  }
]
const router = createRouter({
  history: createWebHistory(),
  routes,
})


export default router
