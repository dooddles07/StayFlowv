import { Router } from 'express'
import { requireRole } from '../middleware/auth.middleware.js'

const noop = (req, res, next) => next()

export const buildCrudRouter = (controller, { readRoles, writeRoles } = {}) => {
  const router = Router()
  const read = readRoles ? requireRole(...readRoles) : noop
  const write = writeRoles ? requireRole(...writeRoles) : noop
  router.get('/', read, controller.list)
  router.get('/:id', read, controller.getOne)
  router.post('/', write, controller.create)
  router.put('/:id', write, controller.update)
  router.delete('/:id', write, controller.remove)
  return router
}
