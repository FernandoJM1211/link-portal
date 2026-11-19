/**
 * Daftar sheet dan urutan kolomnya (baris 1 spreadsheet).
 *
 * Repository membaca berdasarkan POSISI kolom, jadi urutan di sini harus sama
 * persis dengan spreadsheet dan dengan docs/04-database.md.
 * Kolom baru selalu ditambahkan di AKHIR.
 */
export const SHEET_HEADERS = {
  portals: [
    'portal_id',
    'code',
    'name',
    'bio',
    'avatar_url',
    'theme',
    'instagram',
    'whatsapp',
    'website',
    'youtube',
    'email',
    'is_active',
    'created_at',
    'updated_at',
  ],
  links: [
    'link_id',
    'portal_id',
    'title',
    'url',
    'icon',
    'is_active',
    'is_featured',
    'sort_order',
    'created_at',
    'updated_at',
  ],
} as const

export type SheetName = keyof typeof SHEET_HEADERS

export const SHEET_NAMES = Object.keys(SHEET_HEADERS) as SheetName[]
