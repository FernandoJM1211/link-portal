export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (!body || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password wajib diisi.'
    })
  }

  if (body.password !== config.adminPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Password admin salah.'
    })
  }

  const token = Buffer.from(`${config.adminPassword}:${config.jwtSecret}`).toString('base64')

  // Set HTTP-only secure cookie for 7 days
  setCookie(event, 'admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return { success: true, message: 'Login berhasil!' }
})
