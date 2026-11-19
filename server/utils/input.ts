/**
 * Helper validasi input umum. Semua input dari `readBody` dianggap `unknown`.
 *
 * Pola pemakaian:
 *   const errors: FieldErrors = {}
 *   const name = readRequiredText(body, 'name', 'Nama portal', 100, errors)
 *   ...
 *   assertNoFieldErrors(errors)
 */

export type FieldErrors = Record<string, string>

/** Melempar 400 bila ada error; `statusMessage` = error pertama, rincian di `data.errors`. */
export function assertNoFieldErrors(errors: FieldErrors) {
  const messages = Object.values(errors)
  if (messages.length === 0) return

  throw createError({
    statusCode: 400,
    statusMessage: messages[0],
    data: { errors },
  })
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Teks opsional: bukan string → '', di-trim, dicek panjang maksimum. */
export function readOptionalText(
  body: Record<string, unknown>,
  field: string,
  label: string,
  maxLength: number,
  errors: FieldErrors,
): string {
  const raw = body[field]

  if (raw === undefined || raw === null) return ''

  if (typeof raw !== 'string') {
    errors[field] = `${label} harus berupa teks.`
    return ''
  }

  const value = raw.trim()

  if (value.length > maxLength) {
    errors[field] = `${label} maksimal ${maxLength} karakter.`
  }

  return value
}

export function readRequiredText(
  body: Record<string, unknown>,
  field: string,
  label: string,
  maxLength: number,
  errors: FieldErrors,
): string {
  const value = readOptionalText(body, field, label, maxLength, errors)

  if (!value && !errors[field]) {
    errors[field] = `${label} wajib diisi.`
  }

  return value
}

/** Boolean opsional; `undefined` bila tidak dikirim. */
export function readOptionalBoolean(
  body: Record<string, unknown>,
  field: string,
  label: string,
  errors: FieldErrors,
): boolean | undefined {
  const raw = body[field]

  if (raw === undefined) return undefined

  if (typeof raw !== 'boolean') {
    errors[field] = `${label} harus bernilai true/false.`
    return undefined
  }

  return raw
}

/**
 * Menormalkan URL. Tanpa skema → ditambah `https://` (mis. `instagram.com/unit`).
 * Mengembalikan `null` bila tidak valid atau skemanya tidak diizinkan
 * (mencegah `javascript:` dan sejenisnya).
 */
export function normalizeUrl(
  value: string,
  allowedProtocols: readonly string[] = ['http:', 'https:'],
): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null

  const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
  const candidate = hasScheme ? trimmed : `https://${trimmed}`

  let url: URL

  try {
    url = new URL(candidate)
  } catch {
    return null
  }

  if (!allowedProtocols.includes(url.protocol)) return null

  if ((url.protocol === 'http:' || url.protocol === 'https:') && !url.hostname.includes('.')) {
    return null
  }

  return url.toString()
}

/** URL opsional http(s). Kosong → ''. */
export function readOptionalUrl(
  body: Record<string, unknown>,
  field: string,
  label: string,
  errors: FieldErrors,
  maxLength = 2000,
): string {
  const value = readOptionalText(body, field, label, maxLength, errors)
  if (!value || errors[field]) return value

  const normalized = normalizeUrl(value)

  if (!normalized) {
    errors[field] = `${label} harus berupa alamat web yang valid (https://...).`
    return value
  }

  return normalized
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function readOptionalEmail(
  body: Record<string, unknown>,
  field: string,
  label: string,
  errors: FieldErrors,
): string {
  const value = readOptionalText(body, field, label, 254, errors).toLowerCase()
  if (!value || errors[field]) return value

  if (!EMAIL_PATTERN.test(value)) {
    errors[field] = `${label} tidak valid.`
  }

  return value
}
