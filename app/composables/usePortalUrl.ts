/**
 * Alamat publik portal berdasarkan domain yang sedang dibuka
 * (localhost saat development, domain Vercel/kustom saat production).
 */
export function usePortalUrl() {
  const requestUrl = useRequestURL()

  return {
    /** URL lengkap, mis. `https://link.instansi.id/01`. */
    getPortalUrl: (code: string) => `${requestUrl.origin}/${code}`,
    /** Untuk ditampilkan, tanpa `https://`, mis. `link.instansi.id/01`. */
    getPortalUrlLabel: (code: string) => `${requestUrl.host}/${code}`,
  }
}

/** Salin teks ke clipboard dengan notifikasi. */
export function useCopyText() {
  const toast = useToast()

  return async (text: string, successMessage = 'Tautan disalin ke clipboard.') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.add({ title: successMessage, color: 'success', icon: 'i-lucide-circle-check' })
    } catch {
      toast.add({ title: 'Gagal menyalin', description: text, color: 'error', icon: 'i-lucide-circle-x' })
    }
  }
}
