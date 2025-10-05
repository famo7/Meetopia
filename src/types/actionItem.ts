import type { User } from './user'

export type ActionItemStatus = 'OPEN' | 'IN_PROGRESS' | 'DONE'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH'

export interface ActionItem {
  id: number
  title: string
  description: string
  isCompleted: boolean
  status: ActionItemStatus
  priority: Priority
  dueDate: string | null
  createdAt: string
  updatedAt: string
  meetingId: number
  assignedById: number
  assignedToId: number
  assignedBy: User
  assignedTo: User
}

export interface CreateActionItemRequest {
  title: string
  description: string
  priority: Priority
  dueDate?: string
  assignedToId: number
  meetingId: number
}

export interface UpdateActionItemRequest {
  title?: string
  description?: string
  status?: ActionItemStatus
  priority?: Priority
  dueDate?: string
  isCompleted?: boolean
}
