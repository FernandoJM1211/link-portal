import type { LinkFields } from '../repositories/link.repository'

/**
 * Validasi body tombol link. Body memakai camelCase:
 * { title, url, icon, isActive, isFeatured }
 */

export const LINK_TITLE_MAX_LENGTH = 100
export const DEFAULT_LINK_ICON = 'link'

/** Link boleh ke web, email, atau telepon. */
const LINK_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:'] as const

/** Nama ikon Lucide tanpa prefix, mis. `globe`, `file-text`. */
const ICON_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type LinkInput = Pick<LinkFields, 'title' | 'url' | 'icon' | 'is_active' | 'is_featured'>

function readLinkUrl(body: Record<string, unknown>, errors: FieldErrors, required: boolean): string {
  const value = required
    ? readRequiredText(body, 'url', 'URL tujuan', 2000, errors)
    : readOptionalText(body, 'url', 'URL tujuan', 2000, errors)

  if (!value || errors.url) return value

  const normalized = normalizeUrl(value, LINK_PROTOCOLS)

  if (!normalized) {
    errors.url = 'URL tujuan tidak valid. Gunakan alamat web (https://...), mailto:, atau tel:.'
    return value
  }

  return normalized
}

function readIcon(body: Record<string, unknown>, errors: FieldErrors): string {
  const value = readOptionalText(body, 'icon', 'Ikon', 50, errors).toLowerCase()
  if (errors.icon) return value

  // Toleransi prefix dari Nuxt UI (`i-lucide-globe`).
  const icon = value.replace(/^i-lucide-/, '')

  if (icon && !ICON_PATTERN.test(icon)) {
    errors.icon = 'Nama ikon tidak valid.'
  }

  return icon
}

/** Untuk membuat link baru: judul & URL wajib. */
export function readNewLinkInput(body: unknown): LinkInput {
  const errors: FieldErrors = {}

  if (!isPlainObject(body)) {
    assertNoFieldErrors({ body: 'Data tombol tidak valid.' })
  }

  const input = body as Record<string, unknown>

  const title = readRequiredText(input, 'title', 'Judul tombol', LINK_TITLE_MAX_LENGTH, errors)
  const url = readLinkUrl(input, errors, true)
  const icon = readIcon(input, errors)
  const isActive = readOptionalBoolean(input, 'isActive', 'Status aktif', errors)
  const isFeatured = readOptionalBoolean(input, 'isFeatured', 'Unggulan', errors)

  assertNoFieldErrors(errors)

  return {
    title,
    url,
    icon: icon || DEFAULT_LINK_ICON,
    is_active: isActive ?? true,
    is_featured: isFeatured ?? false,
  }
}

/** Untuk mengubah link: hanya field yang dikirim yang diubah (mis. toggle aktif saja). */
export function readLinkChanges(body: unknown): Partial<LinkInput> {
  const errors: FieldErrors = {}

  if (!isPlainObject(body)) {
    assertNoFieldErrors({ body: 'Data tombol tidak valid.' })
  }

  const input = body as Record<string, unknown>
  const changes: Partial<LinkInput> = {}

  if (input.title !== undefined) {
    changes.title = readRequiredText(input, 'title', 'Judul tombol', LINK_TITLE_MAX_LENGTH, errors)
  }

  if (input.url !== undefined) {
    changes.url = readLinkUrl(input, errors, true)
  }

  if (input.icon !== undefined) {
    changes.icon = readIcon(input, errors) || DEFAULT_LINK_ICON
  }

  const isActive = readOptionalBoolean(input, 'isActive', 'Status aktif', errors)
  if (isActive !== undefined) changes.is_active = isActive

  const isFeatured = readOptionalBoolean(input, 'isFeatured', 'Unggulan', errors)
  if (isFeatured !== undefined) changes.is_featured = isFeatured

  assertNoFieldErrors(errors)

  if (Object.keys(changes).length === 0) {
    assertNoFieldErrors({ body: 'Tidak ada perubahan yang dikirim.' })
  }

  return changes
}
