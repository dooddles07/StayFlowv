import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { CheckCircle2, UtensilsCrossed } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { SectionHeader } from '#/components/stayflow/section-header'
import { StatusPill } from '#/components/stayflow/status-pill'
import { EmptyState } from '#/components/stayflow/empty-state'
import { Button } from '#/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { useMockStore } from '#/lib/store/mock-store'
import { tables } from '#/lib/mock/tables'
import { cn } from '#/lib/utils'
import type { DiningTable } from '#/lib/mock/types'

export const Route = createFileRoute('/staff/dining')({
  head: () => ({ meta: [{ title: 'Dining — StayFlow Staff' }] }),
  component: StaffDiningPage,
})

const tableStatusClasses: Record<DiningTable['status'], string> = {
  available: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  reserved: 'border-accent-gold/30 bg-accent-gold/10 text-accent-gold',
  occupied: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
}

function StaffDiningPage() {
  const { state, dispatch } = useMockStore()
  const [tab, setTab] = React.useState<'tables' | 'reservations'>('tables')

  function confirmArrival(id: string) {
    dispatch({ type: 'UPDATE_DINING_STATUS', payload: { id, status: 'arrived' } })
    toast.success('Arrival confirmed')
  }

  const reservations = [...state.diningReservations].sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Culinary Operations" title="Dining" description="Monitor table status and manage reservation arrivals." />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="tables" className="data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            Table Map
          </TabsTrigger>
          <TabsTrigger value="reservations" className="data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            Reservations
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'tables' ? (
        <div className="space-y-8">
          {state.restaurants.map((restaurant) => {
            const restaurantTables = tables.filter((t) => t.restaurantId === restaurant.id)
            return (
              <div key={restaurant.id}>
                <SectionHeader title={restaurant.name} description={`${restaurantTables.length} tables`} />
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                  {restaurantTables.map((table) => (
                    <div
                      key={table.id}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 rounded-xl border p-4 text-center',
                        tableStatusClasses[table.status],
                      )}
                    >
                      <p className="text-sm font-semibold">{table.label}</p>
                      <p className="text-[11px] capitalize opacity-80">{table.status}</p>
                      <p className="text-[10px] opacity-60">{table.seats} seats</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title="No reservations yet" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-surface-hover text-xs uppercase tracking-wide text-muted-text">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Restaurant</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Party</th>
                <th className="px-4 py-3 font-medium">Seating</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-surface">
              {reservations.map((r) => {
                const restaurant = state.restaurants.find((x) => x.id === r.restaurantId)
                const resident = state.residents.find((x) => x.id === r.residentId)
                return (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">{r.date}</td>
                    <td className="px-4 py-3 text-foreground">{restaurant?.name}</td>
                    <td className="px-4 py-3 text-muted-text">{resident?.name}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-text">{r.time}</td>
                    <td className="px-4 py-3 text-muted-text">{r.partySize}</td>
                    <td className="px-4 py-3 text-muted-text">{r.seating}</td>
                    <td className="px-4 py-3">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.status === 'confirmed' && (
                        <Button size="sm" variant="outline" className="gap-1.5 border-border text-xs text-foreground hover:bg-surface-hover" onClick={() => confirmArrival(r.id)}>
                          <CheckCircle2 className="size-3.5" /> Confirm arrival
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
