import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '#/components/stayflow/app-shell'
import { getResidentById } from '#/lib/mock/residents'
import { CURRENT_RESIDENT_ID } from '#/lib/session'

export const Route = createFileRoute('/member')({
  component: MemberLayout,
})

function MemberLayout() {
  const resident = getResidentById(CURRENT_RESIDENT_ID)

  return (
    <AppShell portal="member" identityName={resident?.name ?? 'Member'} identitySubtitle={resident?.unit ?? ''}>
      <Outlet />
    </AppShell>
  )
}
