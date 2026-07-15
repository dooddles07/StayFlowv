import { eventController } from '../controllers/event.controller.js'
import { buildCrudRouter } from '../utils/crudRouter.js'
import { requireOwnResidentBody } from '../middleware/auth.middleware.js'

const router = buildCrudRouter(eventController, { writeRoles: ['STAFF', 'MANAGEMENT'] })
router.post('/:id/rsvp', requireOwnResidentBody(), eventController.rsvp)
router.post('/:id/rsvp/cancel', requireOwnResidentBody(), eventController.cancelRsvp)

export default router
