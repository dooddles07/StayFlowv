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

// Staff: only their own notifications (server enforces via requireOwnStaffParam).
export const getMyStaffNotifications = (staffId: string) =>
  api.get<AppNotification[]>(`/notifications/staff/${staffId}`)

// Shared by both roles — ownership is checked server-side against whichever field
// applies to the caller (requireOwnNotification).
export const markNotificationRead = (id: string) => api.post<AppNotification>(`/notifications/${id}/read`, {})

export const markAllNotificationsRead = (residentId: string) =>
  api.post<void>(`/notifications/resident/${residentId}/read-all`, {})
export const markAllStaffNotificationsRead = (staffId: string) =>
  api.post<void>(`/notifications/staff/${staffId}/read-all`, {})
