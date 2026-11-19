import type { H3Event } from 'h3'

export function verifyAdminAuth(event: H3Event): boolean {
  const token = getCookie(event, 'admin_token')
  const config = useRuntimeConfig()
  
  if (!token) {
    return false
  }

  // Secure token comparison including username
  const expectedToken = Buffer.from(`${config.adminUsername}:${config.adminPassword}:${config.jwtSecret}`).toString('base64')
  return token === expectedToken
}

export function requireAdminAuth(event: H3Event) {
  if (!verifyAdminAuth(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Akses Ditolak: Anda harus login sebagai admin.'
    })
  }
}
