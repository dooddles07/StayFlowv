import { restaurantController } from '../controllers/restaurant.controller.js'
import { buildCrudRouter } from '../utils/crudRouter.js'

export default buildCrudRouter(restaurantController, { writeRoles: ['STAFF', 'MANAGEMENT'] })
