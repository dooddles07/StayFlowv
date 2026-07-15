import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller.js'
import { requireRole } from '../middleware/auth.middleware.js'

const staffOnly = requireRole('STAFF', 'MANAGEMENT')

const router = Router()
router.get('/', notificationController.list)
router.post('/', staffOnly, notificationController.create)
router.post('/:id/read', notificationController.markRead)
router.delete('/:id', staffOnly, notificationController.remove)

export default router
