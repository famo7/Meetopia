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
        'transition-all duration-300 bg-gradient-to-br from-gray-950 to-gray-900 relative',
        currentLayout === 'split' ? 'w-1/2' : 'flex-1'
      ]">
        <!-- Remote Video Container -->
        <div id="remote-video-container" class="absolute inset-0 flex flex-wrap gap-3 p-6">
          <!-- Remote videos will be inserted here dynamically -->
        </div>

        <!-- Local Video (Small Corner) -->
        <div id="local-video"
          class="absolute bottom-24 right-6 w-64 h-48 bg-gray-900 rounded-xl overflow-hidden shadow-2xl z-10 border border-gray-700/50">
          <!-- Local video stream -->
          <div class="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md text-xs text-white">
            You
          </div>
        </div>

        <!-- Video Controls Bar -->
        <div class="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div class="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-2xl px-6 py-4 border border-gray-700/50">
            <div class="flex items-center gap-3">
              <!-- Microphone Toggle -->
              <button @click="toggleAudio" :class="[
                'p-4 rounded-xl transition-all duration-200 hover:scale-105',
                isAudioEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              ]" :title="isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'">
                <Mic v-if="isAudioEnabled" class="h-5 w-5" />
                <MicOff v-else class="h-5 w-5" />
              </button>

              <!-- Camera Toggle -->
              <button @click="toggleVideo" :class="[
                'p-4 rounded-xl transition-all duration-200 hover:scale-105',
                isVideoEnabled
                  ? 'bg-gray-700 hover:bg-gray-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              ]" :title="isVideoEnabled ? 'Turn off camera' : 'Turn on camera'">
                <Video v-if="isVideoEnabled" class="h-5 w-5" />
                <VideoOff v-else class="h-5 w-5" />
              </button>

              <!-- Screen Share Toggle -->
              <button @click="toggleScreenShare" :class="[
                'p-4 rounded-xl transition-all duration-200 hover:scale-105',
                isScreenSharing
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              ]" :title="isScreenSharing ? 'Stop sharing screen' : 'Share screen'">
                <MonitorOff v-if="isScreenSharing" class="h-5 w-5" />
                <Monitor v-else class="h-5 w-5" />
              </button>

              <!-- Divider -->
              <div class="w-px h-10 bg-gray-600"></div>

              <!-- Leave Meeting -->
              <button @click="leaveMeeting"
                class="p-4 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-all duration-200 hover:scale-105"
                title="Leave meeting">
                <PhoneOff class="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="!agoraClient"
          class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-br from-gray-950 to-gray-900">
          <div class="relative">
            <div class="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
            <Video class="h-16 w-16 relative z-10 opacity-50" />
          </div>
          <p class="mt-6 text-lg font-medium">Connecting to video...</p>
          <p class="mt-2 text-sm text-gray-500">This may take a few moments</p>
        </div>

        <!-- Empty State (No Remote Users) -->
        <div v-if="agoraClient && remoteUsers.size === 0"
          class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 pointer-events-none">
          <Users class="h-20 w-20 mb-4 opacity-30" />
          <p class="text-lg font-medium text-gray-300">Waiting for others to join...</p>
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
import { Users, LogOut, Check, Video, FileText, Mic, MicOff, VideoOff, Monitor, MonitorOff, PhoneOff } from 'lucide-vue-next'
import { io, Socket } from 'socket.io-client'
import AgoraRTC from 'agora-rtc-sdk-ng'
import type {
  IAgoraRTCClient,
  IMicrophoneAudioTrack,
  ILocalVideoTrack
} from 'agora-rtc-sdk-ng'
import axios from '@/lib/axios'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const authStore = useAuthStore()

let socket: Socket | null = null
let agoraClient: IAgoraRTCClient | null = null
let localAudioTrack: IMicrophoneAudioTrack | null = null
let localVideoTrack: ILocalVideoTrack | null = null

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
const isAudioEnabled = ref(true)
const isVideoEnabled = ref(true)
const isScreenSharing = ref(false)

