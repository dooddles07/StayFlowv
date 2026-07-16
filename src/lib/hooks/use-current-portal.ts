import { useLocation } from '@tanstack/react-router'
import type { Portal } from './use-portal-preference'

// Used by components mounted once at the app root (outside any portal's own
// provider tree) that still need to know which portal they're currently inside.
export function useCurrentPortal(): Portal | null {
  const { pathname } = useLocation()
  if (pathname.startsWith('/member')) return 'member'
  if (pathname.startsWith('/staff')) return 'staff'
  if (pathname.startsWith('/management')) return 'management'
  return null
}
