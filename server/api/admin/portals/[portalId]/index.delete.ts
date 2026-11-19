import { deletePortalPermanently } from '../../../../services/portal.service'

/** Hapus permanen portal + semua link-nya. Body: { confirmCode } = kode portal. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  const body = await readBody<{ confirmCode?: unknown }>(event)

  if (typeof body?.confirmCode !== 'string' || !body.confirmCode.trim() || body.confirmCode.length > 50) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ketik kode portal untuk mengonfirmasi penghapusan.',
      data: { errors: { confirmCode: 'Kode konfirmasi wajib diisi.' } },
    })
  }

  const result = await deletePortalPermanently(portalId, body.confirmCode)

  return {
    success: true,
    message: `Portal "${result.portal.name}" dan ${result.deletedLinkCount} tombol link telah dihapus permanen.`,
    data: {
      portal_id: result.portal.portal_id,
      deleted_link_count: result.deletedLinkCount,
    },
  }
})
