import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { UserModel } from '../models/user.model.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

const signToken = (user) =>
  jwt.sign(
    { sub: user.id, email: user.email, role: user.role, residentId: user.residentId ?? null, tokenVersion: user.tokenVersion },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn },
  )

export const AUTH_COOKIE = 'stayflow_token'

// Matches the default JWT_EXPIRES_IN of 7d. httpOnly keeps the token out of JS (XSS can't read it),
// SameSite=lax blocks it on cross-site requests, Secure enforced in production (https).
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.isProd,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

const setAuthCookie = (res, token) => res.cookie(AUTH_COOKIE, token, cookieOptions)

// Lock an account for LOCK_DURATION after LOCK_THRESHOLD consecutive failed logins.
// Per-account (survives IP rotation) — defends credential stuffing the per-IP limiter can't.
const LOCK_THRESHOLD = 5
const LOCK_DURATION_MS = 15 * 60 * 1000

// Strip password hash and all internal auth bookkeeping from API responses.
const sanitize = (user) => {
  const { passwordHash, tokenVersion, failedLoginCount, lockedUntil, resetTokenHash, resetTokenExpiresAt, ...rest } = user
  return rest
}

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
  setAuthCookie(res, token)
  res.status(201).json({ token, user: sanitize(user) })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) throw ApiError.badRequest('email and password are required')

  const user = await UserModel.findByEmail(email)
  if (!user) throw ApiError.unauthorized('Invalid credentials')

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    throw ApiError.tooManyRequests('Account temporarily locked after repeated failed logins. Try again later.')
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    const count = user.failedLoginCount + 1
    const locked = count >= LOCK_THRESHOLD
    await UserModel.setLoginState(user.id, {
      failedLoginCount: locked ? 0 : count,
      lockedUntil: locked ? new Date(Date.now() + LOCK_DURATION_MS) : null,
    })
    throw ApiError.unauthorized('Invalid credentials')
  }

  if (user.failedLoginCount > 0 || user.lockedUntil) {
    await UserModel.setLoginState(user.id, { failedLoginCount: 0, lockedUntil: null })
  }

  const token = signToken(user)
  setAuthCookie(res, token)
  res.json({ token, user: sanitize(user) })
})

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions, maxAge: undefined })
  res.status(204).send()
})

export const me = asyncHandler(async (req, res) => {
  const user = await UserModel.findById(req.user.sub)
  if (!user) throw ApiError.notFound('User not found')
  res.json(sanitize(user))
})
