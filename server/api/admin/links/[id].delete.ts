import { getStorageData, saveAllLinks } from '~/server/utils/storage'
import { requireAdminAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = getRouterParam(event, 'id')

  const data = await getStorageData(true)
  const filtered = data.links.filter(l => l.id !== id)

  if (filtered.length === data.links.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tautan tidak ditemukan.'
    })
  }

  // Normalize order
  filtered.forEach((link, idx) => {
    link.order = idx + 1
  })

  await saveAllLinks(filtered)

  return { success: true, message: 'Tautan berhasil dihapus.' }
})
