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

/** Seluruh isi sheet (baris 1 = header). Nilai selalu string. */
export async function getSheetValues(sheetName: string): Promise<string[][]> {
  const response = await getSheetsClient().spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: quoteSheetName(sheetName),
  })

  return (response.data.values ?? []) as string[][]
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
