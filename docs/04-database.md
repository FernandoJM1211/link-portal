# 04 — Database (Google Sheets)

Satu spreadsheet (**Link Portal DB**, env `GOOGLE_SPREADSHEET_ID`) berisi dua sheet:
`portals` dan `links`. Tidak ada sheet akun/sesi karena admin hanya satu dan
kredensialnya ada di environment variable.

## Aturan Umum

- **Baris 1 = header** (nama kolom persis seperti tabel di bawah). Data mulai baris 2.
- **Urutan kolom penting.** Repository membaca berdasarkan posisi (`row[0]`, `row[1]`, ...).
  Sumber kebenaran urutan: [server/utils/sheet-schema.ts](../server/utils/sheet-schema.ts).
  Menambah kolom → **di akhir**, perbarui `sheet-schema.ts`, repository, dan dokumen ini.
- Semua nilai disimpan sebagai teks (`valueInputOption: RAW`). Tanggal = ISO 8601 UTC
  (`2026-11-19T02:30:00.000Z`). Boolean = `TRUE` / `FALSE`.
- **ID** dibuat aplikasi: `PREFIX-` + 6 digit, nomor terbesar + 1.
- Kolom `portals.code` sebaiknya berformat **Teks biasa** di Google Sheets
  (Format → Angka → Teks biasa) agar `01` tidak berubah menjadi `1` saat diedit manual.
- Spreadsheet harus dibagikan ke email Service Account sebagai **Editor**.
- Cek kesesuaian kapan saja: `npm run check-sheets` atau kartu **Status Database** di `/admin`.

## Relasi

```
portals 1──* links      (links.portal_id → portals.portal_id)
```

---

## `portals`

Satu baris = satu portal. ID: `PRT-000001`.

| # | Kolom | Isi |
| --- | --- | --- |
| A | `portal_id` | ID portal |
| B | `code` | Kode alamat publik `domain/<code>`, unik, huruf kecil (aturan di `shared/utils/portal-code.ts`) |
| C | `name` | Nama yang tampil di halaman |
| D | `bio` | Deskripsi singkat |
| E | `avatar_url` | URL logo/avatar (`https://`) |
| F | `theme` | `indigo` / `emerald` / `sunset` / `ocean` / `midnight` |
| G | `instagram` | URL, boleh kosong |
| H | `whatsapp` | URL `https://wa.me/...`, boleh kosong |
| I | `website` | URL, boleh kosong |
| J | `youtube` | URL, boleh kosong |
| K | `email` | Alamat email, boleh kosong |
| L | `is_active` | `TRUE` = tampil publik, `FALSE` = 404 |
| M | `created_at` | — |
| N | `updated_at` | — |

## `links`

Satu baris = satu tombol link. ID: `LNK-000001`.

| # | Kolom | Isi |
| --- | --- | --- |
| A | `link_id` | ID link |
| B | `portal_id` | Relasi ke `portals.portal_id` |
| C | `title` | Teks tombol |
| D | `url` | Tujuan link (`https://`, `mailto:`, `tel:`) |
| E | `icon` | Nama ikon Lucide tanpa prefix, mis. `globe`, `file-text` |
| F | `is_active` | `TRUE` / `FALSE` |
| G | `is_featured` | `TRUE` = disorot sebagai unggulan |
| H | `sort_order` | Urutan dalam satu portal: `1`, `2`, `3`, ... |
| I | `created_at` | — |
| J | `updated_at` | — |

## Perilaku Penulisan

| Operasi | Yang terjadi di sheet |
| --- | --- |
| Buat portal / link | Baris baru ditambahkan di bawah (`append`). Link baru mendapat `sort_order` terbesar + 1. |
| Ubah portal / link | Baris yang sama ditimpa; `updated_at` diperbarui. |
| Atur urutan link | Hanya baris yang `sort_order`-nya berubah yang ditulis, dalam satu request. |
| Hapus link | **Baris fisik dihapus** (bukan dikosongkan). |
| Hapus portal | Semua baris link milik portal dihapus dulu, lalu baris portal. Aman diulang bila gagal di tengah. |
| Duplikat portal | Satu baris portal baru (nonaktif) + semua link disalin dengan `sort_order` 1, 2, 3, ... |

Normalisasi sebelum disimpan:
- `code` → huruf kecil.
- URL tanpa skema → diberi `https://` (mis. `instagram.com/unit` → `https://instagram.com/unit`).
- `whatsapp` berupa nomor (`0812-3456-7890`) → `https://wa.me/6281234567890`.
- `avatar_url` link berbagi Google Drive → `https://lh3.googleusercontent.com/d/<ID>`.
- `email` → huruf kecil. `icon` → tanpa prefix `i-lucide-`, kosong = `link`.

Edit manual di spreadsheet tetap terbaca, tetapi halaman publik baru berubah setelah
cache habis (maks. 60 detik).

## Jika Kelak Butuh Multi-Admin

Tambahkan sheet `users` (+ `portal_admins` untuk hak per portal). Sebaiknya di
**spreadsheet terpisah** seperti CMSP karena berisi hash kata sandi.
