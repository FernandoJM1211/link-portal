import {
  createAdminSessionToken,
  verifyAdminCredentials,
} from '../../services/auth.service'

const LOGIN_WINDOW_MS = 15 * 60 * 1000
const LOGIN_LIMIT_PER_IP = 10

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    username?: unknown
    password?: unknown
  }>(event)

  if (
    typeof body?.username !== 'string' ||
    typeof body?.password !== 'string' ||
    !body.username.trim() ||
    !body.password ||
    body.username.length > 100 ||
    body.password.length > 1024
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username dan kata sandi wajib diisi.',
    })
  }

  // Hanya ada satu akun, jadi pembatasan cukup per IP untuk mencegah brute force.
  const rateLimitKey = `login:ip:${getClientIp(event)}`

  assertRateLimit(
    rateLimitKey,
    LOGIN_LIMIT_PER_IP,
    LOGIN_WINDOW_MS,
    'Terlalu banyak percobaan login. Silakan coba lagi dalam 15 menit.',
  )

  if (!verifyAdminCredentials(body.username.trim(), body.password)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Username atau kata sandi tidak sesuai.',
    })
  }

  resetRateLimit(rateLimitKey)

  const { token, session } = createAdminSessionToken()
  setSessionCookie(event, token, session.expiresAt)

  return {
    success: true,
    message: 'Login berhasil.',
    data: {
      username: session.username,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
  }
})
