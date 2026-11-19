import { updatePortalProfile } from '../../../../services/portal.service'

/** Mengubah profil & tampilan portal (form lengkap). Status aktif diubah lewat `/status`. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  const { is_active: _isActive, ...fields } = readPortalInput(await readBody(event))
  const portal = await updatePortalProfile(portalId, fields)

  return {
    success: true,
    message: 'Pengaturan portal berhasil disimpan.',
    data: portal,
  }
})
