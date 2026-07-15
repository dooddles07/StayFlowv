import type { DiningReservation } from './types'

export const diningReservations: DiningReservation[] = [
  { id: 'dine-001', restaurantId: 'rst-001', residentId: 'res-001', date: '2026-07-15', time: '7:30 PM', partySize: 2, occasion: 'Anniversary', dietary: 'Pescatarian', seating: 'Indoor', status: 'confirmed', createdAt: '2026-07-10T10:00:00Z' },
  { id: 'dine-002', restaurantId: 'rst-002', residentId: 'res-004', date: '2026-07-15', time: '6:00 PM', partySize: 5, seating: 'Outdoor', status: 'confirmed', createdAt: '2026-07-11T13:20:00Z' },
  { id: 'dine-003', restaurantId: 'rst-003', residentId: 'res-007', date: '2026-07-16', time: '8:00 PM', partySize: 2, occasion: 'Business dinner', seating: 'Bar', status: 'pending', createdAt: '2026-07-13T09:05:00Z' },
  { id: 'dine-004', restaurantId: 'rst-004', residentId: 'res-003', date: '2026-07-15', time: '9:00 AM', partySize: 3, dietary: 'Vegetarian, Gluten-Free', seating: 'Indoor', status: 'arrived', createdAt: '2026-07-14T07:00:00Z' },
  { id: 'dine-005', restaurantId: 'rst-001', residentId: 'res-010', date: '2026-07-18', time: '8:00 PM', partySize: 4, seating: 'Private Room', status: 'confirmed', createdAt: '2026-07-12T16:45:00Z' },
  { id: 'dine-006', restaurantId: 'rst-002', residentId: 'res-008', date: '2026-07-14', time: '12:30 PM', partySize: 2, dietary: 'Nut Allergy', seating: 'Indoor', status: 'cancelled', createdAt: '2026-07-09T11:15:00Z' },
  { id: 'dine-007', restaurantId: 'rst-003', residentId: 'res-012', date: '2026-07-17', time: '7:00 PM', partySize: 6, occasion: 'Birthday', seating: 'Private Room', status: 'pending', createdAt: '2026-07-14T14:30:00Z' },
  { id: 'dine-008', restaurantId: 'rst-004', residentId: 'res-006', date: '2026-07-15', time: '10:30 AM', partySize: 1, dietary: 'Vegan', seating: 'Indoor', status: 'confirmed', createdAt: '2026-07-13T08:50:00Z' },
]

export function getDiningReservationsByResident(residentId: string): DiningReservation[] {
  return diningReservations.filter((d) => d.residentId === residentId)
}
