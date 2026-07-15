import { Router } from 'express'
import { diningReservationController } from '../controllers/diningReservation.controller.js'
import { DiningReservationModel } from '../models/diningReservation.model.js'
import { requireOwnResidentBody, requireOwnResidentParam, requireOwnerRecord, requireRole } from '../middleware/auth.middleware.js'

const staffOnly = requireRole('STAFF', 'MANAGEMENT')
const ownRecord = requireOwnerRecord(DiningReservationModel)

const router = Router()
router.get('/', staffOnly, diningReservationController.list)
router.get('/resident/:residentId', requireOwnResidentParam(), diningReservationController.byResident)
router.get('/:id', ownRecord, diningReservationController.getOne)
router.post('/', requireOwnResidentBody(), diningReservationController.create)
router.put('/:id', staffOnly, diningReservationController.update)
router.delete('/:id', ownRecord, diningReservationController.remove)

export default router
