import type { Link, Portal, PublicPortal } from '~~/shared/types/portal'

/** Isian form Profil & Tampilan (camelCase, sesuai body API). */
export type PortalDraft = {
  code: string
  name: string
  bio: string
  avatarUrl: string
  theme: string
  instagram: string
  whatsapp: string
  website: string
  youtube: string
  email: string
}

export function toPortalDraft(portal: Portal): PortalDraft {
  return {
    code: portal.code,
    name: portal.name,
    bio: portal.bio,
    avatarUrl: portal.avatar_url,
    theme: portal.theme,
    instagram: portal.instagram,
    whatsapp: portal.whatsapp,
    website: portal.website,
    youtube: portal.youtube,
    email: portal.email,
  }
}

export function isSameDraft(a: PortalDraft, b: PortalDraft): boolean {
  return (Object.keys(a) as (keyof PortalDraft)[]).every((key) => a[key].trim() === b[key].trim())
}

/**
 * Data pratinjau dari isian form + daftar link (hanya yang aktif), dengan bentuk
 * yang sama seperti halaman publik.
 */
export function toPreviewPortal(draft: PortalDraft, links: Link[]): PublicPortal {
  return {
    code: draft.code,
    name: draft.name.trim(),
    bio: draft.bio.trim(),
    avatar_url: toDirectImageUrl(draft.avatarUrl),
    theme: draft.theme,
    socials: {
      instagram: draft.instagram.trim(),
      whatsapp: draft.whatsapp.trim(),
      website: draft.website.trim(),
      youtube: draft.youtube.trim(),
      email: draft.email.trim(),
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
