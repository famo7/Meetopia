<template>
  <div class="flex h-screen bg-background">
    <!-- Sidebar -->
    <aside class="w-64 border-r border-border flex flex-col bg-card">
      <!-- Logo/Brand -->
      <div class="h-16 flex items-center px-6 border-b border-border">
        <router-link to="/dashboard" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <span class="text-lg font-semibold text-foreground">Meetopia</span>
        </router-link>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link v-for="item in menuItems" :key="item.title" :to="item.url"
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-accent group"
          :class="isActive(item.url) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'">
          <component :is="item.icon" class="h-5 w-5 transition-transform group-hover:scale-110" />
          <span>{{ item.title }}</span>
        </router-link>
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-border">
        <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent transition-colors group">
          <button @click="router.push('/dashboard/profile')" class="flex items-center gap-3 flex-1 text-left">
            <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <User class="h-5 w-5 text-muted-foreground" />
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-foreground truncate">
                {{ authStore.user?.name || 'John Doe' }}
              </p>
              <p class="text-xs text-muted-foreground">
                View Profile
              </p>
            </div>
          </button>
          <button @click="handleLogout" class="p-2 rounded-md hover:bg-accent-foreground/10 transition-colors"
            title="Logout">
            <LogOut class="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { LayoutDashboard, Calendar, CheckCircle2, History, User, LogOut } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Meetings',
    url: '/dashboard/meetings',
    icon: Calendar,
  },
  {
    title: 'Action Items',
    url: '/dashboard/action-items',
    icon: CheckCircle2,
  },
  {
    title: 'History',
    url: '/dashboard/history',
    icon: History,
  },
]

const isActive = (url: string) => {
  if (url === '/dashboard') {
    return route.path === '/dashboard'
  }
  return route.path.startsWith(url)
}

const handleLogout = async () => {
  await authStore.logout()
}
</script>
