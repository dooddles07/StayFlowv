import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Car, Heart, Pencil, Plus, Shield, SlidersHorizontal, Trash2, User as UserIcon } from 'lucide-react'
import { PageHeader } from '#/components/stayflow/page-header'
import { AvatarInitials } from '#/components/stayflow/avatar-initials'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Button } from '#/components/ui/button'
import { Switch } from '#/components/ui/switch'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
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
import { ApiError } from '#/lib/api/client'
import {
  addFamilyMember,
  addVehicle,
  removeFamilyMember,
  removeVehicle,
  tierLabel,
  updateFamilyMember,
  updateMyProfile,
  updateVehicle,
  type ResidentFamilyMember,
  type ResidentProfile,
  type ResidentProfileUpdate,
  type ResidentVehicle,
} from '#/lib/api/resident'
import { useMyProfile } from '#/lib/store/member-profile'

export const Route = createFileRoute('/member/profile')({
  head: () => ({ meta: [{ title: 'Profile — StayFlow Member' }] }),
  component: ProfilePage,
})

const errText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Try again.')

function toUpdate(f: ResidentProfile): ResidentProfileUpdate {
  return {
    name: f.name,
    phone: f.phone,
    emergencyName: f.emergencyContact.name,
    emergencyRelation: f.emergencyContact.relation,
    emergencyPhone: f.emergencyContact.phone,
    notifications: f.preferences.notifications,
    newsletter: f.preferences.newsletter,
  }
}

