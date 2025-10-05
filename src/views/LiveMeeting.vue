<template>
  <div class="h-screen bg-gray-900 text-white flex flex-col">
    <!-- Top Bar -->
    <div class="bg-gray-800 border-b border-gray-700 px-6 py-4 flex-shrink-0">
      <div class="flex items-center justify-between max-w-7xl mx-auto">
        <div class="flex items-center gap-4">
          <h1 class="text-lg font-semibold">{{ meeting?.title || 'Loading...' }}</h1>
          <Badge class="bg-green-500 text-white hover:bg-green-500 flex items-center gap-1.5">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Live
          </Badge>
        </div>

        <div class="flex items-center gap-4">
          <!-- Active Participants -->
          <div class="flex items-center gap-2">
            <Users class="h-4 w-4 text-gray-400" />
            <span class="text-sm text-gray-300">{{ activeParticipants.length }} in meeting</span>
          </div>

          <Button variant="destructive" size="sm" @click="leaveMeeting">
            <LogOut class="h-4 w-4 mr-1.5" />
            Leave Meeting
          </Button>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Collaborative Editor -->
      <div class="flex-1 overflow-y-auto">
        <div class="max-w-4xl mx-auto p-8">
          <div class="bg-white rounded-lg shadow-lg min-h-[600px]">
            <!-- Editor Header -->
            <div class="border-b border-gray-200 px-6 py-4">
              <h2 class="text-lg font-semibold text-gray-900">Meeting Notes</h2>
              <p class="text-xs text-gray-500 mt-1">Collaborating with {{ activeParticipants.length - 1 }} others</p>
            </div>

            <!-- Editor Content -->
            <div class="p-6">
              <Textarea v-model="notes" @input="handleNotesUpdate"
                class="min-h-[500px] text-gray-900 font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Start taking notes... Everyone in the meeting can see and edit these notes in real-time." />

              <!-- Live Cursors Indicator -->
              <!-- TODO: Replace with real-time socket.io connected users instead of database participants -->
              <!-- This should show only users currently connected via socket, not all invited participants -->
              <div v-if="activeParticipants.length > 1" class="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <div class="flex -space-x-2">
                  <div v-for="participant in activeParticipants.filter(p => String(p.id) !== String(currentUserId))"
                    :key="participant.id"
                    class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
                    :style="{ backgroundColor: participant.color }" :title="participant.name">
                    {{ getInitials(participant.name) }}
                  </div>
                </div>
                <!-- <span>{{activeParticipants.filter(p => String(p.id) !== String(currentUserId)).map(p => p.name).join(',
                  ') }} {{ activeParticipants.length - 1 === 1 ? 'is' : 'are' }} also editing</span> -->
              </div>
            </div>
          </div>

          <!-- Auto-save indicator -->
          <div class="mt-4 flex items-center justify-between text-xs text-gray-400">
            <div class="flex items-center gap-2">
              <div v-if="isSaving" class="flex items-center gap-2">
                <div class="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                <span>Saving...</span>
              </div>
              <div v-else-if="lastSaved" class="flex items-center gap-2">
                <Check class="h-3 w-3 text-green-500" />
                <span>Saved {{ lastSaved }}</span>
              </div>
            </div>
            <span class="text-gray-500">{{ notes.length }} characters</span>
          </div>
        </div>
      </div>

      <!-- Participants Sidebar -->
      <!-- TODO: Replace activeParticipants with real-time connectedUsers from socket.io -->
      <!-- Only show users currently in the meeting via socket connection -->
      <div class="w-80 bg-gray-800 border-l border-gray-700 flex-shrink-0 overflow-y-auto">
        <div class="p-6">
          <h3 class="text-sm font-semibold mb-4 text-gray-100">
            In Meeting ({{ activeParticipants.length }})
          </h3>

          <div class="space-y-2">
            <div v-for="participant in activeParticipants" :key="participant.id"
              class="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
              <div class="relative">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  :style="{ backgroundColor: participant.color }">
                  {{ getInitials(participant.name) }}
                </div>
                <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800">
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                  {{ participant.name }}
                  <span v-if="String(participant.id) === String(currentUserId)"
                    class="text-xs text-gray-400">(You)</span>
                </p>
                <p class="text-xs text-gray-400 capitalize">{{ participant.role }}</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="activeParticipants.length === 0" class="text-center py-8">
            <Users class="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p class="text-sm text-gray-400">No one else is here yet</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingStore } from '@/stores/meeting'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Users, LogOut, Check } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const authStore = useAuthStore()

const meeting = computed(() => meetingStore.currentMeeting)
const notes = ref('')
const isSaving = ref(false)
const lastSaved = ref('')
const currentUserId = computed(() => {
  const id = authStore.user?.id
  return typeof id === 'string' ? parseInt(id) : id
})

// Mock active participants - Replace with real socket.io data
const activeParticipants = ref<Array<{
  id: number | string
  name: string
  role: string
  color: string
}>>([])

// Load meeting data
const loadMeeting = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/dashboard/meetings')
    return
  }
  await meetingStore.fetchMeetingById(id)

  // Load existing notes from MeetingNote relation
  if (meeting.value?.notes) {
    // notes is a MeetingNote object with content property
    notes.value = meeting.value.notes.content || ''
  }

  // Add current user first
  if (authStore.user) {
    activeParticipants.value.push({
      id: currentUserId.value as number,
      name: authStore.user.name,
      role: 'host',
      color: '#f97316'
    })
  }

  // Add meeting participants to active list
  if (meeting.value?.participants) {
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']
    meeting.value.participants.forEach((p: any, index: number) => {
      activeParticipants.value.push({
        id: p.user.id,
        name: p.user.name,
        role: p.role.toLowerCase(),
        color: colors[index % colors.length]
      })
    })
  }
}

// Handle notes update with auto-save
let saveTimeout: ReturnType<typeof setTimeout>
const handleNotesUpdate = () => {
  // TODO: Emit real-time update via socket
  // socket.emit('update-notes', {
  //   meetingId: route.params.id,
  //   userId: currentUserId.value,
  //   content: notes.value
  // })

  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    isSaving.value = true
    try {
      // Save to backend
      // TODO: Add API endpoint to update meeting notes
      // await meetingStore.updateMeetingNotes(meeting.value!.id, notes.value)

      lastSaved.value = 'just now'
      setTimeout(() => {
        lastSaved.value = ''
      }, 3000)
    } catch (error) {
      console.error('Failed to save notes:', error)
    } finally {
      isSaving.value = false
    }
  }, 1000)
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const leaveMeeting = () => {
  // TODO: Disconnect socket
  router.push(`/dashboard/meetings/${meeting.value?.id}`)
}

onMounted(() => {
  loadMeeting()

  // TODO: Initialize socket.io connection for real-time collaboration
  // const socket = io('http://localhost:3000')
  // 
  // socket.emit('join-meeting', { 
  //   meetingId: route.params.id, 
  //   userId: currentUserId.value,
  //   userName: authStore.user?.name 
  // })
  // 
  // socket.on('user-joined', (user) => {
  //   // Add to connectedUsers (real-time presence)
  // })
  // 
  // socket.on('user-left', (socketId) => {
  //   // Remove from connectedUsers
  // })
  // 
  // socket.on('notes-updated', ({ userId, content }) => {
  //   if (userId !== currentUserId.value) {
  //     notes.value = content
  //   }
  // })
  // 
  // socket.on('cursor-move', ({ userId, position }) => {
  //   // Update cursor position for live cursors feature
  // })
})

onUnmounted(() => {
  // TODO: Disconnect from socket
  // socket.emit('leave-meeting', { meetingId, userId })
  // socket.disconnect()
})
</script>