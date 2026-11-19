import { editLink } from '../../../../../services/link.service'

/** Ubah sebagian: { title?, url?, icon?, isActive?, isFeatured? } */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')
  const linkId = requireRouterParam(event, 'linkId', 'ID tombol')

  const changes = readLinkChanges(await readBody(event))
  const link = await editLink(portalId, linkId, changes)

  return {
    success: true,
    message: 'Tombol link berhasil diperbarui.',
    data: link,
  }
})
