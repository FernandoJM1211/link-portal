import { getStorageData, saveAllLinks } from '~/server/utils/storage'
import { requireAdminAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const data = await getStorageData(true)
  const index = data.links.findIndex(l => l.id === id)

  if (index === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tautan tidak ditemukan.'
    })
  }

  const existing = data.links[index]
  data.links[index] = {
    ...existing,
    title: body.title !== undefined ? body.title.trim() : existing.title,
    url: body.url !== undefined ? body.url.trim() : existing.url,
    icon: body.icon !== undefined ? body.icon : existing.icon,
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : existing.isActive,
    isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
    order: body.order !== undefined ? Number(body.order) : existing.order
  }

  await saveAllLinks(data.links)

  return { success: true, link: data.links[index] }
})
