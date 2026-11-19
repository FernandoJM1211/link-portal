/**
 * Memeriksa koneksi ke Google Sheets dan kecocokan header setiap sheet.
 *
 * Jalankan: npm run check-sheets
 */
import { checkDatabaseStatus } from '../server/services/database-status.service'

const status = await checkDatabaseStatus()

if (!status.connected) {
  console.error(`✗ Gagal terhubung: ${status.error}`)
  process.exit(1)
}

console.log(`✓ Terhubung ke spreadsheet "${status.spreadsheetTitle}"\n`)

for (const sheet of status.sheets) {
  if (!sheet.exists) {
    console.log(`✗ ${sheet.name}: sheet belum dibuat`)
    continue
  }

  if (!sheet.headerMatches) {
    console.log(`✗ ${sheet.name}: header tidak sesuai`)
    console.log(`    diharapkan : ${sheet.expectedHeaders.join(' | ')}`)
    console.log(`    ditemukan  : ${sheet.actualHeaders.join(' | ') || '(kosong)'}`)
    continue
  }

  console.log(`✓ ${sheet.name}: header sesuai, ${sheet.rowCount} baris data`)
}

process.exit(status.ok ? 0 : 1)
