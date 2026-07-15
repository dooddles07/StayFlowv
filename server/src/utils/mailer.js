import { env } from '../config/env.js'

/**
 * Delivers a password-reset link to the user.
 *
 * NOTE: no email provider is wired yet. To make this work in production, replace the
 * body below with a real send (Resend / SES / SMTP via nodemailer) and NEVER log the
 * raw token in production. The raw token is a bearer credential — treat it like a password.
 */
export async function deliverResetToken(user, rawToken) {
  const link = `${env.appUrl}/reset-password?token=${rawToken}`

  if (env.isProd) {
    // TODO: send `link` to `user.email` via a real email provider.
    console.warn(`[password-reset] No email provider configured — reset link for ${user.email} was NOT delivered.`)
    return
  }

  // Dev only: print the link so the flow is testable without an email provider.
  console.log(`[password-reset] Reset link for ${user.email}: ${link}`)
}
