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
          <!-- Toggle View Button -->
          <Button variant="outline" size="sm" @click="toggleLayout"
            class="bg-gray-700 hover:bg-gray-600 text-white border-gray-600">
            <component :is="currentLayout === 'split' ? Video : FileText" class="h-4 w-4 mr-1.5" />
            {{ currentLayout === 'split' ? 'Full Screen Video' : 'Split View' }}
          </Button>

          <!-- Active Participants -->
          <div class="flex items-center gap-2">
            <Users class="h-4 w-4 text-gray-400" />
            <span class="text-sm text-gray-300">{{ connectedUsers.length }} in meeting</span>
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
      <!-- Agora Video Conference -->
      <div :class="[
        'transition-all duration-300 bg-gray-950 relative',
        currentLayout === 'split' ? 'w-1/2' : 'flex-1'
      ]">
        <!-- Remote Video Container -->
        <div id="remote-video-container" class="absolute inset-0 flex flex-wrap gap-2 p-4">
          <!-- Remote videos will be inserted here dynamically -->
        </div>

        <!-- Local Video (Small Corner) -->
        <div id="local-video"
          class="absolute bottom-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-xl z-10 border-2 border-gray-700">
          <!-- Local video stream -->
        </div>

        <!-- Loading State -->
        <div v-if="!agoraClient" class="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
          <Video class="h-16 w-16 mb-4 opacity-50 animate-pulse" />
          <p>Connecting to video...</p>
        </div>
      </div>

      <!-- Collaborative Editor -->
      <div v-if="currentLayout === 'split'" class="w-1/2 overflow-y-auto border-l border-gray-700">
        <div class="p-8">
          <div class="bg-white rounded-lg shadow-lg min-h-[600px]">
            <!-- Editor Header -->
            <div class="border-b border-gray-200 px-6 py-4">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-lg font-semibold text-gray-900">Meeting Notes</h2>
                  <p class="text-xs text-gray-500 mt-1">
                    Collaborating with {{ connectedUsers.length - 1 }} others
                    <span v-if="isReceivingUpdate" class="text-blue-600 ml-2">
                      ⚡ Receiving updates...
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Editor Content -->
            <div class="p-6">
              <Textarea ref="textareaRef" v-model="notes" @input="handleNotesUpdate"
                class="min-h-[500px] text-gray-900 font-mono text-sm leading-relaxed border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Start taking notes... Everyone in the meeting can see and edit these notes in real-time." />

              <!-- Live Cursors Indicator -->
              <div v-if="connectedUsers.length > 1" class="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <div class="flex -space-x-2">
                  <div v-for="user in connectedUsers.filter(u => u.userId !== currentUserId)" :key="user.socketId"
                    class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-xs font-semibold text-white"
                    :style="{ backgroundColor: user.color }" :title="user.userName">
                    {{ getInitials(user.userName) }}
                  </div>
                </div>
                <span>
                  {{connectedUsers.filter(u => u.userId !== currentUserId).map(u => u.userName).join(', ')}}
                  {{ connectedUsers.length - 1 === 1 ? 'is' : 'are' }} also editing
                </span>
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
      <div class="w-80 bg-gray-800 border-l border-gray-700 flex-shrink-0 overflow-y-auto">
        <div class="p-6">
          <h3 class="text-sm font-semibold mb-4 text-gray-100">
            Currently In Meeting ({{ connectedUsers.length }})
          </h3>

          <div class="space-y-2">
            <div v-for="user in connectedUsers" :key="user.socketId"
              class="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 hover:bg-gray-700 transition-colors">
              <div class="relative">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                  :style="{ backgroundColor: user.color }">
                  {{ getInitials(user.userName) }}
                </div>
                <div
                  class="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800 animate-pulse">
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-white truncate">
                  {{ user.userName }}
                  <span v-if="user.userId === currentUserId" class="text-xs text-gray-400">(You)</span>
                </p>
                <p class="text-xs text-gray-500">Online</p>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="connectedUsers.length === 0" class="text-center py-8">
            <Users class="h-12 w-12 mx-auto mb-3 text-gray-600" />
            <p class="text-sm text-gray-400">Connecting...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingStore } from '@/stores/meeting'
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Users, LogOut, Check, Video, FileText } from 'lucide-vue-next'
import { io, Socket } from 'socket.io-client'
import AgoraRTC from 'agora-rtc-sdk-ng'
import type {
  IAgoraRTCClient,
  ICameraVideoTrack,
  IMicrophoneAudioTrack
} from 'agora-rtc-sdk-ng'
import axios from '@/lib/axios'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const authStore = useAuthStore()

