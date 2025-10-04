<template>
  <div class="p-8 space-y-6">
    <!-- Loading State -->
    <div v-if="dashboardStore.isLoading" class="flex items-center justify-center py-12">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p class="text-muted-foreground">Loading dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="dashboardStore.error" class="text-center py-12">
      <AlertCircle class="h-12 w-12 mx-auto mb-4 text-destructive" />
      <p class="text-destructive mb-4">{{ dashboardStore.error }}</p>
      <Button @click="dashboardStore.refreshDashboard()">Try Again</Button>
    </div>

    <!-- Dashboard Content -->
    <template v-else-if="dashboardStore.data">
      <!-- Welcome Section -->
      <div>
        <h1 class="text-3xl font-bold">Welcome back, {{ authStore.user?.name }}!</h1>
        <p class="text-muted-foreground mt-1">Here's what's happening today</p>
      </div>

      <!-- Quick Actions -->
      <div class="flex gap-3">
        <Button size="lg" class="gap-2">
          <Plus class="h-4 w-4" />
          Create Meeting
        </Button>
        <Button variant="outline" size="lg" class="gap-2">
          <Calendar class="h-4 w-4" />
          View Calendar
        </Button>
      </div>

      <!-- Key Metrics -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium">Today's Meetings</CardTitle>
            <Calendar class="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ dashboardStore.today?.meetingsCount || 0 }}</div>
            <p class="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium">Pending Actions</CardTitle>
            <AlertCircle class="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ dashboardStore.actionItems?.pendingCount || 0 }}</div>
            <p class="text-xs text-muted-foreground">Tasks to complete</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium">This Week</CardTitle>
            <TrendingUp class="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ dashboardStore.thisWeek?.meetingsCount || 0 }}</div>
            <p class="text-xs text-muted-foreground">meetings scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between pb-2">
            <CardTitle class="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle2 class="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ completionRate }}%</div>
            <p class="text-xs text-muted-foreground">of action items</p>
          </CardContent>
        </Card>
      </div>

      <!-- Upcoming Meetings -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Upcoming Meetings</CardTitle>
              <CardDescription>Next 24 hours</CardDescription>
            </div>
            <Button variant="ghost" size="sm" @click="router.push('/dashboard/meetings')">
              View All →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="meeting in dashboardStore.today?.meetings || []" :key="meeting.id"
              class="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer">
              <div class="flex items-center gap-3 flex-1">
                <div :class="`w-2 h-2 rounded-full ${meeting.status === 'ACTIVE' ? 'bg-green-500' :
                  meeting.status === 'SCHEDULED' ? 'bg-blue-500' :
                    meeting.status === 'COMPLETED' ? 'bg-gray-500' : 'bg-yellow-500'
                  }`"></div>
                <div class="flex-1">
                  <p class="font-medium">{{ meeting.title }}</p>
                  <div class="flex items-center gap-4 mt-1">
                    <p class="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock class="h-3 w-3" />
                      {{ formatMeetingTime(meeting.date) }}
                    </p>
                    <p class="text-sm text-muted-foreground flex items-center gap-1">
                      <Users class="h-3 w-3" />
                      {{ meeting._count.participants }} participants
                    </p>
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline">Join</Button>
            </div>
            <div v-if="(dashboardStore.today?.meetings || []).length === 0"
              class="text-center py-8 text-muted-foreground">
              <Calendar class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No meetings in the next 24 hours</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Action Items -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div>
              <CardTitle>Your Action Items</CardTitle>
              <CardDescription>Tasks assigned to you</CardDescription>
            </div>
            <Button variant="ghost" size="sm" @click="router.push('/dashboard/action-items')">
              View All →
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="item in (dashboardStore.actionItems?.pending || []).slice(0, 5)" :key="item.id"
              @click="router.push('/dashboard/action-items')"
              class="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer group">
              <!-- Status Indicator -->
              <div class="mt-1">
                <div v-if="item.status === 'DONE'"
                  class="h-4 w-4 rounded-full bg-green-500 flex items-center justify-center">
                  <CheckCircle2 class="h-3 w-3 text-white" />
                </div>
                <div v-else-if="item.status === 'IN_PROGRESS'"
                  class="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <Clock class="h-3 w-3 text-white" />
                </div>
                <div v-else class="h-4 w-4 rounded-full border-2 border-muted-foreground"></div>
              </div>

              <div class="flex-1 min-w-0">
                <p class="font-medium" :class="{ 'line-through text-muted-foreground': item.status === 'DONE' }">
                  {{ item.title }}
                </p>
                <div class="flex items-center gap-3 mt-1 text-xs">
                  <p class="text-muted-foreground">Due: {{ formatDueDate(item.dueDate) }}</p>
                  <p class="text-muted-foreground truncate">From: {{ item.meeting.title }}</p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <Badge :variant="item.priority === 'HIGH' ? 'destructive' :
                  item.priority === 'MEDIUM' ? 'default' : 'secondary'">
                  {{ item.priority?.toLowerCase() || 'low' }}
                </Badge>
                <ChevronRight
                  class="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            <div v-if="(dashboardStore.actionItems?.pending || []).length === 0"
              class="text-center py-8 text-muted-foreground">
              <CheckCircle2 class="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>All caught up! No pending action items</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useDashboardStore } from '@/stores/dashboard'
import { formatMeetingTime, formatDueDate } from '@/lib/dateHelpers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar, Clock, Users, CheckCircle2, Plus, AlertCircle, TrendingUp, ChevronRight } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const dashboardStore = useDashboardStore()

// Computed values
const completionRate = computed(() => {
  if (!dashboardStore.actionItems) return 0
  const total = dashboardStore.actionItems.totalCount
  const completed = dashboardStore.actionItems.completedCount
  return total > 0 ? Math.round((completed / total) * 100) : 0
})

onMounted(async () => {
  await dashboardStore.fetchDashboard()
})
</script>
