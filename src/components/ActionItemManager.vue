<template>
  <div class="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div
      class="px-6 py-4 flex items-center justify-between cursor-pointer group hover:bg-slate-50/80 transition-all duration-300"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-3">
        <div class="relative">
          <CheckSquare class="h-5 w-5 text-slate-600 group-hover:text-slate-700 transition-colors" />
          <div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" v-if="hasCompletedItems"></div>
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
        <button
          @click.stop="openCreateDialog"
          class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 hover:shadow-md"
        >
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Add</span>
        </button>
        <div class="p-1 rounded-lg transition-transform duration-300" :class="isExpanded ? 'rotate-180' : ''">
          <ChevronDown class="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </div>

    <!-- Expandable Content -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-show="isExpanded" class="border-t border-slate-100">
        <!-- Action Items List -->
        <div v-if="actionItems.length > 0" class="p-4 space-y-2">
          <div
            v-for="item in sortedActionItems"
            :key="item.id"
            class="group bg-white rounded-lg border border-slate-200 p-4 hover:border-slate-300 hover:shadow-md transition-all duration-200"
          >
            <div class="flex items-start gap-3">
              <!-- Status Checkbox -->
              <button
                @click="toggleItemStatus(item)"
                class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all duration-200"
                :class="[
                  item.status === 'DONE'
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50',
                ]"
              >
                <Check v-if="item.status === 'DONE'" class="h-3 w-3" />
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-slate-800 text-sm leading-tight" :class="item.status === 'DONE' ? 'line-through opacity-60' : ''">
                      {{ item.title }}
                    </h4>
                    <p v-if="item.description" class="text-slate-500 mt-1 text-xs leading-relaxed line-clamp-2">
                      {{ item.description }}
                    </p>
                  </div>

                  <!-- Priority Badge -->
                  <div
                    class="px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0"
                    :class="getPriorityClasses(item.priority)"
                  >
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
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="getStatusColor(item.status)"
                    ></div>
                    <span>{{ formatStatus(item.status) }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    @click="editItem(item)"
                    class="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors"
                  >
                    <Edit class="h-3 w-3" />
                    Edit
                  </button>
                  <button
                    @click="cycleStatus(item)"
                    class="flex items-center gap-1 px-2 py-1 hover:bg-slate-100 rounded text-xs text-slate-600 transition-colors"
                  >
                    <RefreshCw class="h-3 w-3" />
                    {{ getNextStatusAction(item.status) }}
                  </button>
                  <button
                    @click="deleteItem(item)"
                    class="flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded text-xs text-red-600 transition-colors"
                  >
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
          <button
            @click="openCreateDialog"
            class="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200"
          >
            <Plus class="h-4 w-4" />
            Create Action Item
          </button>
        </div>
      </div>
    </Transition>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[480px] p-0">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-200">
          <DialogTitle class="text-lg font-semibold text-slate-800">
            {{ editingItem ? 'Edit Action Item' : 'Create Action Item' }}
          </DialogTitle>
          <DialogDescription class="text-slate-600 mt-1 text-sm">
            {{ editingItem ? 'Update the details' : 'Add a new task to track' }}
          </DialogDescription>
        </div>

        <div class="p-6 space-y-4">
          <div class="space-y-2">
            <Label for="title" class="text-sm font-medium text-slate-700">Title</Label>
            <Input
              id="title"
              v-model="formData.title"
              placeholder="What needs to be done?"
              class="h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-500/20"
            />
          </div>

          <div class="space-y-2">
            <Label for="description" class="text-sm font-medium text-slate-700">Description</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Add more details (optional)"
              rows="3"
              class="border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-2">
              <Label for="priority" class="text-sm font-medium text-slate-700">Priority</Label>
              <select
                id="priority"
                v-model="formData.priority"
                class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:ring-blue-500/20"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="assignedTo" class="text-sm font-medium text-slate-700">Assign To</Label>
              <select
                id="assignedTo"
                v-model="formData.assignedToId"
                class="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:ring-blue-500/20"
              >
                <option value="0" disabled>Select person</option>
                <option v-for="user in meetingParticipants" :key="user.userId" :value="user.userId">
                  {{ user.userName }}
                </option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="dueDate" class="text-sm font-medium text-slate-700">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              v-model="formData.dueDate"
              type="date"
              class="h-10 border-slate-200 focus:border-blue-400 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
          <button
            @click="closeDialog"
            class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            @click="saveActionItem"
            :disabled="!formData.title || !formData.assignedToId"
            class="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {{ editingItem ? 'Update' : 'Create' }}
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
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
          <button
            @click="showDeleteDialog = false"
            class="px-3 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-3 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
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

interface Participant {
  userId: number
  userName: string
  color: string
  lastActivity: Date
}

interface ActionItem {
  id: number
  title: string
  description: string
  status: ActionItemStatus
  priority: Priority
  dueDate: string | null
  assignedTo: { id: number; name: string }
  assignedBy: { id: number; name: string }
}

interface Props {
  meetingId: number
  participants?: Participant[]
}

const props = withDefaults(defineProps<Props>(), {
  participants: () => []
})

// Component state
const isExpanded = ref(true)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingItem = ref<ActionItem | null>(null)
const itemToDelete = ref<ActionItem | null>(null)

// Sample data (in real app, this would come from props/store)
const fakeActionItems = ref<ActionItem[]>([
  {
    id: 1,
    title: "Review Q4 marketing strategy document",
    description: "Go through the marketing strategy deck and provide feedback on key initiatives and budget allocation.",
    status: "IN_PROGRESS",
    priority: "HIGH",
    dueDate: "2024-01-15",
    assignedTo: { id: 1, name: "You" },
    assignedBy: { id: 2, name: "Sarah Chen" }
  },
  {
    id: 2,
    title: "Schedule user research interviews",
    description: "Coordinate with product team to schedule at least 5 user interviews for the new feature.",
    status: "OPEN",
    priority: "MEDIUM",
    dueDate: "2024-01-20",
    assignedTo: { id: 3, name: "Alex Johnson" },
    assignedBy: { id: 1, name: "You" }
  },
  {
    id: 3,
    title: "Update API documentation",
    description: "Document the new endpoints and update existing API documentation with examples.",
    status: "DONE",
    priority: "LOW",
    dueDate: "2024-01-10",
    assignedTo: { id: 4, name: "Maria Garcia" },
    assignedBy: { id: 1, name: "You" }
  }
])

// Form data
const formData = ref({
  title: '',
  description: '',
  priority: 'MEDIUM' as Priority,
  status: 'OPEN' as ActionItemStatus,
  assignedToId: 0,
  dueDate: ''
})

// Computed properties
const actionItems = computed(() => fakeActionItems.value)
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

// Use participants from props or fallback to fake data
const meetingParticipants = computed(() => {
  if (props.participants && props.participants.length > 0) {
    return props.participants
  }

  // Fallback fake participants
  return [
    { userId: 1, userName: "You", color: "#3b82f6", lastActivity: new Date() },
    { userId: 2, userName: "Sarah Chen", color: "#ec4899", lastActivity: new Date() },
    { userId: 3, userName: "Alex Johnson", color: "#10b981", lastActivity: new Date() },
    { userId: 4, userName: "Maria Garcia", color: "#f59e0b", lastActivity: new Date() }
  ]
})

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

  console.log('Saving action item:', formData.value)

  if (editingItem.value) {
    console.log('Update action item logic here')
  } else {
    console.log('Create action item logic here')
  }

  closeDialog()
}

const toggleItemStatus = (item: ActionItem) => {
  const newStatus = item.status === 'DONE' ? 'OPEN' : 'DONE'
  console.log(`Toggling status from ${item.status} to ${newStatus} for item: ${item.title}`)
}

const cycleStatus = (item: ActionItem) => {
  const statusCycle = {
    'OPEN': 'IN_PROGRESS',
    'IN_PROGRESS': 'DONE',
    'DONE': 'OPEN'
  }

  const newStatus = statusCycle[item.status as keyof typeof statusCycle] as ActionItemStatus
  console.log(`Cycling status from ${item.status} to ${newStatus} for item: ${item.title}`)
}

const deleteItem = (item: ActionItem) => {
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const confirmDelete = () => {
  if (!itemToDelete.value) return

  console.log('Deleting action item:', itemToDelete.value.title)
  showDeleteDialog.value = false
  itemToDelete.value = null
}

// Expose methods for parent component
defineExpose({
  updateConnectedUsers: (users: Array<{ userId: number; userName: string }>) => {
    console.log('Updating connected users in ActionItemManager:', users)
    // In a real app, you would update the participants list here
  }
})
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