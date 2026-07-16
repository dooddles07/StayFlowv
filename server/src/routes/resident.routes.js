import { Router } from 'express'
import { residentController, residentSelfController } from '../controllers/resident.controller.js'
import { buildCrudRouter } from '../utils/crudRouter.js'

const router = Router()

// Self routes first so "me" is never captured by the CRUD "/:id" param route.
// Any authenticated user with a linked residentId (i.e. MEMBERs) may use these.
router.get('/me', residentSelfController.getMe)
router.put('/me', residentSelfController.updateMe)

router.post('/me/family', residentSelfController.addFamilyMember)
router.put('/me/family/:id', residentSelfController.updateFamilyMember)
router.delete('/me/family/:id', residentSelfController.removeFamilyMember)

router.post('/me/vehicles', residentSelfController.addVehicle)
router.put('/me/vehicles/:id', residentSelfController.updateVehicle)
router.delete('/me/vehicles/:id', residentSelfController.removeVehicle)

router.post('/me/notices-seen', residentSelfController.markNoticesSeen)

router.use(
  buildCrudRouter(residentController, {
    readRoles: ['STAFF', 'MANAGEMENT'],
    writeRoles: ['STAFF', 'MANAGEMENT'],
  }),
)

export default router
