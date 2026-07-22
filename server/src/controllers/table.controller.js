import { TableModel } from '../models/table.model.js'
import { buildCrudController } from '../utils/crudController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { pickAllowed } from '../utils/validate.js'

const base = buildCrudController(TableModel, 'Table')

// Matches the DiningTable schema fields — no client UI drives table CRUD directly
// today, but the routes are live and STAFF/MANAGEMENT-writable regardless.
const FIELDS = ['restaurantId', 'label', 'seats', 'status']

export const tableController = {
  ...base,
  create: asyncHandler(async (req, res) => {
    const item = await TableModel.create(pickAllowed(req.body, FIELDS))
    res.status(201).json(item)
  }),
  update: asyncHandler(async (req, res) => {
    const item = await TableModel.update(req.params.id, pickAllowed(req.body, FIELDS))
    res.json(item)
  }),
  byRestaurant: asyncHandler(async (req, res) => {
    res.json(await TableModel.findByRestaurant(req.params.restaurantId))
  }),
}
