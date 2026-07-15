import type { AppNotification } from './types'

export const notifications: AppNotification[] = [
  { id: 'notif-001', kind: 'booking', title: 'Booking confirmed', body: 'Your Infinity Sky Pool session for July 16, 9:00 AM is confirmed.', createdAt: '2026-07-14T14:22:00Z', read: false },
  { id: 'notif-002', kind: 'guest', title: 'Guest checked in', body: 'Harrison Blake has checked in at the main lobby.', createdAt: '2026-07-15T14:05:00Z', read: false },
  { id: 'notif-003', kind: 'dining', title: 'Reservation reminder', body: 'Your table at Ember & Oak is booked for 7:30 PM tonight.', createdAt: '2026-07-15T10:00:00Z', read: false },
  { id: 'notif-004', kind: 'event', title: 'Event RSVP confirmed', body: 'You\'re on the list for Sunset Rooftop Wine Tasting, July 18.', createdAt: '2026-07-13T09:15:00Z', read: true },
  { id: 'notif-005', kind: 'notice', title: 'New community notice', body: 'Water shutoff scheduled for Garden Residences on July 16.', createdAt: '2026-07-13T15:30:00Z', read: true },
  { id: 'notif-006', kind: 'booking', title: 'Booking pending approval', body: 'Your Aurora Screening Room request for July 18 is awaiting staff approval.', createdAt: '2026-07-13T19:40:00Z', read: true },
  { id: 'notif-007', kind: 'system', title: 'Profile updated', body: 'Your emergency contact information was updated successfully.', createdAt: '2026-07-11T11:00:00Z', read: true },
  { id: 'notif-008', kind: 'guest', title: 'Guest pass expiring', body: 'Ingrid Solveig\'s guest pass for July 16 is still pending approval.', createdAt: '2026-07-15T08:00:00Z', read: false },
]
