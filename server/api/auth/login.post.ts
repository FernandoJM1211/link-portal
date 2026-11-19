export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  if (!body || !body.username || !body.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username dan Password wajib diisi.'
    })
  }

  const isValidUser = body.username.trim() === config.adminUsername
  const isValidPass = body.password === config.adminPassword

  if (!isValidUser || !isValidPass) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Username atau Password salah.'
    })
  }

  const token = Buffer.from(`${config.adminUsername}:${config.adminPassword}:${config.jwtSecret}`).toString('base64')

  // Set HTTP-only secure cookie for 7 days
  setCookie(event, 'admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return { success: true, message: 'Login berhasil!' }
})
