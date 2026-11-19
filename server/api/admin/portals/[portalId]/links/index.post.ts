import { addLink } from '../../../../../services/link.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  const input = readNewLinkInput(await readBody(event))
  const link = await addLink(portalId, input)

  return {
    success: true,
    message: 'Tombol link berhasil ditambahkan.',
    data: link,
  }
})
