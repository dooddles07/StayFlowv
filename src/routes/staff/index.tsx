import { createFileRoute, Link } from '@tanstack/react-router'
import { AlertTriangle, CalendarClock, ClipboardList, UtensilsCrossed, Users } from 'lucide-react'
import { KpiCard } from '#/components/stayflow/kpi-card'
import { SectionHeader } from '#/components/stayflow/section-header'
import { StatusPill } from '#/components/stayflow/status-pill'
import { EmptyState } from '#/components/stayflow/empty-state'
import { useMockStore } from '#/lib/store/mock-store'
import { toDateKey } from '#/lib/booking-slots'

export const Route = createFileRoute('/staff/')({
  head: () => ({ meta: [{ title: 'Dashboard — StayFlow Staff' }] }),
  component: StaffDashboard,
})

function StaffDashboard() {
  const { state } = useMockStore()
  const today = toDateKey(new Date())

  const todaysGuests = state.guests.filter((g) => g.arrivalDate === today)
  const todaysBookings = state.bookings.filter((b) => b.date === today && b.status !== 'cancelled')
  const todaysDining = state.diningReservations.filter((d) => d.date === today && d.status !== 'cancelled')
  const pendingCount =
    state.bookings.filter((b) => b.status === 'pending').length +
    state.guests.filter((g) => g.status === 'pending').length +
    state.diningReservations.filter((d) => d.status === 'pending').length

  const alerts = state.facilities.filter((f) => f.status !== 'open')

  const scheduleRows = [
    ...todaysBookings.map((b) => ({
      id: b.id,
      time: b.timeSlot,
      what: state.facilities.find((f) => f.id === b.facilityId)?.name ?? 'Facility',
      who: state.residents.find((r) => r.id === b.residentId)?.name ?? '—',
      status: b.status,
      kind: 'Facility',
    })),
    ...todaysDining.map((d) => ({
      id: d.id,
      time: d.time,
      what: state.restaurants.find((r) => r.id === d.restaurantId)?.name ?? 'Restaurant',
      who: state.residents.find((r) => r.id === d.residentId)?.name ?? '—',
      status: d.status,
      kind: 'Dining',
    })),
    ...todaysGuests.map((g) => ({
      id: g.id,
      time: g.arrivalTime,
      what: `Guest: ${g.name}`,
      who: state.residents.find((r) => r.id === g.hostResidentId)?.name ?? '—',
      status: g.status,
      kind: 'Guest',
    })),
  ].sort((a, b) => a.time.localeCompare(b.time))

  const tasks = [
    ...state.bookings.filter((b) => b.status === 'pending').map((b) => ({
      id: b.id,
      label: `Approve ${state.facilities.find((f) => f.id === b.facilityId)?.name ?? 'facility'} booking`,
      href: '/staff/bookings',
    })),
    ...state.guests.filter((g) => g.status === 'pending').map((g) => ({
      id: g.id,
      label: `Approve guest pass for ${g.name}`,
      href: '/staff/guests',
    })),
  ].slice(0, 6)

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 animate-fade-in">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-gold">Operations</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Today's Overview</h1>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Users} label="Visitors today" value={String(todaysGuests.length)} />
        <KpiCard icon={ClipboardList} label="Facility bookings" value={String(todaysBookings.length)} />
        <KpiCard icon={UtensilsCrossed} label="Dining reservations" value={String(todaysDining.length)} />
        <KpiCard icon={AlertTriangle} label="Pending approvals" value={String(pendingCount)} hint="Across bookings, dining & guests" />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SectionHeader title="Today's Schedule" description={`${scheduleRows.length} items`} />
          {scheduleRows.length === 0 ? (
            <EmptyState icon={CalendarClock} title="Nothing scheduled today" />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-border">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-hover text-xs uppercase tracking-wide text-muted-text">
                  <tr>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">What</th>
                    <th className="px-4 py-3 font-medium">Who</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {scheduleRows.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-foreground">{row.time}</td>
                      <td className="px-4 py-3 text-foreground">{row.what}</td>
                      <td className="px-4 py-3 text-muted-text">{row.who}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={row.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <SectionHeader title="Alerts" />
            {alerts.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface px-4 py-6 text-center text-xs text-muted-text">
                No facility alerts.
              </p>
            ) : (
              <div className="space-y-2">
                {alerts.map((f) => (
                  <div key={f.id} className="flex items-start gap-2.5 rounded-xl border border-accent-gold/25 bg-accent-gold/10 px-3.5 py-3">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent-gold" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{f.name}</p>
                      <p className="text-[11px] text-muted-text">{f.statusReason ?? f.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <SectionHeader title="Task List" />
            {tasks.length === 0 ? (
              <p className="rounded-2xl border border-border bg-surface px-4 py-6 text-center text-xs text-muted-text">All caught up.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <Link
                    key={task.id}
                    to={task.href}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3.5 py-3 text-xs text-foreground transition-colors hover:border-accent-indigo/40"
                  >
                    {task.label}
                    <StatusPill status="pending" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
