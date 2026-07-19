import { api } from './client'

export type StaffShift = 'Morning' | 'Afternoon' | 'Night'

export interface StaffMemberView {
  id: string
  name: string
  role: string
  email: string
  shift: StaffShift
  avatarSeed: string
}

export interface StaffAdminInput {
  name: string
  role: string
  email: string
  shift: StaffShift
}

// Read: STAFF/MANAGEMENT. Write: MANAGEMENT only (enforced server-side).
export const getAllStaff = () => api.get<StaffMemberView[]>('/staff')

export const createStaffMember = (data: StaffAdminInput) =>
  api.post<StaffMemberView>('/staff', { ...data, avatarSeed: Math.random().toString(36).slice(2, 10) })

export const updateStaffMember = (id: string, data: StaffAdminInput) =>
  api.put<StaffMemberView>(`/staff/${id}`, data)

export const removeStaffMember = (id: string) => api.del<void>(`/staff/${id}`)
