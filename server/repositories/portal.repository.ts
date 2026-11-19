import {
  appendSheetRow,
  deleteSheetRows,
  fromSheetBoolean,
  generateSequentialIds,
  getSheetValues,
  toSheetBoolean,
  updateSheetRow,
} from '../utils/google-sheets'
import { SHEET_HEADERS } from '../utils/sheet-schema'

const SHEET_NAME = 'portals'
const HEADERS = SHEET_HEADERS.portals
const ID_PREFIX = 'PRT'

export interface Portal {
  portal_id: string
  code: string
  name: string
  bio: string
  avatar_url: string
  theme: string
  instagram: string
  whatsapp: string
  website: string
  youtube: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

/** Kolom yang boleh diisi saat membuat/mengubah portal (sisanya diatur repository). */
export type PortalFields = Omit<Portal, 'portal_id' | 'created_at' | 'updated_at'>

type PortalRecord = {
  portal: Portal
  /** Nomor baris di sheet (mulai dari 1, baris 1 = header). */
  rowNumber: number
}

function rowToPortal(row: string[]): Portal {
  const value = (column: (typeof HEADERS)[number]) => (row[HEADERS.indexOf(column)] ?? '').trim()

  return {
    portal_id: value('portal_id'),
    code: value('code').toLowerCase(),
    name: value('name'),
    bio: value('bio'),
    avatar_url: value('avatar_url'),
    theme: value('theme'),
    instagram: value('instagram'),
    whatsapp: value('whatsapp'),
    website: value('website'),
    youtube: value('youtube'),
    email: value('email'),
    is_active: fromSheetBoolean(value('is_active')),
    created_at: value('created_at'),
    updated_at: value('updated_at'),
  }
}

function portalToRow(portal: Portal): string[] {
  return HEADERS.map((column) => {
    const value = portal[column]
    return typeof value === 'boolean' ? toSheetBoolean(value) : value
  })
}

async function readPortalRecords(): Promise<{ rows: string[][], records: PortalRecord[] }> {
  const rows = await getSheetValues(SHEET_NAME)
  const records: PortalRecord[] = []

  rows.forEach((row, index) => {
    // Lewati header dan baris kosong (mis. hasil edit manual).
    if (index === 0 || !(row[0] ?? '').trim()) return
    records.push({ portal: rowToPortal(row), rowNumber: index + 1 })
  })

  return { rows, records }
}

async function findPortalRecordById(portalId: string): Promise<PortalRecord | null> {
  const { records } = await readPortalRecords()
  return records.find((record) => record.portal.portal_id === portalId) ?? null
}

export async function findAllPortals(): Promise<Portal[]> {
  const { records } = await readPortalRecords()
  return records.map((record) => record.portal)
}

export async function findPortalById(portalId: string): Promise<Portal | null> {
  return (await findPortalRecordById(portalId))?.portal ?? null
}

export async function findPortalByCode(code: string): Promise<Portal | null> {
  const normalizedCode = code.trim().toLowerCase()
  const { records } = await readPortalRecords()
  return records.find((record) => record.portal.code === normalizedCode)?.portal ?? null
}

export async function createPortal(fields: PortalFields): Promise<Portal> {
  const { rows } = await readPortalRecords()
  const [portalId] = generateSequentialIds(rows, ID_PREFIX)
  const now = new Date().toISOString()

  const portal: Portal = {
    ...fields,
    portal_id: portalId!,
    created_at: now,
    updated_at: now,
  }

  await appendSheetRow(SHEET_NAME, portalToRow(portal))

  return portal
}

/** Mengubah sebagian kolom portal. Mengembalikan `null` bila portal tidak ada. */
export async function updatePortal(
  portalId: string,
  changes: Partial<PortalFields>,
): Promise<Portal | null> {
  const record = await findPortalRecordById(portalId)
  if (!record) return null

  const portal: Portal = {
    ...record.portal,
    ...changes,
    updated_at: new Date().toISOString(),
  }

  await updateSheetRow(SHEET_NAME, record.rowNumber, portalToRow(portal))

  return portal
}

/** Menghapus baris portal secara permanen. Mengembalikan `false` bila tidak ada. */
export async function deletePortal(portalId: string): Promise<boolean> {
  const record = await findPortalRecordById(portalId)
  if (!record) return false

  await deleteSheetRows(SHEET_NAME, [record.rowNumber])

  return true
}
