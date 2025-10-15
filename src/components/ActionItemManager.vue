<template>
  <div class="bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Header -->
    <div
      class="px-6 py-5 flex items-center justify-between cursor-pointer group hover:bg-slate-50/80 transition-all duration-300"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="relative">
            <CheckSquare class="h-6 w-6 text-slate-600 group-hover:text-slate-700 transition-colors" />
            <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" v-if="hasCompletedItems"></div>
          </div>
          <h3 class="text-lg font-semibold text-slate-800">Action Items</h3>
          <div class="flex items-center gap-2">
            <div class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">
              {{ actionItems.length }} total
            </div>
            <div v-if="hasPendingItems" class="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
              <div class="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              {{ pendingItemsCount }} pending
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button
          @click.stop="showCreateDialog = true"
          class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm transition-all duration-200"
        >
          <Plus class="h-4 w-4" />
          <span class="hidden sm:inline">Add Item</span>
        </button>
        <div class="p-2 rounded-lg transition-transform duration-300" :class="isExpanded ? 'rotate-180' : ''">
          <ChevronDown class="h-5 w-5 text-slate-500" />
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
        <!-- Action Items Grid -->
        <div v-if="actionItems.length > 0" class="p-6 space-y-3">
          <div
            v-for="item in actionItems"
            :key="item.id"
            class="group/item bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <div class="flex items-start gap-4">
              <!-- Status Checkbox -->
              <button
                @click="toggleItemStatus(item)"
                class="mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border-2 transition-all duration-200 hover:scale-105"
                :class="[
                  item.status === 'DONE'
                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/25'
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50',
                ]"
              >
                <Check v-if="item.status === 'DONE'" class="h-3.5 w-3.5" />
              </button>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-slate-800 text-base leading-tight" :class="item.status === 'DONE' ? 'line-through opacity-60' : ''">
                      {{ item.title }}
                    </h4>
                    <p v-if="item.description" class="text-slate-600 mt-1.5 text-sm leading-relaxed">
                      {{ item.description }}
                    </p>
                  </div>

                  <!-- Priority Badge -->
                  <div
                    class="px-2.5 py-1 rounded-full text-xs font-semibold border"
                    :class="getPriorityClasses(item.priority)"
                  >
                    {{ item.priority }}
                  </div>
                </div>

                <!-- Meta Information -->
                <div class="flex items-center gap-4 mt-3.5 text-xs text-slate-500">
                  <div class="flex items-center gap-1.5">
                    <div class="w-5 h-5 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center">
                      <User class="h-3 w-3 text-white" />
                    </div>
                    <span class="font-medium">{{ item.assignedTo.name }}</span>
                  </div>
                  <div v-if="item.dueDate" class="flex items-center gap-1.5">
                    <Calendar class="h-3.5 w-3.5" />
                    <span :class="{ 'text-red-500 font-medium': isOverdue(item.dueDate) }">
                      {{ formatDate(item.dueDate) }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 text-slate-400">
                    <span>by {{ item.assignedBy.name }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex items-center gap-2 mt-4">
                  <button
                    @click="updateItemStatus(item)"
                    class="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-700 transition-colors duration-200"
                  >
                    <RefreshCw class="h-3 w-3" />
                    {{ getNextStatus(item.status) }}
                  </button>

                  <button
                    @click="editItem(item)"
                    class="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-600 transition-colors duration-200"
                  >
                    <Edit class="h-3 w-3" />
                    Edit
                  </button>

                  <button
                    @click="deleteItem(item)"
                    class="flex items-center gap-1.5 px-3 py-1.5 hover:bg-red-50 rounded-lg text-xs font-medium text-red-600 transition-colors duration-200"
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
        <div v-else class="px-6 py-16 text-center">
          <div class="relative mx-auto w-20 h-20 mb-6">
            <div class="absolute inset-0 bg-slate-100 rounded-2xl"></div>
            <CheckSquare class="absolute inset-2 h-16 w-16 text-slate-400" />
          </div>
          <h3 class="text-lg font-semibold text-slate-800 mb-2">No action items yet</h3>
          <p class="text-slate-500 mb-6 max-w-sm mx-auto">Start tracking tasks and decisions by creating your first action item</p>
          <button
            @click="showCreateDialog = true"
            class="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus class="h-4 w-4" />
            Create Action Item
          </button>
        </div>
      </div>
    </Transition>

    <!-- Create/Edit Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-[540px] p-0 overflow-hidden">
        <div class="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-5 border-b border-slate-200">
          <DialogTitle class="text-xl font-semibold text-slate-800">
            {{ editingItem ? 'Edit Action Item' : 'Create Action Item' }}
          </DialogTitle>
          <DialogDescription class="text-slate-600 mt-1">
            {{ editingItem ? 'Update the action item details.' : 'Add a new action item to track tasks and decisions.' }}
          </DialogDescription>
        </div>

        <div class="p-6 space-y-5">
          <div class="space-y-2">
            <Label for="title" class="text-sm font-semibold text-slate-700">Title</Label>
            <Input
              id="title"
              v-model="formData.title"
              placeholder="Enter action item title"
              class="h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-500/20"
            />
          </div>

          <div class="space-y-2">
            <Label for="description" class="text-sm font-semibold text-slate-700">Description</Label>
            <Textarea
              id="description"
              v-model="formData.description"
              placeholder="Enter description (optional)"
              rows="3"
              class="border-slate-200 focus:border-blue-400 focus:ring-blue-500/20 resize-none"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="priority" class="text-sm font-semibold text-slate-700">Priority</Label>
              <select
                id="priority"
                v-model="formData.priority"
                class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:ring-blue-500/20 transition-colors"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div class="space-y-2">
              <Label for="status" class="text-sm font-semibold text-slate-700">Status</Label>
              <select
                id="status"
                v-model="formData.status"
                class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:ring-blue-500/20 transition-colors"
              >
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="assignedTo" class="text-sm font-semibold text-slate-700">Assign To</Label>
            <select
              id="assignedTo"
              v-model="formData.assignedToId"
              class="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-blue-400 focus:ring-blue-500/20 transition-colors"
            >
              <option value="0" disabled>Select user</option>
              <option v-for="user in meetingParticipants" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
          </div>

          <div class="space-y-2">
            <Label for="dueDate" class="text-sm font-semibold text-slate-700">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              v-model="formData.dueDate"
              type="date"
              class="h-11 border-slate-200 focus:border-blue-400 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
          <button
            @click="closeDialog"
            class="px-5 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            @click="saveActionItem"
            class="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg"
          >
            {{ editingItem ? 'Update' : 'Create' }}
          </button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent class="sm:max-w-[420px] p-0">
        <div class="px-6 py-5">
          <div class="flex items-center gap-3 text-red-600 mb-4">
            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Trash2 class="h-5 w-5" />
            </div>
            <DialogTitle class="text-lg font-semibold text-slate-800">Delete Action Item</DialogTitle>
          </div>
          <DialogDescription class="text-slate-600 mb-4">
            Are you sure you want to delete this action item? This action cannot be undone.
          </DialogDescription>

          <div v-if="itemToDelete" class="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <h4 class="font-semibold text-slate-800 mb-1">{{ itemToDelete.title }}</h4>
            <p v-if="itemToDelete.description" class="text-sm text-slate-600">
              {{ itemToDelete.description }}
            </p>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-200 flex gap-3 justify-end">
          <button
            @click="showDeleteDialog = false"
            class="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200"
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

interface User {
  id: number
  name: string
}

interface ActionItem {
  id: number
  title: string
  description: string
  status: ActionItemStatus
  priority: Priority
  dueDate: string | null
  assignedTo: User
  assignedBy: User
}

interface Props {
  meetingId: number
}

defineProps<Props>()

// Component state
const isExpanded = ref(true)
const showCreateDialog = ref(false)
const showDeleteDialog = ref(false)
const editingItem = ref<ActionItem | null>(null)
const itemToDelete = ref<ActionItem | null>(null)

// Fake data
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
  },
  {
    id: 4,
    title: "Prepare demo for client presentation",
    description: "Create and rehearse demo presentation for next week's client meeting.",
    status: "OPEN",
    priority: "HIGH",
    dueDate: "2024-01-18",
    assignedTo: { id: 1, name: "You" },
    assignedBy: { id: 2, name: "Sarah Chen" }
  }
])

