import type { Guest } from './types'

export const guests: Guest[] = [
  { id: 'gst-001', name: 'Harrison Blake', hostResidentId: 'res-001', purpose: 'Personal visit', vehiclePlate: 'CA-8821X', arrivalDate: '2026-07-15', arrivalTime: '2:00 PM', passNumber: 'SF-GP-48213', status: 'checked-in', checkedInAt: '2026-07-15T14:05:00Z' },
  { id: 'gst-002', name: 'Sophie Laurent', hostResidentId: 'res-004', purpose: 'Delivery coordination', arrivalDate: '2026-07-15', arrivalTime: '3:30 PM', passNumber: 'SF-GP-48214', status: 'approved' },
  { id: 'gst-003', name: 'Marcus Feld', hostResidentId: 'res-007', purpose: 'Contractor', vehiclePlate: 'CA-2290Z', arrivalDate: '2026-07-15', arrivalTime: '9:00 AM', passNumber: 'SF-GP-48198', status: 'checked-out', checkedInAt: '2026-07-15T09:10:00Z', checkedOutAt: '2026-07-15T12:40:00Z' },
  { id: 'gst-004', name: 'Ingrid Solveig', hostResidentId: 'res-010', purpose: 'Personal visit', arrivalDate: '2026-07-16', arrivalTime: '11:00 AM', passNumber: 'SF-GP-48227', status: 'pending' },
  { id: 'gst-005', name: 'Tobias Renner', hostResidentId: 'res-002', purpose: 'Personal visit', vehiclePlate: 'CA-6613A', arrivalDate: '2026-07-15', arrivalTime: '5:00 PM', passNumber: 'SF-GP-48219', status: 'approved' },
  { id: 'gst-006', name: 'Layla Haddad', hostResidentId: 'res-003', purpose: 'Family visit', arrivalDate: '2026-07-15', arrivalTime: '1:00 PM', passNumber: 'SF-GP-48210', status: 'checked-in', checkedInAt: '2026-07-15T13:05:00Z' },
  { id: 'gst-007', name: 'Owen Petrova', hostResidentId: 'res-012', purpose: 'Personal trainer', arrivalDate: '2026-07-16', arrivalTime: '7:00 AM', passNumber: 'SF-GP-48231', status: 'pending' },
  { id: 'gst-008', name: 'Ava Sinclair', hostResidentId: 'res-008', purpose: 'Family visit', vehiclePlate: 'CA-9042B', arrivalDate: '2026-07-14', arrivalTime: '4:00 PM', passNumber: 'SF-GP-48176', status: 'checked-out', checkedInAt: '2026-07-14T16:05:00Z', checkedOutAt: '2026-07-14T20:30:00Z' },
  { id: 'gst-009', name: 'Rafael Costa', hostResidentId: 'res-005', purpose: 'Personal visit', arrivalDate: '2026-07-15', arrivalTime: '6:00 PM', passNumber: 'SF-GP-48222', status: 'approved' },
  { id: 'gst-010', name: 'Nina Osei', hostResidentId: 'res-011', purpose: 'Interior designer', vehiclePlate: 'CA-3387Y', arrivalDate: '2026-07-16', arrivalTime: '10:00 AM', passNumber: 'SF-GP-48229', status: 'pending' },
]

export function getGuestsByResident(residentId: string): Guest[] {
  return guests.filter((g) => g.hostResidentId === residentId)
}
