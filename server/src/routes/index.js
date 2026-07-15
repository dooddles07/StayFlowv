import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import authRoutes from './auth.routes.js'
import residentRoutes from './resident.routes.js'
import staffRoutes from './staff.routes.js'
import facilityRoutes from './facility.routes.js'
import bookingRoutes from './booking.routes.js'
import restaurantRoutes from './restaurant.routes.js'
import tableRoutes from './table.routes.js'
import diningReservationRoutes from './diningReservation.routes.js'
import guestRoutes from './guest.routes.js'
import eventRoutes from './event.routes.js'
import noticeRoutes from './notice.routes.js'
import notificationRoutes from './notification.routes.js'

const router = Router()

router.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

router.use('/auth', authRoutes)
router.use('/residents', requireAuth, residentRoutes)
router.use('/staff', requireAuth, staffRoutes)
router.use('/facilities', requireAuth, facilityRoutes)
router.use('/bookings', requireAuth, bookingRoutes)
router.use('/restaurants', requireAuth, restaurantRoutes)
router.use('/tables', requireAuth, tableRoutes)
router.use('/dining-reservations', requireAuth, diningReservationRoutes)
router.use('/guests', requireAuth, guestRoutes)
router.use('/events', requireAuth, eventRoutes)
router.use('/notices', requireAuth, noticeRoutes)
router.use('/notifications', requireAuth, notificationRoutes)

export default router
