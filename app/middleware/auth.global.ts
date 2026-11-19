/**
 * Redirect berdasarkan status login.
 *
 * Catatan: ini hanya untuk pengalaman pengguna (redirect).
 * Pengamanan sesungguhnya ada di setiap endpoint API (`requireAdmin`).
 */
const ADMIN_PREFIX = '/admin'

async function isLoggedIn(): Promise<boolean> {
  try {
    await useRequestFetch()('/api/auth/me')
    return true
  } catch {
    return false
  }
}

export default defineNuxtRouteMiddleware(async (to) => {
  const isAdminRoute = to.path === ADMIN_PREFIX || to.path.startsWith(`${ADMIN_PREFIX}/`)

  if (isAdminRoute && !(await isLoggedIn())) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } }, { replace: true })
  }

  if (to.path === '/login' && (await isLoggedIn())) {
    return navigateTo(ADMIN_PREFIX, { replace: true })
  }
})
