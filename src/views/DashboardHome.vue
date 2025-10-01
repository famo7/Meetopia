<template>
  <div class="p-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-foreground mb-2">Welcome back, {{ authStore.user?.name }}!</h1>
        <p class="text-muted-foreground">Here's what's happening with your meetings today.</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Total Meetings</p>
                <p class="text-3xl font-bold">24</p>
              </div>
              <div class="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Calendar class="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Upcoming</p>
                <p class="text-3xl font-bold">5</p>
              </div>
              <div class="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Clock class="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Active</p>
                <p class="text-3xl font-bold">3</p>
              </div>
              <div class="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Activity class="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Completed</p>
                <p class="text-3xl font-bold">16</p>
              </div>
              <div class="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <CheckCircle2 class="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <Button size="lg" class="shadow-lg">
          <Plus class="h-5 w-5 mr-2" />
          Create Meeting
        </Button>
      </div>

      <!-- Recent Activity -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest meetings and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors">
              <div class="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Calendar class="h-5 w-5 text-blue-500" />
              </div>
              <div class="flex-1">
                <p class="font-medium">Project Kickoff scheduled</p>
                <p class="text-sm text-muted-foreground">July 15, 2024 at 10:00 AM</p>
              </div>
              <Badge>Scheduled</Badge>
            </div>

            <div class="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors">
              <div class="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 class="h-5 w-5 text-green-500" />
              </div>
              <div class="flex-1">
                <p class="font-medium">Design Review completed</p>
                <p class="text-sm text-muted-foreground">July 14, 2024 at 2:00 PM</p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            <div class="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors">
              <div class="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                <Users class="h-5 w-5 text-purple-500" />
              </div>
              <div class="flex-1">
                <p class="font-medium">Team Sync ended</p>
                <p class="text-sm text-muted-foreground">July 13, 2024 at 9:00 AM</p>
              </div>
              <Badge variant="outline">Ended</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Calendar,
  Clock,
  Activity,
  CheckCircle2,
  Plus,
  Users
} from 'lucide-vue-next'

const authStore = useAuthStore()
</script>
