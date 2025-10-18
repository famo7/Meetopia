<template>
  <div class="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div
      class="px-6 py-4 flex items-center justify-between cursor-pointer group hover:bg-slate-50/80 transition-all duration-300"
      @click="toggleExpanded">
      <div class="flex items-center gap-3">
        <div class="relative">
          <CheckSquare class="h-5 w-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
          <div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"
            v-if="hasCompletedItems"></div>
        </div>
        <h3 class="text-lg font-semibold text-slate-800">Action Items</h3>
        <div class="flex items-center gap-1.5">
          <div class="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
            {{ actionItems.length }}
          </div>
          <div v-if="hasPendingItems" class="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
            {{ pendingItemsCount }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click.stop="openCreateDialog"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-md">
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Add</span>
        </button>
        <div class="p-1 rounded-lg transition-transform duration-300" :class="isExpanded ? 'rotate-180' : ''">
          <ChevronDown class="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </div>

    <!-- Expandable Content -->
    <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0" leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
      <div v-show="isExpanded" class="border-t border-slate-100">
        <!-- Action Items List -->
        <div v-if="actionItems.length > 0" class="p-4 space-y-2">
          <div v-for="item in sortedActionItems" :key="item.id"
            class="group bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:shadow-md transition-all duration-200">
            <div class="flex items-start gap-3">
              <!-- Status Checkbox -->
              <button @click="toggleItemStatus(item)"
                class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200"
                :class="[
                  item.status === 'DONE'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50',
                ]">
                <Check v-if="item.status === 'DONE'" class="h-3 w-3" />
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-slate-800 text-sm leading-tight"
                      :class="item.status === 'DONE' ? 'line-through opacity-60' : ''">
                      {{ item.title }}
                    </h4>
                    <p v-if="item.description" class="text-slate-500 mt-1 text-xs leading-relaxed line-clamp-2">
                      {{ item.description }}
                    </p>
                  </div>

                  <!-- Priority Badge -->
                  <div class="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                    :class="getPriorityClasses(item.priority)">
                    {{ item.priority }}
                  </div>
                </div>

                <!-- Meta Information -->
                <div class="flex items-center gap-3 mt-2 text-xs text-slate-400">
                  <div class="flex items-center gap-1">
                    <User class="h-3 w-3" />
                    <span>{{ item.assignedTo.name }}</span>
                  </div>
                  <div v-if="item.dueDate" class="flex items-center gap-1">
                    <Calendar class="h-3 w-3" />
                    <span :class="{ 'text-red-500 font-medium': isOverdue(item.dueDate) }">
                      {{ formatDate(item.dueDate) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1">
                    <div class="w-2 h-2 rounded-full" :class="getStatusColor(item.status)"></div>
                    <span>{{ formatStatus(item.status) }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div
                  class="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                  <button v-if="canDelete(item)" @click="deleteItem(item)"
                    class="flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded text-xs text-red-600 transition-colors">
                    <Trash2 class="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else class="px-6 py-12 text-center">
          <div class="relative mx-auto w-16 h-16 mb-4">
            <div class="absolute inset-0 bg-slate-100 rounded-xl"></div>
            <CheckSquare class="absolute inset-2 h-12 w-12 text-slate-400" />
          </div>
          <h3 class="text-base font-semibold text-slate-800 mb-1">No action items</h3>
          <p class="text-sm text-slate-500 mb-4">Create your first action item to track tasks</p>
          <button @click="openCreateDialog"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200">
            <Plus class="h-4 w-4" />
            Create Action Item
          </button>
        </div>
      </div>
    </Transition>

    <!-- Create Dialog -->
    <ActionItemCreate v-model:open="showCreateDialog" :meetingId="meetingId" :participants="participants" />

    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-[400px] p-0">
        <div class="px-6 py-4">
          <div class="flex items-center gap-3 text-red-600 mb-3">
            <div class="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 class="h-4 w-4" />
            </div>
            <DialogTitle class="text-base font-semibold text-slate-800">Delete Action Item</DialogTitle>
          </div>
          <DialogDescription class="text-slate-600 text-sm mb-4">
            Are you sure you want to delete this action item? This action cannot be undone.
          </DialogDescription>

          <div v-if="itemToDelete" class="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <h4 class="font-medium text-slate-800 text-sm">{{ itemToDelete.title }}</h4>
            <p v-if="itemToDelete.description" class="text-xs text-slate-600 mt-1">
              {{ itemToDelete.description }}
            </p>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
          <button @click="showDeleteDialog = false"
            class="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm transition-colors">
            Cancel
          </button>
          <button v-if="canDelete(itemToDelete)" @click="confirmDelete"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors">
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { useActionItemStore } from '@/stores/actionItem'
import { useParticipantStore } from '@/stores/participant'
import { useAuthStore } from '@/stores/auth'
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
} from 'lucide-vue-next'

type ActionItemStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'
type Priority = 'LOW' | 'MEDIUM' | 'HIGH'


const actionItemStore = useActionItemStore()
const participantStore = useParticipantStore()
const authStore = useAuthStore()
const currentUser = computed(() => authStore.user)

const loadActionItems = async () => {
  try {
    await actionItemStore.fetchActionItems(props.meetingId)
  } catch (error) {
    console.error('Failed to load action items:', error)
  }
}


const loadParticipants = async () => {
  try {
    await participantStore.fetchParticipants(props.meetingId)
  } catch (error) {
    console.error('Failed to load action items:', error)
  }
}

onMounted(() => {
  loadActionItems()
  loadParticipants()

})

const props = defineProps(['meetingId'])


const isExpanded = ref(true)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingItem = ref<ActionItem | null>(null)
const itemToDelete = ref<ActionItem | null>(null)

const formData = ref({
  title: '',
  description: '',
  priority: 'MEDIUM' as Priority,
  status: 'OPEN' as ActionItemStatus,
  assignedToId: 0,
  dueDate: ''
})

const actionItems = computed(() => actionItemStore.actionItems)
const participants = computed(() => participantStore.participants)

const sortedActionItems = computed(() => {
  const statusOrder = { 'OPEN': 0, 'IN_PROGRESS': 1, 'DONE': 2 }
  return [...actionItems.value].sort((a, b) => {
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]
    if (statusDiff !== 0) return statusDiff
    const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 }
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



const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const openCreateDialog = () => {
  resetForm()
  showCreateDialog.value = true
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
      return 'bg-gray-100 text-gray-700'
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

  if (isToday) {
    return 'Today'
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const isOverdue = (dateString: string) => {
  const dueDate = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return dueDate < today
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignedToId: 0,
    dueDate: ''
  }
  editingItem.value = null
}

const closeDialog = () => {
  showCreateDialog.value = false
  resetForm()
}

const editItem = (item: ActionItem) => {
  editingItem.value = item
  formData.value = {
    title: item.title,
    description: item.description,
    priority: item.priority,
    status: item.status,
    assignedToId: item.assignedTo.id,
    dueDate: item.dueDate || ''
  }
  showCreateDialog.value = true
}

const saveActionItem = () => {
  if (!formData.value.title || !formData.value.assignedToId) return
  // TODO: Implement save logic with actionItemStore
  closeDialog()
}

const toggleItemStatus = (item: ActionItem) => {
  // TODO: Implement toggle logic with actionItemStore
}

const cycleStatus = (item: ActionItem) => {
  // TODO: Implement cycle logic with actionItemStore
}

const deleteItem = (item: ActionItem) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const canDelete = (item: ActionItem | null) => {
  if (!item) return false
  // Only allow deleting if the current user exists and is the owner/assigned user
  return !!currentUser.value && currentUser.value.id === item.createdById
}

const confirmDelete = async () => {
  if (!itemToDelete.value) return
  try {
    await actionItemStore.deleteActionItem(props.meetingId, itemToDelete.value.id)
  } catch (err) {
    console.error('Failed to delete action item:', err)
  } finally {
    showDeleteDialog.value = false
    itemToDelete.value = null
  }
}

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