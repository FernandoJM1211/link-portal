import { getStorageData, saveAllLinks } from '~/server/utils/storage'
import { requireAdminAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const body = await readBody(event)

  if (!body.orderedIds || !Array.isArray(body.orderedIds)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'orderedIds harus berupa array string id.'
    })
  }

  const data = await getStorageData(true)
  const orderedIds: string[] = body.orderedIds

  // Create a map for quick lookup
  const linksMap = new Map(data.links.map(l => [l.id, l]))

  const newLinks = []
  let currentOrder = 1

  // First place the reordered ones
  for (const id of orderedIds) {
    const link = linksMap.get(id)
    if (link) {
      link.order = currentOrder++
      newLinks.push(link)
      linksMap.delete(id)
    }
  }

  // Any remaining links not in orderedIds
  for (const remaining of linksMap.values()) {
    remaining.order = currentOrder++
    newLinks.push(remaining)
  }

  await saveAllLinks(newLinks)

  return { success: true, links: newLinks }
})
