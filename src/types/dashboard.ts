import type { Meeting } from './meeting'
import type { ActionItem } from './actionItem'

export interface DashboardStats {
  totalMeetings: number
  upcomingMeetings: number
  completedMeetings: number
  pendingActionItems: number
}

export interface DashboardData {
  stats: DashboardStats
  upcomingMeetings: Meeting[]
  recentMeetings: Meeting[]
  actionItems: ActionItem[]
}
