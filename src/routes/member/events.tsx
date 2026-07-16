import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Calendar } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { EventCard } from '#/components/stayflow/event-card'
import { EmptyState } from '#/components/stayflow/empty-state'
import { Button } from '#/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { ApiError } from '#/lib/api/client'
import { cancelEventRsvp, getEvents, rsvpToEvent, type CommunityEventView } from '#/lib/api/event'
import { useMyProfile } from '#/lib/store/member-profile'
import type { EventCategory } from '#/lib/mock/types'

export const Route = createFileRoute('/member/events')({
  head: () => ({ meta: [{ title: 'Events — StayFlow Member' }] }),
  component: EventsPage,
})

const categories: (EventCategory | 'All')[] = ['All', 'Social', 'Wellness', 'Kids', 'Seasonal', 'Cultural']

const tabTrigger =
  'min-h-11 shrink-0 px-3 data-[state=active]:bg-accent-gold/10 data-[state=active]:font-semibold data-[state=active]:text-accent-gold data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-accent-gold/30'

const errText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Try again.')
const today = () => new Date().toISOString().slice(0, 10)

function EventsPage() {
  const { profile } = useMyProfile()
  const [events, setEvents] = React.useState<CommunityEventView[]>([])
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [category, setCategory] = React.useState<(typeof categories)[number]>('All')
  const [busyIds, setBusyIds] = React.useState<Set<string>>(new Set())

  const load = React.useCallback(() => {
    let active = true
    setStatus('loading')
    getEvents()
      .then((data) => {
        if (!active) return
        setEvents(data)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => load(), [load])

  async function toggleRsvp(event: CommunityEventView, attending: boolean) {
    const residentId = profile?.id
    if (!residentId || busyIds.has(event.id)) return

    setBusyIds((prev) => new Set(prev).add(event.id))
    // Optimistic update so the button responds instantly; rolled back on failure.
    const previous = events
    setEvents((prev) =>
      prev.map((e) =>
        e.id !== event.id
          ? e
          : { ...e, attendeeIds: attending ? e.attendeeIds.filter((id) => id !== residentId) : [...e.attendeeIds, residentId] },
      ),
    )

    try {
      const updated = attending ? await cancelEventRsvp(event.id) : await rsvpToEvent(event.id)
      setEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)))
      toast.success(attending ? 'RSVP cancelled' : "You're on the list!")
    } catch (err) {
      setEvents(previous)
      toast.error(errText(err))
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev)
        next.delete(event.id)
        return next
      })
    }
  }

  const upcoming = events.filter((e) => e.date >= today())
  const visible = upcoming.filter((e) => category === 'All' || e.category === category).sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader eyebrow="Community" title="Events" description="RSVP to upcoming gatherings, wellness sessions, and celebrations." />

      <Tabs value={category} onValueChange={(v) => setCategory(v as typeof category)} className="mb-6">
        <TabsList className="flex h-auto w-full justify-start gap-1 overflow-x-auto bg-surface p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((c) => (
            <TabsTrigger key={c} value={c} className={tabTrigger}>
              {c}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {status === 'loading' ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-text">We couldn't load events right now.</p>
          <Button onClick={load} className="mt-4 bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            Retry
          </Button>
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon={Calendar} title="No upcoming events in this category" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event) => {
            const attending = !!profile && event.attendeeIds.includes(profile.id)
            return (
              <EventCard
                key={event.id}
                event={event}
                attending={attending}
                busy={busyIds.has(event.id)}
                onRsvp={() => toggleRsvp(event, false)}
                onCancel={() => toggleRsvp(event, true)}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
