import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '#/components/stayflow/app-shell'
import { getStaffById } from '#/lib/mock/staff'
import { CURRENT_STAFF_ID } from '#/lib/session'

export const Route = createFileRoute('/staff')({
  component: StaffLayout,
})

function StaffLayout() {
  const member = getStaffById(CURRENT_STAFF_ID)

  return (
    <AppShell portal="staff" identityName={member?.name ?? 'Staff'} identitySubtitle={member?.role ?? ''}>
      <Outlet />
    </AppShell>
  )
}
