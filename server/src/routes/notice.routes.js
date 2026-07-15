import { noticeController } from '../controllers/notice.controller.js'
import { buildCrudRouter } from '../utils/crudRouter.js'

export default buildCrudRouter(noticeController, { writeRoles: ['STAFF', 'MANAGEMENT'] })
