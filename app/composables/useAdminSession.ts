export type AdminSessionInfo = {
  username: string
  expiresAt: string
}

type AuthMeResponse = {
  success: boolean
  data: AdminSessionInfo
}

const SESSION_KEY = 'admin-session'

/**
 * Data admin yang sedang login (dari /api/auth/me).
 * Memakai key yang sama sehingga layout dan halaman berbagi satu request.
 */
export async function useAdminSession() {
  const { data, status, error, refresh } = await useFetch<AuthMeResponse>('/api/auth/me', {
    key: SESSION_KEY,
  })

  const admin = computed(() => data.value?.data ?? null)

  return { admin, status, error, refresh }
}

/** Keluar dari dashboard lalu kembali ke halaman login. */
export async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })

  clearNuxtData(SESSION_KEY)

  // Muat ulang penuh agar seluruh state dashboard di memori ikut bersih.
  await navigateTo('/login', { replace: true, external: true })
}
