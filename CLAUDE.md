# CLAUDE.md — Panduan Pengembangan Link Portal

File ini dibaca otomatis oleh asisten AI (Claude Code) di setiap sesi.
Isinya ringkas; detail ada di folder [docs/](docs/).

## Tentang Proyek

**Link Portal** adalah pengganti Linktree yang di-host sendiri (tanpa iklan).
Satu **admin pusat** mengelola banyak **portal**; setiap portal punya alamat publik
`domain/<kode>` (mis. `domain/01`), profil (nama, bio, logo, media sosial), tema warna,
dan daftar tombol link sendiri. Pengunjung hanya melihat halaman portal yang **aktif**.
Detail: [docs/01-gambaran-sistem.md](docs/01-gambaran-sistem.md).

Stack: **Nuxt 4 + Nuxt UI 4 + Tailwind CSS 4**, database **Google Sheets** (satu spreadsheet),
hosting **Vercel**. **Cara kerja** pengembangan (dokumentasi probis/database/status, lapisan backend,
konvensi) mengikuti proyek CMSP (`d:\Project\sertifikasi-coaching-mentoring`), tetapi **tampilan tidak** —
UI memakai gaya ramah desain awal proyek (indigo, kartu membulat, header atas), lihat docs/05.
Bahasa UI, pesan error, dan komentar kode: **Bahasa Indonesia**.

## Dokumentasi

| File | Isi |
| --- | --- |
| [docs/01-gambaran-sistem.md](docs/01-gambaran-sistem.md) | Apa sistem ini, aturan bisnis, keputusan |
| [docs/02-tech-stack.md](docs/02-tech-stack.md) | Teknologi, versi, environment variable |
| [docs/03-struktur-proyek.md](docs/03-struktur-proyek.md) | Fungsi setiap folder dan file |
| [docs/04-database.md](docs/04-database.md) | Sheet di Google Sheets beserta kolomnya |
| [docs/05-panduan-ui.md](docs/05-panduan-ui.md) | Style guide dashboard & halaman publik |
| [docs/06-konvensi-kode.md](docs/06-konvensi-kode.md) | Pola kode backend/frontend + checklist keamanan |
| [docs/07-status-pengembangan.md](docs/07-status-pengembangan.md) | Tahapan, fitur yang sudah/belum ada, known issues |

**Baca dokumen yang relevan sebelum mengerjakan fitur.** Setelah menambah fitur, sheet,
atau file baru, **perbarui dokumen terkait** (terutama 03, 04, dan 07).

## Aturan Wajib

1. **Setiap endpoint `/api/admin/**`** wajib diawali `requireAdmin(event)`.
   Middleware frontend hanya untuk redirect, bukan pengaman.
2. **Alur lapisan backend:** `server/api` (validasi input + otorisasi) → `server/services`
   (logika bisnis) → `server/repositories` (baca/tulis sheet). Endpoint tidak memanggil
   Google Sheets langsung.
3. **Urutan kolom sheet** didefinisikan di [server/utils/sheet-schema.ts](server/utils/sheet-schema.ts)
   dan harus sama dengan spreadsheet + [docs/04-database.md](docs/04-database.md). Kolom baru selalu di **akhir**.
4. Tulis ke sheet selalu lewat repository (sudah memakai `valueInputOption: RAW`).
5. Validasi semua input di server (tipe, wajib, panjang maksimum). Input dari `readBody`
   bertipe `unknown` sampai dicek. Kode portal → `getPortalCodeError()`, tema → `isPortalTheme()`.
6. URL dari pengguna (link, logo, media sosial) wajib `http(s)://` (atau `mailto:` untuk email) —
   jangan pernah merender `javascript:` di halaman publik.
7. Ikuti [docs/05-panduan-ui.md](docs/05-panduan-ui.md) agar tampilan konsisten.
8. Jangan menambah dependency baru tanpa alasan kuat; utamakan komponen Nuxt UI.
9. Jangan commit `.env`, file kredensial Google, atau folder `data/`.

## Perintah

```bash
npm run dev           # development (http://localhost:3000)
npm run build         # build production
npm run typecheck     # pemeriksaan TypeScript
npm run check-sheets  # cek koneksi Google Sheets & header setiap sheet
```

Sebelum menyatakan pekerjaan selesai: jalankan `npm run typecheck` dan pastikan
tidak ada error baru.
