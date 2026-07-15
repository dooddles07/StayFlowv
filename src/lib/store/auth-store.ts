import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { api, ApiError } from '#/lib/api/client'
import type { Portal } from '#/lib/hooks/use-portal-preference'

export type PortalRole = 'MEMBER' | 'STAFF' | 'MANAGEMENT'

export const roleToPortal: Record<PortalRole, Portal> = {
  MEMBER: 'member',
  STAFF: 'staff',
  MANAGEMENT: 'management',
}

interface AuthUser {
  id: string
  email: string
  role: PortalRole
  displayName: string
}

interface LoginResponse {
  user: AuthUser
}

interface AuthState {
  user: AuthUser | null
  hasHydrated: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      // The JWT lives in an httpOnly cookie set by the server — never stored in JS.
      // Only the non-sensitive user profile is persisted, purely for portal-gating UX.
      login: async (email, password) => {
        const { user } = await api.post<LoginResponse>('/auth/login', { email, password })
        set({ user })
        return user
      },
      logout: async () => {
        try {
          await api.post('/auth/logout', {})
        } catch {
          // Clear local state regardless of network outcome.
        }
        set({ user: null })
      },
    }),
    {
      name: 'stayflow.auth',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hasHydrated = true
      },
    },
  ),
)

export function isPortalRoleMatch(role: PortalRole, portal: Portal) {
  return roleToPortal[role] === portal
}

export { ApiError }
