<template>
  <Sidebar>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" asChild>
            <router-link to="/dashboard">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <span class="font-bold">M</span>
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-semibold">Meetopia</span>
                <span class="text-xs">Meeting Management</span>
              </div>
            </router-link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in menuItems" :key="item.title">
              <SidebarMenuButton asChild :isActive="isActive(item.url)">
                <router-link :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </router-link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg">
                <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10">
                  <User class="h-4 w-4 text-primary" />
                </div>
                <div class="flex flex-col gap-0.5 leading-none">
                  <span class="font-medium">{{ authStore.user?.name || 'User' }}</span>
                  <span class="text-xs text-muted-foreground">{{ authStore.user?.email || '' }}</span>
                </div>
                <ChevronUp class="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" class="w-[--radix-popper-anchor-width]">
              <DropdownMenuItem @click="handleLogout">
                <LogOut class="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LayoutDashboard, Calendar, CheckCircle2, History, User, LogOut, ChevronUp } from 'lucide-vue-next'

const route = useRoute()
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