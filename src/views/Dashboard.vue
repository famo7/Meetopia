<template>
  <div class="flex h-screen bg-background overflow-hidden">
    <!-- Sidebar -->
    <aside class="w-64 bg-card border-r border-border flex flex-col">
      <!-- Logo/Brand -->
      <div class="p-6 border-b border-border">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-primary-foreground font-bold text-sm">M</span>
          </div>
          <span class="text-xl font-bold text-foreground">Meetopia</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 p-4 space-y-1">
        <router-link to="/dashboard"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors" :class="currentRoute === '/dashboard'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'">
          <LayoutDashboard class="h-5 w-5" />
          Dashboard
        </router-link>

        <router-link to="/dashboard/meetings"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors" :class="currentRoute === '/dashboard/meetings'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'">
          <Calendar class="h-5 w-5" />
          Meetings
        </router-link>

        <router-link to="/dashboard/action-items"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors" :class="currentRoute === '/dashboard/action-items'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'">
          <CheckCircle2 class="h-5 w-5" />
          Action Items
        </router-link>

        <router-link to="/dashboard/history"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors" :class="currentRoute === '/dashboard/history'
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'">
          <History class="h-5 w-5" />
          History
        </router-link>
      </nav>

      <!-- User Profile -->
      <div class="p-4 border-t border-border">
        <div
          class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User class="h-5 w-5 text-primary" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-foreground truncate">
              {{ authStore.user?.name || 'John Doe' }}
            </p>
            <p class="text-xs text-muted-foreground">View Profile</p>
          </div>
          <button @click="handleLogout" class="opacity-0 group-hover:opacity-100 transition-opacity" title="Logout">
            <LogOut class="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  LayoutDashboard,
  Calendar,
  CheckCircle2,
  History,
  User,
  LogOut
} from 'lucide-vue-next'

const route = useRoute()
const authStore = useAuthStore()

const currentRoute = computed(() => route.path)

const handleLogout = async () => {
  await authStore.logout()
}
</script>
