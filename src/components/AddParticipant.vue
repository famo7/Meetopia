<template>
  <!-- Modal Backdrop -->
  <div v-if="props.isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>

    <!-- Modal Card -->
    <Card class="relative z-50 w-full max-w-md">
      <!-- Header -->
      <CardHeader>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus class="h-4 w-4 text-primary" />
            </div>
            <CardTitle>Add Participant</CardTitle>
          </div>
          <Button variant="ghost" size="sm" @click="closeModal" :disabled="isLoading">
            <X class="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Search and add a participant to this meeting</CardDescription>
      </CardHeader>

      <!-- Content -->
      <CardContent class="space-y-4">
        <!-- Search Input -->
        <div class="space-y-2">
          <Label for="search">Search by name or email</Label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input id="search" v-model="searchQuery" placeholder="Type to search..." class="pl-9" :disabled="isLoading"
              @input="handleSearch" />
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="searchQuery.length > 0 && filteredUsers.length === 0" class="flex items-center justify-center py-8">
          <UserX class="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p class="text-sm text-gray-500">No available users found</p>
        </div>

        <!-- Search Results -->
        <div v-else-if="searchQuery.length > 0" class="space-y-2">
          <p class="text-xs text-gray-500 mb-2">
            {{ filteredUsers.length }} {{ filteredUsers.length === 1 ? 'person' : 'people' }} found
          </p>

          <!-- User List -->
          <div class="max-h-64 overflow-y-auto space-y-1 border rounded-lg p-2">
            <button v-for="user in filteredUsers" :key="user.id" @click="selectUser(user)" :disabled="isLoading"
              class="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left disabled:opacity-50">
              <!-- Avatar -->
              <div
                class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
                <span class="text-sm font-semibold text-white">
                  {{ getInitials(user.name) }}
                </span>
              </div>

              <!-- User Info -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900">{{ user.name }}</p>
                <p class="text-xs text-gray-500 truncate">{{ user.email }}</p>
              </div>

              <!-- Selected indicator -->
              <Check v-if="selectedUser?.id === user.id" class="h-4 w-4 text-primary flex-shrink-0" />
            </button>

            <!-- Empty state -->
            <div v-if="filteredUsers.length === 0" class="text-center py-8">
              <UserX class="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p class="text-sm text-gray-500">No users found</p>
              <p class="text-xs text-gray-400">Try a different search term</p>
            </div>
          </div>
        </div>

        <!-- Initial State -->
        <div v-else class="text-center py-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
            <Search class="h-6 w-6 text-gray-400" />
          </div>
          <p class="text-sm text-gray-500">Start typing to search for users</p>
        </div>

        <!-- Selected User Preview -->
        <div v-if="selectedUser" class="p-3 rounded-lg bg-blue-50 border border-blue-200">
          <div class="flex items-center gap-3">
            <div
              class="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center flex-shrink-0">
              <span class="text-sm font-semibold text-white">
                {{ getInitials(selectedUser.name) }}
              </span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">{{ selectedUser.name }}</p>
              <p class="text-xs text-gray-500">{{ selectedUser.email }}</p>
            </div>
            <button @click="clearSelection" class="text-gray-400 hover:text-gray-600">
              <X class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="p-3 rounded-lg bg-red-50 border border-red-200">
          <p class="text-sm text-red-600">{{ error }}</p>
        </div>
      </CardContent>

      <!-- Footer -->
      <CardFooter class="flex justify-end gap-2">
        <Button variant="outline" @click="closeModal" :disabled="isLoading">
          Cancel
        </Button>
        <Button @click="handleSubmit" :disabled="!selectedUser || isLoading">
          <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
          {{ isLoading ? 'Adding...' : 'Add Participant' }}
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useParticipantStore } from '@/stores/participant'
import { useMeetingStore } from '@/stores/meeting'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { UserPlus, X, Search, Check, UserX, Loader2 } from 'lucide-vue-next'

interface User {
  id: number
  name: string
  email: string
}

const props = defineProps<{
  isOpen: boolean
  meetingId: number
}>()

const emit = defineEmits<{
  close: []
  success: []
}>()

const participantStore = useParticipantStore()
const meetingStore = useMeetingStore()

const searchQuery = ref('')
const selectedUser = ref<User | null>(null)
const isLoading = ref(false)
const error = ref('')

let searchTimeout: number | undefined

const currentMeeting = computed(() =>
  meetingStore.meetings.find(m => m.id === props.meetingId) || meetingStore.currentMeeting
)


const allKnownUsers = computed(() => {
  const usersMap = new Map<number, User>()

  meetingStore.meetings.forEach(meeting => {
    if (!usersMap.has(meeting.creator.id)) {
      usersMap.set(meeting.creator.id, {
        id: meeting.creator.id,
        name: meeting.creator.name,
        email: meeting.creator.email
      })
    }

    meeting.participants?.forEach(p => {
      if (!usersMap.has(p.user.id)) {
        usersMap.set(p.user.id, {
          id: p.user.id,
          name: p.user.name,
          email: p.user.email
        })
      }
    })
  })

  return Array.from(usersMap.values())
})

const existingParticipantIds = computed(() => {
  if (!currentMeeting.value) return new Set<number>()

  const ids = new Set<number>()

  ids.add(currentMeeting.value.creator.id)

  currentMeeting.value.participants?.forEach(p => {
    ids.add(p.user.id)
  })

  return ids
})

const availableUsers = computed(() => {
  return allKnownUsers.value.filter(user =>
    !existingParticipantIds.value.has(user.id)
  )
})

const filteredUsers = computed(() => {
  if (searchQuery.value.length === 0) return []

  const query = searchQuery.value.toLowerCase()
  return availableUsers.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const handleSearch = () => {
  clearTimeout(searchTimeout)

  if (searchQuery.value.length === 0) {
    return
  }

  searchTimeout = setTimeout(() => {
  }, 300)
}

const selectUser = (user: User) => {
  selectedUser.value = user
  error.value = ''
}

const clearSelection = () => {
  selectedUser.value = null
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const handleSubmit = async () => {
  if (!selectedUser.value) return

  isLoading.value = true
  error.value = ''

  try {
    await participantStore.addParticipant(props.meetingId, {
      userId: selectedUser.value.id,
      role: 'PARTICIPANT'
    })

    resetForm()
    emit('success')
    emit('close')
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to add participant. They may already be in the meeting.'
    console.error('Failed to add participant:', err)
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  searchQuery.value = ''
  selectedUser.value = null
  error.value = ''
}

const closeModal = () => {
  if (!isLoading.value) {
    resetForm()
    emit('close')
  }
}

// Reset form when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    resetForm()
  }
})
</script>