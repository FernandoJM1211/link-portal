/**
 * Pilihan ikon tombol link di dashboard (nama ikon Lucide, disimpan di kolom `links.icon`).
 * Semua nama sudah dicek ada di koleksi @iconify-json/lucide.
 * Cari ikon lain di https://lucide.dev bila perlu menambah.
 */
export const LINK_ICON_OPTIONS: readonly { value: string, label: string }[] = [
  { value: 'link', label: 'Tautan' },
  { value: 'globe', label: 'Website' },
  { value: 'file-text', label: 'Dokumen' },
  { value: 'clipboard-list', label: 'Formulir' },
  { value: 'download', label: 'Unduh' },
  { value: 'folder-open', label: 'Folder' },
  { value: 'message-circle', label: 'Chat / WhatsApp' },
  { value: 'phone', label: 'Telepon' },
  { value: 'mail', label: 'Email' },
  { value: 'send', label: 'Kirim' },
  { value: 'calendar', label: 'Jadwal' },
  { value: 'map-pin', label: 'Lokasi' },
  { value: 'video', label: 'Video' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'image', label: 'Galeri' },
  { value: 'newspaper', label: 'Berita' },
  { value: 'megaphone', label: 'Pengumuman' },
  { value: 'book-open', label: 'Panduan' },
  { value: 'graduation-cap', label: 'Pendidikan' },
  { value: 'briefcase', label: 'Layanan' },
  { value: 'building-2', label: 'Instansi' },
  { value: 'users', label: 'Komunitas' },
  { value: 'award', label: 'Penghargaan' },
  { value: 'ticket', label: 'Tiket' },
  { value: 'shopping-bag', label: 'Belanja' },
  { value: 'star', label: 'Favorit' },
  { value: 'circle-help', label: 'Bantuan' },
]

/** Nama kelas ikon Nuxt UI dari nama ikon Lucide yang tersimpan di sheet. */
export function toLucideIconName(icon: string | null | undefined): string {
  return `i-lucide-${icon?.trim() || 'link'}`
}
