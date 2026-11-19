import { getStorageData } from '~/server/utils/storage'
import { requireAdminAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const data = await getStorageData(true)
  return {
    profile: data.profile,
    links: data.links.sort((a, b) => a.order - b.order)
  }
})