let socket: Socket | null = null
let agoraClient: IAgoraRTCClient | null = null
let localAudioTrack: IMicrophoneAudioTrack | null = null
let localVideoTrack: ICameraVideoTrack | null = null

const meeting = computed(() => meetingStore.currentMeeting)
const notes = ref('')
const isSaving = ref(false)
const lastSaved = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isReceivingUpdate = ref(false)
const currentLayout = ref<'split' | 'fullscreen'>('split')

const currentUserId = computed(() => {
  const id = authStore.user?.id
  return typeof id === 'string' ? parseInt(id) : id
})

const connectedUsers = ref<Array<{
  socketId: string
  userId: number
  userName: string
  color: string
  lastActivity: Date
}>>([])

const toggleLayout = () => {
  currentLayout.value = currentLayout.value === 'split' ? 'fullscreen' : 'split'
}

const remoteUsers = ref<Set<string | number>>(new Set())

const initAgora = async () => {
  try {
    const meetingId = route.params.id

    const { data } = await axios.post(`/meetings/${meetingId}/agora-token`)

    agoraClient = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

    agoraClient.on('user-published', async (user, mediaType) => {
      await agoraClient!.subscribe(user, mediaType)

      if (mediaType === 'video') {
        remoteUsers.value.add(user.uid)

        const remoteContainer = document.getElementById('remote-video-container')
        if (remoteContainer) {
          const playerDiv = document.createElement('div')
          playerDiv.id = `player-${user.uid}`
          playerDiv.className = 'flex-1 min-w-[300px] h-full bg-gray-900 rounded-lg overflow-hidden relative'

          const nameLabel = document.createElement('div')
          nameLabel.className = 'absolute bottom-2 left-2 bg-black/70 px-3 py-1 rounded text-sm text-white z-10'
          nameLabel.textContent = `User ${user.uid}`
          playerDiv.appendChild(nameLabel)

          remoteContainer.appendChild(playerDiv)
          user.videoTrack?.play(`player-${user.uid}`)
        }
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play()
      }
    })

    agoraClient.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        remoteUsers.value.delete(user.uid)
        const playerDiv = document.getElementById(`player-${user.uid}`)
        if (playerDiv) {
          playerDiv.remove()
        }
      }
    })

    agoraClient.on('user-left', (user) => {
      remoteUsers.value.delete(user.uid)
      const playerDiv = document.getElementById(`player-${user.uid}`)
      if (playerDiv) {
        playerDiv.remove()
      }
    })

    const uid = await agoraClient.join(
      data.appId,
      data.channelName,
      data.token,
      currentUserId.value
    )

    console.log('✅ Joined Agora channel:', data.channelName, 'with UID:', uid)

    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    localVideoTrack = await AgoraRTC.createCameraVideoTrack()

    const localContainer = document.getElementById('local-video')
    if (localContainer) {
      localVideoTrack.play(localContainer)
    }

    await agoraClient.publish([localAudioTrack, localVideoTrack])
    console.log('✅ Published local audio and video')

  } catch (error) {
    console.error('Failed to initialize Agora:', error)
  }
}

const disconnectAgora = async () => {
  try {
    if (localAudioTrack) {
      localAudioTrack.close()
      localAudioTrack = null
    }

    if (localVideoTrack) {
      localVideoTrack.close()
      localVideoTrack = null
    }

    if (agoraClient) {
      await agoraClient.leave()
      agoraClient = null
    }

    remoteUsers.value.clear()

    console.log('✅ Disconnected from Agora')
  } catch (error) {
    console.error('Error disconnecting Agora:', error)
  }
}

