import { prisma } from '../config/db.js'

// Notifications are the fastest-growing table (created on every booking/reservation/
// guest/event status change) with no retention policy — bounded `take` here, same
// pattern as AuthEventModel.list, keeps a list endpoint from becoming an unbounded
// full-table dump as the property accumulates history.
export const NotificationModel = {
  findAll: ({ limit = 200 } = {}) =>
    prisma.appNotification.findMany({ orderBy: { createdAt: 'desc' }, take: Math.min(limit, 500) }),
  findById: (id) => prisma.appNotification.findUnique({ where: { id } }),
  findByResident: (residentId, { limit = 100 } = {}) =>
    prisma.appNotification.findMany({ where: { residentId }, orderBy: { createdAt: 'desc' }, take: Math.min(limit, 500) }),
  findByStaff: (staffId, { limit = 100 } = {}) =>
    prisma.appNotification.findMany({ where: { staffId }, orderBy: { createdAt: 'desc' }, take: Math.min(limit, 500) }),
  create: (data) => prisma.appNotification.create({ data }),
  markRead: (id) => prisma.appNotification.update({ where: { id }, data: { read: true } }),
  markAllReadForResident: (residentId) =>
    prisma.appNotification.updateMany({ where: { residentId, read: false }, data: { read: true } }),
  markAllReadForStaff: (staffId) =>
    prisma.appNotification.updateMany({ where: { staffId, read: false }, data: { read: true } }),
  markAllRead: () => prisma.appNotification.updateMany({ where: { read: false }, data: { read: true } }),
  remove: (id) => prisma.appNotification.delete({ where: { id } }),
}
