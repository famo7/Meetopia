import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/lib/axios'
import type { Participant } from '@/types/participant'

interface AddParticipantRequest {
  userId: number
  role?: 'CREATOR' | 'PARTICIPANT'
}

export const useParticipantStore = defineStore('participant', () => {
  const participants = ref<Participant[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)


  const fetchParticipants = async (meetingId: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get(`/meetings/${meetingId}`)
      participants.value = response.data.participants || []
      return response.data.participants
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch participants'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const addParticipant = async (meetingId: number, data: AddParticipantRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post(`/meetings/${meetingId}/participants`, data)

      participants.value.push(response.data)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to add participant'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeParticipant = async (meetingId: number, participantId: number) => {
    isLoading.value = true
    error.value = null

    try {
      await axios.delete(`/meetings/${meetingId}/participants/${participantId}`)

      // Remove from local state
      participants.value = participants.value.filter(p => p.id !== participantId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to remove participant'
      throw err
    } finally {
      isLoading.value = false
    }
  }


  const leaveAsParticipant = async (meetingId: number, currentUserId: number) => {
    isLoading.value = true
    error.value = null

    try {
      await axios.delete(`/meetings/${meetingId}/participants/me`)

      participants.value = participants.value.filter(p => p.userId !== currentUserId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to leave meeting'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Reset store
  const resetStore = () => {
    participants.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    participants,
    isLoading,
    error,

    fetchParticipants,
    addParticipant,
    removeParticipant,
    leaveAsParticipant,
    resetStore
  }
})
