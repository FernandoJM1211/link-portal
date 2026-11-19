/**
 * Kelas Tailwind gaya desain awal yang sering dipakai (lihat docs/05-panduan-ui.md).
 * Ditulis lengkap agar terdeteksi Tailwind saat build.
 */

export const inputClass =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500'

export const inputErrorClass =
  'w-full rounded-xl border border-rose-300 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500'

export const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50'

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:pointer-events-none disabled:opacity-50'

export const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 active:scale-95 disabled:pointer-events-none disabled:opacity-50'

/** Pilih kelas input biasa atau merah bila ada error. */
export function fieldClass(error?: string): string {
  return error ? inputErrorClass : inputClass
}

/** Ambil pesan error per field dari respons API (`data.data.errors`). */
export function getApiFieldErrors(error: unknown): Record<string, string> {
  const errors = (error as { data?: { data?: { errors?: unknown } } } | null)?.data?.data?.errors
  return errors && typeof errors === 'object' ? errors as Record<string, string> : {}
}
