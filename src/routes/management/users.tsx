import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { AvatarInitials } from '#/components/stayflow/avatar-initials'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '#/components/ui/sheet'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'
import { ApiError } from '#/lib/api/client'
import {
  createResident,
  deleteResident,
  getAllResidents,
  tierLabel,
  updateResident,
  type ResidentProfile,
  type ResidentTier,
} from '#/lib/api/resident'
import {
  createStaffMember,
  getAllStaff,
  removeStaffMember,
  updateStaffMember,
  type StaffMemberView,
  type StaffShift,
} from '#/lib/api/staff'

export const Route = createFileRoute('/management/users')({
  head: () => ({ meta: [{ title: 'Users — StayFlow Management' }] }),
  component: UsersPage,
})

const tiers: ResidentTier[] = ['SIGNATURE', 'PRESTIGE', 'ELITE']
const roles = ['Concierge', 'Facilities Manager', 'Guest Relations', 'Dining Manager', 'Security', 'Operations']
const shifts: StaffShift[] = ['Morning', 'Afternoon', 'Night']
const errText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Try again.')

interface ResidentDraft {
  id?: string
  name: string
  email: string
  unit: string
  tier: ResidentTier
}

interface StaffDraft {
  id?: string
  name: string
  role: string
  email: string
  shift: StaffShift
}

function newResidentDraft(): ResidentDraft {
  return { name: '', email: '', unit: '', tier: 'SIGNATURE' }
}

function newStaffDraft(): StaffDraft {
  return { name: '', role: 'Concierge', email: '', shift: 'Morning' }
}

