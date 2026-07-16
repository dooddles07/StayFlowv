import { BookingModel } from '../models/booking.model.js'
import { buildCrudController } from '../utils/crudController.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const base = buildCrudController(BookingModel, 'Booking')

// A bare "YYYY-MM-DD" makes Prisma's DateTime column throw an unhandled validation
// error. Accept it defensively server-side too — this bug shape has already hit
// events, guests, and dining reservations.
const toFullDate = (value) => (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value)

export const bookingController = {
  ...base,
  create: asyncHandler(async (req, res) => {
    const booking = await BookingModel.create({ ...req.body, date: toFullDate(req.body.date) })
    res.status(201).json(booking)
  }),
  update: asyncHandler(async (req, res) => {
    const data = { ...req.body }
    if ('date' in data) data.date = toFullDate(data.date)
    res.json(await BookingModel.update(req.params.id, data))
  }),
  byResident: asyncHandler(async (req, res) => {
    res.json(await BookingModel.findByResident(req.params.residentId))
  }),
  byFacility: asyncHandler(async (req, res) => {
    res.json(await BookingModel.findByFacility(req.params.facilityId))
  }),
}
