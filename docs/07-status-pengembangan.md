# 07 — Status Pengembangan

Terakhir diperbarui: 19 November 2026. **Perbarui setiap fitur selesai/dimulai.**

Legenda: ✅ selesai · 🚧 sedang dikerjakan · ❌ belum ada

## Tahapan

| Tahap | Isi | Status |
| --- | --- | --- |
| 1. Fondasi | Dokumentasi, migrasi Nuxt 4 + Nuxt UI 4, koneksi Google Sheets, login admin | ✅ |
| 2. Backend multi-portal | Repository `portals` & `links`, service + API CRUD portal & link, API publik + cache | ✅ |
| 3. Dashboard admin | Daftar portal, buat/ubah/nonaktifkan/duplikat/hapus, editor profil & tema, kelola link (drag & drop, aktif, unggulan), pratinjau langsung | ✅ |
| 4. Halaman publik | `/<kode>` dengan tema, meta tag (preview WhatsApp), 404 | ❌ |
| 5. Deploy | Repo GitHub + Vercel + environment variable | ❌ |

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

| Fitur | Backend (API) | Tampilan |
| --- | --- | --- |
| Daftar portal (+ jumlah link, pencarian bila > 3 portal) | ✅ | ✅ |
| Buat portal (kode, nama, tema; dibuat nonaktif) | ✅ | ✅ |
| Ubah profil & tema portal | ✅ | ✅ |
| Aktif/nonaktifkan portal | ✅ | ✅ (daftar & editor) |
| Hapus portal permanen (beserta link, konfirmasi kode) | ✅ | ✅ |
| Duplikat portal (hasil nonaktif) | ✅ | ✅ |
| Logo dari link Google Drive (dikonversi ke URL gambar langsung) | ✅ | ✅ (pratinjau logo + petunjuk berbagi) |
| Tambah/ubah/hapus link | ✅ | ✅ |
| Urutkan link | ✅ | ✅ (drag & drop, simpan otomatis) |
| Aktif/nonaktif & unggulan link | ✅ | ✅ |
| Pratinjau langsung di editor | — | ✅ (desktop: bingkai HP; HP: tombol Pratinjau) |
| Salin link portal | — | ✅ |
| Data halaman publik `/<kode>` (cache 60 detik) | ✅ | ❌ (tahap 4) |

Pengujian tahap 2 (19 Nov 2026): 47 skenario end-to-end terhadap spreadsheet asli lolos
(validasi input, kode duplikat, normalisasi URL/WA/Drive, urutan, publik hanya data aktif,
duplikat, hapus permanen); data uji dibersihkan.

Pengujian tahap 3 (19 Nov 2026): uji di Chrome headless (desktop 1366px & HP 390px) dengan data
demo — drag & drop tersimpan sesuai urutan layar, pratinjau ikut berubah saat mengetik,
tidak ada error console; data demo dibersihkan.

## Known Issues / Utang Teknis

| # | Masalah | Dampak | Saran |
| --- | --- | --- | --- |
| 1 | Rate limiter login in-memory | Di Vercel tiap instance punya hitungan sendiri | Cukup untuk sekarang; pakai Upstash Redis bila perlu |
| 2 | Generator ID membaca nomor terbesar | Dua penulisan bersamaan bisa menghasilkan ID sama | Risiko kecil (satu admin) |
| 3 | Logout hanya menghapus cookie di browser itu | Cookie yang tercuri tetap berlaku sampai kedaluwarsa (8 jam) | Ganti `SESSION_SECRET` untuk mencabut semua sesi |
| 4 | Data lama di `data/data.json` (versi sebelum migrasi) belum dipindah ke sheet | — | Bisa dibuat ulang lewat dashboard, atau diimpor dengan script bila diperlukan |
| 5 | Cache halaman publik per instance | Di Vercel, perubahan dari admin bisa terlambat tampil maks. 60 detik di instance lain | Terima; atau pakai cache bersama/Vercel KV bila perlu |
| 6 | Duplikat portal: portal dibuat dulu, lalu link | Bila penulisan link gagal, portal salinan ada tanpa link | Hapus portal salinan lalu ulangi |
| 7 | Nama ikon tidak dicek terhadap daftar Lucide di server | Ikon salah ketik tidak tampil | Dashboard memakai pemilih ikon (tahap 3) |
