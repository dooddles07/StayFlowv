import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { UserModel } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const signToken = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn })

const sanitize = (user) => {
  const { passwordHash, ...rest } = user
  return rest
}

const VALID_ROLES = ['MEMBER', 'STAFF', 'MANAGEMENT']

export const register = asyncHandler(async (req, res) => {
  const { email, password, displayName, residentId } = req.body
  if (!email || !password || !displayName) {
    throw ApiError.badRequest('email, password, displayName are required')
  }

  const existing = await UserModel.findByEmail(email)
  if (existing) throw ApiError.conflict('Email already registered')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await UserModel.create({ email, passwordHash, role: 'MEMBER', displayName, residentId })
  const token = signToken(user)
  res.status(201).json({ token, user: sanitize(user) })
})

export const registerStaff = asyncHandler(async (req, res) => {
  const { email, password, role, displayName, residentId, staffId } = req.body
  if (!email || !password || !role || !displayName) {
    throw ApiError.badRequest('email, password, role, displayName are required')
  }
  if (!VALID_ROLES.includes(role)) {
    throw ApiError.badRequest(`role must be one of ${VALID_ROLES.join(', ')}`)
  }

  const existing = await UserModel.findByEmail(email)
  if (existing) throw ApiError.conflict('Email already registered')

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await UserModel.create({ email, passwordHash, role, displayName, residentId, staffId })
  const token = signToken(user)
  res.status(201).json({ token, user: sanitize(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw ApiError.badRequest('email and password are required')

  const user = await UserModel.findByEmail(email)
  if (!user) throw ApiError.unauthorized('Invalid credentials')

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) throw ApiError.unauthorized('Invalid credentials')

  const token = signToken(user)
  res.json({ token, user: sanitize(user) })
})

export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.sub)
  if (!user) throw ApiError.notFound('User not found')
  res.json(sanitize(user))
})
