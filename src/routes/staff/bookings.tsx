import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Calendar, Check, ClipboardList, List, X } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { StatusPill } from '#/components/stayflow/status-pill'
import { EmptyState } from '#/components/stayflow/empty-state'
import { Button } from '#/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useMockStore } from '#/lib/store/mock-store'
import type { BookingStatus } from '#/lib/mock/types'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/staff/bookings')({
  head: () => ({ meta: [{ title: 'Bookings — StayFlow Staff' }] }),
  component: BookingsPage,
})

const statusFilters: (BookingStatus | 'all')[] = ['all', 'pending', 'confirmed', 'cancelled']

function BookingsPage() {
  const { state, dispatch } = useMockStore()
  const [statusFilter, setStatusFilter] = React.useState<(typeof statusFilters)[number]>('all')
  const [view, setView] = React.useState<'table' | 'calendar'>('table')

  const bookings = [...state.bookings]
    .filter((b) => statusFilter === 'all' || b.status === statusFilter)
    .sort((a, b) => a.date.localeCompare(b.date))

  function updateStatus(id: string, status: BookingStatus) {
    dispatch({ type: 'UPDATE_BOOKING_STATUS', payload: { id, status } })
    toast.success(status === 'confirmed' ? 'Booking approved' : 'Booking rejected')
  }

  const grouped = bookings.reduce<Record<string, typeof bookings>>((acc, b) => {
    ;(acc[b.date] ??= []).push(b)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Reservations"
        title="Bookings"
        description="Review and manage all facility booking requests."
        actions={
          <div className="flex overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              onClick={() => setView('table')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs', view === 'table' ? 'bg-accent-indigo/20 text-accent-gold' : 'text-muted-text')}
            >
              <List className="size-3.5" /> Table
            </button>
            <button
              type="button"
              onClick={() => setView('calendar')}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs', view === 'calendar' ? 'bg-accent-indigo/20 text-accent-gold' : 'text-muted-text')}
            >
              <Calendar className="size-3.5" /> Calendar
            </button>
          </div>
        }
      />

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)} className="mb-6">
        <TabsList className="bg-surface">
          {statusFilters.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {bookings.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No bookings match this filter" />
      ) : view === 'table' ? (
        <>
          <div className="space-y-3 sm:hidden">
            {bookings.map((b) => {
              const facility = state.facilities.find((f) => f.id === b.facilityId)
              const resident = state.residents.find((r) => r.id === b.residentId)
              return (
                <div key={b.id} className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{facility?.name}</p>
                      <p className="text-xs text-muted-text">{resident?.name}</p>
                    </div>
                    <StatusPill status={b.status} />
                  </div>
                  <p className="mt-2 text-xs text-muted-text">{b.date} · {b.timeSlot} · Party of {b.partySize}</p>
                  {b.status === 'pending' && (
                    <div className="mt-3 flex justify-end gap-1.5">
                      <Button size="icon" variant="ghost" className="size-7 text-emerald-400 hover:bg-emerald-500/10" onClick={() => updateStatus(b.id, 'confirmed')}>
                        <Check className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="size-7 text-rose-400 hover:bg-rose-500/10" onClick={() => updateStatus(b.id, 'cancelled')}>
                        <X className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-hover text-xs uppercase tracking-wide text-muted-text">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Facility</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Party</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {bookings.map((b) => {
                const facility = state.facilities.find((f) => f.id === b.facilityId)
                const resident = state.residents.find((r) => r.id === b.residentId)
                return (
                  <tr key={b.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">{b.date}</td>
                    <td className="px-4 py-3 text-foreground">{facility?.name}</td>
                    <td className="px-4 py-3 text-muted-text">{resident?.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-text">{b.timeSlot}</td>
                    <td className="px-4 py-3 text-muted-text">{b.partySize}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={b.status} />
                    </td>
                    <td className="px-4 py-3">
                      {b.status === 'pending' ? (
                        <div className="flex justify-end gap-1.5">
                          <Button size="icon" variant="ghost" className="size-7 text-emerald-400 hover:bg-emerald-500/10" onClick={() => updateStatus(b.id, 'confirmed')}>
                            <Check className="size-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7 text-rose-400 hover:bg-rose-500/10" onClick={() => updateStatus(b.id, 'cancelled')}>
                            <X className="size-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="block text-right text-xs text-muted-text/60">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-gold">{date}</p>
              <div className="space-y-2">
                {items.map((b) => {
                  const facility = state.facilities.find((f) => f.id === b.facilityId)
                  const resident = state.residents.find((r) => r.id === b.residentId)
                  return (
                    <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm">
                      <div>
                        <p className="font-medium text-foreground">
                          {facility?.name} · {b.timeSlot}
                        </p>
                        <p className="text-xs text-muted-text">{resident?.name} · Party of {b.partySize}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusPill status={b.status} />
                        {b.status === 'pending' && (
                          <>
                            <Button size="icon" variant="ghost" className="size-7 text-emerald-400 hover:bg-emerald-500/10" onClick={() => updateStatus(b.id, 'confirmed')}>
                              <Check className="size-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="size-7 text-rose-400 hover:bg-rose-500/10" onClick={() => updateStatus(b.id, 'cancelled')}>
                              <X className="size-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
