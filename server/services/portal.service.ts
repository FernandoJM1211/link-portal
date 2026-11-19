import {
  createPortal as insertPortal,
  deletePortal as removePortal,
  findAllPortals,
  findPortalById,
  updatePortal as savePortal,
  type Portal,
  type PortalFields,
} from '../repositories/portal.repository'
import {
  createLinks,
  deleteLinksByPortalId,
  findAllLinks,
  findLinksByPortalId,
  type Link,
} from '../repositories/link.repository'
import { invalidatePublicPortalCache } from './public-portal.service'

export type PortalSummary = Portal & {
  link_count: number
  active_link_count: number
}

export type PortalDetail = Portal & {
  links: Link[]
}

function notFound(): never {
  throw createError({
    statusCode: 404,
    statusMessage: 'Portal tidak ditemukan.',
  })
}

/** Pastikan kode belum dipakai portal lain (409 bila bentrok). */
function assertCodeAvailable(portals: Portal[], code: string, exceptPortalId?: string) {
  const owner = portals.find((portal) => portal.code === code && portal.portal_id !== exceptPortalId)

  if (owner) {
    throw createError({
      statusCode: 409,
      statusMessage: `Kode "${code}" sudah dipakai oleh portal "${owner.name}".`,
      data: { errors: { code: 'Kode portal sudah dipakai.' } },
    })
  }
}

export async function getPortalHeader(portalId: string): Promise<Portal> {
  return (await findPortalById(portalId)) ?? notFound()
}

/** Daftar semua portal + jumlah link, urut nama. */
export async function listPortals(): Promise<PortalSummary[]> {
  const [portals, links] = await Promise.all([findAllPortals(), findAllLinks()])

  return portals
    .map((portal) => {
      const ownLinks = links.filter((link) => link.portal_id === portal.portal_id)

      return {
        ...portal,
        link_count: ownLinks.length,
        active_link_count: ownLinks.filter((link) => link.is_active).length,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'id'))
}

export async function getPortalDetail(portalId: string): Promise<PortalDetail> {
  const [portal, links] = await Promise.all([
    findPortalById(portalId),
    findLinksByPortalId(portalId),
  ])

  if (!portal) notFound()

  return { ...portal, links }
}

export async function createPortal(fields: PortalFields): Promise<Portal> {
  assertCodeAvailable(await findAllPortals(), fields.code)

  const portal = await insertPortal(fields)
  invalidatePublicPortalCache()

  return portal
}

/** Mengubah profil & tampilan. Status aktif diatur lewat `setPortalActive`. */
export async function updatePortalProfile(
  portalId: string,
  fields: Omit<PortalFields, 'is_active'>,
): Promise<Portal> {
  const portals = await findAllPortals()
  if (!portals.some((portal) => portal.portal_id === portalId)) notFound()

  assertCodeAvailable(portals, fields.code, portalId)

  const portal = (await savePortal(portalId, fields)) ?? notFound()
  invalidatePublicPortalCache()

  return portal
}

export async function setPortalActive(portalId: string, isActive: boolean): Promise<Portal> {
  const portal = (await savePortal(portalId, { is_active: isActive })) ?? notFound()
  invalidatePublicPortalCache()

  return portal
}

/**
 * Hapus permanen portal beserta semua link-nya.
 * `confirmCode` wajib sama dengan kode portal (pengaman salah hapus).
 * Link dihapus lebih dulu; bila gagal di tengah, aman diulang.
 */
export async function deletePortalPermanently(
  portalId: string,
  confirmCode: string,
): Promise<{ portal: Portal, deletedLinkCount: number }> {
  const portal = await getPortalHeader(portalId)

  if (normalizePortalCode(confirmCode) !== portal.code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kode konfirmasi tidak sesuai dengan kode portal.',
      data: { errors: { confirmCode: 'Ketik ulang kode portal dengan benar.' } },
    })
  }

  const deletedLinkCount = await deleteLinksByPortalId(portalId)
  await removePortal(portalId)
  invalidatePublicPortalCache()

  return { portal, deletedLinkCount }
}

/**
 * Salin portal (profil, tema, semua link) ke portal baru dengan kode & nama baru.
 * Portal hasil salinan dibuat NONAKTIF agar bisa dicek dulu sebelum dibuka ke publik.
 */
export async function duplicatePortal(
  sourcePortalId: string,
  target: { code: string, name: string },
): Promise<PortalDetail> {
  const [portals, sourceLinks] = await Promise.all([
    findAllPortals(),
    findLinksByPortalId(sourcePortalId),
  ])

  const source = portals.find((portal) => portal.portal_id === sourcePortalId) ?? notFound()

  assertCodeAvailable(portals, target.code)

  const portal = await insertPortal({
    code: target.code,
    name: target.name,
    bio: source.bio,
    avatar_url: source.avatar_url,
    theme: source.theme,
    instagram: source.instagram,
    whatsapp: source.whatsapp,
    website: source.website,
    youtube: source.youtube,
    email: source.email,
    is_active: false,
  })

  const links = await createLinks(sourceLinks.map((link, index) => ({
    portal_id: portal.portal_id,
    title: link.title,
    url: link.url,
    icon: link.icon,
    is_active: link.is_active,
    is_featured: link.is_featured,
    sort_order: index + 1,
  })))

  invalidatePublicPortalCache()

  return { ...portal, links }
}
