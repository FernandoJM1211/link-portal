import { duplicatePortal } from '../../../../services/portal.service'

/** Body: { code, name } untuk portal baru. Hasil salinan dibuat nonaktif. */
export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  const body = await readBody(event)

  if (!isPlainObject(body)) {
    assertNoFieldErrors({ body: 'Data salinan portal tidak valid.' })
  }

  const input = body as Record<string, unknown>
  const errors: FieldErrors = {}

  const code = readPortalCode(input, errors)
  const name = readRequiredText(input, 'name', 'Nama portal', PORTAL_NAME_MAX_LENGTH, errors)
  assertNoFieldErrors(errors)

  const portal = await duplicatePortal(portalId, { code, name })

  return {
    success: true,
    message: `Portal "${portal.name}" berhasil dibuat dari salinan (masih nonaktif).`,
    data: portal,
  }
})
