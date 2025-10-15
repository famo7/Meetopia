<template>
  <Card class="border-gray-200 shadow-sm">
    <CardHeader class="pb-4 border-b border-gray-100">
      <CardTitle class="text-base font-semibold text-gray-900">
        Action Items ({{ actionItems.length }})
      </CardTitle>
    </CardHeader>
    <CardContent class="p-6">
      <!-- Loading -->
      <div v-if="actionItemStore.isLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <!-- Action Items List -->
      <div v-else-if="actionItems.length > 0" class="space-y-2">
        <div v-for="item in actionItems" :key="item.id"
          class="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
          <!-- Status Toggle (clickable if assigned to me) -->
          <button v-if="item.assignedTo.id === authStore.user?.id" @click="toggleStatus(item)"
            class="flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
            :title="`Click to change status (${item.status})`">
            <div v-if="item.status === 'DONE'"
              class="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check class="h-3 w-3 text-white" />
            </div>
            <div v-else-if="item.status === 'IN_PROGRESS'"
              class="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
              <Clock class="h-3 w-3 text-white" />
            </div>
            <div v-else class="h-5 w-5 rounded-full border-2 border-gray-400 hover:border-blue-500"></div>
          </button>

          <!-- Status Indicator (non-clickable) -->
          <div v-else class="flex-shrink-0">
            <div v-if="item.status === 'DONE'"
              class="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center">
              <Check class="h-3 w-3 text-white" />
            </div>
            <div v-else-if="item.status === 'IN_PROGRESS'"
              class="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
              <Clock class="h-3 w-3 text-white" />
            </div>
            <div v-else class="h-5 w-5 rounded-full border-2 border-gray-300"></div>
          </div>

          <!-- Task Details -->
          <div class="flex-1 min-w-0">
            <p :class="[
              'text-sm font-medium',
              item.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-900'
            ]">
              {{ item.title }}
            </p>
            <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>{{ item.assignedTo.name }}</span>
              <span v-if="item.dueDate">Due: {{ formatDueDate(item.dueDate) }}</span>
            </div>
          </div>

          <!-- Priority Badge -->
          <Badge v-if="item.priority" :variant="item.priority === 'HIGH' ? 'destructive' :
            item.priority === 'MEDIUM' ? 'default' : 'secondary'
            " class="text-xs">
            {{ item.priority }}
          </Badge>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-8">
        <p class="text-sm text-gray-500">No action items yet</p>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useActionItemStore } from '@/stores/actionItem'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Clock } from 'lucide-vue-next'
import type { ActionItem } from '@/types/actionItem'

interface Props {
  meetingId: number
}

const props = defineProps<Props>()

const authStore = useAuthStore()
const actionItemStore = useActionItemStore()

const actionItems = computed(() => actionItemStore.actionItems)

const formatDueDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const toggleStatus = async (item: ActionItem) => {
  const statusCycle = {
    'OPEN': 'IN_PROGRESS',
    'IN_PROGRESS': 'DONE',
    'DONE': 'OPEN'
  }

  const newStatus = statusCycle[item.status as keyof typeof statusCycle]

  try {
    await actionItemStore.updateActionItem(props.meetingId, item.id, {
      status: newStatus as 'OPEN' | 'IN_PROGRESS' | 'DONE'
    })
  } catch (error) {
    console.error('Failed to update status:', error)
  }
}
</script>
