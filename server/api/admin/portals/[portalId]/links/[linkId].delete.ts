import { removeLink } from '../../../../../services/link.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')
  const linkId = requireRouterParam(event, 'linkId', 'ID tombol')

  await removeLink(portalId, linkId)

  return {
    success: true,
    message: 'Tombol link berhasil dihapus.',
  }
})
