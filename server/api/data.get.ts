import { getStorageData } from '~/server/utils/storage'

export default defineEventHandler(async () => {
  const data = await getStorageData()
  return {
    profile: data.profile,
    links: data.links
      .filter(link => link.isActive)
      .sort((a, b) => a.order - b.order)
  }
})
