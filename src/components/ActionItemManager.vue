<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-6 py-4 flex items-center justify-between border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="relative">
          <CheckSquare class="h-5 w-5 text-slate-600" />
          <div v-if="hasCompletedItems"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></div>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-slate-900">Action Items</h3>
          <div class="flex items-center gap-2 mt-1">
            <span class="text-sm text-slate-600">{{ actionItems.length }} total</span>
            <span v-if="hasPendingItems" class="text-sm text-amber-600 font-medium">
              {{ pendingItemsCount }} pending
            </span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click="openCreateDialog"
          class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Add Item</span>
        </button>
        <button @click="toggleExpanded" class="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ChevronDown class="h-4 w-4 text-slate-500 transition-transform" :class="{ 'rotate-180': isExpanded }" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-show="isExpanded">
        <div v-if="actionItems.length > 0" class="divide-y divide-slate-100">
          <div v-for="item in sortedActionItems" :key="item.id" class="p-4 hover:bg-slate-50 transition-colors group">
            <div class="flex items-start gap-3">
              <!-- Status Checkbox -->
              <button @click="toggleItemStatus(item)"
                class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all hover:scale-105"
                :class="getStatusClasses(item.status)">
                <Check v-if="item.status === 'DONE'" class="h-3 w-3" />
                <Clock v-else-if="item.status === 'IN_PROGRESS'" class="h-3 w-3" />
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-slate-900 text-sm leading-tight"
                      :class="{ 'line-through opacity-60': item.status === 'DONE' }">
                      {{ item.title }}
                    </h4>
                    <p v-if="item.description" class="text-slate-600 mt-1 text-sm leading-relaxed line-clamp-2">
                      {{ item.description }}
                    </p>
                  </div>

                  <!-- Priority Badge -->
                  <div class="px-2 py-1 rounded-full text-xs font-medium flex-shrink-0"
                    :class="getPriorityClasses(item.priority)">
                    {{ item.priority }}
                  </div>
                </div>

                <!-- Meta Information -->
                <div class="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <div class="flex items-center gap-1">
                    <User class="h-3 w-3" />
                    <span>{{ item.assignedTo?.name }}{{ item.assignedTo?.id === authStore.user?.id ? ' (You)' : ''
                    }}</span>
                  </div>
                  <div v-if="item.dueDate" class="flex items-center gap-1">
                    <Calendar class="h-3 w-3" />
                    <span :class="{ 'text-red-600 font-medium': isOverdue(item.dueDate) }">
                      {{ formatDate(item.dueDate) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full" :class="getStatusColor(item.status)"></div>
                    <span>{{ formatStatus(item.status) }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button @click="editItem(item)"
                    class="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors">
                    <Edit class="h-3 w-3" />
                    Edit
                  </button>
                  <button @click="cycleStatus(item)"
                    class="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors">
                    <RefreshCw class="h-3 w-3" />
                    {{ getNextStatusAction(item.status) }}
                  </button>
                  <button @click="deleteItem(item)"
                    class="flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded text-xs text-red-600 transition-colors">
                    <Trash2 class="h-3 w-3" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="px-6 py-12 text-center">
          <div class="mx-auto w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
            <CheckSquare class="h-8 w-8 text-slate-400" />
          </div>
          <h3 class="text-lg font-semibold text-slate-900 mb-2">No action items yet</h3>
          <p class="text-slate-600 mb-6">Start collaborating by creating your first action item</p>
          <button @click="openCreateDialog"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <Plus class="h-4 w-4" />
            Create First Item
          </button>
        </div>
      </div>
    </Transition>

    <!-- Dialogs -->
    <ActionItemCreate v-model:open="showCreateDialog" :meetingId="meetingId" :participants="participantsWithCurrentUser"
      @updated="handleItemCreated" />

    <UpdateActionItem v-model:open="showUpdateDialog" :item="editingItem" :meetingId="meetingId"
      :participants="participantsWithCurrentUser" @updated="handleItemUpdated" />

    <DeleteActionItem v-model:open="showDeleteDialog" :item="itemToDelete" :meetingId="meetingId"
      :participants="participantsWithCurrentUser" @deleted="handleItemDeleted" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useActionItemStore } from '@/stores/actionItem'
import { useParticipantStore } from '@/stores/participant'
import { useAuthStore } from '@/stores/auth'
import UpdateActionItem from './UpdateActionItem.vue'
import DeleteActionItem from './DeleteActionItem.vue'
import ActionItemCreate from './ActionItemCreate.vue'
import type { ActionItem } from '@/types/actionItem'
import {
  Plus,
  CheckSquare,
  User,
  Calendar,
  RefreshCw,
  Edit,
  Trash2,
  ChevronDown,
  Check,
  Clock,
} from 'lucide-vue-next'
import type { ActionItemStatus, Priority } from '@/types/actionItem'
import type { Participant } from '@/types'


const props = defineProps<{ meetingId: number }>()

const actionItemStore = useActionItemStore()
const participantStore = useParticipantStore()
const authStore = useAuthStore()

const isExpanded = ref(true)
const showUpdateDialog = ref(false)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingItem = ref<ActionItem>()
const itemToDelete = ref<ActionItem | null>(null)

const actionItems = computed(() => actionItemStore.actionItems)
const participants = computed(() => participantStore.participants)

const participantsWithCurrentUser = computed(() => {
  if (!authStore.user) return participants.value

  return [
    ...participantStore.participants,
    {
      user: authStore.user,
      id: authStore.user.id,
      meetingId: props.meetingId
    } as Participant
  ]
})

const sortedActionItems = computed(() => {
  const statusOrder = { 'OPEN': 0, 'IN_PROGRESS': 1, 'DONE': 2 }
  const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }

  return [...actionItems.value].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

const hasPendingItems = computed(() =>
  actionItems.value.some(item => item.status !== 'DONE')
)

const pendingItemsCount = computed(() =>
  actionItems.value.filter(item => item.status !== 'DONE').length
)

const hasCompletedItems = computed(() =>
  actionItems.value.some(item => item.status === 'DONE')
)

const loadData = async () => {
  try {
    await Promise.all([
      actionItemStore.fetchActionItems(props.meetingId),
      participantStore.fetchParticipants(props.meetingId)
    ])
  } catch (error) {
    console.error('Failed to load data:', error)
  }
}

onMounted(loadData)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const openCreateDialog = () => {
  showCreateDialog.value = true
}

const getStatusClasses = (status: ActionItemStatus) => {
  switch (status) {
    case 'DONE':
      return 'bg-emerald-500 border-emerald-500 text-white'
    case 'IN_PROGRESS':
      return 'bg-blue-500 border-blue-500 text-white'
    default:
      return 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
  }
}

const getPriorityClasses = (priority: Priority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-700'
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700'
    case 'LOW':
      return 'bg-green-100 text-green-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const getStatusColor = (status: ActionItemStatus) => {
  switch (status) {
    case 'OPEN':
      return 'bg-slate-400'
    case 'IN_PROGRESS':
      return 'bg-blue-500'
    case 'DONE':
      return 'bg-emerald-500'
    default:
      return 'bg-slate-400'
  }
}

const formatStatus = (status: ActionItemStatus) => {
  switch (status) {
    case 'OPEN':
      return 'Open'
    case 'IN_PROGRESS':
      return 'In Progress'
    case 'DONE':
      return 'Completed'
    default:
      return status
  }
}

const getNextStatusAction = (currentStatus: ActionItemStatus) => {
  switch (currentStatus) {
    case 'OPEN':
      return 'Start'
    case 'IN_PROGRESS':
      return 'Complete'
    case 'DONE':
      return 'Reopen'
    default:
      return 'Update'
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  const isToday = date.toDateString() === today.toDateString()

  if (isToday) return 'Today'

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const isOverdue = (dateString: string) => {
  const dueDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}

const editItem = (item: ActionItem) => {
  editingItem.value = item
  showUpdateDialog.value = true
}

const deleteItem = (item: ActionItem) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const toggleItemStatus = async (item: ActionItem) => {
  try {
    const statusCycle: Record<string, ActionItemStatus> = {
      'OPEN': 'IN_PROGRESS',
      'IN_PROGRESS': 'DONE',
      'DONE': 'OPEN'
    }
    const newStatus = statusCycle[item.status]
    await actionItemStore.updateActionItem(props.meetingId, item.id, { status: newStatus })
    await actionItemStore.fetchActionItems(props.meetingId)
  } catch (error) {
    console.error('Failed to toggle item status:', error)
  }
}

const cycleStatus = async (item: ActionItem) => {
  try {
    let newStatus: ActionItemStatus
    switch (item.status) {
      case 'OPEN':
        newStatus = 'IN_PROGRESS'
        break
      case 'IN_PROGRESS':
        newStatus = 'DONE'
        break
      case 'DONE':
        newStatus = 'OPEN'
        break
      default:
        newStatus = 'OPEN'
    }
    await actionItemStore.updateActionItem(props.meetingId, item.id, { status: newStatus })
    await actionItemStore.fetchActionItems(props.meetingId)
  } catch (error) {
    console.error('Failed to cycle item status:', error)
  }
}

const handleItemCreated = () => loadData()
const handleItemUpdated = () => loadData()
const handleItemDeleted = () => loadData()
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
</style>