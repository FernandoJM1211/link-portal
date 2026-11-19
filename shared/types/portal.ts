/**
 * Bentuk data portal & link yang dipakai backend (repository/service/API)
 * dan frontend (dashboard & halaman publik). Satu sumber agar tidak berbeda.
 * Nama field = nama kolom sheet (snake_case).
 */

export interface Portal {
  portal_id: string
  code: string
  name: string
  bio: string
  avatar_url: string
  theme: string
  instagram: string
  whatsapp: string
  website: string
  youtube: string
  email: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Link {
  link_id: string
  portal_id: string
  title: string
  url: string
  icon: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/** Baris daftar portal di dashboard. */
export type PortalSummary = Portal & {
  link_count: number
  active_link_count: number
}

/** Portal lengkap dengan semua link-nya (editor dashboard). */
export type PortalDetail = Portal & {
  links: Link[]
}

export type PortalSocials = {
  instagram: string
  whatsapp: string
  website: string
  youtube: string
  email: string
}

/** Data yang dibutuhkan untuk menampilkan halaman portal (publik maupun pratinjau). */
export type PublicPortal = {
  code: string
  name: string
  bio: string
  avatar_url: string
  theme: string
  socials: PortalSocials
  links: {
    link_id: string
    title: string
    url: string
    icon: string
    is_featured: boolean
  }[]
}
