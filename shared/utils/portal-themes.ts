/**
 * Tema warna halaman publik portal (kolom `portals.theme`).
 * Kelas Tailwind ditulis lengkap (bukan dirangkai) agar terdeteksi saat build.
 */

export type PortalThemeClasses = {
  wrapper: string
  avatarGlow: string
  normalButton: string
  featuredButton: string
  iconContainer: string
}

export type PortalTheme = {
  value: string
  label: string
  /** Warna contoh untuk pilihan tema di dashboard. */
  swatch: string
  /** Warna bilah browser HP (meta theme-color), sesuai warna atas gradasi. */
  themeColor: string
  classes: PortalThemeClasses
}

const FEATURED_AMBER =
  'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 hover:from-amber-200 hover:to-amber-100 text-slate-900 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-950/20'

export const PORTAL_THEMES: readonly PortalTheme[] = [
  {
    value: 'indigo',
    label: 'Indigo',
    themeColor: '#312e81',
    swatch: 'bg-gradient-to-br from-indigo-900 via-indigo-700 to-slate-900',
    classes: {
      wrapper: 'bg-gradient-to-br from-indigo-900 via-indigo-700 to-slate-900 text-white',
      avatarGlow: 'bg-gradient-to-r from-indigo-400 to-purple-400',
      normalButton: 'bg-white/90 hover:bg-white text-indigo-950 border-white/30 backdrop-blur-md shadow-indigo-950/20',
      featuredButton: FEATURED_AMBER,
      iconContainer: 'bg-indigo-100 text-indigo-700',
    },
  },
  {
    value: 'emerald',
    label: 'Emerald',
    themeColor: '#064e3b',
    swatch: 'bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900',
    classes: {
      wrapper: 'bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 text-white',
      avatarGlow: 'bg-gradient-to-r from-emerald-400 to-teal-300',
      normalButton: 'bg-white/90 hover:bg-white text-emerald-950 border-white/30 backdrop-blur-md shadow-emerald-950/20',
      featuredButton: FEATURED_AMBER,
      iconContainer: 'bg-emerald-100 text-emerald-700',
    },
  },
  {
    value: 'sunset',
    label: 'Sunset',
    themeColor: '#881337',
    swatch: 'bg-gradient-to-br from-rose-900 via-orange-800 to-purple-950',
    classes: {
      wrapper: 'bg-gradient-to-br from-rose-900 via-orange-800 to-purple-950 text-white',
      avatarGlow: 'bg-gradient-to-r from-orange-400 to-rose-400',
      normalButton: 'bg-white/90 hover:bg-white text-slate-900 border-white/30 backdrop-blur-md shadow-rose-950/20',
      featuredButton:
        'bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 hover:from-yellow-200 hover:to-yellow-100 text-slate-900 border-yellow-300 ring-2 ring-yellow-400/50 shadow-yellow-950/20',
      iconContainer: 'bg-rose-100 text-rose-700',
    },
  },
  {
    value: 'ocean',
    label: 'Ocean',
    themeColor: '#164e63',
    swatch: 'bg-gradient-to-br from-cyan-900 via-blue-800 to-slate-950',
    classes: {
      wrapper: 'bg-gradient-to-br from-cyan-900 via-blue-800 to-slate-950 text-white',
      avatarGlow: 'bg-gradient-to-r from-cyan-400 to-blue-400',
      normalButton: 'bg-white/90 hover:bg-white text-slate-900 border-white/30 backdrop-blur-md shadow-blue-950/20',
      featuredButton: FEATURED_AMBER,
      iconContainer: 'bg-blue-100 text-blue-700',
    },
  },
  {
    value: 'midnight',
    label: 'Midnight',
    themeColor: '#020617',
    swatch: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950',
    classes: {
      wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-white',
      avatarGlow: 'bg-gradient-to-r from-slate-600 to-zinc-400',
      normalButton: 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/60 backdrop-blur-md shadow-black/50',
      featuredButton:
        'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-indigo-400 ring-2 ring-indigo-400/40 shadow-indigo-950/50',
      iconContainer: 'bg-slate-800 text-slate-200',
    },
  },
]

export const DEFAULT_PORTAL_THEME = 'indigo'

export function isPortalTheme(value: string): boolean {
  return PORTAL_THEMES.some((theme) => theme.value === value)
}

/** Tema berdasarkan nilai; nilai tidak dikenal jatuh ke tema bawaan. */
export function getPortalTheme(value: string | null | undefined): PortalTheme {
  return (
    PORTAL_THEMES.find((theme) => theme.value === value) ??
    PORTAL_THEMES.find((theme) => theme.value === DEFAULT_PORTAL_THEME)!
  )
}
