import { findPortalById } from '../repositories/portal.repository'
import {
  createLinks,
  deleteLinks,
  findLinksByPortalId,
  updateLinks,
  type Link,
} from '../repositories/link.repository'
import type { LinkInput } from '../utils/link-input'
import { invalidatePublicPortalCache } from './public-portal.service'

/** Batas wajar jumlah tombol per portal. */
export const MAX_LINKS_PER_PORTAL = 100

async function assertPortalExists(portalId: string) {
  if (!(await findPortalById(portalId))) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Portal tidak ditemukan.',
    })
  }
}

function linkNotFound(): never {
  throw createError({
    statusCode: 404,
    statusMessage: 'Tombol link tidak ditemukan.',
  })
}

/** Link baru ditaruh di urutan paling bawah. */
export async function addLink(portalId: string, input: LinkInput): Promise<Link> {
  const [, links] = await Promise.all([
    assertPortalExists(portalId),
    findLinksByPortalId(portalId),
  ])

  if (links.length >= MAX_LINKS_PER_PORTAL) {
    throw createError({
      statusCode: 409,
      statusMessage: `Satu portal maksimal ${MAX_LINKS_PER_PORTAL} tombol link.`,
    })
  }

  const maxOrder = links.reduce((max, link) => Math.max(max, link.sort_order), 0)

  const [link] = await createLinks([{
    ...input,
    portal_id: portalId,
    sort_order: maxOrder + 1,
  }])

  invalidatePublicPortalCache()

  return link!
}

export async function editLink(
  portalId: string,
  linkId: string,
  changes: Partial<LinkInput>,
): Promise<Link> {
  const [link] = await updateLinks(portalId, [{ linkId, changes }])
  if (!link) linkNotFound()

  invalidatePublicPortalCache()

  return link
}

export async function removeLink(portalId: string, linkId: string): Promise<void> {
  const deletedCount = await deleteLinks(portalId, [linkId])
  if (deletedCount === 0) linkNotFound()

  invalidatePublicPortalCache()
}

/**
 * Menyimpan urutan baru. `orderedLinkIds` harus berisi PERSIS semua link portal
 * (tanpa duplikat), sehingga urutan dari layar yang sudah usang ditolak (409).
 */
export async function reorderLinks(portalId: string, orderedLinkIds: string[]): Promise<Link[]> {
  const links = await findLinksByPortalId(portalId)

  const currentIds = new Set(links.map((link) => link.link_id))
  const requestedIds = new Set(orderedLinkIds)

  const isSameSet =
    requestedIds.size === orderedLinkIds.length &&
    requestedIds.size === currentIds.size &&
    orderedLinkIds.every((id) => currentIds.has(id))

  if (!isSameSet) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Daftar tombol sudah berubah. Muat ulang halaman lalu atur urutan lagi.',
    })
  }

  // Hanya tulis link yang urutannya benar-benar berubah.
  const changes = orderedLinkIds
    .map((linkId, index) => ({ linkId, sortOrder: index + 1 }))
    .filter(({ linkId, sortOrder }) => links.find((link) => link.link_id === linkId)?.sort_order !== sortOrder)
    .map(({ linkId, sortOrder }) => ({ linkId, changes: { sort_order: sortOrder } }))

  const updated = await updateLinks(portalId, changes)

  if (changes.length > 0) invalidatePublicPortalCache()

  const updatedById = new Map(updated.map((link) => [link.link_id, link]))

  return orderedLinkIds.map((linkId) => (
    updatedById.get(linkId) ?? links.find((link) => link.link_id === linkId)!
  ))
}
