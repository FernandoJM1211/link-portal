import {
  appendSheetRows,
  deleteSheetRows,
  fromSheetBoolean,
  generateSequentialIds,
  getSheetValues,
  toSheetBoolean,
  updateSheetRows,
} from '../utils/google-sheets'
import { SHEET_HEADERS } from '../utils/sheet-schema'

const SHEET_NAME = 'links'
const HEADERS = SHEET_HEADERS.links
const ID_PREFIX = 'LNK'

export interface Link {
  link_id: string
  portal_id: string
  title: string
  url: string
  icon: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/** Kolom yang boleh diisi saat membuat link (sisanya diatur repository). */
export type LinkFields = Omit<Link, 'link_id' | 'created_at' | 'updated_at'>

type LinkRecord = {
  link: Link
  /** Nomor baris di sheet (mulai dari 1, baris 1 = header). */
  rowNumber: number
}

function rowToLink(row: string[]): Link {
  const value = (column: (typeof HEADERS)[number]) => (row[HEADERS.indexOf(column)] ?? '').trim()
  const sortOrder = Number.parseInt(value('sort_order'), 10)

  return {
    link_id: value('link_id'),
    portal_id: value('portal_id'),
    title: value('title'),
    url: value('url'),
    icon: value('icon'),
    is_active: fromSheetBoolean(value('is_active')),
    is_featured: fromSheetBoolean(value('is_featured')),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    created_at: value('created_at'),
    updated_at: value('updated_at'),
  }
}

function linkToRow(link: Link): string[] {
  return HEADERS.map((column) => {
    const value = link[column]
    if (typeof value === 'boolean') return toSheetBoolean(value)
    return String(value)
  })
}

async function readLinkRecords(): Promise<{ rows: string[][], records: LinkRecord[] }> {
  const rows = await getSheetValues(SHEET_NAME)
  const records: LinkRecord[] = []

  rows.forEach((row, index) => {
    if (index === 0 || !(row[0] ?? '').trim()) return
    records.push({ link: rowToLink(row), rowNumber: index + 1 })
  })

  return { rows, records }
}

/** Urutan tampil: `sort_order`, lalu waktu dibuat sebagai penentu bila sama. */
export function compareLinks(a: Link, b: Link): number {
  return a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at)
}

export async function findAllLinks(): Promise<Link[]> {
  const { records } = await readLinkRecords()
  return records.map((record) => record.link)
}

export async function findLinksByPortalId(portalId: string): Promise<Link[]> {
  const { records } = await readLinkRecords()

  return records
    .map((record) => record.link)
    .filter((link) => link.portal_id === portalId)
    .sort(compareLinks)
}

/** Menambah banyak link sekaligus (satu request tulis). */
export async function createLinks(items: LinkFields[]): Promise<Link[]> {
  if (items.length === 0) return []

  const { rows } = await readLinkRecords()
  const ids = generateSequentialIds(rows, ID_PREFIX, items.length)
  const now = new Date().toISOString()

  const links = items.map((fields, index): Link => ({
    ...fields,
    link_id: ids[index]!,
    created_at: now,
    updated_at: now,
  }))

  await appendSheetRows(SHEET_NAME, links.map(linkToRow))

  return links
}

/**
 * Mengubah sebagian kolom beberapa link milik satu portal dalam satu request.
 * Link yang tidak ditemukan (atau milik portal lain) diabaikan.
 */
export async function updateLinks(
  portalId: string,
  changes: { linkId: string, changes: Partial<LinkFields> }[],
): Promise<Link[]> {
  if (changes.length === 0) return []

  const { records } = await readLinkRecords()
  const now = new Date().toISOString()
  const updated: { rowNumber: number, link: Link }[] = []

  for (const item of changes) {
    const record = records.find((r) => r.link.link_id === item.linkId && r.link.portal_id === portalId)
    if (!record) continue

    updated.push({
      rowNumber: record.rowNumber,
      link: { ...record.link, ...item.changes, portal_id: portalId, updated_at: now },
    })
  }

  await updateSheetRows(
    SHEET_NAME,
    updated.map((item) => ({ rowNumber: item.rowNumber, values: linkToRow(item.link) })),
  )

  return updated.map((item) => item.link)
}

/** Menghapus permanen link tertentu milik satu portal. Mengembalikan jumlah yang dihapus. */
export async function deleteLinks(portalId: string, linkIds: string[]): Promise<number> {
  const { records } = await readLinkRecords()
  const targetIds = new Set(linkIds)

  const rowNumbers = records
    .filter((record) => record.link.portal_id === portalId && targetIds.has(record.link.link_id))
    .map((record) => record.rowNumber)

  await deleteSheetRows(SHEET_NAME, rowNumbers)

  return rowNumbers.length
}

/** Menghapus permanen semua link milik satu portal. Mengembalikan jumlah yang dihapus. */
export async function deleteLinksByPortalId(portalId: string): Promise<number> {
  const { records } = await readLinkRecords()

  const rowNumbers = records
    .filter((record) => record.link.portal_id === portalId)
    .map((record) => record.rowNumber)

  await deleteSheetRows(SHEET_NAME, rowNumbers)

  return rowNumbers.length
}
