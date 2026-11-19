/**
 * Aturan kode portal (alamat publik `domain/<kode>`).
 * Dipakai frontend (validasi form) dan backend (validasi wajib).
 */

export const PORTAL_CODE_MIN_LENGTH = 2
export const PORTAL_CODE_MAX_LENGTH = 30

/** Huruf kecil, angka, dan tanda hubung di tengah. Contoh: `01`, `pmb-2026`. */
export const PORTAL_CODE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** Kode yang bentrok dengan route aplikasi, tidak boleh dipakai portal. */
export const RESERVED_PORTAL_CODES: readonly string[] = [
  'admin',
  'api',
  'login',
  'logout',
]

export function normalizePortalCode(value: string): string {
  return value.trim().toLowerCase()
}

/** Pesan error Bahasa Indonesia bila kode tidak valid, atau `null` bila valid. */
export function getPortalCodeError(code: string): string | null {
  if (code.length < PORTAL_CODE_MIN_LENGTH || code.length > PORTAL_CODE_MAX_LENGTH) {
    return `Kode portal harus ${PORTAL_CODE_MIN_LENGTH}–${PORTAL_CODE_MAX_LENGTH} karakter.`
  }

  if (!PORTAL_CODE_PATTERN.test(code)) {
    return 'Kode portal hanya boleh huruf kecil, angka, dan tanda hubung (-) di tengah.'
  }

  if (RESERVED_PORTAL_CODES.includes(code)) {
    return `Kode "${code}" dipakai oleh sistem. Silakan pilih kode lain.`
  }

  return null
}
