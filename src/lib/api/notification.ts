import { api } from './client'
import type { NotificationKind } from '#/lib/mock/types'

export interface AppNotification {
  id: string
  kind: NotificationKind
  title: string
  body: string
  createdAt: string
  read: boolean
}

// Member: only their own notifications (server enforces via requireOwnResidentParam).
export const getMyNotifications = (residentId: string) =>
  api.get<AppNotification[]>(`/notifications/resident/${residentId}`)

export const markNotificationRead = (id: string) => api.post<AppNotification>(`/notifications/${id}/read`, {})
export const markAllNotificationsRead = (residentId: string) =>
  api.post<void>(`/notifications/resident/${residentId}/read-all`, {})
