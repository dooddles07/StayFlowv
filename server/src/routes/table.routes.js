import { tableController } from '../controllers/table.controller.js'
import { buildCrudRouter } from '../utils/crudRouter.js'

const router = buildCrudRouter(tableController, { writeRoles: ['STAFF', 'MANAGEMENT'] })
router.get('/restaurant/:restaurantId', tableController.byRestaurant)

export default router
