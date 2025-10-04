export interface User {
  id: number
  name: string
  email: string
}

export interface ActionItem {
  id: number
  title: string
  description: string | null
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string
  meetingId: number
  assignedById: number
  assignedToId: number
  assignedBy: User
  assignedTo: User
}

export interface CreateActionItemRequest {
  title: string
  description?: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate: string
  meetingId: number
  assignedToId: number
}

export interface UpdateActionItemRequest {
  title?: string
  description?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE'
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  dueDate?: string
}

export interface ActionItemsResponse {
  actionItems: ActionItem[]
}

export interface ActionItemResponse {
  actionItem: ActionItem
}
