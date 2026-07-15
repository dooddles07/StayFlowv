import type { StaffMember } from './types'

export const staff: StaffMember[] = [
  { id: 'stf-001', name: 'Marcus Webb', role: 'Concierge', email: 'marcus.webb@stayflow.io', shift: 'Morning', avatarSeed: 'Marcus Webb' },
  { id: 'stf-002', name: 'Renata Silva', role: 'Facilities Manager', email: 'renata.silva@stayflow.io', shift: 'Morning', avatarSeed: 'Renata Silva' },
  { id: 'stf-003', name: 'Jonah Pierce', role: 'Guest Relations', email: 'jonah.pierce@stayflow.io', shift: 'Afternoon', avatarSeed: 'Jonah Pierce' },
  { id: 'stf-004', name: 'Yuki Tanaka', role: 'Dining Manager', email: 'yuki.tanaka@stayflow.io', shift: 'Afternoon', avatarSeed: 'Yuki Tanaka' },
  { id: 'stf-005', name: 'Deshawn Ellis', role: 'Security', email: 'deshawn.ellis@stayflow.io', shift: 'Night', avatarSeed: 'Deshawn Ellis' },
  { id: 'stf-006', name: 'Fatima Haidari', role: 'Operations', email: 'fatima.haidari@stayflow.io', shift: 'Morning', avatarSeed: 'Fatima Haidari' },
  { id: 'stf-007', name: 'Callum Reyes', role: 'Guest Relations', email: 'callum.reyes@stayflow.io', shift: 'Night', avatarSeed: 'Callum Reyes' },
  { id: 'stf-008', name: 'Nadia Osei', role: 'Concierge', email: 'nadia.osei@stayflow.io', shift: 'Afternoon', avatarSeed: 'Nadia Osei' },
]

export function getStaffById(id: string): StaffMember | undefined {
  return staff.find((s) => s.id === id)
}
