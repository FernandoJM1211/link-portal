# 07 — Status Pengembangan

Terakhir diperbarui: 19 November 2026. **Perbarui setiap fitur selesai/dimulai.**

Legenda: ✅ selesai · 🚧 sedang dikerjakan · ❌ belum ada

## Tahapan

| Tahap | Isi | Status |
| --- | --- | --- |
| 1. Fondasi | Dokumentasi, migrasi Nuxt 4 + Nuxt UI 4, koneksi Google Sheets, login admin | ✅ |
| 2. Backend multi-portal | Repository `portals` & `links`, service + API CRUD portal & link | ❌ |
| 3. Dashboard admin | Daftar portal, buat/ubah/nonaktifkan, editor profil & tema, kelola link (drag & drop, aktif, unggulan) | ❌ |
| 4. Halaman publik | `/<kode>` dengan tema, cache server, meta tag (preview WhatsApp), 404 | ❌ |
| 5. Deploy | Vercel + environment variable | ❌ |

## Fitur

### Umum & Akun

| Fitur | Status | Catatan |
| --- | --- | --- |
| Login & logout admin | ✅ | Cookie HMAC 8 jam, rate limit per IP, CSRF |
| Redirect `/admin` ↔ `/login` | ✅ | `app/middleware/auth.global.ts` |
| Status database di beranda | ✅ | Koneksi + header sheet |
| `npm run check-sheets` | ✅ | |
| Halaman 404 | ✅ | `app/error.vue` |

### Portal & Link

| Fitur | Status |
| --- | --- |
| Daftar portal | ❌ |
| Buat portal (kode, nama, tema) | ❌ |
| Ubah profil & tema portal | ❌ |
| Aktif/nonaktifkan portal | ❌ |
| Hapus portal permanen (beserta link) | ❌ |
| Duplikat portal | ❌ |
| Logo dari link Google Drive (dikonversi ke URL gambar langsung) | ❌ |
| Tambah/ubah/hapus link | ❌ |
| Urutkan link (drag & drop) | ❌ |
| Aktif/nonaktif & unggulan link | ❌ |
| Pratinjau halaman publik dari dashboard | ❌ |
| Halaman publik `/<kode>` | ❌ |

## Known Issues / Utang Teknis

| # | Masalah | Dampak | Saran |
| --- | --- | --- | --- |
| 1 | Rate limiter login in-memory | Di Vercel tiap instance punya hitungan sendiri | Cukup untuk sekarang; pakai Upstash Redis bila perlu |
| 2 | Generator ID membaca nomor terbesar | Dua penulisan bersamaan bisa menghasilkan ID sama | Risiko kecil (satu admin) |
| 3 | Logout hanya menghapus cookie di browser itu | Cookie yang tercuri tetap berlaku sampai kedaluwarsa (8 jam) | Ganti `SESSION_SECRET` untuk mencabut semua sesi |
| 4 | Data lama di `data/data.json` (versi sebelum migrasi) belum dipindah ke sheet | — | Bisa diimpor sebagai portal pertama di tahap 2 bila diperlukan |
