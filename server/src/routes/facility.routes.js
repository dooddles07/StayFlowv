import { facilityController } from '../controllers/facility.controller.js'
import { buildCrudRouter } from '../utils/crudRouter.js'

export default buildCrudRouter(facilityController, { writeRoles: ['STAFF', 'MANAGEMENT'] })
