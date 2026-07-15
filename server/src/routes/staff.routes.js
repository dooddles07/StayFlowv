import { staffController } from '../controllers/staff.controller.js'
import { buildCrudRouter } from '../utils/crudRouter.js'

export default buildCrudRouter(staffController, {
  readRoles: ['STAFF', 'MANAGEMENT'],
  writeRoles: ['MANAGEMENT'],
})
