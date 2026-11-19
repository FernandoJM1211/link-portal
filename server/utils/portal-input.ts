import type { PortalFields } from '../repositories/portal.repository'

/**
 * Validasi body form portal (buat & ubah profil). Body memakai camelCase:
 * { code, name, bio, avatarUrl, theme, instagram, whatsapp, website, youtube, email, isActive? }
 */

export const PORTAL_NAME_MAX_LENGTH = 100
export const PORTAL_BIO_MAX_LENGTH = 300

/** Kode portal wajib + valid (format & bukan kode sistem). */
export function readPortalCode(
  body: Record<string, unknown>,
  errors: FieldErrors,
  field = 'code',
): string {
  const raw = readRequiredText(body, field, 'Kode portal', PORTAL_CODE_MAX_LENGTH, errors)
  if (errors[field]) return raw

  const code = normalizePortalCode(raw)
  const codeError = getPortalCodeError(code)

  if (codeError) {
    errors[field] = codeError
  }

  return code
}

/**
 * Nomor/URL WhatsApp. Menerima:
 * - URL (`https://wa.me/62812...`, `wa.me/62812...`), atau
 * - nomor telepon (`0812-3456-7890`, `+62 812 3456 7890`) → diubah menjadi `https://wa.me/62812...`.
 */
function readWhatsapp(body: Record<string, unknown>, errors: FieldErrors): string {
  const field = 'whatsapp'
  const value = readOptionalText(body, field, 'WhatsApp', 500, errors)
  if (!value || errors[field]) return value

  if (/^[+\d\s().-]+$/.test(value)) {
    let digits = value.replace(/\D/g, '')
    if (digits.startsWith('0')) digits = `62${digits.slice(1)}`

    if (digits.length < 9 || digits.length > 15) {
      errors[field] = 'Nomor WhatsApp tidak valid.'
      return value
    }

    return `https://wa.me/${digits}`
  }

  return readOptionalUrl(body, field, 'WhatsApp', errors, 500)
}

/** Logo: link berbagi Google Drive atau URL gambar https; Drive diubah ke URL gambar langsung. */
function readAvatarUrl(body: Record<string, unknown>, errors: FieldErrors): string {
  const value = readOptionalUrl(body, 'avatarUrl', 'Link logo', errors)
  if (!value || errors.avatarUrl) return value
  return toDirectImageUrl(value)
}

export function readPortalInput(body: unknown): PortalFields {
  const errors: FieldErrors = {}

  if (!isPlainObject(body)) {
    assertNoFieldErrors({ body: 'Data portal tidak valid.' })
  }

  const input = body as Record<string, unknown>

  const code = readPortalCode(input, errors)
  const name = readRequiredText(input, 'name', 'Nama portal', PORTAL_NAME_MAX_LENGTH, errors)
  const bio = readOptionalText(input, 'bio', 'Deskripsi', PORTAL_BIO_MAX_LENGTH, errors)
  const avatarUrl = readAvatarUrl(input, errors)

  const theme = readOptionalText(input, 'theme', 'Tema', 30, errors) || DEFAULT_PORTAL_THEME
  if (!errors.theme && !isPortalTheme(theme)) {
    errors.theme = 'Tema tidak dikenal.'
  }

  const instagram = readOptionalUrl(input, 'instagram', 'Instagram', errors, 500)
  const whatsapp = readWhatsapp(input, errors)
  const website = readOptionalUrl(input, 'website', 'Website', errors, 500)
  const youtube = readOptionalUrl(input, 'youtube', 'YouTube', errors, 500)
  const email = readOptionalEmail(input, 'email', 'Email', errors)
  const isActive = readOptionalBoolean(input, 'isActive', 'Status aktif', errors)

  assertNoFieldErrors(errors)

  return {
    code,
    name,
    bio,
    avatar_url: avatarUrl,
    theme,
    instagram,
    whatsapp,
    website,
    youtube,
    email,
    is_active: isActive ?? true,
  }
}
