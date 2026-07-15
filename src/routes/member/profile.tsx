import { createFileRoute, useBlocker } from '@tanstack/react-router'
import * as React from 'react'
import { toast } from 'sonner'
import { Car, Heart, Pencil, PhoneCall, Plus, Shield, SlidersHorizontal, Trash2, User as UserIcon, X } from 'lucide-react'
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
import { useAuthStore } from '#/lib/store/auth-store'

export const Route = createFileRoute('/member/profile')({
  head: () => ({ meta: [{ title: 'Profile — StayFlow Member' }] }),
  component: ProfilePage,
})

const errText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Try again.')

const PHONE_RE = /^[+()\-\s\d]{7,}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isBlank = (s: string) => s.trim() === ''
const phoneError = (v: string) => (isBlank(v) ? 'Phone is required' : !PHONE_RE.test(v) ? 'Enter a valid phone number' : '')

function computeErrors(f: ResidentProfile) {
  return {
    name: isBlank(f.name) ? 'Name is required' : '',
    phone: phoneError(f.phone),
    emName: isBlank(f.emergencyContact.name) ? 'Contact name is required' : '',
    emRelation: isBlank(f.emergencyContact.relation) ? 'Relation is required' : '',
    emPhone: phoneError(f.emergencyContact.phone),
  }
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1 text-xs text-red-500">{msg}</p>
}

// Single-row tab that never compresses its label (scrolls on narrow screens) and
// keeps a ≥44px touch target. Active state layers three cues (not colour alone):
// gold-tinted surface + gold text + hairline gold ring.
const tabTrigger =
  'min-h-11 shrink-0 gap-1.5 px-3 data-[state=active]:bg-accent-gold/10 data-[state=active]:font-semibold data-[state=active]:text-accent-gold data-[state=active]:ring-1 data-[state=active]:ring-inset data-[state=active]:ring-accent-gold/30'

