import { readFileSync } from 'node:fs'
import { google, type sheets_v4 } from 'googleapis'

/**
 * Akses Google Sheets sebagai database (satu spreadsheet: GOOGLE_SPREADSHEET_ID).
 *
 * Seluruh penulisan memakai valueInputOption RAW agar input pengguna
 * tidak pernah dieksekusi sebagai formula spreadsheet.
 *
 * File ini sengaja tidak memakai auto-import Nuxt (mis. `createError`) supaya
 * bisa dipakai juga oleh script CLI di folder `scripts/`.
 */

let sheetsClient: sheets_v4.Sheets | null = null

/**
 * Kredensial Service Account:
 * - `GOOGLE_SERVICE_ACCOUNT_JSON` : isi file JSON (mentah atau base64) — untuk hosting tanpa
 *   file kredensial, mis. Vercel. Diutamakan bila diisi;
 * - `GOOGLE_APPLICATION_CREDENTIALS` : path file JSON — untuk development lokal.
 */
function readServiceAccountCredentials(): Record<string, unknown> {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim()

  if (raw) {
    const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8')

    try {
      return JSON.parse(json) as Record<string, unknown>
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON bukan JSON/base64 yang valid.')
    }
  }

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()

  if (!credentialsPath) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON atau GOOGLE_APPLICATION_CREDENTIALS belum dikonfigurasi.')
  }

  try {
    return JSON.parse(readFileSync(credentialsPath, 'utf8')) as Record<string, unknown>
  } catch (error) {
    if ((error as { code?: string }).code === 'ENOENT') throw error
    throw new Error('File GOOGLE_APPLICATION_CREDENTIALS bukan JSON yang valid.')
  }
}

export function isGoogleSheetsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SPREADSHEET_ID?.trim() &&
    (process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim() || process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim()),
  )
}

function getSheetsClient(): sheets_v4.Sheets {
  if (sheetsClient) return sheetsClient

  const credentials = readServiceAccountCredentials()

  if (typeof credentials.client_email !== 'string' || typeof credentials.private_key !== 'string') {
    throw new Error('Kredensial Service Account tidak memiliki client_email/private_key.')
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })

  sheetsClient = google.sheets({ version: 'v4', auth })

  return sheetsClient
}

function getSpreadsheetId(): string {
  const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID?.trim()

  if (!spreadsheetId) {
    throw new Error('GOOGLE_SPREADSHEET_ID belum dikonfigurasi.')
  }

  return spreadsheetId
}

function quoteSheetName(sheetName: string): string {
  return `'${sheetName.replace(/'/g, "''")}'`
}

/** Judul spreadsheet dan daftar nama sheet di dalamnya. */
export async function getSpreadsheetInfo(): Promise<{ title: string, sheetNames: string[] }> {
  const response = await getSheetsClient().spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: 'properties.title,sheets.properties.title',
  })

  return {
    title: response.data.properties?.title ?? '',
    sheetNames: (response.data.sheets ?? [])
      .map((sheet) => sheet.properties?.title ?? '')
      .filter(Boolean),
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Error sementara dari Google (kuota habis / server sibuk) yang layak dicoba ulang. */
function isRetryableError(error: unknown): boolean {
  const code = Number((error as { code?: unknown, status?: unknown } | null)?.code ?? (error as { status?: unknown } | null)?.status)
  return code === 429 || code === 500 || code === 502 || code === 503 || code === 504
}

/**
 * Menjalankan operasi BACA dengan coba ulang (jeda 0,5 → 1 → 2 detik + acak)
 * saat kuota Google Sheets terlampaui atau server Google sibuk.
 * Jangan dipakai untuk operasi tulis `append` (bisa menghasilkan baris ganda).
 */
async function withReadRetry<T>(operation: () => Promise<T>, attempts = 4): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation()
    } catch (error) {
      if (attempt >= attempts || !isRetryableError(error)) throw error
      await sleep(500 * 2 ** (attempt - 1) + Math.random() * 250)
    }
  }
}

/** Seluruh isi sheet (baris 1 = header). Nilai selalu string. */
export async function getSheetValues(sheetName: string): Promise<string[][]> {
  const response = await withReadRetry(() => getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: quoteSheetName(sheetName),
  }))

  return (response.data.values ?? []) as string[][]
}

