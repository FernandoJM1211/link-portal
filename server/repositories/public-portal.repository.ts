import { getMultipleSheetValues } from '../utils/google-sheets'
import { parsePortalRows, type Portal } from './portal.repository'
import { compareLinks, parseLinkRows, type Link } from './link.repository'

/**
 * Bacaan khusus halaman publik: sheet `portals` dan `links` diambil dalam
 * SATU request Google Sheets (hemat kuota saat kunjungan ramai).
 */
export async function findPortalWithLinksByCode(
  code: string,
): Promise<{ portal: Portal, links: Link[] } | null> {
  const [portalRows, linkRows] = await getMultipleSheetValues(['portals', 'links'])

  const normalizedCode = code.trim().toLowerCase()
  const portal = parsePortalRows(portalRows ?? []).find((item) => item.code === normalizedCode)
  if (!portal) return null

  const links = parseLinkRows(linkRows ?? [])
    .filter((link) => link.portal_id === portal.portal_id)
    .sort(compareLinks)

  return { portal, links }
}
