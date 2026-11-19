import {
  getSheetValues,
  getSpreadsheetInfo,
  isGoogleSheetsConfigured,
} from '../utils/google-sheets'
import { SHEET_HEADERS, SHEET_NAMES } from '../utils/sheet-schema'

/**
 * Pemeriksaan kesehatan database: koneksi ke spreadsheet, keberadaan sheet,
 * dan kecocokan header kolom dengan skema.
 *
 * Tidak memakai auto-import Nuxt agar bisa dipanggil dari `scripts/check-sheets.ts`.
 */

export type SheetStatus = {
  name: string
  exists: boolean
  headerMatches: boolean
  /** Header yang diharapkan vs yang ditemukan, untuk ditampilkan saat tidak cocok. */
  expectedHeaders: string[]
  actualHeaders: string[]
  /** Jumlah baris data (tanpa header). */
  rowCount: number
}

export type DatabaseStatus = {
  configured: boolean
  connected: boolean
  spreadsheetTitle: string
  sheets: SheetStatus[]
  ok: boolean
  /** Pesan kesalahan koneksi (tanpa detail kredensial). */
  error: string
}

export async function checkDatabaseStatus(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    configured: isGoogleSheetsConfigured(),
    connected: false,
    spreadsheetTitle: '',
    sheets: [],
    ok: false,
    error: '',
  }

  if (!status.configured) {
    status.error = 'GOOGLE_SPREADSHEET_ID dan kredensial Service Account belum diisi.'
    return status
  }

  try {
    const info = await getSpreadsheetInfo()
    status.connected = true
    status.spreadsheetTitle = info.title

    for (const name of SHEET_NAMES) {
      const expectedHeaders = [...SHEET_HEADERS[name]]
      const exists = info.sheetNames.includes(name)
      const rows = exists ? await getSheetValues(name) : []
      const actualHeaders = (rows[0] ?? []).map((value) => value.trim())

      status.sheets.push({
        name,
        exists,
        headerMatches: exists && expectedHeaders.every((header, index) => actualHeaders[index] === header),
        expectedHeaders,
        actualHeaders,
        rowCount: Math.max(rows.length - 1, 0),
      })
    }

    status.ok = status.sheets.every((sheet) => sheet.exists && sheet.headerMatches)
  } catch (error) {
    status.error = describeGoogleError(error)
  }

  return status
}

function describeGoogleError(error: unknown): string {
  const code = (error as { code?: number | string } | null)?.code

  if (code === 403) {
    return 'Akses ditolak. Pastikan spreadsheet sudah dibagikan ke email Service Account sebagai Editor.'
  }

  if (code === 404) {
    return 'Spreadsheet tidak ditemukan. Periksa GOOGLE_SPREADSHEET_ID.'
  }

  if (code === 'ENOENT') {
    return 'File kredensial Service Account tidak ditemukan. Periksa GOOGLE_APPLICATION_CREDENTIALS.'
  }

  const message = error instanceof Error ? error.message : ''
  return message || 'Gagal terhubung ke Google Sheets.'
}
