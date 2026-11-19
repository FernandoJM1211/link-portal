import { saveProfile } from '~/server/utils/storage'
import { requireAdminAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  requireAdminAuth(event)
  const body = await readBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data profil tidak boleh kosong.'
    })
  }

  const profile = {
    name: body.name ? body.name.trim() : 'Unit Link Portal',
    bio: body.bio ? body.bio.trim() : '',
    avatarUrl: body.avatarUrl ? body.avatarUrl.trim() : '',
    theme: body.theme || 'indigo',
    socials: body.socials || {}
  }

  await saveProfile(profile)

  return { success: true, profile }
})
