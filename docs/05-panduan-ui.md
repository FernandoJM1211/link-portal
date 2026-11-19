# 05 — Panduan UI (Style Guide)

Gaya tampilan Link Portal adalah **ramah dan santai** (desain awal proyek), **bukan** gaya
dashboard formal CMSP. Yang diikuti dari CMSP hanya cara kerja pengembangannya
(dokumentasi, lapisan backend, konvensi), bukan tampilannya.

Ada dua "wajah" aplikasi:

| Area | Gaya |
| --- | --- |
| **Dashboard admin** (`/login`, `/admin/**`) | Latar `slate-100`, kartu putih membulat, aksen **indigo**, header atas (tanpa sidebar) |
| **Halaman publik portal** (`/<kode>`) | Gradasi warna sesuai tema portal (`shared/utils/portal-themes.ts`), mobile-first |

Acuan visual: `app/pages/login.vue`, `app/layouts/admin.vue`, `app/pages/admin/index.vue`.

## Prinsip

- **Bahasa Indonesia santai tapi sopan**, sapaan "Anda". Boleh emoji ringan untuk petunjuk
  (💡, 👋) — secukupnya. Hindari istilah teknis ("Tombol Link", bukan "Link Item").
- **Light mode saja** (`colorMode.preference = 'light'`).
- Font **Plus Jakarta Sans** (diatur di `app/assets/css/main.css` lewat `@theme`).
- Elemen dasar (kartu, input, tombol) ditulis dengan **Tailwind utility class** sesuai pola
  di bawah agar tampilannya seragam dengan desain awal. Komponen Nuxt UI dipakai untuk
  hal yang rumit: `UIcon`, `toast` (`useToast`), `UModal`, `USlideover`, `UDropdownMenu`, dst.
- Ikon: Lucide via `<UIcon name="i-lucide-..." />`.

## Warna

Tema Nuxt UI (`app/app.config.ts`): `primary = indigo`, `neutral = slate`.

| Kegunaan | Class |
| --- | --- |
| Latar halaman | `bg-slate-100` (sudah di `body` dan layout) |
| Aksen utama | `indigo-600` (tombol, kotak logo, tab aktif), hover `indigo-700` |
| Latar ikon lembut | `bg-indigo-50 text-indigo-600` |
| Judul | `text-slate-900 font-bold` / `font-extrabold` |
| Teks keterangan | `text-slate-500` (kecil: `text-xs`) |
| Teks sangat redup | `text-slate-400` |
| Border kartu | `border border-slate-200/80` |
| Info / berhasil | banner `border-indigo-100 bg-indigo-50`, teks `text-indigo-950` / `text-indigo-800/80` |
| Peringatan | `border-amber-200 bg-amber-50`, teks `text-amber-950` / `text-amber-800/80` |
| Error / bahaya | `border-rose-200 bg-rose-50 text-rose-700`, tombol `bg-rose-50 text-rose-600 hover:bg-rose-100` |
| Unggulan | `bg-amber-100 text-amber-800` |

### Label status (pill)

```html
<span class="rounded-full px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-700">Aktif</span>
```

| Arti | Class |
| --- | --- |
| Aktif / siap | `bg-emerald-100 text-emerald-700` |
| Perlu perhatian | `bg-amber-100 text-amber-800` |
| Nonaktif / gagal | `bg-rose-100 text-rose-700` |
| Netral | `bg-slate-100 text-slate-600` |

## Kerangka Halaman Admin

Layout `admin` sudah menyediakan header atas (logo + "Dashboard Admin" + tombol Keluar)
dan pembungkus `max-w-5xl`. Halaman cukup mengisi konten:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Judul Halaman' })
</script>

<template>
  <div class="space-y-6">
    <!-- Bar aksi -->
    <div class="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <div>
        <h2 class="text-base font-bold text-slate-900">Judul Bagian</h2>
        <p class="mt-0.5 text-xs text-slate-500">💡 Petunjuk singkat.</p>
      </div>
      <button class="... tombol utama ...">+ Tambah</button>
    </div>

    <!-- Kartu form/isi -->
    <div class="max-w-3xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <h2 class="mb-1 text-lg font-bold text-slate-900">Judul Kartu</h2>
      <p class="mb-6 text-xs text-slate-500">Keterangan singkat.</p>
      ...
    </div>
  </div>
