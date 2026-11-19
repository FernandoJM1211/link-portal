# 06 — Konvensi Kode

## Penamaan

| Hal | Aturan | Contoh |
| --- | --- | --- |
| Folder & file | kebab-case | `portal.service.ts` |
| Komponen Vue | PascalCase | `LinkFormModal.vue` |
| Route admin | `/admin/<modul>` Bahasa Inggris | `/admin/portals`, `/admin/portals/[portalId]` |
| Kolom sheet & field API respons | snake_case | `portal_id`, `is_active` |
| Body request dari frontend | camelCase | `{ isActive, sortOrder }` |
| Variabel/fungsi TS | camelCase | `findPortalByCode` |
| Repository | `find*`, `create*`, `update*`, `delete*` | `findLinksByPortalId` |
| Service | kata kerja bisnis | `createPortal`, `reorderLinks` |
| Teks UI, error, komentar | Bahasa Indonesia | `'Portal tidak ditemukan.'` |

## Arsitektur Backend

```
server/api/xxx.get.ts                 ← 1. otorisasi (requireAdmin)
                                         2. ambil & validasi input (tipe, wajib, panjang)
                                         3. panggil service
                                         4. bentuk respons
server/services/xxx.service.ts        ← aturan bisnis, gabungan repository,
                                         lempar createError dengan pesan yang jelas
server/repositories/xxx.repository.ts ← baca/tulis satu sheet, mapping row ↔ object
```

- Endpoint **tidak** memanggil `server/utils/google-sheets.ts` langsung.
- Repository **tidak** memeriksa sesi.
- Kode yang dipakai script CLI (`google-sheets.ts`, `database-status.service.ts`, repository)
  tidak boleh bergantung pada auto-import Nuxt; import eksplisit (mis. `createError` dari `'h3'`).
- Indeks kolom repository diambil dari urutan `SHEET_HEADERS` di `sheet-schema.ts`.

### Template endpoint

```ts
// server/api/admin/portals/[portalId].patch.ts
import { updatePortal } from '../../../services/portal.service'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const portalId = requireRouterParam(event, 'portalId', 'ID portal')

  const body = await readBody<{ name?: unknown }>(event)

  if (typeof body?.name !== 'string' || !body.name.trim() || body.name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nama portal wajib diisi (maksimal 100 karakter).',
    })
  }

  const portal = await updatePortal(portalId, { name: body.name.trim() })

  return {
    success: true,
    message: 'Portal berhasil diperbarui.',
    data: portal,
  }
})
```

### Format respons

```jsonc
// sukses
{ "success": true, "message": "...", "data": { ... } }

// gagal (otomatis dari createError)
{ "statusCode": 400, "statusMessage": "Pesan untuk pengguna" }
```

### Kode status HTTP

| Kode | Kapan |
| --- | --- |
| 400 | Input tidak valid |
| 401 | Belum login / sesi tidak valid |
| 403 | Origin request ditolak (CSRF) |
| 404 | Data tidak ditemukan / portal nonaktif (publik) |
| 409 | Bentrok data (kode portal sudah dipakai) |
| 429 | Terlalu banyak percobaan |
| 500 | Kesalahan server/konfigurasi |

### Operasi multi-langkah

Google Sheets tidak punya transaksi. Lakukan semua **validasi sebelum** menulis apa pun,
dan buat proses **aman diulang**. Ubah banyak baris sekaligus dengan `updateSheetRows`
(satu request), mis. saat menyimpan urutan link.

## Frontend

- `<script setup lang="ts">`, Composition API.
- Data awal halaman: `await useFetch(...)` (ikut SSR). Aksi pengguna: `$fetch(...)`.
- Halaman admin memanggil `definePageMeta({ layout: 'admin' })`.
- **Nama komponen otomatis = nama folder + nama file.** `components/portal/LinkFormModal.vue`
  dipanggil `<PortalLinkFormModal>`. Cek `.nuxt/components.d.ts` jika ragu.
- Tipe respons API ditulis sebagai `type` di halaman. Jika dipakai ≥ 2 tempat, pindahkan ke `shared/types/`.
- Aturan yang berlaku di frontend **dan** backend (kode portal, tema) taruh di `shared/utils/`.

## Checklist Keamanan (setiap endpoint/fitur baru)

- [ ] Endpoint admin diawali `requireAdmin(event)`.
- [ ] Semua input dicek tipe dan panjang maksimumnya; `readBody` diperlakukan `unknown`.
- [ ] URL dari pengguna hanya `http:`/`https:` (plus `mailto:`/`tel:` untuk link); tolak `javascript:`.
- [ ] Tidak ada kata sandi, `SESSION_SECRET`, atau kredensial Google dalam respons maupun log.
- [ ] Endpoint publik hanya mengembalikan portal **aktif** dan link **aktif**.
- [ ] Tidak memakai `v-html` dengan data dari pengguna.
- [ ] Request yang mengubah data memakai POST/PUT/PATCH/DELETE (dilindungi CSRF middleware), bukan GET.

## Git

- Pesan commit singkat, boleh Bahasa Indonesia: `feat: kelola portal di dashboard admin`.
- Jangan commit `.env`, kredensial Google, atau folder `data/`.
