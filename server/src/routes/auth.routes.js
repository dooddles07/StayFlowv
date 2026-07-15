import { Router } from 'express'
import { login, logout, me, register } from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { loginLimiter, registerLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()

router.post('/register', registerLimiter, register)
router.post('/login', loginLimiter, login)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router
