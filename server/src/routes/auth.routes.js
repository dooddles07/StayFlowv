import { Router } from 'express'
import {
  changePassword,
  confirmEmailChange,
  forgotPassword,
  login,
  logout,
  me,
  requestEmailChange,
  resetPassword,
} from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { loginLimiter, passwordResetLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()

router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.post('/forgot-password', passwordResetLimiter, forgotPassword)
router.post('/reset-password', passwordResetLimiter, resetPassword)
router.get('/me', requireAuth, me)
router.post('/change-password', requireAuth, passwordResetLimiter, changePassword)
router.post('/change-email', requireAuth, passwordResetLimiter, requestEmailChange)
router.post('/confirm-email', passwordResetLimiter, confirmEmailChange)

export default router
