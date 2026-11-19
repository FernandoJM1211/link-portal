import { setPortalActive } from '../../../../services/portal.service'

/** Body: { isActive: boolean } */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  const body = await readBody<{ isActive?: unknown }>(event)

  if (typeof body?.isActive !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Status aktif wajib bernilai true/false.',
    })
  }

  const portal = await setPortalActive(portalId, body.isActive)

  return {
    success: true,
    message: portal.is_active
      ? `Portal "${portal.name}" sekarang aktif dan bisa dibuka publik.`
      : `Portal "${portal.name}" dinonaktifkan.`,
    data: portal,
  }
})
