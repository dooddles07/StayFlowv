import { prisma } from '../config/db.js'

const includeRelations = { restaurant: true, resident: true, table: true }

export const DiningReservationModel = {
  findAll: () => prisma.diningReservation.findMany({ include: includeRelations, orderBy: { createdAt: 'desc' } }),
  findById: (id) => prisma.diningReservation.findUnique({ where: { id }, include: includeRelations }),
  findByResident: (residentId) => prisma.diningReservation.findMany({ where: { residentId }, include: { restaurant: true, table: true } }),
  create: (data) => prisma.diningReservation.create({ data, include: includeRelations }),
  update: (id, data) => prisma.diningReservation.update({ where: { id }, data, include: includeRelations }),
  remove: (id) => prisma.diningReservation.delete({ where: { id } }),

  setTableStatus: (tableId, status) => prisma.diningTable.update({ where: { id: tableId }, data: { status } }),

  // Finding the smallest fitting table and reserving it were two separate statements —
  // two reservations confirmed at once could both see the same AVAILABLE table before
  // either commits. Serializable isolation makes Postgres detect that overlap and fail
  // one side with P2034 ("write conflict, retry"); retried once here, same approach as
  // BookingModel.createIfNoConflict for the equivalent facility-slot race. Returns null
  // both when nothing fits and when contention couldn't be resolved after retry — from
  // the caller's perspective both mean "no table available right now."
  assignTableIfAvailable: async (restaurantId, minSeats) => {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        return await prisma.$transaction(
          async (tx) => {
            const table = await tx.diningTable.findFirst({
              where: { restaurantId, status: 'AVAILABLE', seats: { gte: minSeats } },
              orderBy: { seats: 'asc' },
            })
            if (!table) return null
            await tx.diningTable.update({ where: { id: table.id }, data: { status: 'RESERVED' } })
            return table
          },
          { isolationLevel: 'Serializable' },
        )
      } catch (err) {
        if (err.code !== 'P2034') throw err
        if (attempt === 1) return null
      }
    }
  },
}
