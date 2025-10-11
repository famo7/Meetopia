<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="meetingStore.isLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-muted-foreground">Loading meeting...</p>
      </div>
    </div>

    <div v-else-if="meetingStore.error" class="text-center py-12">
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <p class="text-destructive mb-4">{{ meetingStore.error }}</p>
      <Button @click="loadMeeting">Try Again</Button>
    </div>

    <div v-else-if="meeting" class="max-w-6xl mx-auto p-6">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <div class="space-y-6">
          <Card class="border-gray-200 shadow-sm">
            <CardContent class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h1 class="text-2xl font-bold text-gray-900">{{ meeting.title }}</h1>
                <div class="flex items-center gap-2">
                  <Button v-if="meeting.status === 'ACTIVE'" @click="joinMeeting"
                    class="bg-green-600 hover:bg-green-700 text-white">
                    <Video class="h-4 w-4 mr-1.5" />
                    Join Meeting
                  </Button>

                  <Button v-else-if="meeting.status === 'SCHEDULED'" disabled variant="outline" size="sm">
                    <Clock class="h-4 w-4 mr-1.5" />
                    Scheduled
                  </Button>

                  <Button size="sm" variant="outline" @click="showEditMeeting = true">
                    <Edit class="h-3.5 w-3.5 mr-1.5" />
                    Edit
                  </Button>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-3">{{ meeting.description }}</p>
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">{{ formatFullDate(meeting.date) }} • {{ formatTime(meeting.date)
                }}</span>
                <Badge :class="{
                  'bg-blue-100 text-blue-700 hover:bg-blue-100': meeting.status === 'SCHEDULED',
                  'bg-green-100 text-green-700 hover:bg-green-100': meeting.status === 'ENDED',
                  'bg-purple-100 text-purple-700 hover:bg-purple-100': meeting.status === 'ACTIVE',
                  'bg-red-100 text-red-700 hover:bg-red-100': meeting.status === 'CANCELLED',
                }" class="text-xs font-normal px-2 py-0.5">
                  {{ meeting.status === 'SCHEDULED' ? 'Scheduled' :
                    meeting.status === 'ENDED' ? 'Ended' :
                      meeting.status === 'ACTIVE' ? 'Active' :
                        meeting.status === 'CANCELLED' ? 'Cancelled' :
                          meeting.status }}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card class="border-gray-200 shadow-sm">
            <CardHeader class="pb-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <CardTitle class="text-base font-semibold text-gray-900">Meeting Notes</CardTitle>
                <Badge v-if="meeting.status === 'ACTIVE'" class="bg-green-100 text-green-700 hover:bg-green-100">
                  <div class="w-2 h-2 bg-green-600 rounded-full mr-1.5 animate-pulse"></div>
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent class="p-6">
              <div v-if="meeting.notes && meeting.notes.content">
                <div class="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                  {{ meeting.notes.content }}
                </div>
              </div>

              <div v-else class="text-center py-12">
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-3">
                  <FileText class="h-7 w-7 text-gray-400" />
                </div>

                <div v-if="meeting.status === 'SCHEDULED'">
                  <p class="text-sm font-medium text-gray-900 mb-1">No notes yet</p>
                  <p class="text-xs text-gray-500">
                    Notes will be created when the meeting starts
                  </p>
                </div>

                <div v-else-if="meeting.status === 'ACTIVE'">
                  <p class="text-sm font-medium text-gray-900 mb-1">Meeting in progress</p>
                  <p class="text-xs text-gray-500">
                    Join now to start taking collaborative notes
                  </p>
                </div>

                <!-- Ended Meeting -->
                <div v-else-if="meeting.status === 'ENDED'">
                  <p class="text-sm font-medium text-gray-900 mb-1">No notes were taken</p>
                  <p class="text-xs text-gray-500">
                    This meeting ended without any notes being recorded
                  </p>
                </div>

                <!-- Cancelled Meeting -->
                <div v-else-if="meeting.status === 'CANCELLED'">
                  <p class="text-sm font-medium text-gray-900 mb-1">Meeting cancelled</p>
                  <p class="text-xs text-gray-500">
                    This meeting was cancelled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Action Items -->
          <ActionItems :meeting-id="meeting.id" />
        </div>

        <div>
          <Card class="border-gray-200 shadow-sm">
            <CardHeader class="pb-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <CardTitle class="text-base font-semibold text-gray-900">Participants ({{ meeting.participants.length +
                  1 }})</CardTitle>
              </div>
            </CardHeader>
            <CardContent class="p-4">
              <div class="space-y-2">
                <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div class="relative">
                    <div
                      class="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center flex-shrink-0">
                      <span class="text-sm font-semibold text-white">
                        {{ getInitials(meeting.creator.name) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ meeting.creator.name }}</p>
                    <p class="text-xs text-gray-500">Creator</p>
                  </div>
                </div>

                <div v-for="(participant, index) in meeting.participants" :key="participant.id"
                  class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                  <div class="relative">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" :class="{
                      'bg-gradient-to-br from-orange-400 to-pink-400': index % 3 === 0,
                      'bg-gradient-to-br from-blue-400 to-cyan-400': index % 3 === 1,
                      'bg-gradient-to-br from-purple-400 to-pink-400': index % 3 === 2,
                    }">
                      <span class="text-sm font-semibold text-white">
                        {{ getInitials(participant.user.name) }}
                      </span>
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900">{{ participant.user.name }}</p>
                    <p class="text-xs text-gray-500 capitalize">{{ participant.role.toLowerCase() }}</p>
                  </div>
                  <!-- Only creator can remove other participants -->
                  <button v-if="isCreator" @click="handleRemoveParticipant(participant)"
                    class="opacity-0 group-hover:opacity-100 transition-opacity" title="Remove participant">
                    <X class="h-4 w-4 text-gray-400 hover:text-red-600" />
                  </button>
                </div>

                <div v-if="meeting.participants.length === 0" class="text-center py-8">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                    <Users class="h-6 w-6 text-gray-400" />
                  </div>
                  <p class="text-xs text-gray-500">No other participants yet</p>
                </div>
              </div>

              <div class="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <Button variant="ghost" size="sm"
                  class="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  @click="showAddParticipant = true">
                  <Plus class="h-4 w-4 mr-1.5" />
                  Add Participant
                </Button>

                <Button v-if="isCreator || isParticipant" variant="ghost" size="sm"
                  class="w-full justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                  @click="handleLeaveMeeting">
                  <X class="h-4 w-4 mr-1.5" />
                  Leave Meeting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>

    <UpdateMeeting :is-open="showEditMeeting" :meeting="meeting" @close="showEditMeeting = false"
      @success="handleMeetingUpdated" />

    <AddParticipant :is-open="showAddParticipant" :meeting-id="meeting?.id || 0" @close="showAddParticipant = false"
      @success="handleParticipantAdded" />

    <AlertDialog :open="showRemoveDialog" @update:open="showRemoveDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Participant?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{{ participantToRemove?.user.name }}</strong> from this meeting?
            <br /><br />
            They will lose access to meeting notes and updates.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelRemove">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmRemove" class="bg-destructive hover:bg-destructive/90">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog :open="showLeaveDialog" @update:open="showLeaveDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave Meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            <span v-if="isCreator">
              As the creator, you will still own the meeting but will be removed from the participant list.
            </span>
            <span v-else>
              You will no longer have access to meeting notes, action items, and updates. You can be re-invited by other
              participants.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showLeaveDialog = false">Cancel</AlertDialogCancel>
          <AlertDialogAction @click="confirmLeave" class="bg-destructive hover:bg-destructive/90">
            Leave Meeting
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingStore } from '@/stores/meeting'
import { useParticipantStore } from '@/stores/participant'
import { useAuthStore } from '@/stores/auth'
import { formatFullDate, formatTime } from '@/lib/dateHelpers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  AlertCircle,
  Edit,
  FileText,
  Users,
  Plus,
  X,
  Video,
  Clock
} from 'lucide-vue-next'
import UpdateMeeting from '@/components/UpdateMeeting.vue'
import AddParticipant from '@/components/AddParticipant.vue'
import ActionItems from '@/components/ActionItems.vue'
import { useActionItemStore } from '@/stores/actionItem'
import type { Participant } from '@/types/participant'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()
const participantStore = useParticipantStore()
const actionItemStore = useActionItemStore()
const authStore = useAuthStore()

