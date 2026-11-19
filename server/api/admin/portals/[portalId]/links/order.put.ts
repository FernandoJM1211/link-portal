import { MAX_LINKS_PER_PORTAL, reorderLinks } from '../../../../../services/link.service'

/** Body: { linkIds: string[] } — semua ID link portal dalam urutan baru. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  const body = await readBody<{ linkIds?: unknown }>(event)
  const linkIds = body?.linkIds

  if (
    !Array.isArray(linkIds) ||
    linkIds.length > MAX_LINKS_PER_PORTAL ||
    !linkIds.every((id) => typeof id === 'string' && id.length > 0 && id.length <= 50)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Urutan tombol tidak valid.',
    })
  }

  const links = await reorderLinks(portalId, linkIds as string[])

  return {
    success: true,
    message: 'Urutan tombol berhasil disimpan.',
    data: links,
  }
})
