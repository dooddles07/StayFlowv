import { prisma } from '../config/db.js'

export const NotificationModel = {
  findAll: () => prisma.appNotification.findMany({ orderBy: { createdAt: 'desc' } }),
  findById: (id) => prisma.appNotification.findUnique({ where: { id } }),
  findByResident: (residentId) =>
    prisma.appNotification.findMany({ where: { residentId }, orderBy: { createdAt: 'desc' } }),
  create: (data) => prisma.appNotification.create({ data }),
  markRead: (id) => prisma.appNotification.update({ where: { id }, data: { read: true } }),
  markAllReadForResident: (residentId) =>
    prisma.appNotification.updateMany({ where: { residentId, read: false }, data: { read: true } }),
  remove: (id) => prisma.appNotification.delete({ where: { id } }),
}
