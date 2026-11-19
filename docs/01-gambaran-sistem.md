# 01 — Gambaran Sistem

## Apa itu Link Portal?

Aplikasi pengganti Linktree yang di-host sendiri, sehingga tidak ada iklan dan data
dikelola sendiri di Google Sheets. Satu aplikasi bisa melayani **banyak portal**, misalnya
satu portal per unit, kegiatan, atau program.

```
Admin pusat ──login──▶ /admin ──kelola──▶ Portal 01 ── link, link, link
                                      ├─▶ Portal 02 ── link, link
                                      └─▶ Portal pmb-2026 ── ...

Pengunjung ──buka──▶ domain/01  ──▶ halaman publik Portal 01 (jika aktif)
```

## Pengguna

| Pengguna | Akses | Cara masuk |
| --- | --- | --- |
| **Admin** (satu orang/akun) | Semua portal: buat, ubah, nonaktifkan, kelola link | `/login` dengan username & kata sandi dari environment variable |
| **Pengunjung** | Halaman publik portal yang aktif | Tanpa login |

Tidak ada akun per unit. Bila kelak dibutuhkan, tambahkan sheet `users` (lihat catatan di
[04-database.md](04-database.md)).

## Konsep

### Portal
- Punya **kode** unik yang menjadi alamat publik: `domain/<kode>`.
  - Huruf kecil, angka, tanda hubung di tengah; 2–30 karakter. Contoh: `01`, `02`, `pmb-2026`.
  - Kode sistem tidak boleh dipakai: `admin`, `api`, `login`, `logout`
    ([shared/utils/portal-code.ts](../shared/utils/portal-code.ts)).
  - **Sebaiknya tidak diganti** setelah dibagikan (link/QR code lama akan mati).
- Profil: nama, bio, URL logo/avatar, tautan media sosial (Instagram, WhatsApp, Website, YouTube, Email).
- Tema warna: `indigo`, `emerald`, `sunset`, `ocean`, `midnight`
  ([shared/utils/portal-themes.ts](../shared/utils/portal-themes.ts)).
- Status **aktif/nonaktif**. Portal nonaktif → halaman publik 404.

### Link (tombol)
- Milik tepat satu portal.
- Judul, URL, ikon (nama ikon Lucide), urutan, status aktif, dan penanda **unggulan** (disorot).
- Link nonaktif tidak tampil di halaman publik, tetapi tetap tersimpan.

## Keputusan yang Sudah Dikonfirmasi (19 Nov 2026)

| Topik | Keputusan |
| --- | --- |
| Stack & pola pengembangan | Disamakan dengan CMSP (Nuxt 4 + Nuxt UI 4, api → services → repositories, docs/) |
| Desain tampilan | **Tidak** mengikuti CMSP; memakai gaya ramah desain awal (indigo, kartu membulat, header atas) |
| Pengelola | Satu admin pusat untuk semua portal |
| Format URL | `domain/<kode>`, kode diisi admin (mis. `01`) |
| Hosting | Vercel |
| Database | Satu spreadsheet, sheet `portals` dan `links` |
| Statistik klik | Belum dibutuhkan |
| Halaman `/` | Halaman netral, bukan daftar portal |
| Hapus portal | **Hapus permanen**: baris portal **dan semua link miliknya** dihapus dari sheet. Wajib konfirmasi (ketik kode portal). Alternatif tidak permanen tetap ada: nonaktifkan |
| Logo portal | Admin **mengunggah gambar sendiri ke Google Drive**, lalu menempelkan link berbagi Drive. Aplikasi tidak mengunggah file (tanpa OAuth Drive) |
| Duplikat portal | Ada: menyalin profil, tema, dan semua link ke portal baru dengan kode baru (portal baru dibuat **nonaktif**) |

### Aturan logo dari Google Drive

- File di Drive harus dibagikan **"Siapa saja yang memiliki link"** (Anyone with the link → Viewer),
  kalau tidak gambar tidak tampil untuk pengunjung.
- Link berbagi Drive (`https://drive.google.com/file/d/<ID>/view?...` atau `...open?id=<ID>`)
  bukan alamat gambar langsung. Server mengambil `<ID>` lalu menyimpan alamat gambar langsung
  `https://lh3.googleusercontent.com/d/<ID>` di kolom `avatar_url`.
- URL gambar `https://` lain (bukan Drive) tetap diterima apa adanya.
- Kosong → avatar bawaan (inisial nama portal).

## Pertanyaan Terbuka

Belum ada.
