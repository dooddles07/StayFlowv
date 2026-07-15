import cors from 'cors'
import express from 'express'
import morgan from 'morgan'
import { env } from './config/env.js'
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js'
import routes from './routes/index.js'

const app = express()

app.set('trust proxy', 1)

// Wildcard + credentials is forbidden by the CORS spec and unsafe; only reflect an
// explicit allowlist with credentials. Empty allowlist => cross-origin denied (same-origin still works).
if (env.corsOrigins.includes('*')) {
  app.use(cors({ origin: true, credentials: false }))
} else if (env.corsOrigins.length > 0) {
  app.use(cors({ origin: env.corsOrigins, credentials: true }))
}
app.use(express.json())
app.use(morgan('dev'))

app.use('/api', routes)

app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