const loadMeeting = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/dashboard/meetings')
    return
  }
  await meetingStore.fetchMeetingById(id)

  if (meeting.value?.notes) {
    notes.value = meeting.value.notes.content || ''
  }
}

const initSocket = () => {
  const meetingId = route.params.id
  const userId = currentUserId.value
  const userName = authStore.user!.name

  socket = io('http://localhost:3000', {
    withCredentials: true,
    transports: ['websocket', 'polling']
  })

  socket.on('connect', () => {
    socket?.emit('join-meeting', { meetingId, userId, userName })
  })

  socket.on('disconnect', () => {
  })

  socket.on('connect_error', (error: Error) => {
    console.error('Socket connection error:', error)
  })

  socket.on('error', (data: { message: string }) => {
    console.error('Socket error:', data.message)
  })

  socket.on('user-joined', (data: { socketId: string; userId: number; userName: string; color: string }) => {
    connectedUsers.value.push({
      socketId: data.socketId,
      userId: data.userId,
      userName: data.userName,
      color: data.color,
      lastActivity: new Date()
    })
  })

  socket.on('user-left', (data: { socketId: string; userName: string }) => {
    connectedUsers.value = connectedUsers.value.filter(u => u.socketId !== data.socketId)
  })

  socket.on('current-users', (users: Array<{ socketId: string; userId: number; userName: string; color: string }>) => {
    const myself = {
      socketId: socket!.id!,
      userId: currentUserId.value!,
      userName: authStore.user!.name,
      color: '#3b82f6',
      lastActivity: new Date()
    }

    connectedUsers.value = [
      myself,
      ...users.map(u => ({ ...u, lastActivity: new Date() }))
    ]
  })

  socket.on('notes-updated', (data: { userId: number; content: string; userName: string }) => {
    if (data.userId !== currentUserId.value) {
      isReceivingUpdate.value = true

      let cursorPosition = 0
      if (textareaRef.value) {
        const textarea = (textareaRef.value as any).$el?.querySelector?.('textarea') || textareaRef.value
        cursorPosition = textarea?.selectionStart || 0
      }

      notes.value = data.content

      nextTick(() => {
        if (textareaRef.value) {
          const textarea = (textareaRef.value as any).$el?.querySelector?.('textarea') || textareaRef.value
          if (textarea && typeof textarea.setSelectionRange === 'function') {
            textarea.setSelectionRange(cursorPosition, cursorPosition)
          }
        }
        isReceivingUpdate.value = false
      })
    }
  })

  socket.on('notes-saved', () => {
  })
}

const disconnectSocket = () => {
  if (socket) {
    socket.emit('leave-meeting', {
      meetingId: route.params.id,
      userId: currentUserId.value
    })
    socket.disconnect()
    socket = null
  }
}

let saveTimeout: ReturnType<typeof setTimeout>
let updateTimeout: ReturnType<typeof setTimeout>

const handleNotesUpdate = () => {
  if (isReceivingUpdate.value) {
    return
  }

  clearTimeout(updateTimeout)
  updateTimeout = setTimeout(() => {
    if (socket && socket.connected) {
      socket.emit('update-notes', {
        meetingId: route.params.id,
        userId: currentUserId.value,
        content: notes.value
      })
    }
  }, 500)

  clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    isSaving.value = true
    try {
      if (socket && socket.connected) {
        socket.emit('save-notes', {
          meetingId: route.params.id,
          content: notes.value
        })
      }

      lastSaved.value = 'just now'
      setTimeout(() => {
        lastSaved.value = ''
      }, 3000)
    } catch (error) {
      console.error('Error saving notes:', error)
    } finally {
      isSaving.value = false
    }
  }, 2000)
}

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const leaveMeeting = async () => {
  disconnectSocket()
  await disconnectAgora()
  router.push(`/dashboard/meetings/${meeting.value?.id}`)
}

onMounted(() => {
  loadMeeting()
  nextTick(() => {
    initSocket()
    initAgora() // Initialize Agora video
  })
})

onUnmounted(async () => {
  disconnectSocket()
  await disconnectAgora() // Clean up Agora on unmount
})
</script>