function toUpdate(f: ResidentProfile): ResidentProfileUpdate {
  return {
    name: f.name.trim(),
    phone: f.phone.trim(),
    emergencyName: f.emergencyContact.name.trim(),
    emergencyRelation: f.emergencyContact.relation.trim(),
    emergencyPhone: f.emergencyContact.phone.trim(),
    notifications: f.preferences.notifications,
    newsletter: f.preferences.newsletter,
    dietary: f.preferences.dietary,
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

// --- Change email (verify-then-apply) ---
function EmailSection() {
  const currentEmail = useMyProfile().profile?.email ?? ''
  const requestEmailChange = useAuthStore((s) => s.requestEmailChange)
  const [newEmail, setNewEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const emailError = newEmail && !EMAIL_RE.test(newEmail) ? 'Enter a valid email address' : ''
  const sameError = newEmail && newEmail.toLowerCase() === currentEmail.toLowerCase() ? 'This is already your email' : ''
  const canSubmit = !busy && !!password && EMAIL_RE.test(newEmail) && newEmail.toLowerCase() !== currentEmail.toLowerCase()

  async function submit() {
    if (!canSubmit) return
    setBusy(true)
    try {
      const message = await requestEmailChange(newEmail.trim(), password)
      toast.success(message)
      setNewEmail('')
      setPassword('')
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground">Email address</p>
        <p className="text-xs text-muted-text">Current: {currentEmail}</p>
      </div>
      <div className="max-w-md space-y-4">
        <div>
          <Label htmlFor="email-new" className="mb-1.5 text-xs text-muted-text">New email</Label>
          <Input id="email-new" type="email" autoComplete="email" value={newEmail} aria-invalid={!!emailError || !!sameError} onChange={(e) => setNewEmail(e.target.value)} className="border-border bg-canvas" />
          <FieldError msg={emailError || sameError} />
        </div>
        <div>
          <Label htmlFor="email-password" className="mb-1.5 text-xs text-muted-text">Current password</Label>
          <Input id="email-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="border-border bg-canvas" />
        </div>
      </div>
      <p className="text-xs text-muted-text">We'll send a verification link to the new address. Your email changes only after you open it.</p>
      <Button onClick={submit} disabled={!canSubmit} className="bg-accent-indigo text-white hover:bg-accent-indigo-soft">
        {busy ? 'Sending…' : 'Send verification link'}
      </Button>
    </div>
  )
}

// --- Change password ---
function SecuritySection() {
  const changePassword = useAuthStore((s) => s.changePassword)
  const [current, setCurrent] = React.useState('')
  const [next, setNext] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [busy, setBusy] = React.useState(false)

  const nextError = next && next.length < 8 ? 'Must be at least 8 characters' : ''
  const sameError = next && current && next === current ? 'Choose a password different from your current one' : ''
  const confirmError = confirm && confirm !== next ? 'Passwords do not match' : ''
  const canSubmit = !busy && !!current && next.length >= 8 && confirm === next && next !== current

  async function submit() {
    if (!canSubmit) return
    setBusy(true)
    try {
      await changePassword(current, next)
      toast.success('Password updated. Other devices have been signed out.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err) {
      toast.error(errText(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="max-w-md space-y-4">
        <div>
          <Label htmlFor="pw-current" className="mb-1.5 text-xs text-muted-text">Current password</Label>
          <Input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className="border-border bg-canvas" />
        </div>
        <div>
          <Label htmlFor="pw-new" className="mb-1.5 text-xs text-muted-text">New password</Label>
          <Input id="pw-new" type="password" autoComplete="new-password" value={next} aria-invalid={!!nextError || !!sameError} onChange={(e) => setNext(e.target.value)} className="border-border bg-canvas" />
          <FieldError msg={nextError || sameError} />
        </div>
        <div>
          <Label htmlFor="pw-confirm" className="mb-1.5 text-xs text-muted-text">Confirm new password</Label>
          <Input id="pw-confirm" type="password" autoComplete="new-password" value={confirm} aria-invalid={!!confirmError} onChange={(e) => setConfirm(e.target.value)} className="border-border bg-canvas" />
          <FieldError msg={confirmError} />
        </div>
      </div>
      <p className="text-xs text-muted-text">Changing your password signs you out on all other devices.</p>
      <Button onClick={submit} disabled={!canSubmit} className="bg-accent-indigo text-white hover:bg-accent-indigo-soft">
        {busy ? 'Updating…' : 'Update Password'}
      </Button>
    </div>
  )
}

function ProfilePage() {
  const { profile, status, setProfile } = useMyProfile()
  const [form, setForm] = React.useState<ResidentProfile | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [dietaryInput, setDietaryInput] = React.useState('')

  // Sync the editable copy when the identity loads/changes — but not on every
  // child mutation, so unsaved text edits aren't clobbered by a family/vehicle save.
  React.useEffect(() => {
    if (profile) setForm(profile)
  }, [profile?.id])

  const dirty =
    form && profile
      ? {
          personal: form.name !== profile.name || form.phone !== profile.phone,
          emergency:
            form.emergencyContact.name !== profile.emergencyContact.name ||
            form.emergencyContact.relation !== profile.emergencyContact.relation ||
            form.emergencyContact.phone !== profile.emergencyContact.phone,
          prefs:
            form.preferences.notifications !== profile.preferences.notifications ||
            form.preferences.newsletter !== profile.preferences.newsletter ||
            form.preferences.dietary.join('|') !== profile.preferences.dietary.join('|'),
        }
      : { personal: false, emergency: false, prefs: false }
  const isDirty = dirty.personal || dirty.emergency || dirty.prefs

  // Guard against losing unsaved edits: block in-app navigation (styled prompt via
  // resolver) and warn the browser on tab close / refresh.
  const blocker = useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
    withResolver: true,
  })

  async function save(message: string) {
    if (!form) return
    if (Object.values(computeErrors(form)).some(Boolean)) {
      toast.error('Fix the highlighted fields before saving.')
      return
    }
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

  const errors = computeErrors(form)

  function addDietary() {
    if (!form) return
    const value = dietaryInput.trim()
    if (!value) return
    if (form.preferences.dietary.some((d) => d.toLowerCase() === value.toLowerCase())) {
      setDietaryInput('')
      return
    }
    setForm({ ...form, preferences: { ...form.preferences, dietary: [...form.preferences.dietary, value] } })
    setDietaryInput('')
  }

  function removeDietary(tag: string) {
    if (!form) return
    setForm({ ...form, preferences: { ...form.preferences, dietary: form.preferences.dietary.filter((d) => d !== tag) } })
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader eyebrow="Account" title="Profile" description="Manage your personal information and preferences." />

      <AlertDialog open={blocker.status === 'blocked'}>
        <AlertDialogContent className="border-border bg-surface">
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>You have edits that haven't been saved. Leaving now will lose them.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border" onClick={() => blocker.reset?.()}>Stay</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={() => blocker.proceed?.()}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-5">
        <AvatarInitials seed={form.avatarSeed} className="size-14" />
        <div>
          <p className="text-base font-semibold text-foreground">{form.name}</p>
          <p className="text-sm text-muted-text">{form.unit} · {tierLabel(form.tier)} Member</p>
        </div>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="mb-6 flex h-auto w-full justify-start gap-1 overflow-x-auto bg-surface p-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="personal" className={tabTrigger}>
            <UserIcon className="size-3.5" /> Personal
          </TabsTrigger>
          <TabsTrigger value="family" className={tabTrigger}>
            <Heart className="size-3.5" /> Family
          </TabsTrigger>
          <TabsTrigger value="vehicles" className={tabTrigger}>
            <Car className="size-3.5" /> Vehicles
          </TabsTrigger>
          <TabsTrigger value="emergency" className={tabTrigger}>
            <PhoneCall className="size-3.5" /> Emergency
          </TabsTrigger>
          <TabsTrigger value="preferences" className={tabTrigger}>
            <SlidersHorizontal className="size-3.5" /> Preferences
          </TabsTrigger>
          <TabsTrigger value="security" className={tabTrigger}>
            <Shield className="size-3.5" /> Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="profile-name" className="mb-1.5 text-xs text-muted-text">Full name</Label>
              <Input id="profile-name" value={form.name} aria-invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-border bg-canvas" />
              <FieldError msg={errors.name} />
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
              <Input id="profile-phone" value={form.phone} aria-invalid={!!errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border-border bg-canvas" />
              <FieldError msg={errors.phone} />
            </div>
          </div>
          <Button
            onClick={() => save('Personal details saved')}
            disabled={saving || !dirty.personal || !!errors.name || !!errors.phone}
            className="bg-accent-indigo text-white hover:bg-accent-indigo-soft"
          >
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
                aria-invalid={!!errors.emName}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, name: e.target.value } })}
                className="border-border bg-canvas"
              />
              <FieldError msg={errors.emName} />
            </div>
            <div>
              <Label htmlFor="emergency-relation" className="mb-1.5 text-xs text-muted-text">Relation</Label>
              <Input
                id="emergency-relation"
                value={form.emergencyContact.relation}
                aria-invalid={!!errors.emRelation}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, relation: e.target.value } })}
                className="border-border bg-canvas"
              />
              <FieldError msg={errors.emRelation} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="emergency-phone" className="mb-1.5 text-xs text-muted-text">Phone</Label>
              <Input
                id="emergency-phone"
                value={form.emergencyContact.phone}
                aria-invalid={!!errors.emPhone}
                onChange={(e) => setForm({ ...form, emergencyContact: { ...form.emergencyContact, phone: e.target.value } })}
                className="border-border bg-canvas"
              />
              <FieldError msg={errors.emPhone} />
            </div>
          </div>
          <Button
            onClick={() => save('Emergency contact saved')}
            disabled={saving || !dirty.emergency || !!errors.emName || !!errors.emRelation || !!errors.emPhone}
            className="bg-accent-indigo text-white hover:bg-accent-indigo-soft"
          >
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
            <Label htmlFor="dietary-input" className="mb-1.5 text-xs text-muted-text">Dietary preferences</Label>
            {form.preferences.dietary.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {form.preferences.dietary.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-accent-indigo/15 px-3 py-1 text-xs font-medium text-foreground">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeDietary(tag)}
                      aria-label={`Remove ${tag}`}
                      className="text-muted-text transition-colors hover:text-red-500"
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                id="dietary-input"
                value={dietaryInput}
                placeholder="e.g. Vegetarian, Gluten-free"
                onChange={(e) => setDietaryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addDietary()
                  }
                }}
                className="border-border bg-canvas"
              />
              <Button type="button" variant="outline" onClick={addDietary} className="border-border">
                Add
              </Button>
            </div>
          </div>
          <Button
            onClick={() => save('Preferences saved')}
            disabled={saving || !dirty.prefs}
            className="bg-accent-indigo text-white hover:bg-accent-indigo-soft"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </TabsContent>

        <TabsContent value="security" className="space-y-8 rounded-2xl border border-border bg-surface p-5">
          <EmailSection />
          <div className="border-t border-border" />
          <SecuritySection />
        </TabsContent>
      </Tabs>
    </div>
  )
}