/**
 * Isi beberapa sheet sekaligus dalam SATU request (hemat kuota).
 * Hasil berurutan sesuai `sheetNames`.
 */
export async function getMultipleSheetValues(sheetNames: string[]): Promise<string[][][]> {
  const response = await withReadRetry(() => getSheetsClient().spreadsheets.values.batchGet({
    spreadsheetId: getSpreadsheetId(),
    ranges: sheetNames.map(quoteSheetName),
  }))

  const valueRanges = response.data.valueRanges ?? []
  return sheetNames.map((_, index) => (valueRanges[index]?.values ?? []) as string[][])
}

export async function appendSheetRows(sheetName: string, rows: string[][]): Promise<void> {
  if (rows.length === 0) return

  await getSheetsClient().spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: quoteSheetName(sheetName),
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: rows },
  })
}

export async function appendSheetRow(sheetName: string, values: string[]): Promise<void> {
  await appendSheetRows(sheetName, [values])
}

/** Memperbarui banyak baris sekaligus dalam satu request. `rowNumber` mulai dari 1. */
export async function updateSheetRows(
  sheetName: string,
  updates: { rowNumber: number, values: string[] }[],
): Promise<void> {
  if (updates.length === 0) return

  await getSheetsClient().spreadsheets.values.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      valueInputOption: 'RAW',
      data: updates.map((update) => ({
        range: `${quoteSheetName(sheetName)}!A${update.rowNumber}`,
        values: [update.values],
      })),
    },
  })
}

export async function updateSheetRow(
  sheetName: string,
  rowNumber: number,
  values: string[],
): Promise<void> {
  await updateSheetRows(sheetName, [{ rowNumber, values }])
}

/** Cache ID numerik sheet (dibutuhkan untuk menghapus baris). ID sheet tidak berubah. */
const sheetIdCache = new Map<string, number>()

async function getSheetId(sheetName: string): Promise<number> {
  const cached = sheetIdCache.get(sheetName)
  if (cached !== undefined) return cached

  const response = await getSheetsClient().spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: 'sheets.properties(sheetId,title)',
  })

  for (const sheet of response.data.sheets ?? []) {
    const title = sheet.properties?.title
    const sheetId = sheet.properties?.sheetId

    if (title && typeof sheetId === 'number') {
      sheetIdCache.set(title, sheetId)
    }
  }

  const sheetId = sheetIdCache.get(sheetName)

  if (sheetId === undefined) {
    throw new Error(`Sheet "${sheetName}" tidak ditemukan.`)
  }

  return sheetId
}

/**
 * Menghapus baris fisik (bukan sekadar mengosongkan) dalam satu request.
 * `rowNumbers` mulai dari 1; baris header (1) tidak boleh dihapus.
 * Dihapus dari bawah ke atas agar nomor baris lain tidak bergeser.
 */
export async function deleteSheetRows(sheetName: string, rowNumbers: number[]): Promise<void> {
  const uniqueRows = [...new Set(rowNumbers)]
    .filter((rowNumber) => rowNumber > 1)
    .sort((a, b) => b - a)

  if (uniqueRows.length === 0) return

  const sheetId = await getSheetId(sheetName)

  await getSheetsClient().spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: uniqueRows.map((rowNumber) => ({
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowNumber - 1,
            endIndex: rowNumber,
          },
        },
      })),
    },
  })
}

/**
 * Membuat `count` ID berurutan `PREFIX-000001` berdasarkan nomor terbesar
 * di kolom A dari `rows` (hasil `getSheetValues`, termasuk header).
 */
export function generateSequentialIds(rows: string[][], prefix: string, count = 1): string[] {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`)
  let maxNumber = 0

  for (const row of rows.slice(1)) {
    const match = (row[0] ?? '').match(pattern)
    if (match) maxNumber = Math.max(maxNumber, Number(match[1]))
  }

  return Array.from({ length: count }, (_, index) => (
    `${prefix}-${String(maxNumber + index + 1).padStart(6, '0')}`
  ))
}

/** Nilai boolean di sheet: `TRUE` / `FALSE`. */
export function toSheetBoolean(value: boolean): string {
  return value ? 'TRUE' : 'FALSE'
}

export function fromSheetBoolean(value: string | undefined): boolean {
  return (value ?? '').trim().toUpperCase() === 'TRUE'
}
