import { findPortalByCode } from '../repositories/portal.repository'
import { findLinksByPortalId } from '../repositories/link.repository'

/**
 * Data halaman publik `/<kode>`: hanya portal AKTIF dan link AKTIF.
 *
 * Disimpan di cache memori agar kunjungan ramai tidak menghabiskan kuota
 * Google Sheets. Cache dikosongkan setiap admin mengubah data (di instance yang sama);
 * instance Vercel lain paling lambat memperbarui setelah PUBLIC_CACHE_TTL_MS.
 */

export const PUBLIC_CACHE_TTL_MS = 60 * 1000

export type PublicPortal = {
  code: string
  name: string
  bio: string
  avatar_url: string
  theme: string
  socials: {
    instagram: string
    whatsapp: string
    website: string
    youtube: string
    email: string
  }
  links: {
    link_id: string
    title: string
    url: string
    icon: string
    is_featured: boolean
  }[]
}

type CacheEntry = {
  /** `null` = portal tidak ada / tidak aktif (ikut di-cache agar 404 juga murah). */
  portal: PublicPortal | null
  expiresAt: number
}

const cache = new Map<string, CacheEntry>()

/** Dipanggil setiap kali data portal/link berubah. */
export function invalidatePublicPortalCache() {
  cache.clear()
}

export async function getPublicPortal(code: string): Promise<PublicPortal | null> {
  const normalizedCode = normalizePortalCode(code)
  const now = Date.now()
  const cached = cache.get(normalizedCode)

  if (cached && cached.expiresAt > now) {
    return cached.portal
  }

  const portal = await findPortalByCode(normalizedCode)
  let result: PublicPortal | null = null

  if (portal?.is_active) {
    const links = await findLinksByPortalId(portal.portal_id)

    result = {
      code: portal.code,
      name: portal.name,
      bio: portal.bio,
      avatar_url: portal.avatar_url,
      theme: getPortalTheme(portal.theme).value,
      socials: {
        instagram: portal.instagram,
        whatsapp: portal.whatsapp,
        website: portal.website,
        youtube: portal.youtube,
        email: portal.email,
      },
      links: links
        .filter((link) => link.is_active)
        .map((link) => ({
          link_id: link.link_id,
          title: link.title,
          url: link.url,
          icon: link.icon,
          is_featured: link.is_featured,
        })),
    }
  }

  cache.set(normalizedCode, { portal: result, expiresAt: now + PUBLIC_CACHE_TTL_MS })

  return result
}
