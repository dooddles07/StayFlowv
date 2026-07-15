import type { DiningTable } from './types'

export const tables: DiningTable[] = [
  { id: 'tbl-001', restaurantId: 'rst-001', label: 'T1', seats: 2, status: 'available' },
  { id: 'tbl-002', restaurantId: 'rst-001', label: 'T2', seats: 4, status: 'reserved' },
  { id: 'tbl-003', restaurantId: 'rst-001', label: 'T3', seats: 4, status: 'available' },
  { id: 'tbl-004', restaurantId: 'rst-001', label: 'T4', seats: 6, status: 'occupied' },
  { id: 'tbl-005', restaurantId: 'rst-001', label: 'T5', seats: 8, status: 'available' },
  { id: 'tbl-006', restaurantId: 'rst-002', label: 'A1', seats: 2, status: 'available' },
  { id: 'tbl-007', restaurantId: 'rst-002', label: 'A2', seats: 4, status: 'available' },
  { id: 'tbl-008', restaurantId: 'rst-002', label: 'A3', seats: 4, status: 'reserved' },
  { id: 'tbl-009', restaurantId: 'rst-002', label: 'A4', seats: 6, status: 'occupied' },
  { id: 'tbl-010', restaurantId: 'rst-003', label: 'K1', seats: 2, status: 'reserved' },
  { id: 'tbl-011', restaurantId: 'rst-003', label: 'K2', seats: 2, status: 'available' },
  { id: 'tbl-012', restaurantId: 'rst-003', label: 'K3', seats: 4, status: 'available' },
  { id: 'tbl-013', restaurantId: 'rst-003', label: 'Private Room', seats: 10, status: 'available' },
  { id: 'tbl-014', restaurantId: 'rst-004', label: 'M1', seats: 2, status: 'available' },
  { id: 'tbl-015', restaurantId: 'rst-004', label: 'M2', seats: 4, status: 'occupied' },
  { id: 'tbl-016', restaurantId: 'rst-004', label: 'M3', seats: 4, status: 'available' },
]

export function getTablesByRestaurant(restaurantId: string): DiningTable[] {
  return tables.filter((t) => t.restaurantId === restaurantId)
}
