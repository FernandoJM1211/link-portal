import { createHash, createHmac, timingSafeEqual } from 'node:crypto'
import { createError } from 'h3'

/**
 * Autentikasi admin tunggal.
 *
 * - Username & kata sandi diambil dari environment variable (ADMIN_USERNAME, ADMIN_PASSWORD).
 * - Sesi disimpan di cookie bertanda tangan HMAC (tidak ada sheet `sessions`):
 *   `<payload base64url>.<signature base64url>`.
 * - Kunci tanda tangan diturunkan dari SESSION_SECRET + kredensial admin, sehingga
 *   mengganti ADMIN_PASSWORD atau SESSION_SECRET otomatis membatalkan semua sesi lama.
 */

export const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

const MIN_SECRET_LENGTH = 32

export type AdminSession = {
  username: string
  issuedAt: number
  expiresAt: number
}

type AdminConfig = {
  username: string
  password: string
  sessionSecret: string
}

function getAdminConfig(): AdminConfig {
  const username = process.env.ADMIN_USERNAME?.trim() ?? ''
  const password = process.env.ADMIN_PASSWORD ?? ''
  const sessionSecret = process.env.SESSION_SECRET ?? ''

  if (!username || !password) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Akun admin belum dikonfigurasi (ADMIN_USERNAME / ADMIN_PASSWORD).',
    })
  }

  if (sessionSecret.length < MIN_SECRET_LENGTH) {
    throw createError({
      statusCode: 500,
      statusMessage: `SESSION_SECRET belum dikonfigurasi (minimal ${MIN_SECRET_LENGTH} karakter).`,
    })
  }

  return { username, password, sessionSecret }
}

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest()
}

/** Perbandingan string dengan waktu konstan (panjang input disamakan lewat hash). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b))
}

function getSigningKey(config: AdminConfig): Buffer {
  return sha256(`${config.sessionSecret}\u0000${config.username}\u0000${config.password}`)
}

function sign(payload: string, key: Buffer): string {
  return createHmac('sha256', key).update(payload).digest('base64url')
}

export function verifyAdminCredentials(username: string, password: string): boolean {
  const config = getAdminConfig()

  // Keduanya selalu dihitung agar waktu respons tidak membocorkan mana yang salah.
  const usernameMatches = safeEqual(username, config.username)
  const passwordMatches = safeEqual(password, config.password)

  return usernameMatches && passwordMatches
}

export function createAdminSessionToken(): { token: string, session: AdminSession } {
  const config = getAdminConfig()
  const now = Date.now()

  const session: AdminSession = {
    username: config.username,
    issuedAt: now,
    expiresAt: now + SESSION_DURATION_MS,
  }

  const payload = Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
  const token = `${payload}.${sign(payload, getSigningKey(config))}`

  return { token, session }
}

/** Mengembalikan sesi bila token sah dan belum kedaluwarsa; selain itu `null`. */
export function readAdminSessionToken(token: string): AdminSession | null {
  const config = getAdminConfig()
  const [payload, signature, extra] = token.split('.')

  if (!payload || !signature || extra !== undefined) return null

  const expected = sign(payload, getSigningKey(config))
  if (!safeEqual(signature, expected)) return null

  let session: AdminSession

  try {
    session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession
  } catch {
    return null
  }

  if (
    typeof session?.username !== 'string' ||
    typeof session.expiresAt !== 'number' ||
    session.expiresAt <= Date.now() ||
    session.username !== config.username
  ) {
    return null
  }

  return session
}
