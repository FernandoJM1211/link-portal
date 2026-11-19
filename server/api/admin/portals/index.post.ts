import { createPortal } from '../../../services/portal.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const fields = readPortalInput(await readBody(event))
  const portal = await createPortal(fields)

  return {
    success: true,
    message: `Portal "${portal.name}" berhasil dibuat.`,
    data: portal,
  }
})
