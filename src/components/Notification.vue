<template>
  <DropdownMenu v-model:open="isOpen">
    <DropdownMenuTrigger as-child>
      <button
        class="relative inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground h-10 w-10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        aria-label="Notifications">
        <Bell class="h-4 w-4" />
        <span v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-medium text-destructive-foreground">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>
    </DropdownMenuTrigger>

    <DropdownMenuContent class="w-80 p-0" align="end" side="bottom">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">Notifications</h3>
        <Button v-if="unreadCount > 0" variant="ghost" size="sm" @click="handleMarkAllAsRead"
          :disabled="isMarkingAllAsRead" class="text-xs">
          Mark all as read
        </Button>
      </div>

      <div v-if="isLoading" class="flex items-center justify-center p-8">
        <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary"></div>
      </div>

      <div v-else-if="notifications.length === 0" class="p-8 text-center">
        <Bell class="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
        <p class="mt-2 text-sm text-muted-foreground">No notifications yet</p>
      </div>

      <div v-else class="max-h-96 overflow-y-auto">
        <DropdownMenuItem v-for="notification in notifications" :key="notification.id"
          class="flex flex-col items-start p-4 cursor-pointer transition-colors hover:bg-accent/50 focus:bg-accent/50"
          :class="{ 'bg-accent/30': !notification.isRead }" @click.prevent="handleNotificationClick(notification)">
          <div class="flex w-full items-start justify-between gap-3">
            <div class="flex-1 space-y-2">
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full" :class="getNotificationColorClass(notification.type)"></div>
                <p class="font-medium text-sm leading-none">{{ notification.title }}</p>
              </div>
              <p class="text-sm text-muted-foreground leading-relaxed">{{ notification.message }}</p>
              <p class="text-xs text-muted-foreground mt-1">
                {{ formatRelativeTime(notification.createdAt) }}
              </p>
            </div>
            <div class="flex-shrink-0 mt-1">
              <div v-if="!notification.isRead" class="h-2 w-2 rounded-full bg-primary"></div>
            </div>
          </div>
        </DropdownMenuItem>
      </div>

      <div v-if="notifications.length > 0" class="p-2 border-t">
        <Button variant="ghost" class="w-full justify-center text-sm" @click="handleViewAll">
          View all notifications
        </Button>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Bell } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useNotificationStore } from '@/stores/notification'
import type { Notification } from '@/types/notification'

const notificationStore = useNotificationStore()
const router = useRouter()
const isOpen = ref(false)
const isMarkingAllAsRead = ref(false)

const notifications = computed(() => notificationStore.notifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const isLoading = computed(() => notificationStore.isLoading)

onMounted(async () => {
  await notificationStore.fetchNotifications()
})

const handleMarkAllAsRead = async () => {
  try {
    isMarkingAllAsRead.value = true
    await notificationStore.markAllAsRead()
  } finally {
    isMarkingAllAsRead.value = false
  }
}

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.isRead) {
    try {
      await notificationStore.markNotificationAsRead(notification.id)
    } catch (error) {

    }
  }

  handleNotificationNavigation(notification)
}

const handleNotificationNavigation = (notification: Notification) => {
  switch (notification.type) {
    case 'ACTION_ITEM_ASSIGNED':
    case 'ACTION_ITEM_UPDATED':
      router.push({ name: 'action-items' })
      break
    case 'MEETING_UPDATED':
    case 'MEETING_REMINDER':
    case 'PARTICIPANT_ADDED':
      if (notification.relatedId) {
        router.push({ name: 'meeting-detail', params: { id: notification.relatedId.toString() } })
      } else {
        router.push({ name: 'dashboard' })
      }
      break
    case 'INFO':
    case 'SUCCESS':
    case 'WARNING':
    case 'ERROR':
    default:
      router.push({ name: 'dashboard' })
      break
  }
}

const handleViewAll = () => {
  router.push({ name: 'action-items' })
}

const getNotificationColorClass = (type: string): string => {
  const colorMap: Record<string, string> = {
    'INFO': 'bg-blue-500',
    'SUCCESS': 'bg-green-500',
    'WARNING': 'bg-yellow-500',
    'ERROR': 'bg-red-500',
    'PARTICIPANT_ADDED': 'bg-purple-500',
    'ACTION_ITEM_ASSIGNED': 'bg-orange-500',
    'ACTION_ITEM_UPDATED': 'bg-orange-500',
    'MEETING_UPDATED': 'bg-blue-500',
    'MEETING_REMINDER': 'bg-blue-500'
  }
  return colorMap[type] || 'bg-gray-500'
}

const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'Just now'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
  }

  return date.toLocaleDateString()
}
</script>