import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const requireAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Missing bearer token')
  }
  const token = header.slice('Bearer '.length)
  try {
    const payload = jwt.verify(token, env.jwtSecret)
    req.user = payload
    next()
  } catch {
    throw ApiError.unauthorized('Invalid or expired token')
  }
})

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw ApiError.forbidden('Insufficient role')
    }
    next()
  }

// STAFF/MANAGEMENT act on behalf of any resident; MEMBER only ever their own.
export const requireOwnResidentParam =
  (paramName = 'residentId') =>
  (req, res, next) => {
    if (req.user.role !== 'MEMBER') return next()
    if (req.params[paramName] !== req.user.residentId) {
      throw ApiError.forbidden("Not allowed to access this resident's data")
    }
    next()
  }

export const requireOwnResidentBody =
  (fieldName = 'residentId') =>
  (req, res, next) => {
    if (req.user.role !== 'MEMBER') return next()
    req.body[fieldName] = req.user.residentId
    next()
  }

export const requireOwnerRecord =
  (model, ownerField = 'residentId') =>
  async (req, res, next) => {
    if (req.user.role !== 'MEMBER') return next()
    const record = await model.findById(req.params.id)
    if (!record) throw ApiError.notFound('Not found')
    if (record[ownerField] !== req.user.residentId) {
      throw ApiError.forbidden('Not allowed to access this record')
    }
    next()
  }
