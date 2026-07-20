import { ApiError } from './ApiError.js'
import { asyncHandler } from './asyncHandler.js'

export const buildCrudController = (model, resourceName = 'Resource') => ({
  list: asyncHandler(async (req, res) => {
    res.json(await model.findAll())
  }),
  getOne: asyncHandler(async (req, res) => {
    // requireOwnerRecord already fetched this row to check ownership — reuse it
    // instead of running the same findById twice.
    const item = req.record ?? (await model.findById(req.params.id))
    if (!item) throw ApiError.notFound(`${resourceName} not found`)
    res.json(item)
  }),
  create: asyncHandler(async (req, res) => {
    const item = await model.create(req.body)
    res.status(201).json(item)
  }),
  update: asyncHandler(async (req, res) => {
    const item = await model.update(req.params.id, req.body)
    res.json(item)
  }),
  remove: asyncHandler(async (req, res) => {
    await model.remove(req.params.id)
    res.status(204).send()
  }),
})
