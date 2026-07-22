import crypto from 'node:crypto'
import { ApiError } from './ApiError.js'

export const BCRYPT_ROUNDS = 12
export const MIN_PASSWORD_LENGTH = 8
// bcrypt silently truncates input past 72 bytes — reject longer so the stored hash matches what the user typed.
export const MAX_PASSWORD_LENGTH = 72

export function assertValidPassword(password) {
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    throw ApiError.badRequest(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  }
  if (Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_LENGTH) {
    throw ApiError.badRequest(`Password must be at most ${MAX_PASSWORD_LENGTH} bytes`)
  }
}

const TEMP_PASSWORD_LENGTH = 12
// Excludes 0/O/o/1/l/I — the classic handwritten/read-aloud ambiguous set. Management
// reads this off-screen to a resident in person; it must survive that round trip.
const TEMP_PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

// crypto.randomInt is CSPRNG and unbiased (unlike Math.random() or randomBytes()%n) —
// matches the existing precedent in guestController.generateUniquePassNumber for
// anything security/uniqueness-adjacent.
export function generateTempPassword(length = TEMP_PASSWORD_LENGTH) {
  let out = ''
  for (let i = 0; i < length; i++) {
    out += TEMP_PASSWORD_CHARS[crypto.randomInt(TEMP_PASSWORD_CHARS.length)]
  }
  return out
}
