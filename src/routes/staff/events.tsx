import { createFileRoute } from '@tanstack/react-router'
import { format, parseISO } from 'date-fns'
import * as React from 'react'
import { CalendarDays, Users } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { EmptyState } from '#/components/stayflow/empty-state'
import { AvatarInitials } from '#/components/stayflow/avatar-initials'
import { useMockStore } from '#/lib/store/mock-store'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/staff/events')({
  head: () => ({ meta: [{ title: 'Events — StayFlow Staff' }] }),
  component: StaffEventsPage,
})

function StaffEventsPage() {
  const { state } = useMockStore()
  const events = [...state.events].sort((a, b) => a.date.localeCompare(b.date))
  const [selectedId, setSelectedId] = React.useState(events[0]?.id)
  const selected = events.find((e) => e.id === selectedId)
  const attendees = selected ? state.residents.filter((r) => selected.attendeeIds.includes(r.id)) : []

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Community" title="Events" description="Review attendee lists for upcoming events." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-2 lg:col-span-1">
          {events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => setSelectedId(event.id)}
              className={cn(
                'w-full rounded-xl border px-4 py-3 text-left transition-colors',
                selectedId === event.id ? 'border-accent-gold bg-accent-indigo/10' : 'border-border bg-surface hover:border-accent-indigo/30',
              )}
            >
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-text">
                <CalendarDays className="size-3.5" />
                {format(parseISO(event.date), 'EEE, MMM d')} · {event.time}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-text/70">{event.attendeeIds.length} / {event.capacity} attending</p>
            </button>
          ))}
        </div>

        <div className="lg:col-span-2">
          {!selected ? (
            <EmptyState icon={Users} title="No event selected" />
          ) : attendees.length === 0 ? (
            <EmptyState icon={Users} title="No attendees yet" description="No one has RSVP'd to this event." />
          ) : (
            <div className="rounded-2xl border border-border bg-surface">
              <div className="border-b border-border px-4 py-3">
                <p className="text-sm font-semibold text-foreground">{selected.title} — Attendees</p>
              </div>
              <ul className="divide-y divide-border">
                {attendees.map((resident) => (
                  <li key={resident.id} className="flex items-center gap-3 px-4 py-3">
                    <AvatarInitials seed={resident.name} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{resident.name}</p>
                      <p className="text-xs text-muted-text">{resident.unit}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