</template>
```

## Pola Elemen

### Kartu

| Jenis | Class |
| --- | --- |
| Bar aksi / item daftar | `rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm` (bar: `p-5`) |
| Kartu besar (form, panel) | `rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8` |
| Item di dalam kartu | `rounded-2xl border border-slate-200/80 p-4` |
| Keadaan kosong | `rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center` |

### Tombol

| Jenis | Class |
| --- | --- |
| Utama | `rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-95 disabled:opacity-50` |
| Utama besar (form login) | `w-full rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30` |
| Sekunder | `rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200` |
| Bahaya | `rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100` — **wajib konfirmasi** sebelum menghapus |
| Ikon saja | `rounded-xl bg-slate-100 p-2 text-slate-600 hover:bg-slate-200` + `aria-label` + `title` |

Saat memproses: tombol `disabled`, ikon `i-lucide-loader-circle animate-spin`, teks berubah
("Menyimpan...", "Memeriksa...").

### Input

```html
<label class="mb-1.5 block text-sm font-semibold text-slate-700">Label</label>
<input class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500">
```

Label form panjang (editor profil): `text-xs font-bold uppercase tracking-wider text-slate-700`.
Textarea sama dengan input + `resize-none`.

### Tab

```html
<button class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition"
        :class="active ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'">
```

Pembungkus tab: `mb-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-1 sm:gap-6`.

### Pilihan bergambar (tema, ikon)

Kotak `rounded-2xl border-2 p-3`; terpilih `border-indigo-600 bg-indigo-50/50 shadow-sm`,
belum terpilih `border-slate-200 hover:border-slate-300`.

### Toggle aktif/nonaktif

Switch hijau: `bg-emerald-500` (aktif) / `bg-slate-300` (nonaktif). Boleh memakai `USwitch`
dengan `color="success"`.

### Notifikasi

Gunakan `useToast()` Nuxt UI:

```ts
toast.add({ title: 'Berhasil disimpan', color: 'success', icon: 'i-lucide-circle-check' })
toast.add({ title: 'Gagal menyimpan', description: getApiErrorMessage(error, 'Terjadi kesalahan.'), color: 'error', icon: 'i-lucide-circle-x' })
```

Error form (mis. login) boleh tampil langsung di bawah field dalam kotak rose.

### State halaman

1. **Memuat** — skeleton `h-14 animate-pulse rounded-2xl bg-slate-100` (beberapa baris).
2. **Gagal** — kotak rose dengan ikon `circle-alert` + tombol "Periksa Ulang"/"Muat Ulang".
3. **Kosong** — kartu bergaris putus-putus, ikon abu-abu, judul tebal "Belum ada ...", petunjuk singkat.

## Halaman Publik Portal

- **Mobile-first**, konten `max-w-md` di tengah.
- Warna dari tema portal (`getPortalTheme(theme).classes`): `wrapper`, `avatarGlow`,
  `normalButton`, `featuredButton`, `iconContainer`. Menambah tema → tambah entri di
  `PORTAL_THEMES` dengan kelas Tailwind **lengkap** (jangan dirangkai dinamis).
- Urutan: tombol bagikan → avatar (dengan glow) → nama → bio → ikon media sosial → tombol link → footer ©.
- Link unggulan memakai `featuredButton` + label kecil "Unggulan".
- Semua link eksternal: `target="_blank" rel="noopener noreferrer"`.

## Aksesibilitas

- Tombol ikon wajib `aria-label` (dan `title`).
- Jangan menyampaikan status hanya lewat warna — selalu ada teks label.
- Elemen yang bisa diklik pakai `<button>`/`<NuxtLink>`/`<a>`, bukan `<div @click>`.

## Responsif

Admin dan publik harus nyaman di HP: `flex-col sm:flex-row`, `grid-cols-2 sm:grid-cols-5`,
`min-w-0` + `truncate` untuk teks panjang (judul link, URL).