const toggleAudio = async () => {
  if (!localAudioTrack) return

  if (isAudioEnabled.value) {
    await localAudioTrack.setEnabled(false)
    isAudioEnabled.value = false
  } else {
    await localAudioTrack.setEnabled(true)
    isAudioEnabled.value = true
  }
}

const toggleVideo = async () => {
  if (!localVideoTrack || !agoraClient) return

  if (isVideoEnabled.value) {
    await localVideoTrack.setEnabled(false)
    isVideoEnabled.value = false

    showCameraOffOverlay('local-video', authStore.user!.name)
  } else {
    await localVideoTrack.setEnabled(true)
    isVideoEnabled.value = true

    removeCameraOffOverlay('local-video')
  }
}

const showCameraOffOverlay = (containerId: string, userName: string) => {
  const container = document.getElementById(containerId)
  if (!container) return

  const existingOverlay = container.querySelector('.camera-off-overlay')
  if (existingOverlay) return

  const overlay = document.createElement('div')
  overlay.className = 'camera-off-overlay absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-20'
  overlay.innerHTML = `
    <div class="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
        <path d="M10.66 5H14a2 2 0 0 1 2 2v2.34l1 1L22 7v10"></path>
        <path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2l10 10Z"></path>
        <line x1="2" y1="2" x2="22" y2="22"></line>
      </svg>
    </div>
    <p class="text-sm text-gray-300 font-medium">${userName}</p>
    <p class="text-xs text-gray-500 mt-1">Camera is off</p>
  `
  container.appendChild(overlay)
}

const removeCameraOffOverlay = (containerId: string) => {
  const container = document.getElementById(containerId)
  if (!container) return

  const overlay = container.querySelector('.camera-off-overlay')
  if (overlay) {
    overlay.remove()
  }
}

const toggleScreenShare = async () => {
  if (!agoraClient) return

  try {
    if (isScreenSharing.value) {
      if (localVideoTrack) {
        await agoraClient.unpublish(localVideoTrack)
        localVideoTrack.close()
      }

      localVideoTrack = await AgoraRTC.createCameraVideoTrack()
      const localContainer = document.getElementById('local-video')
      if (localContainer) {
        localVideoTrack.play(localContainer)
      }
      await agoraClient.publish(localVideoTrack)

      isScreenSharing.value = false
      isVideoEnabled.value = true
    } else {
      if (localVideoTrack) {
        await agoraClient.unpublish(localVideoTrack)
        localVideoTrack.close()
      }

      localVideoTrack = await AgoraRTC.createScreenVideoTrack({}, 'disable')
      const localContainer = document.getElementById('local-video')
      if (localContainer) {
        localVideoTrack.play(localContainer)
      }
      await agoraClient.publish(localVideoTrack)

      isScreenSharing.value = true

      localVideoTrack.on('track-ended', async () => {
        await toggleScreenShare()
      })
    }
  } catch (error) {
    console.error('Error toggling screen share:', error)
  }
}

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
          let playerDiv = document.getElementById(`player-${user.uid}`)

          if (!playerDiv) {
            playerDiv = document.createElement('div')
            playerDiv.id = `player-${user.uid}`
            playerDiv.className = 'relative flex-1 min-w-[400px] min-h-[300px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50'

            const nameLabel = document.createElement('div')
            nameLabel.className = 'absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium text-white shadow-lg z-10'
            nameLabel.textContent = `User ${user.uid}`
            playerDiv.appendChild(nameLabel)

            remoteContainer.appendChild(playerDiv)
          }

          user.videoTrack?.play(`player-${user.uid}`)

          removeCameraOffOverlay(`player-${user.uid}`)
        }
      }

      if (mediaType === 'audio') {
        user.audioTrack?.play()
      }
    })

    agoraClient.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') {
        const playerDiv = document.getElementById(`player-${user.uid}`)
        if (playerDiv) {
          showCameraOffOverlay(`player-${user.uid}`, `User ${user.uid}`)
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