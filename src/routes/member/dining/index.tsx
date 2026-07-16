import { createFileRoute, Link } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { MapPin, Star, UtensilsCrossed } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { SectionHeader } from '#/components/stayflow/section-header'
import { StatusPill } from '#/components/stayflow/status-pill'
import { EmptyState } from '#/components/stayflow/empty-state'
import { Button } from '#/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { ApiError } from '#/lib/api/client'
import { getRestaurants } from '#/lib/api/restaurant'
import { cancelReservation, getMyReservations, type ReservationView } from '#/lib/api/diningReservation'
import { useMyProfile } from '#/lib/store/member-profile'
import type { Restaurant } from '#/lib/mock/types'

export const Route = createFileRoute('/member/dining/')({
  head: () => ({ meta: [{ title: 'Dining — StayFlow Member' }] }),
  component: DiningList,
})

const errText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Try again.')

function DiningList() {
  const { profile } = useMyProfile()
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([])
  const [reservations, setReservations] = React.useState<ReservationView[]>([])
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [cancelingId, setCancelingId] = React.useState<string | null>(null)

  const load = React.useCallback((residentId?: string) => {
    let active = true
    setStatus('loading')
    Promise.all([getRestaurants(), residentId ? getMyReservations(residentId) : Promise.resolve([])])
      .then(([r, res]) => {
        if (!active) return
        setRestaurants(r)
        setReservations(res)
        setStatus('ready')
      })
      .catch(() => {
        if (active) setStatus('error')
      })
    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => {
    if (profile) return load(profile.id)
  }, [profile, load])

  const upcoming = [...reservations]
    .filter((r) => r.status === 'pending' || r.status === 'confirmed')
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  async function handleCancel(id: string) {
    if (cancelingId) return
    setCancelingId(id)
    try {
      await cancelReservation(id)
      setReservations((prev) => prev.filter((r) => r.id !== id))
      toast.success('Reservation cancelled')
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setCancelingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Culinary"
        title="Dining"
        description="Reserve a table at one of our resident restaurants."
      />

      {status === 'ready' && upcoming.length > 0 && (
        <div className="mb-8">
          <SectionHeader title="Your Reservations" description="Upcoming requests and confirmations" />
          <div className="space-y-3">
            {upcoming.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.restaurantName ?? 'Restaurant'}</p>
                  <p className="text-xs text-muted-text">
                    {r.date.slice(0, 10)} at {r.time} · Party of {r.partySize} · {r.seating}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={r.status} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" disabled={cancelingId === r.id} className="border-border text-rose-400 hover:bg-rose-500/10 hover:text-rose-400">
                        {cancelingId === r.id ? 'Cancelling…' : 'Cancel'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="border-border bg-surface">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel this reservation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Your table at {r.restaurantName ?? 'this restaurant'} on {r.date.slice(0, 10)} at {r.time} will be released. This can't be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-border">Keep it</AlertDialogCancel>
                        <AlertDialogAction className="bg-rose-600 text-white hover:bg-rose-700" onClick={() => handleCancel(r.id)}>
                          Cancel Reservation
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <SectionHeader title="Restaurants" />

      {status === 'loading' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-text">We couldn't load restaurants right now.</p>
          <Button onClick={() => load(profile?.id)} className="mt-4 bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            Retry
          </Button>
        </div>
      ) : restaurants.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No restaurants available" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {restaurants.map((restaurant) => (
            <Link
              key={restaurant.id}
              to="/member/dining/$id"
              params={{ id: restaurant.id }}
              className="group animate-fade-in flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-accent-indigo/40"
            >
              <div className="relative h-36 w-full bg-surface-hover">
                <img
                  src={restaurant.image}
                  alt={restaurant.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 size-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
                <span className="absolute right-3 top-3 rounded-full bg-canvas/60 px-2 py-1 text-[11px] font-medium text-accent-gold backdrop-blur">
                  {restaurant.priceRange}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{restaurant.name}</p>
                  <span className="flex shrink-0 items-center gap-1 text-xs text-accent-gold">
                    <Star className="size-3 fill-current" />
                    {restaurant.rating}
                  </span>
                </div>
                <p className="text-xs text-muted-text">{restaurant.cuisine}</p>
                <p className="line-clamp-2 text-xs text-muted-text">{restaurant.description}</p>
                <div className="mt-auto flex items-center gap-1 pt-1 text-[11px] text-muted-text/80">
                  <MapPin className="size-3" />
                  <span className="truncate">{restaurant.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