const fakeParticipants = ref<User[]>([
  { id: 1, name: "You" },
  { id: 2, name: "Sarah Chen" },
  { id: 3, name: "Alex Johnson" },
  { id: 4, name: "Maria Garcia" }
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
const hasPendingItems = computed(() =>
  actionItems.value.some(item => item.status !== 'DONE')
)
const pendingItemsCount = computed(() =>
  actionItems.value.filter(item => item.status !== 'DONE').length
)
const hasCompletedItems = computed(() =>
  actionItems.value.some(item => item.status === 'DONE')
)
const meetingParticipants = computed(() => fakeParticipants.value)

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const getPriorityClasses = (priority: Priority) => {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'LOW':
      return 'bg-green-100 text-green-700 border-green-200'
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

const getNextStatus = (currentStatus: ActionItemStatus) => {
  const statusCycle = {
    'OPEN': 'In Progress',
    'IN_PROGRESS': 'Done',
    'DONE': 'Open'
  }
  return statusCycle[currentStatus as keyof typeof statusCycle]
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

const updateItemStatus = (item: ActionItem) => {
  const statusCycle = {
    'OPEN': 'IN_PROGRESS',
    'IN_PROGRESS': 'DONE',
    'DONE': 'OPEN'
  }

  const newStatus = statusCycle[item.status as keyof typeof statusCycle] as ActionItemStatus
  console.log(`Updating status from ${item.status} to ${newStatus} for item: ${item.title}`)
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
</script>