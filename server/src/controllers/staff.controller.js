import { StaffModel } from '../models/staff.model.js'
import { buildCrudController } from '../utils/crudController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { pickAllowed } from '../utils/validate.js'

const base = buildCrudController(StaffModel, 'Staff member')

// Matches src/lib/api/staff.ts: createStaffMember sends avatarSeed too (client-
// generated), updateStaffMember never touches it once set.
const CREATE_FIELDS = ['name', 'role', 'email', 'shift', 'avatarSeed']
const UPDATE_FIELDS = ['name', 'role', 'email', 'shift']

export const staffController = {
  ...base,
  create: asyncHandler(async (req, res) => {
    const item = await StaffModel.create(pickAllowed(req.body, CREATE_FIELDS))
    res.status(201).json(item)
  }),
  update: asyncHandler(async (req, res) => {
    const item = await StaffModel.update(req.params.id, pickAllowed(req.body, UPDATE_FIELDS))
    res.json(item)
  }),
}
