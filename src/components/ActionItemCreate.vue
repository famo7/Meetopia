<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-md">
      <DialogTitle class="text-xl font-semibold">
        Create Action Item
      </DialogTitle>
      <DialogDescription class="text-gray-600">
        Add a new action item to track tasks and assignments.
      </DialogDescription>

      <div class="space-y-4">
        <div>
          <Label for="title">Title</Label>
          <Input id="title" v-model="formData.title" placeholder="Enter action item title" class="mt-1" />
        </div>

        <div>
          <Label for="description">Description</Label>
          <Textarea id="description" v-model="formData.description" placeholder="Enter detailed description" rows="3"
            class="mt-1" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <Label for="priority">Priority</Label>
            <select id="priority" v-model="formData.priority"
              class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div>
            <Label for="dueDate">Due Date</Label>
            <DatePicker
              id="dueDate"
              v-model="dueDateValue"
              placeholder="Select due date"
              class="mt-1"
            />
          </div>
        </div>

        <div>
          <Label for="assignedTo">Assign To</Label>
          <select id="assignedTo" v-model="formData.assignedToId"
            class="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">Select person</option>
            <option v-for="participant in participants" :key="participant.user.id" :value="participant.user.id">
              {{ participant.user.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="mt-6 flex justify-end space-x-3">
        <button @click="handleCancel"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Cancel
        </button>
        <button @click="handleSubmit"
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          Create
        </button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { DatePicker } from '@/components/ui/date-picker'
import type { Participant } from '@/types'
import type { CreateActionItemRequest } from '@/types/actionItem'
import { useActionItemStore } from '@/stores/actionItem'
interface Props {
  open: boolean
  meetingId: number,
  participants: Participant[]
}

interface Emits {
  (e: 'update:open', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const actionItemStore = useActionItemStore()
const formData = ref<CreateActionItemRequest>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: ''
})

// Computed property to handle date conversion between string and Date
const dueDateValue = computed({
  get: () => {
    if (!formData.value.dueDate) return undefined
    return new Date(formData.value.dueDate)
  },
  set: (value) => {
    formData.value.dueDate = value ? value.toISOString().split('T')[0] : ''
  }
})

const handleCancel = () => {
  emit('update:open', false)
  console.log('ActionItemCreate: Cancelled')
}

const handleSubmit = async () => {
  try {
    await actionItemStore.createActionItem(props.meetingId, {
      title: formData.value.title,
      description: formData.value.description,
      priority: formData.value.priority,
      assignedToId: formData.value.assignedToId ? Number(formData.value.assignedToId) : undefined,
      dueDate: formData.value.dueDate || undefined,
      status: 'OPEN'
    })

    await actionItemStore.fetchActionItems(props.meetingId)

    emit('update:open', false)
  } catch (error) {
    console.error('Failed to create action item:', error)
  }
}

watch(() => props.open, (newVal) => {
  if (!newVal) {
    formData.value = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: ''
    }
  }
})

</script>