import { EventModel } from '../models/event.model.js'
import { buildCrudController } from '../utils/crudController.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

export const eventController = {
  ...buildCrudController(EventModel, 'Event'),
  rsvp: asyncHandler(async (req, res) => {
    const { residentId } = req.body
    if (!residentId) throw ApiError.badRequest('residentId is required')
    const event = await EventModel.findById(req.params.id)
    if (!event) throw ApiError.notFound('Event not found')

    // Capacity is a hard limit, not a UI hint — enforce it here so a direct API call
    // can't overbook. Already-attending residents re-confirming never count twice.
    const alreadyAttending = event.rsvps.some((r) => r.residentId === residentId)
    if (!alreadyAttending && event.rsvps.length >= event.capacity) {
      throw ApiError.conflict('This event is fully booked')
    }

    await EventModel.addAttendee(req.params.id, residentId)
    res.status(201).json(await EventModel.findById(req.params.id))
  }),
  cancelRsvp: asyncHandler(async (req, res) => {
    const { residentId } = req.body
    if (!residentId) throw ApiError.badRequest('residentId is required')
    await EventModel.removeAttendee(req.params.id, residentId)
    res.json(await EventModel.findById(req.params.id))
  }),
}
