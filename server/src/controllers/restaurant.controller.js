import { RestaurantModel } from '../models/restaurant.model.js'
import { buildCrudController } from '../utils/crudController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { pickAllowed } from '../utils/validate.js'

const base = buildCrudController(RestaurantModel, 'Restaurant')

// Matches src/lib/api/restaurant.ts's RestaurantInput.
const FIELDS = ['name', 'cuisine', 'description', 'image', 'openHours', 'priceRange', 'rating', 'location', 'maxPartySize']

export const restaurantController = {
  ...base,
  create: asyncHandler(async (req, res) => {
    const item = await RestaurantModel.create(pickAllowed(req.body, FIELDS))
    res.status(201).json(item)
  }),
  update: asyncHandler(async (req, res) => {
    const item = await RestaurantModel.update(req.params.id, pickAllowed(req.body, FIELDS))
    res.json(item)
  }),
}