function UsersPage() {
  const [residents, setResidents] = React.useState<ResidentProfile[]>([])
  const [staff, setStaff] = React.useState<StaffMemberView[]>([])
  const [status, setStatus] = React.useState<'loading' | 'ready' | 'error'>('loading')
  const [tab, setTab] = React.useState<'members' | 'staff'>('members')
  const [editingResident, setEditingResident] = React.useState<ResidentDraft | null>(null)
  const [editingStaff, setEditingStaff] = React.useState<StaffDraft | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<{ kind: 'resident' | 'staff'; id: string; name: string } | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const load = React.useCallback(() => {
    let active = true
    setStatus('loading')
    Promise.all([getAllResidents(), getAllStaff()])
      .then(([r, s]) => {
        if (!active) return
        setResidents(r)
        setStaff(s)
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

  async function saveResident() {
    if (!editingResident) return
    if (!editingResident.name.trim() || !editingResident.email.trim() || !editingResident.unit.trim()) {
      toast.error('Name, email, and unit are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: editingResident.name.trim(),
        email: editingResident.email.trim(),
        unit: editingResident.unit.trim(),
        tier: editingResident.tier,
      }
      const saved = editingResident.id ? await updateResident(editingResident.id, payload) : await createResident(payload)
      setResidents((prev) => {
        const exists = prev.some((r) => r.id === saved.id)
        return exists ? prev.map((r) => (r.id === saved.id ? saved : r)) : [...prev, saved].sort((a, b) => a.name.localeCompare(b.name))
      })
      toast.success(editingResident.id ? 'Member updated' : 'Member added')
      setEditingResident(null)
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveStaff() {
    if (!editingStaff) return
    if (!editingStaff.name.trim() || !editingStaff.email.trim()) {
      toast.error('Name and email are required.')
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: editingStaff.name.trim(),
        role: editingStaff.role,
        email: editingStaff.email.trim(),
        shift: editingStaff.shift,
      }
      const saved = editingStaff.id ? await updateStaffMember(editingStaff.id, payload) : await createStaffMember(payload)
      setStaff((prev) => {
        const exists = prev.some((s) => s.id === saved.id)
        return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved].sort((a, b) => a.name.localeCompare(b.name))
      })
      toast.success(editingStaff.id ? 'Staff updated' : 'Staff added')
      setEditingStaff(null)
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.kind === 'resident') {
        await deleteResident(deleteTarget.id)
        setResidents((prev) => prev.filter((r) => r.id !== deleteTarget.id))
      } else {
        await removeStaffMember(deleteTarget.id)
        setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      }
      toast.success(`${deleteTarget.name} removed`)
      setDeleteTarget(null)
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Directory"
        title="Users"
        description="Manage member and staff accounts."
        actions={
          <Button
            className="gap-1.5 bg-accent-indigo text-white hover:bg-accent-indigo-soft"
            onClick={() => (tab === 'members' ? setEditingResident(newResidentDraft()) : setEditingStaff(newStaffDraft()))}
          >
            <Plus className="size-4" />
            Add {tab === 'members' ? 'Member' : 'Staff'}
          </Button>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="mb-6">
        <TabsList className="bg-surface">
          <TabsTrigger value="members" className="data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            Members ({residents.length})
          </TabsTrigger>
          <TabsTrigger value="staff" className="data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            Staff ({staff.length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {status === 'loading' ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl border border-border bg-surface" />
          ))}
        </div>
      ) : status === 'error' ? (
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-text">We couldn't load users right now.</p>
          <Button onClick={load} className="mt-4 bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            Retry
          </Button>
        </div>
      ) : tab === 'members' ? (
        <>
          <div className="space-y-3 sm:hidden">
            {residents.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <AvatarInitials seed={r.name} className="size-8 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                    <p className="truncate text-xs text-muted-text">{r.unit} · {tierLabel(r.tier)}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-muted-text hover:text-foreground"
                    onClick={() => setEditingResident({ id: r.id, name: r.name, email: r.email, unit: r.unit, tier: r.tier })}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-rose-400 hover:bg-rose-500/10"
                    onClick={() => setDeleteTarget({ kind: 'resident', id: r.id, name: r.name })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-muted-text">
                <tr>
                  <th className="px-4 py-3 font-medium">Member</th>
                  <th className="px-4 py-3 font-medium">Unit</th>
                  <th className="px-4 py-3 font-medium">Tier</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {residents.map((r) => (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <AvatarInitials seed={r.name} className="size-8" />
                        <span className="font-medium text-foreground">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-text">{r.unit}</td>
                    <td className="px-4 py-3 text-muted-text">{tierLabel(r.tier)}</td>
                    <td className="px-4 py-3 text-muted-text">{r.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-text hover:text-foreground"
                          onClick={() => setEditingResident({ id: r.id, name: r.name, email: r.email, unit: r.unit, tier: r.tier })}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => setDeleteTarget({ kind: 'resident', id: r.id, name: r.name })}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3 sm:hidden">
            {staff.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <AvatarInitials seed={s.name} className="size-8 shrink-0" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{s.name}</p>
                    <p className="truncate text-xs text-muted-text">{s.role} · {s.shift}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-muted-text hover:text-foreground"
                    onClick={() => setEditingStaff({ id: s.id, name: s.name, role: s.role, email: s.email, shift: s.shift })}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-rose-400 hover:bg-rose-500/10"
                    onClick={() => setDeleteTarget({ kind: 'staff', id: s.id, name: s.name })}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-2xl border border-border sm:block">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-surface-hover text-xs uppercase tracking-wide text-muted-text">
                <tr>
                  <th className="px-4 py-3 font-medium">Staff</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Shift</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-surface">
                {staff.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <AvatarInitials seed={s.name} className="size-8" />
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-text">{s.role}</td>
                    <td className="px-4 py-3 text-muted-text">{s.shift}</td>
                    <td className="px-4 py-3 text-muted-text">{s.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-text hover:text-foreground"
                          onClick={() => setEditingStaff({ id: s.id, name: s.name, role: s.role, email: s.email, shift: s.shift })}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-rose-400 hover:bg-rose-500/10"
                          onClick={() => setDeleteTarget({ kind: 'staff', id: s.id, name: s.name })}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <Sheet open={!!editingResident} onOpenChange={(open) => !open && setEditingResident(null)}>
        <SheetContent className="border-border bg-surface text-foreground">
          <SheetHeader>
            <SheetTitle className="text-foreground">{editingResident?.id ? 'Edit Member' : 'Add Member'}</SheetTitle>
          </SheetHeader>
          {editingResident && (
            <div className="space-y-4 px-4 pb-6">
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Name</Label>
                <Input value={editingResident.name} onChange={(e) => setEditingResident({ ...editingResident, name: e.target.value })} className="border-border bg-canvas" />
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Email</Label>
                <Input value={editingResident.email} onChange={(e) => setEditingResident({ ...editingResident, email: e.target.value })} className="border-border bg-canvas" />
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Unit</Label>
                <Input value={editingResident.unit} onChange={(e) => setEditingResident({ ...editingResident, unit: e.target.value })} className="border-border bg-canvas" />
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Tier</Label>
                <Select value={editingResident.tier} onValueChange={(v) => setEditingResident({ ...editingResident, tier: v as ResidentTier })}>
                  <SelectTrigger className="border-border bg-canvas">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-surface text-foreground">
                    {tiers.map((t) => (
                      <SelectItem key={t} value={t}>
                        {tierLabel(t)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!editingResident.id && (
                <p className="text-[11px] text-muted-text">
                  This reserves the unit. Phone and emergency contact are filled in by the resident once they sign in.
                </p>
              )}
              <Button className="w-full bg-accent-indigo text-white hover:bg-accent-indigo-soft" disabled={saving} onClick={saveResident}>
                {saving ? 'Saving…' : 'Save Member'}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={!!editingStaff} onOpenChange={(open) => !open && setEditingStaff(null)}>
        <SheetContent className="border-border bg-surface text-foreground">
          <SheetHeader>
            <SheetTitle className="text-foreground">{editingStaff?.id ? 'Edit Staff' : 'Add Staff'}</SheetTitle>
          </SheetHeader>
          {editingStaff && (
            <div className="space-y-4 px-4 pb-6">
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Name</Label>
                <Input value={editingStaff.name} onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })} className="border-border bg-canvas" />
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Email</Label>
                <Input value={editingStaff.email} onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })} className="border-border bg-canvas" />
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Role</Label>
                <Select value={editingStaff.role} onValueChange={(v) => setEditingStaff({ ...editingStaff, role: v })}>
                  <SelectTrigger className="border-border bg-canvas">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-surface text-foreground">
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="mb-1.5 text-xs text-muted-text">Shift</Label>
                <Select value={editingStaff.shift} onValueChange={(v) => setEditingStaff({ ...editingStaff, shift: v as StaffShift })}>
                  <SelectTrigger className="border-border bg-canvas">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-surface text-foreground">
                    {shifts.map((sh) => (
                      <SelectItem key={sh} value={sh}>
                        {sh}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full bg-accent-indigo text-white hover:bg-accent-indigo-soft" disabled={saving} onClick={saveStaff}>
                {saving ? 'Saving…' : 'Save Staff'}
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="border-border bg-surface text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border bg-transparent text-foreground hover:bg-surface-hover">Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={deleting} className="bg-rose-500 text-white hover:bg-rose-600" onClick={confirmDelete}>
              {deleting ? 'Removing…' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
