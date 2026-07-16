import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { UserPlus, Users } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { SectionHeader } from '#/components/stayflow/section-header'
import { StatusPill } from '#/components/stayflow/status-pill'
import { EmptyState } from '#/components/stayflow/empty-state'
import { QrCode } from '#/components/stayflow/qr-code'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { ApiError } from '#/lib/api/client'
import { getMyGuests, registerGuest, type GuestView } from '#/lib/api/guest'
import { useMyProfile } from '#/lib/store/member-profile'
import { nextDays, toDateKey } from '#/lib/booking-slots'

export const Route = createFileRoute('/member/guests')({
  head: () => ({ meta: [{ title: 'Guests — StayFlow Member' }] }),
  component: GuestsPage,
})

const errText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Try again.')

function GuestsPage() {
  const { profile } = useMyProfile()
  const days = React.useMemo(() => nextDays(14), [])

  const [guests, setGuests] = React.useState<GuestView[]>([])
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [name, setName] = React.useState('')
  const [purpose, setPurpose] = React.useState('')
  const [vehiclePlate, setVehiclePlate] = React.useState('')
  const [arrivalDate, setArrivalDate] = React.useState(days[0]!)
  const [arrivalTime, setArrivalTime] = React.useState('2:00 PM')
  const [newGuest, setNewGuest] = React.useState<GuestView | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const load = React.useCallback((residentId: string) => {
    let active = true
    setStatus('loading')
    getMyGuests(residentId)
      .then((data) => {
        if (!active) return
        setGuests(data)
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

  const myGuests = [...guests].sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !profile || submitting) return
    setSubmitting(true)
    try {
      // Full ISO — the API's date column rejects a bare "YYYY-MM-DD".
      const arrivalDateIso = new Date(toDateKey(arrivalDate)).toISOString()
      const guest = await registerGuest({
        name: name.trim(),
        purpose: purpose.trim() || 'Personal visit',
        vehiclePlate: vehiclePlate.trim() || undefined,
        arrivalDate: arrivalDateIso,
        arrivalTime,
      })
      setGuests((prev) => [guest, ...prev])
      setNewGuest(guest)
      setName('')
      setPurpose('')
      setVehiclePlate('')
      toast.success('Guest registered', { description: `${guest.name} · Pass ${guest.passNumber}` })
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Access" title="Guests" description="Register a guest and generate their entry pass." />

      <div className="grid gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="animate-fade-in space-y-4 rounded-2xl border border-border bg-surface p-5 lg:col-span-1">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <UserPlus className="size-4 text-accent-gold" />
            Register a Guest
          </h2>
          <div>
            <Label htmlFor="guest-name" className="mb-1.5 text-xs text-muted-text">
              Guest name
            </Label>
            <Input id="guest-name" value={name} onChange={(e) => setName(e.target.value)} required className="border-border bg-canvas" />
          </div>
          <div>
            <Label htmlFor="purpose" className="mb-1.5 text-xs text-muted-text">
              Purpose of visit
            </Label>
            <Input
              id="purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Personal visit, delivery…"
              className="border-border bg-canvas"
            />
          </div>
          <div>
            <Label htmlFor="plate" className="mb-1.5 text-xs text-muted-text">
              Vehicle plate (optional)
            </Label>
            <Input id="plate" value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className="border-border bg-canvas" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="arrival-date" className="mb-1.5 text-xs text-muted-text">Arrival date</Label>
              <select
                id="arrival-date"
                value={toDateKey(arrivalDate)}
                onChange={(e) => setArrivalDate(days.find((d) => toDateKey(d) === e.target.value) ?? days[0]!)}
                className="h-9 w-full rounded-md border border-border bg-canvas px-2 text-sm text-foreground"
              >
                {days.map((d) => (
                  <option key={toDateKey(d)} value={toDateKey(d)}>
                    {d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="arrival-time" className="mb-1.5 text-xs text-muted-text">
                Arrival time
              </Label>
              <Input
                id="arrival-time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
                className="border-border bg-canvas"
              />
            </div>
          </div>
          <Button type="submit" disabled={submitting || !profile} className="w-full bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            {submitting ? 'Generating…' : 'Generate Pass'}
          </Button>
        </form>

        <div className="lg:col-span-2">
          <SectionHeader title="Your Guests" description="Passes registered for your unit" />
          {status === 'loading' ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl border border-border bg-surface" />
              ))}
            </div>
          ) : status === 'error' ? (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
              <p className="text-sm text-muted-text">We couldn't load your guests right now.</p>
              <Button
                onClick={() => profile && load(profile.id)}
                className="mt-4 bg-accent-indigo text-white hover:bg-accent-indigo-soft"
              >
                Retry
              </Button>
            </div>
          ) : myGuests.length === 0 ? (
            <EmptyState icon={Users} title="No guests registered" description="Register a guest to generate their pass." />
          ) : (
            <div className="space-y-3">
              {myGuests.map((guest) => (
                <button
                  key={guest.id}
                  type="button"
                  onClick={() => setNewGuest(guest)}
                  className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-left transition-colors hover:border-accent-indigo/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{guest.name}</p>
                    <p className="truncate text-xs text-muted-text">
                      {guest.purpose} · {guest.arrivalDate.slice(0, 10)} at {guest.arrivalTime}
                    </p>
                    <p className="mt-0.5 text-[11px] text-muted-text/70">Pass {guest.passNumber}</p>
                  </div>
                  <StatusPill status={guest.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!newGuest} onOpenChange={(open) => !open && setNewGuest(null)}>
        <DialogContent className="border-border bg-surface text-foreground">
          <DialogHeader>
            <DialogTitle>Guest Pass</DialogTitle>
          </DialogHeader>
          {newGuest && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-canvas p-6 text-center">
              <QrCode value={newGuest.passNumber} />
              <div>
                <p className="text-base font-semibold text-foreground">{newGuest.name}</p>
                <p className="text-xs text-muted-text">{newGuest.purpose}</p>
              </div>
              <div className="w-full border-t border-border pt-3 text-xs text-muted-text">
                <p>
                  Pass Number: <span className="font-medium text-accent-gold">{newGuest.passNumber}</span>
                </p>
                <p className="mt-1">
                  {newGuest.arrivalDate.slice(0, 10)} at {newGuest.arrivalTime}
                </p>
              </div>
              <StatusPill status={newGuest.status} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
