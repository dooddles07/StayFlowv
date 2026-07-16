import { prisma } from '../config/db.js'

export const GuestModel = {
  findAll: () => prisma.guest.findMany({ include: { hostResident: true }, orderBy: { arrivalDate: 'desc' } }),
  findById: (id) => prisma.guest.findUnique({ where: { id }, include: { hostResident: true } }),
  findByResident: (hostResidentId) => prisma.guest.findMany({ where: { hostResidentId }, orderBy: { arrivalDate: 'desc' } }),
  findByPassNumber: (passNumber) => prisma.guest.findUnique({ where: { passNumber } }),
  create: (data) => prisma.guest.create({ data, include: { hostResident: true } }),
  update: (id, data) => prisma.guest.update({ where: { id }, data, include: { hostResident: true } }),
  remove: (id) => prisma.guest.delete({ where: { id } }),
}
