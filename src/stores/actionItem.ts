import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from '@/lib/axios'
import type { ActionItem } from '@/types/actionItem'

interface CreateActionItemRequest {
  title: string
  description?: string
  assignedToId: number
  dueDate?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
}

interface UpdateActionItemRequest {
  title?: string
  description?: string
  status?: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'
  assignedToId?: number
  dueDate?: string
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
}

export const useActionItemStore = defineStore('actionItem', () => {
  const actionItems = ref<ActionItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)


  const fetchActionItems = async (meetingId: number) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get(`/meetings/${meetingId}/action-items`)
      actionItems.value = response.data
      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch action items'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createActionItem = async (meetingId: number, data: CreateActionItemRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.post(`/meetings/${meetingId}/action-items`, data)

      actionItems.value.unshift(response.data)

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create action item'
      throw err
    } finally {
      isLoading.value = false
    }
  }


  const updateActionItem = async (
    meetingId: number,
    actionItemId: number,
    data: UpdateActionItemRequest
  ) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await axios.put(
        `/meetings/${meetingId}/action-items/${actionItemId}`,
        data
      )

      const index = actionItems.value.findIndex(item => item.id === actionItemId)
      if (index !== -1) {
        actionItems.value[index] = response.data
      }

      return response.data
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update action item'
      throw err
    } finally {
      isLoading.value = false
    }
  }


  const deleteActionItem = async (meetingId: number, actionItemId: number) => {
    isLoading.value = true
    error.value = null

    try {
      await axios.delete(`/meetings/${meetingId}/action-items/${actionItemId}`)

      actionItems.value = actionItems.value.filter(item => item.id !== actionItemId)
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete action item'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const resetStore = () => {
    actionItems.value = []
    isLoading.value = false
    error.value = null
  }

  return {
    actionItems,
    isLoading,
    error,

    fetchActionItems,
    createActionItem,
    updateActionItem,
    deleteActionItem,
    resetStore
  }
})
