import { getStorageData, saveAllLinks } from '~/server/utils/storage'
import { requireAdminAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const body = await readBody(event)

  if (!body.title || !body.url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Judul dan URL tautan wajib diisi.'
    })
  }

  const data = await getStorageData(true)
  const newOrder = data.links.length > 0 ? Math.max(...data.links.map(l => l.order || 0)) + 1 : 1

  const newLink = {
    id: String(Date.now()),
    title: body.title.trim(),
    url: body.url.trim(),
    icon: body.icon || 'Globe',
    isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    order: newOrder,
    isFeatured: Boolean(body.isFeatured)
  }

  data.links.push(newLink)
  await saveAllLinks(data.links)

  return { success: true, link: newLink }
})
