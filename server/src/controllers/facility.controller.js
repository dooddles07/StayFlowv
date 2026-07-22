import { FacilityModel } from '../models/facility.model.js'
import { buildCrudController } from '../utils/crudController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { pickAllowed } from '../utils/validate.js'

const base = buildCrudController(FacilityModel, 'Facility')

// Matches src/lib/api/facility.ts's FacilityInput. setFacilityStatus sends only a
// {status, statusReason} subset — pickAllowed only copies keys actually present, so
// that partial update still works without listing it separately.
const FIELDS = ['name', 'category', 'description', 'rules', 'image', 'capacity', 'openHours', 'location', 'rating', 'status', 'statusReason']

export const facilityController = {
  ...base,
  create: asyncHandler(async (req, res) => {
    const item = await FacilityModel.create(pickAllowed(req.body, FIELDS))
    res.status(201).json(item)
  }),
  update: asyncHandler(async (req, res) => {
    const item = await FacilityModel.update(req.params.id, pickAllowed(req.body, FIELDS))
    res.json(item)
  }),
}
