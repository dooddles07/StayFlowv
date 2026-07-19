import { format, parseISO } from 'date-fns'
import { Calendar, MapPin, Users } from 'lucide-react'
import { cn, hideBrokenImg } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
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
import type { CommunityEventView } from '#/lib/api/event'

const eventTimeRange = (event: CommunityEventView) => (event.endTime ? `${event.time} – ${event.endTime}` : event.time)

function EventMeta({ event, spotsLeft }: { event: CommunityEventView; spotsLeft: number }) {
  return (
    <div className="space-y-1 text-[11px] text-muted-text/80">
      <p className="flex items-center gap-1.5">
        <Calendar className="size-3.5" />
        {format(parseISO(event.date), 'EEE, MMM d')} · {eventTimeRange(event)}
      </p>
      <p className="flex items-center gap-1.5">
        <MapPin className="size-3.5" />
        {event.location}
      </p>
      <p className="flex items-center gap-1.5">
        <Users className="size-3.5" />
        {spotsLeft > 0 ? `${spotsLeft} spots left` : 'Fully booked'}
      </p>
    </div>
  )
}

export function EventCard({
  event,
  attending,
  busy,
  onRsvp,
  onCancel,
}: {
  event: CommunityEventView
  attending: boolean
  busy: boolean
  onRsvp: () => void
  onCancel: () => void
}) {
  const spotsLeft = event.capacity - event.attendeeIds.length

  return (
    <div className="animate-fade-in flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="flex flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-indigo/50">
            <div className="relative h-36 w-full bg-surface-hover">
              <img src={event.image} alt={event.title} loading="lazy" decoding="async" onError={hideBrokenImg} className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent" />
              <span className="absolute left-3 top-3 rounded-full bg-canvas/60 px-2 py-1 text-[11px] font-medium text-accent-gold backdrop-blur">
                {event.category}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2 p-4 pb-0">
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <p className="line-clamp-2 text-xs text-muted-text">{event.description}</p>
              <EventMeta event={event} spotsLeft={spotsLeft} />
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="border-border bg-surface">
          <DialogHeader>
            <span className="mb-1 w-fit rounded-full bg-accent-gold/15 px-2 py-0.5 text-[11px] font-medium text-accent-gold">{event.category}</span>
            <DialogTitle>{event.title}</DialogTitle>
            <DialogDescription className="text-muted-text">
              {format(parseISO(event.date), 'EEEE, MMMM d, yyyy')} · {eventTimeRange(event)} · {event.location}
            </DialogDescription>
          </DialogHeader>
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{event.description}</p>
        </DialogContent>
      </Dialog>

      <div className="p-4 pt-3">
        {attending ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button disabled={busy} className="w-full bg-surface-hover text-foreground hover:bg-surface-hover/70">
                {busy ? 'Updating…' : "You're Attending — Cancel"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border bg-surface">
              <AlertDialogHeader>
                <AlertDialogTitle>Give up your spot?</AlertDialogTitle>
                <AlertDialogDescription>You'll give up your spot at {event.title}. You can save a spot again later if space remains.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">Keep my spot</AlertDialogCancel>
                <AlertDialogAction className="bg-rose-500 text-white hover:bg-rose-600" onClick={onCancel}>
                  Give Up Spot
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            onClick={onRsvp}
            disabled={busy || spotsLeft <= 0}
            className={cn('w-full', 'bg-accent-indigo text-white hover:bg-accent-indigo-soft')}
          >
            {busy ? 'Saving…' : spotsLeft <= 0 ? 'Fully Booked' : "I'm Going"}
          </Button>
        )}
      </div>
    </div>
  )
}