// --- Family add/edit dialog ---
function FamilyDialog({
  initial,
  onSaved,
  trigger,
}: {
  initial?: ResidentFamilyMember
  onSaved: (p: ResidentProfile) => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [relation, setRelation] = React.useState('')
  const [age, setAge] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setName(initial?.name ?? '')
    setRelation(initial?.relation ?? '')
    setAge(initial ? String(initial.age) : '')
  }, [open, initial])

  async function submit() {
    setBusy(true)
    try {
      const payload = { name, relation, age: Number(age) }
      const profile = initial ? await updateFamilyMember(initial.id, payload) : await addFamilyMember(payload)
      onSaved(profile)
      toast.success(initial ? 'Family member updated' : 'Family member added')
      setOpen(false)
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-border bg-surface">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit family member' : 'Add family member'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="fam-name" className="mb-1.5 text-xs text-muted-text">Full name</Label>
            <Input id="fam-name" value={name} onChange={(e) => setName(e.target.value)} className="border-border bg-canvas" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fam-relation" className="mb-1.5 text-xs text-muted-text">Relation</Label>
              <Input id="fam-relation" value={relation} onChange={(e) => setRelation(e.target.value)} className="border-border bg-canvas" />
            </div>
            <div>
              <Label htmlFor="fam-age" className="mb-1.5 text-xs text-muted-text">Age</Label>
              <Input id="fam-age" type="number" min={0} max={130} value={age} onChange={(e) => setAge(e.target.value)} className="border-border bg-canvas" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-border">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={busy} className="bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Vehicle add/edit dialog ---
function VehicleDialog({
  initial,
  onSaved,
  trigger,
}: {
  initial?: ResidentVehicle
  onSaved: (p: ResidentProfile) => void
  trigger: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [make, setMake] = React.useState('')
  const [model, setModel] = React.useState('')
  const [plate, setPlate] = React.useState('')
  const [color, setColor] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!open) return
    setMake(initial?.make ?? '')
    setModel(initial?.model ?? '')
    setPlate(initial?.plate ?? '')
    setColor(initial?.color ?? '')
  }, [open, initial])

  async function submit() {
    setBusy(true)
    try {
      const payload = { make, model, plate, color }
      const profile = initial ? await updateVehicle(initial.id, payload) : await addVehicle(payload)
      onSaved(profile)
      toast.success(initial ? 'Vehicle updated' : 'Vehicle added')
      setOpen(false)
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="border-border bg-surface">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit vehicle' : 'Add vehicle'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="veh-make" className="mb-1.5 text-xs text-muted-text">Make</Label>
            <Input id="veh-make" value={make} onChange={(e) => setMake(e.target.value)} className="border-border bg-canvas" />
          </div>
          <div>
            <Label htmlFor="veh-model" className="mb-1.5 text-xs text-muted-text">Model</Label>
            <Input id="veh-model" value={model} onChange={(e) => setModel(e.target.value)} className="border-border bg-canvas" />
          </div>
          <div>
            <Label htmlFor="veh-plate" className="mb-1.5 text-xs text-muted-text">Plate</Label>
            <Input id="veh-plate" value={plate} onChange={(e) => setPlate(e.target.value)} className="border-border bg-canvas" />
          </div>
          <div>
            <Label htmlFor="veh-color" className="mb-1.5 text-xs text-muted-text">Color</Label>
            <Input id="veh-color" value={color} onChange={(e) => setColor(e.target.value)} className="border-border bg-canvas" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="border-border">Cancel</Button>
          </DialogClose>
          <Button onClick={submit} disabled={busy} className="bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// --- Delete confirmation ---
function DeleteButton({ label, onConfirm }: { label: string; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = React.useState(false)
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8 text-muted-text hover:text-red-500" aria-label={`Remove ${label}`}>
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-border bg-surface">
        <AlertDialogHeader>
          <AlertDialogTitle>Remove {label}?</AlertDialogTitle>
          <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={async (e) => {
              e.preventDefault()
              setBusy(true)
              try {
                await onConfirm()
              } finally {
                setBusy(false)
              }
            }}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {busy ? 'Removing…' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ProfilePage() {
  const { profile, status, setProfile } = useMyProfile()
  const [form, setForm] = React.useState<ResidentProfile | null>(null)
  const [saving, setSaving] = React.useState(false)

  // Sync the editable copy when the identity loads/changes — but not on every
  // child mutation, so unsaved text edits aren't clobbered by a family/vehicle save.
  React.useEffect(() => {
    if (profile) setForm(profile)
  }, [profile?.id])

  async function save(message: string) {
    if (!form) return
    setSaving(true)
    try {
      const updated = await updateMyProfile(toUpdate(form))
      setProfile(updated)
      setForm(updated)
      toast.success(message)
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || (status === 'ready' && !form)) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader eyebrow="Account" title="Profile" description="Manage your personal information and preferences." />
        <div className="animate-pulse space-y-4">
          <div className="h-24 rounded-2xl border border-border bg-surface" />
          <div className="h-10 w-full max-w-md rounded-xl bg-surface" />
          <div className="h-64 rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    )
  }

  if (status === 'error' || !form || !profile) {
    return (
      <div className="mx-auto max-w-4xl">
        <PageHeader eyebrow="Account" title="Profile" description="Manage your personal information and preferences." />
        <div className="rounded-2xl border border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-text">We couldn't load your profile right now.</p>
          <Button onClick={() => window.location.reload()} className="mt-4 bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Account" title="Profile" description="Manage your personal information and preferences." />

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <AvatarInitials seed={form.avatarSeed} className="size-14" />
        <div>
          <p className="text-base font-semibold text-foreground">{form.name}</p>
          <p className="text-sm text-muted-text">{form.unit} · {tierLabel(form.tier)} Member</p>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="mb-6 flex-wrap bg-surface">
          <TabsTrigger value="personal" className="gap-1.5 data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            <UserIcon className="size-3.5" /> Personal
          </TabsTrigger>
          <TabsTrigger value="family" className="gap-1.5 data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            <Heart className="size-3.5" /> Family
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-1.5 data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            <Car className="size-3.5" /> Vehicles
          </TabsTrigger>
          <TabsTrigger value="emergency" className="gap-1.5 data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            <Shield className="size-3.5" /> Emergency
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 data-[state=active]:bg-accent-indigo/20 data-[state=active]:text-accent-gold">
            <SlidersHorizontal className="size-3.5" /> Preferences
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-name" className="mb-1.5 text-xs text-muted-text">Full name</Label>
              <Input id="profile-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-border bg-canvas" />
            </div>
            <div>
              <Label htmlFor="profile-unit" className="mb-1.5 text-xs text-muted-text">Unit</Label>
              <Input id="profile-unit" value={form.unit} readOnly disabled className="border-border bg-canvas" />
            </div>
            <div>
              <Label htmlFor="profile-email" className="mb-1.5 text-xs text-muted-text">Email</Label>
              <Input id="profile-email" value={form.email} readOnly disabled className="border-border bg-canvas" />
            </div>
            <div>
              <Label htmlFor="profile-phone" className="mb-1.5 text-xs text-muted-text">Phone</Label>
              <Input id="profile-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border-border bg-canvas" />
            </div>
          </div>
          <Button onClick={() => save('Personal details saved')} disabled={saving} className="bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </TabsContent>

        <TabsContent value="family" className="space-y-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Family members</p>
            <FamilyDialog
              onSaved={setProfile}
              trigger={
                <Button size="sm" className="gap-1.5 bg-accent-indigo text-white hover:bg-accent-indigo-soft">
                  <Plus className="size-4" /> Add
                </Button>
              }
            />
          </div>
          {profile.family.length === 0 ? (
            <p className="text-sm text-muted-text">No family members added yet.</p>
          ) : (
            profile.family.map((member) => (
              <div key={member.id} className="flex items-center justify-between rounded-xl border border-border bg-canvas px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{member.name}</p>
                  <p className="text-xs text-muted-text">{member.relation} · Age {member.age}</p>
                </div>
                <div className="flex items-center gap-1">
                  <FamilyDialog
                    initial={member}
                    onSaved={setProfile}
                    trigger={
                      <Button variant="ghost" size="icon" className="size-8 text-muted-text hover:text-foreground" aria-label={`Edit ${member.name}`}>
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <DeleteButton label={member.name} onConfirm={() => removeFamilyMember(member.id).then(setProfile)} />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-3 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Registered vehicles</p>
            <VehicleDialog
              onSaved={setProfile}
              trigger={
                <Button size="sm" className="gap-1.5 bg-accent-indigo text-white hover:bg-accent-indigo-soft">
                  <Plus className="size-4" /> Add
                </Button>
              }
            />
          </div>
          {profile.vehicles.length === 0 ? (
            <p className="text-sm text-muted-text">No vehicles registered.</p>
          ) : (
            profile.vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex items-center justify-between rounded-xl border border-border bg-canvas px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-xs text-muted-text">{vehicle.color}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium text-accent-gold">{vehicle.plate}</p>
                  <VehicleDialog
                    initial={vehicle}
                    onSaved={setProfile}
                    trigger={
                      <Button variant="ghost" size="icon" className="size-8 text-muted-text hover:text-foreground" aria-label={`Edit ${vehicle.make} ${vehicle.model}`}>
                        <Pencil className="size-4" />
                      </Button>
                    }
                  />
                  <DeleteButton label={`${vehicle.make} ${vehicle.model}`} onConfirm={() => removeVehicle(vehicle.id).then(setProfile)} />
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="emergency-name" className="mb-1.5 text-xs text-muted-text">Contact name</Label>
              <Input
                id="emergency-name"
                value={form.emergencyContact.name}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })}
                className="border-border bg-canvas"
              />
            </div>
            <div>
              <Label htmlFor="emergency-relation" className="mb-1.5 text-xs text-muted-text">Relation</Label>
              <Input
                id="emergency-relation"
                value={form.emergencyContact.relation}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })}
                className="border-border bg-canvas"
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="emergency-phone" className="mb-1.5 text-xs text-muted-text">Phone</Label>
              <Input
                id="emergency-phone"
                value={form.emergencyContact.phone}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })}
                className="border-border bg-canvas"
              />
            </div>
          </div>
          <Button onClick={() => save('Emergency contact saved')} disabled={saving} className="bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-5 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Push notifications</p>
              <p className="text-xs text-muted-text">Booking updates, guest arrivals, and reminders.</p>
            </div>
            <Switch
              checked={form.preferences.notifications}
              onCheckedChange={(checked) => setForm({ ...form, preferences: { ...form.preferences, notifications: checked } })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Community newsletter</p>
              <p className="text-xs text-muted-text">Monthly digest of events and announcements.</p>
            </div>
            <Switch
              checked={form.preferences.newsletter}
              onCheckedChange={(checked) => setForm({ ...form, preferences: { ...form.preferences, newsletter: checked } })}
            />
          </div>
          <div>
            <Label className="mb-1.5 text-xs text-muted-text">Dietary preferences</Label>
            <p className="text-sm text-foreground">
              {form.preferences.dietary.length > 0 ? form.preferences.dietary.join(', ') : 'None specified'}
            </p>
          </div>
          <Button onClick={() => save('Preferences saved')} disabled={saving} className="bg-accent-indigo text-white hover:bg-accent-indigo-soft">
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}
