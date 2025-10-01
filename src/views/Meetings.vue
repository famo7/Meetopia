<template>
  <div class="p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-3xl font-bold text-foreground mb-2">Meetings</h1>
          <p class="text-muted-foreground">Manage and track all your meetings</p>
        </div>
        <Button>
          <Plus class="h-5 w-5 mr-2" />
          Create Meeting
        </Button>
      </div>

      <!-- Search and Filters -->
      <div class="flex items-center gap-4 mb-6">
        <div class="relative flex-1 max-w-md">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input v-model="searchQuery" placeholder="Search by title..." class="pl-10" />
        </div>
        <div class="flex gap-2">
          <Button variant="outline" :class="{ 'bg-primary/10 text-primary border-primary': activeTab === 'upcoming' }"
            @click="activeTab = 'upcoming'">
            Upcoming
          </Button>
          <Button variant="outline" :class="{ 'bg-primary/10 text-primary border-primary': activeTab === 'past' }"
            @click="activeTab = 'past'">
            Past
          </Button>
          <Button variant="outline" :class="{ 'bg-primary/10 text-primary border-primary': activeTab === 'all' }"
            @click="activeTab = 'all'">
            All
          </Button>
        </div>
      </div>

      <!-- Meetings Table -->
      <Card>
        <CardContent class="p-0">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="border-b border-border bg-muted/50">
                <tr>
                  <th class="text-left p-4 text-sm font-medium text-muted-foreground">TITLE</th>
                  <th class="text-left p-4 text-sm font-medium text-muted-foreground">DATE/TIME</th>
                  <th class="text-left p-4 text-sm font-medium text-muted-foreground">STATUS</th>
                  <th class="text-left p-4 text-sm font-medium text-muted-foreground">PARTICIPANTS</th>
                  <th class="text-left p-4 text-sm font-medium text-muted-foreground">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="meeting in meetings" :key="meeting.id"
                  class="border-b border-border hover:bg-accent/50 transition-colors">
                  <td class="p-4">
                    <p class="font-medium text-foreground">{{ meeting.title }}</p>
                  </td>
                  <td class="p-4 text-sm text-muted-foreground">
                    {{ meeting.date }}
                  </td>
                  <td class="p-4">
                    <Badge :variant="getStatusVariant(meeting.status)">
                      {{ meeting.status }}
                    </Badge>
                  </td>
                  <td class="p-4 text-sm text-muted-foreground">
                    {{ meeting.participants }}
                  </td>
                  <td class="p-4">
                    <Button variant="ghost" size="sm"
                      :class="meeting.status === 'Ended' ? 'text-muted-foreground' : 'text-primary'">
                      {{ meeting.status === 'Ended' ? 'View' : 'Join' }}
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Plus, Search } from 'lucide-vue-next'

const searchQuery = ref('')
const activeTab = ref('upcoming')

const meetings = ref([
  {
    id: 1,
    title: 'Project Kickoff',
    date: 'July 15, 2024, 10:00 AM',
    status: 'Scheduled',
    participants: 5,
  },
  {
    id: 2,
    title: 'Design Review',
    date: 'July 16, 2024, 2:00 PM',
    status: 'Active',
    participants: 3,
  },
  {
    id: 3,
    title: 'Client Presentation',
    date: 'July 17, 2024, 11:00 AM',
    status: 'Scheduled',
    participants: 4,
  },
  {
    id: 4,
    title: 'Team Sync',
    date: 'July 18, 2024, 9:00 AM',
    status: 'Ended',
    participants: 6,
  },
  {
    id: 5,
    title: 'Sprint Planning',
    date: 'July 19, 2024, 1:00 PM',
    status: 'Scheduled',
    participants: 7,
  },
])

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'Scheduled':
      return 'default'
    case 'Active':
      return 'secondary'
    case 'Ended':
      return 'outline'
    default:
      return 'default'
  }
}
</script>
