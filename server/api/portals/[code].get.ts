import { getPublicPortal } from '../../services/public-portal.service'

/** Data publik satu portal (hanya portal & link yang aktif). Tanpa login. */
export default defineEventHandler(async (event) => {
  const code = normalizePortalCode(getRouterParam(event, 'code') ?? '')

  // Kode yang formatnya tidak valid tidak perlu sampai ke Google Sheets.
  const portal = getPortalCodeError(code) ? null : await getPublicPortal(code)

  if (!portal) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Portal tidak ditemukan atau sedang tidak aktif.',
    })
  }

  return {
    success: true,
    data: portal,
  }
})
