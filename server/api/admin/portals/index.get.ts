import { listPortals } from '../../../services/portal.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  return {
    success: true,
    data: await listPortals(),
  }
})
