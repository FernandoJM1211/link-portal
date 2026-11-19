export default defineEventHandler((event) => {
  const isAuth = verifyAdminAuth(event)
  return { authenticated: isAuth }
})
