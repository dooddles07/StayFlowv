import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller.js'
import { NotificationModel } from '../models/notification.model.js'
import { requireOwnerRecord, requireOwnResidentParam, requireRole } from '../middleware/auth.middleware.js'

const staffOnly = requireRole('STAFF', 'MANAGEMENT')
const ownRecord = requireOwnerRecord(NotificationModel)

const router = Router()
router.get('/', staffOnly, notificationController.list)
router.get('/resident/:residentId', requireOwnResidentParam(), notificationController.byResident)
router.post('/', staffOnly, notificationController.create)
router.post('/:id/read', ownRecord, notificationController.markRead)
router.post('/resident/:residentId/read-all', requireOwnResidentParam(), notificationController.markAllRead)
router.delete('/:id', staffOnly, notificationController.remove)

export default router