const meeting = computed(() => meetingStore.currentMeeting)
const showEditMeeting = ref(false)
const showAddParticipant = ref(false)
const showRemoveDialog = ref(false)
const showLeaveDialog = ref(false)
const participantToRemove = ref<Participant | null>(null)

const isCreator = computed(() => {
  if (!meeting.value || !authStore.user) return false
  return meeting.value.creator.id === authStore.user.id
})

const isParticipant = computed(() => {
  if (!meeting.value || !authStore.user) return false
  return meeting.value.participants.some(p => p.userId === authStore.user!.id)
})

const loadMeeting = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/dashboard/meetings')
    return
  }
  await meetingStore.fetchMeetingById(id)
  await actionItemStore.fetchActionItems(id)
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const joinMeeting = () => {
  if (!meeting.value) return
  router.push(`/dashboard/meetings/${meeting.value.id}/live`)
}

const handleMeetingUpdated = async () => {
  await loadMeeting()
}

const handleParticipantAdded = async () => {
  await loadMeeting()
}

// Creator removes a specific participant
const handleRemoveParticipant = async (participant: Participant) => {
  if (!meeting.value || !isCreator.value) return

  participantToRemove.value = participant
  showRemoveDialog.value = true
}

const cancelRemove = () => {
  showRemoveDialog.value = false
  participantToRemove.value = null
}

const confirmRemove = async () => {
  if (!meeting.value || !participantToRemove.value) return

  try {
    await participantStore.removeParticipant(meeting.value.id, participantToRemove.value.id)
    showRemoveDialog.value = false
    participantToRemove.value = null
    await loadMeeting()
  } catch (error) {
    console.error('Failed to remove participant:', error)
  }
}

const handleLeaveMeeting = () => {
  if (!meeting.value || !authStore.user) return
  showLeaveDialog.value = true
}

const confirmLeave = async () => {
  if (!meeting.value || !authStore.user) return

  try {
    await participantStore.leaveAsParticipant(meeting.value.id, authStore.user.id)
    showLeaveDialog.value = false
    router.push('/dashboard/meetings')
  } catch (error) {
    console.error('Failed to leave meeting:', error)
    showLeaveDialog.value = false
  }
}

onMounted(() => {
  loadMeeting()
})
</script>
