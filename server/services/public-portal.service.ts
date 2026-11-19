import { findPortalWithLinksByCode } from '../repositories/public-portal.repository'
import type { PublicPortal } from '../../shared/types/portal'

export type { PublicPortal }

/**
 * Data halaman publik `/<kode>`: hanya portal AKTIF dan link AKTIF.
 *
 * Dirancang untuk kunjungan ramai (mis. QR code di acara, ribuan orang):
 * 1. Cache memori 60 detik per kode — kunjungan berikutnya tidak membaca Google Sheets.
 * 2. Single-flight — bila banyak pengunjung datang bersamaan saat cache kosong,
 *    hanya SATU permintaan ke Google Sheets; yang lain menunggu hasil yang sama.
 * 3. Data basi saat gagal — bila Google Sheets error/kuota habis, data terakhir yang
 *    berhasil dimuat tetap disajikan (maks. STALE_MAX_AGE_MS) daripada menampilkan error.
 * Di atas ini masih ada cache CDN Vercel (lihat `app/pages/[code].vue`).
 *
 * Cache dikosongkan setiap admin mengubah data (di instance yang sama);
 * instance Vercel lain paling lambat memperbarui setelah PUBLIC_CACHE_TTL_MS.
 */

export const PUBLIC_CACHE_TTL_MS = 60 * 1000
const STALE_MAX_AGE_MS = 24 * 60 * 60 * 1000
const MAX_CACHE_ENTRIES = 500

type CacheEntry = {
  /** `null` = portal tidak ada / tidak aktif (ikut di-cache agar 404 juga murah). */
  portal: PublicPortal | null
  loadedAt: number
}

const cache = new Map<string, CacheEntry>()
const inFlight = new Map<string, Promise<PublicPortal | null>>()

/** Dipanggil setiap kali data portal/link berubah. */
export function invalidatePublicPortalCache() {
  cache.clear()
}

async function loadPublicPortal(code: string): Promise<PublicPortal | null> {
  console.info(`[public-portal] memuat "${code}" dari Google Sheets`)

  const result = await findPortalWithLinksByCode(code)
  if (!result?.portal.is_active) return null

  const { portal, links } = result

  return {
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

function remember(code: string, portal: PublicPortal | null) {
  // Batasi ukuran cache (kode acak dari pengunjung juga ikut tersimpan sebagai 404).
  if (cache.size >= MAX_CACHE_ENTRIES && !cache.has(code)) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) cache.delete(oldestKey)
  }

  cache.set(code, { portal, loadedAt: Date.now() })
}

export async function getPublicPortal(code: string): Promise<PublicPortal | null> {
  const normalizedCode = normalizePortalCode(code)
  const cached = cache.get(normalizedCode)

  if (cached && Date.now() - cached.loadedAt < PUBLIC_CACHE_TTL_MS) {
    return cached.portal
  }

  // Sudah ada permintaan yang sedang berjalan untuk kode ini → tunggu hasilnya.
  const pending = inFlight.get(normalizedCode)
  if (pending) return pending

  const request = loadPublicPortal(normalizedCode)
    .then((portal) => {
      remember(normalizedCode, portal)
      return portal
    })
    .catch((error: unknown) => {
      if (cached && Date.now() - cached.loadedAt < STALE_MAX_AGE_MS) {
        console.warn(`[public-portal] Google Sheets gagal, menyajikan data lama "${normalizedCode}":`, (error as Error)?.message)
        return cached.portal
      }
      throw error
    })
    .finally(() => {
      inFlight.delete(normalizedCode)
    })

  inFlight.set(normalizedCode, request)

  return request
}
