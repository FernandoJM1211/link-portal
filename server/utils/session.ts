import type { H3Event } from 'h3'
import {
  readAdminSessionToken,
  type AdminSession,
} from '../services/auth.service'

export const SESSION_COOKIE_NAME = 'link_portal_session'

const isProduction = process.env.NODE_ENV === 'production'

export function setSessionCookie(event: H3Event, token: string, expiresAt: number) {
  setCookie(event, SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires: new Date(expiresAt),
  })
}

export function clearSessionCookie(event: H3Event) {
  deleteCookie(event, SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
  })
}

/**
 * Memastikan request berasal dari admin yang sudah login.
 * Wajib dipanggil di awal setiap endpoint `/api/admin/**`.
 */
export function requireAdmin(event: H3Event): AdminSession {
  const token = getCookie(event, SESSION_COOKIE_NAME)
  const session = token ? readAdminSessionToken(token) : null

  if (!session) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Silakan login terlebih dahulu.',
    })
  }

  event.context.admin = session

  return session
}

/** Mengambil parameter route yang wajib ada (sudah di-trim). */
export function requireRouterParam(event: H3Event, name: string, label = name): string {
  const value = getRouterParam(event, name)?.trim()

  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `${label} wajib diisi.`,
    })
  }

  return value
}

/** Alamat IP klien untuk keperluan pembatasan percobaan. */
export function getClientIp(event: H3Event): string {
  return getRequestIP(event, { xForwardedFor: true }) ?? ''
}
