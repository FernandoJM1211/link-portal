export default defineEventHandler((event) => {
  const session = requireAdmin(event)

  return {
    success: true,
    data: {
      username: session.username,
      expiresAt: new Date(session.expiresAt).toISOString(),
    },
  }
})
