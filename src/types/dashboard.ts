import type { User } from './actionItem'

export interface Meeting {
  id: number
  title: string
  date: string
  status: string
  creator: User
  participants: Array<{
    user: User
  }>
  _count: {
    actionItems: number
    participants: number
  }
}

export interface DashboardActionItem {
  id: number
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string
  meeting: {
    id: number
    title: string
    date: string
    status: string
  }
  assignedBy: User
  assignedTo: User
}

export interface DashboardData {
  today: {
    meetings: Meeting[]
    meetingsCount: number
  }
  thisWeek: {
    meetingsCount: number
    actionItemsDueCount: number
  }
  upcoming: {
    meetings: Meeting[]
    meetingsCount: number
  }
  actionItems: {
    pending: DashboardActionItem[]
    pendingCount: number
    totalCount: number
    completedCount: number
  }
  totals: {
    meetings: number
    actionItems: number
    completedActionItems: number
  }
}

export interface DashboardResponse {
  dashboard: DashboardData
}
