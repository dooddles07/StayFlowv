import { prisma } from '../config/db.js'

export const UserModel = {
  findByEmail: (email) => prisma.user.findUnique({ where: { email }, include: { resident: true, staff: true } }),
  findById: (id) => prisma.user.findUnique({ where: { id }, include: { resident: true, staff: true } }),
  findAuthState: (id) => prisma.user.findUnique({ where: { id }, select: { id: true, tokenVersion: true } }),
  setLoginState: (id, data) => prisma.user.update({ where: { id }, data }),
  create: (data) => prisma.user.create({ data }),
}
