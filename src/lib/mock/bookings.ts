import type { Booking } from './types'

export const bookings: Booking[] = [
  { id: 'bkg-001', facilityId: 'fac-001', residentId: 'res-001', date: '2026-07-16', timeSlot: '9:00 AM – 10:30 AM', partySize: 3, status: 'confirmed', createdAt: '2026-07-10T14:22:00Z' },
  { id: 'bkg-002', facilityId: 'fac-002', residentId: 'res-002', date: '2026-07-15', timeSlot: '6:00 AM – 7:00 AM', partySize: 1, status: 'confirmed', createdAt: '2026-07-09T08:11:00Z' },
  { id: 'bkg-003', facilityId: 'fac-003', residentId: 'res-004', date: '2026-07-18', timeSlot: '7:00 PM – 9:00 PM', partySize: 8, status: 'pending', createdAt: '2026-07-13T19:40:00Z', notes: 'Birthday celebration, need cake table' },
  { id: 'bkg-004', facilityId: 'fac-005', residentId: 'res-003', date: '2026-07-16', timeSlot: '7:00 AM – 8:00 AM', partySize: 1, status: 'confirmed', createdAt: '2026-07-12T06:00:00Z' },
  { id: 'bkg-005', facilityId: 'fac-006', residentId: 'res-010', date: '2026-07-25', timeSlot: '6:00 PM – 11:00 PM', partySize: 60, status: 'pending', createdAt: '2026-07-11T11:05:00Z', notes: 'Anniversary party, catering approval needed' },
  { id: 'bkg-006', facilityId: 'fac-001', residentId: 'res-007', date: '2026-07-14', timeSlot: '4:00 PM – 5:30 PM', partySize: 2, status: 'cancelled', createdAt: '2026-07-08T10:15:00Z' },
  { id: 'bkg-007', facilityId: 'fac-007', residentId: 'res-008', date: '2026-07-17', timeSlot: '2:00 PM – 3:00 PM', partySize: 1, status: 'confirmed', createdAt: '2026-07-13T09:30:00Z' },
  { id: 'bkg-008', facilityId: 'fac-002', residentId: 'res-005', date: '2026-07-15', timeSlot: '5:30 PM – 6:30 PM', partySize: 2, status: 'confirmed', createdAt: '2026-07-10T17:00:00Z' },
  { id: 'bkg-009', facilityId: 'fac-004', residentId: 'res-011', date: '2026-07-20', timeSlot: '8:00 AM – 9:00 AM', partySize: 2, status: 'pending', createdAt: '2026-07-14T07:45:00Z' },
  { id: 'bkg-010', facilityId: 'fac-003', residentId: 'res-012', date: '2026-07-19', timeSlot: '3:00 PM – 5:00 PM', partySize: 6, status: 'confirmed', createdAt: '2026-07-12T15:20:00Z' },
  { id: 'bkg-011', facilityId: 'fac-001', residentId: 'res-006', date: '2026-07-17', timeSlot: '11:00 AM – 12:30 PM', partySize: 1, status: 'confirmed', createdAt: '2026-07-13T12:00:00Z' },
  { id: 'bkg-012', facilityId: 'fac-005', residentId: 'res-009', date: '2026-07-16', timeSlot: '6:00 PM – 7:00 PM', partySize: 4, status: 'pending', createdAt: '2026-07-14T18:10:00Z' },
]

export function getBookingsByResident(residentId: string): Booking[] {
  return bookings.filter((b) => b.residentId === residentId)
}
