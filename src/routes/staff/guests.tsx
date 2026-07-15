import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { CheckCircle2, LogOut, QrCode as QrCodeIcon, ScanLine, Search, UserCheck } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { StatusPill } from '#/components/stayflow/status-pill'
import { EmptyState } from '#/components/stayflow/empty-state'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '#/components/ui/dialog'
import { useMockStore } from '#/lib/store/mock-store'
import { toDateKey } from '#/lib/booking-slots'

export const Route = createFileRoute('/staff/guests')({
  head: () => ({ meta: [{ title: 'Guests — StayFlow Staff' }] }),
  component: StaffGuestsPage,
})

function StaffGuestsPage() {
  const { state, dispatch } = useMockStore()
  const today = toDateKey(new Date())
  const [tab, setTab] = React.useState<'arriving' | 'history'>('arriving')
  const [scannerOpen, setScannerOpen] = React.useState(false)
  const [passInput, setPassInput] = React.useState('')

  const arriving = state.guests
    .filter((g) => g.arrivalDate === today && (g.status === 'pending' || g.status === 'approved' || g.status === 'checked-in'))
    .sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime))

  const history = state.guests
    .filter((g) => g.status === 'checked-out' || g.arrivalDate < today)
    .sort((a, b) => b.arrivalDate.localeCompare(a.arrivalDate))

  function checkIn(id: string) {
    dispatch({ type: 'UPDATE_GUEST_STATUS', payload: { id, status: 'checked-in' } })
    toast.success('Guest checked in')
  }

  function checkOut(id: string) {
    dispatch({ type: 'UPDATE_GUEST_STATUS', payload: { id, status: 'checked-out' } })
    toast.success('Guest checked out')
  }

  function approve(id: string) {
    dispatch({ type: 'UPDATE_GUEST_STATUS', payload: { id, status: 'approved' } })
    toast.success('Guest approved')
  }

  function handleScanLookup() {
    const guest = state.guests.find((g) => g.passNumber.toLowerCase() === passInput.trim().toLowerCase())
    if (!guest) {
      toast.error('Pass number not found')
      return
    }
    checkIn(guest.id)
    setScannerOpen(false)
    setPassInput('')
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Access Control"
        title="Guests"
        description="Check guests in and out of the community."
        actions={
          <Button size="lg" className="gap-2 bg-accent-indigo text-white hover:bg-accent-indigo-soft" onClick={() => setScannerOpen(true)}>
            <ScanLine className="size-4" />
            Check In
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="arriving" className="data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            Arriving Today
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            History
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'arriving' ? (
        arriving.length === 0 ? (
          <EmptyState icon={UserCheck} title="No guests arriving today" />
        ) : (
          <div className="space-y-3">
            {arriving.map((guest) => {
              const host = state.residents.find((r) => r.id === guest.hostResidentId)
              return (
                <div key={guest.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">{guest.name}</p>
                    <p className="text-xs text-muted-text">
                      Hosted by {host?.name} · {guest.arrivalTime} · Pass {guest.passNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={guest.status} />
                    {guest.status === 'pending' && (
                      <Button size="sm" variant="outline" className="border-border text-foreground hover:bg-surface-hover" onClick={() => approve(guest.id)}>
                        Approve
                      </Button>
                    )}
                    {guest.status === 'approved' && (
                      <Button size="sm" className="gap-1.5 bg-accent-indigo text-white hover:bg-accent-indigo-soft" onClick={() => checkIn(guest.id)}>
                        <CheckCircle2 className="size-3.5" /> Check In
                      </Button>
                    )}
                    {guest.status === 'checked-in' && (
                      <Button size="sm" variant="outline" className="gap-1.5 border-border text-foreground hover:bg-surface-hover" onClick={() => checkOut(guest.id)}>
                        <LogOut className="size-3.5" /> Check Out
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : history.length === 0 ? (
        <EmptyState icon={UserCheck} title="No guest history yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-surface-hover text-xs uppercase tracking-wide text-muted-text">
              <tr>
                <th className="px-4 py-3 font-medium">Guest</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Host</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {history.map((guest) => {
                const host = state.residents.find((r) => r.id === guest.hostResidentId)
                return (
                  <tr key={guest.id}>
                    <td className="px-4 py-3 text-foreground">{guest.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-text">{guest.arrivalDate}</td>
                    <td className="px-4 py-3 text-muted-text">{host?.name}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={guest.status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
        <DialogContent className="border-border bg-surface text-foreground">
          <DialogHeader>
            <DialogTitle>Check In Guest</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-canvas p-8 text-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-accent-indigo/15 text-accent-gold">
              <QrCodeIcon className="size-7" />
            </span>
            <p className="text-sm text-muted-text">Point the guest's QR pass at the scanner, or enter their pass number below.</p>
          </div>
          <div className="mt-2 flex gap-2">
            <Input
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              placeholder="SF-GP-48213"
              className="border-border bg-canvas"
              onKeyDown={(e) => e.key === 'Enter' && handleScanLookup()}
            />
            <Button onClick={handleScanLookup} className="gap-1.5 bg-accent-indigo text-white hover:bg-accent-indigo-soft">
              <Search className="size-4" />
              Look up
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
