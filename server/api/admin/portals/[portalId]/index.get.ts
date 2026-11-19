import { getPortalDetail } from '../../../../services/portal.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  return {
    success: true,
    data: await getPortalDetail(portalId),
  }
})
