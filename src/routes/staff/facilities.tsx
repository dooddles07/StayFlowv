import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { PageHeader } from '#/components/stayflow/page-header'
import { StatusPill } from '#/components/stayflow/status-pill'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { cn } from '#/lib/utils'
import { useMockStore } from '#/lib/store/mock-store'
import type { FacilityStatus } from '#/lib/mock/types'

export const Route = createFileRoute('/staff/facilities')({
  head: () => ({ meta: [{ title: 'Facilities — StayFlow Staff' }] }),
  component: StaffFacilitiesPage,
})

const statusOptions: FacilityStatus[] = ['open', 'maintenance', 'closed']

function StaffFacilitiesPage() {
  const { state, dispatch } = useMockStore()
  const [reasonDrafts, setReasonDrafts] = React.useState<Record<string, string>>({})

  function setStatus(id: string, status: FacilityStatus, currentReason?: string) {
    const reason = status === 'open' ? undefined : (reasonDrafts[id] ?? currentReason)
    dispatch({ type: 'UPDATE_FACILITY_STATUS', payload: { id, status, reason } })
    toast.success(`Facility marked ${status}`)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader eyebrow="Amenities" title="Facilities" description="Update facility availability for residents in real time." />

      <div className="space-y-3">
        {state.facilities.map((facility) => (
          <div key={facility.id} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{facility.name}</p>
                <p className="text-xs text-muted-text">{facility.location} · {facility.category}</p>
              </div>
              <StatusPill status={facility.status} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatus(facility.id, status, facility.statusReason)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                    facility.status === status
                      ? 'border-accent-gold bg-accent-indigo/15 text-accent-gold'
                      : 'border-border text-muted-text hover:border-accent-indigo/40 hover:text-foreground',
                  )}
                >
                  {status}
                </button>
              ))}

              {facility.status !== 'open' && (
                <div className="flex flex-1 min-w-[200px] items-center gap-2">
                  <Input
                    value={reasonDrafts[facility.id] ?? facility.statusReason ?? ''}
                    onChange={(e) => setReasonDrafts((prev) => ({ ...prev, [facility.id]: e.target.value }))}
                    placeholder="Reason (e.g. resurfacing courts)"
                    className="h-8 border-border bg-canvas text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 shrink-0 border-border text-xs text-foreground hover:bg-surface-hover"
                    onClick={() => setStatus(facility.id, facility.status, reasonDrafts[facility.id])}
                  >
                    Save reason
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
