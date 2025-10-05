<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="meetingStore.isLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-muted-foreground">Loading meeting...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="meetingStore.error" class="text-center py-12">
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <p class="text-destructive mb-4">{{ meetingStore.error }}</p>
      <Button @click="loadMeeting">Try Again</Button>
    </div>

    <!-- Meeting Content -->
    <div v-else-if="meeting" class="max-w-6xl mx-auto p-6">
      <div class="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
        <!-- Left Column - Meeting Info & Notes -->
        <div class="space-y-6">
          <!-- Meeting Header Card -->
          <Card class="border-gray-200 shadow-sm">
            <CardContent class="p-6">
              <div class="flex items-start justify-between mb-3">
                <h1 class="text-2xl font-bold text-gray-900">{{ meeting.title }}</h1>
                <div class="flex items-center gap-2">
                  <!-- Join Meeting Button (Only when ACTIVE) -->
                  <Button v-if="meeting.status === 'ACTIVE'" @click="joinMeeting"
                    class="bg-green-600 hover:bg-green-700 text-white">
                    <Video class="h-4 w-4 mr-1.5" />
                    Join Meeting
                  </Button>

                  <!-- Scheduled Button (Disabled) -->
                  <Button v-else-if="meeting.status === 'SCHEDULED'" disabled variant="outline" size="sm">
                    <Clock class="h-4 w-4 mr-1.5" />
                    Scheduled
                  </Button>

                  <!-- Edit Button -->
                  <Button size="sm" variant="outline">
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
                  'bg-green-100 text-green-700 hover:bg-green-100': meeting.status === 'COMPLETED',
                  'bg-purple-100 text-purple-700 hover:bg-purple-100': meeting.status === 'ACTIVE',
                }" class="text-xs font-normal px-2 py-0.5">
                  {{ meeting.status === 'SCHEDULED' ? 'Scheduled' : meeting.status === 'COMPLETED' ? 'Completed' :
                    meeting.status === 'ACTIVE' ? 'Active' : meeting.status }}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <!-- Meeting Notes Card -->
          <Card class="border-gray-200 shadow-sm">
            <CardHeader class="pb-4 border-b border-gray-100">
              <div class="flex items-center justify-between">
                <CardTitle class="text-base font-semibold text-gray-900">Meeting Notes</CardTitle>
                <p v-if="meeting.status === 'ACTIVE'" class="text-xs text-muted-foreground">
                  Join the meeting to collaborate live
                </p>
              </div>
            </CardHeader>
            <CardContent class="p-6">
              <div v-if="meeting.notes" class="space-y-4">
                <div class="text-sm text-gray-700 leading-relaxed space-y-3">
                  <p class="whitespace-pre-wrap">{{ meeting.notes }}</p>
                </div>
                <Button v-if="meeting.status !== 'ACTIVE'" size="sm" class="bg-blue-600 hover:bg-blue-700 text-white"
                  @click="editNotes">
                  <Edit class="h-3.5 w-3.5 mr-1.5" />
                  Edit Notes
                </Button>
              </div>
              <div v-else class="text-center py-12">
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gray-100 mb-3">
                  <FileText class="h-7 w-7 text-gray-400" />
                </div>
                <p class="text-sm text-gray-500 mb-2">No meeting notes yet</p>
                <p v-if="meeting.status === 'ACTIVE'" class="text-xs text-muted-foreground mb-4">
                  Join the meeting to start taking notes
                </p>
                <Button v-if="meeting.status !== 'ACTIVE'" variant="outline" size="sm" @click="editNotes">
                  <Edit class="h-3.5 w-3.5 mr-1.5" />
                  Add Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Right Column - Participants -->
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
                <!-- Creator -->
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
                  <button class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <X class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                <!-- Participants List -->
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
                  <button class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <X class="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>

                <!-- Empty State -->
                <div v-if="meeting.participants.length === 0" class="text-center py-8">
                  <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                    <Users class="h-6 w-6 text-gray-400" />
                  </div>
                  <p class="text-xs text-gray-500">No other participants yet</p>
                </div>
              </div>

              <!-- Add Participant Button -->
              <div class="mt-4 pt-4 border-t border-gray-100">
                <Button variant="ghost" size="sm"
                  class="w-full justify-center text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  <Plus class="h-4 w-4 mr-1.5" />
                  Add Participant
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMeetingStore } from '@/stores/meeting'
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
  AlertCircle,
  Edit,
  FileText,
  Users,
  Plus,
  X,
  Video,
  Clock
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const meetingStore = useMeetingStore()

const meeting = computed(() => meetingStore.currentMeeting)

const loadMeeting = async () => {
  const id = parseInt(route.params.id as string)
  if (isNaN(id)) {
    router.push('/dashboard/meetings')
    return
  }
  await meetingStore.fetchMeetingById(id)
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

const editNotes = () => {
  // TODO: Open edit notes dialog
  console.log('Edit notes')
}

onMounted(() => {
  loadMeeting()
})
</script>
