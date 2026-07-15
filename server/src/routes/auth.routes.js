import { Router } from 'express'
import { login, me, register, registerStaff } from '../controllers/auth.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()

router.post('/register', registerLimiter, register)
router.post('/register-staff', requireAuth, requireRole('MANAGEMENT'), registerStaff)
router.post('/login', loginLimiter, login)
router.get('/me', requireAuth, me)

export default router
