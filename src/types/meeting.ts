import type { User, ActionItem } from './actionItem'

export interface MeetingParticipant {
  user: User
}

export interface Meeting {
  id: number
  title: string
  description: string | null
  date: string
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  creatorId: number
  creator: User
  participants: MeetingParticipant[]
  _count: {
    participants: number
    actionItems: number
  }
}

export interface Note {
  id: number
  content: string
  createdAt: string
  meetingId: number
}

export interface DetailedMeeting extends Meeting {
  notes: Note
  actionItems: ActionItem[]
}

export interface CreateMeetingRequest {
  title: string
  description?: string
  date: string
}

export interface UpdateMeetingRequest {
  title?: string
  description?: string
  date?: string
  status?: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

export interface MeetingsResponse {
  meetings: Meeting[]
}

export interface MeetingsResponse {
  meetings: Meeting[]
}

export interface MeetingResponse {
  meeting: Meeting | DetailedMeeting
}
