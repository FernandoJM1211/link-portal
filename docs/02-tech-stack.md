# 02 — Tech Stack

## Ringkasan

| Lapisan | Teknologi | Versi | Catatan |
| --- | --- | --- | --- |
| Framework | **Nuxt** | 4.5 | Full-stack: frontend (Vue) + backend (Nitro) dalam satu proyek |
| UI library | **Nuxt UI** | 4.11 | Komponen `U*` (UButton, UCard, UModal, UInput, ...) |
| CSS | **Tailwind CSS** | 4.3 | Diimpor lewat `app/assets/css/main.css` |
| Bahasa | **TypeScript** | 5.9 | `.ts` dan `<script setup lang="ts">` |
| Ikon | **Lucide** (`@iconify-json/lucide`) | — | Format `i-lucide-<nama>`, cari di <https://lucide.dev>. Disajikan dari server sendiri (`icon.serverBundle`) karena nama ikon link dinamis dari sheet |
| Database | **Google Sheets API** | `googleapis` 183 | Lewat Service Account (klien JWT) |
| Script CLI | **tsx** | — | Menjalankan script TypeScript di `scripts/` |
| Hosting | **Vercel** | — | Serverless; tidak ada penyimpanan file lokal |
| Runtime | **Node.js** | ≥ 20.6 (dev: 24) | Perlu `--env-file` untuk script |

## Kenapa Google Sheets?

Data mudah dilihat dan diolah tim non-teknis tanpa server database. Konsekuensinya:

- **Tidak ada transaksi.** Operasi multi-langkah bisa gagal di tengah; buat service yang aman diulang.
- **Tidak ada index.** Setiap pencarian membaca seluruh sheet. Ambil sekali, olah di memori.
- **Kuota API** ±60 baca/menit/user dan ±300 tulis/menit/proyek. Halaman publik perlu cache (tahap 4).
- **ID dibuat aplikasi** (`PRT-000001`, `LNK-000001`) dari nomor terbesar + 1.
- Semua nilai disimpan sebagai **string**. Boolean = `TRUE`/`FALSE`, tanggal = ISO 8601 UTC.

Pola repository memudahkan migrasi ke database sungguhan kelak (cukup ganti `server/repositories/`).

## Autentikasi

- Satu akun admin: `ADMIN_USERNAME` + `ADMIN_PASSWORD` (environment variable).
- Sesi: cookie `link_portal_session` (httpOnly, sameSite=lax, secure di production, 8 jam)
  berisi payload + tanda tangan HMAC-SHA256. **Tidak ada sheet sessions** — cocok untuk Vercel.
- Kunci tanda tangan = turunan `SESSION_SECRET` + username + kata sandi admin, sehingga
  **mengganti kata sandi atau `SESSION_SECRET` otomatis mengeluarkan semua sesi**.
- Logout menghapus cookie di browser tersebut. Untuk mencabut semua sesi, ganti `SESSION_SECRET`.
- Login dibatasi 10 percobaan / 15 menit per IP (in-memory).
- Semua request POST/PUT/PATCH/DELETE ke `/api` dicek origin-nya (CSRF).

## Environment Variable

Salin `.env.example` menjadi `.env` lalu isi.

| Variabel | Wajib | Fungsi |
| --- | --- | --- |
| `APP_BASE_URL` | ✅ | URL publik aplikasi, untuk validasi origin (CSRF). |
| `ADMIN_USERNAME` | ✅ | Username admin. |
| `ADMIN_PASSWORD` | ✅ | Kata sandi admin (gunakan yang kuat). |
| `SESSION_SECRET` | ✅ | Kunci tanda tangan sesi, minimal 32 karakter acak. |
| `GOOGLE_SPREADSHEET_ID` | ✅ | ID spreadsheet database. |
| `GOOGLE_APPLICATION_CREDENTIALS` | ✅* | Path file JSON Service Account — untuk lokal. |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | ✅* | Isi file JSON Service Account (mentah atau base64) — untuk Vercel. Diutamakan bila diisi. |

\* Cukup salah satu.

Variabel dibaca lewat `process.env` (bukan `runtimeConfig`) agar kode server juga bisa dipakai
script CLI di luar Nuxt.

Membuat `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

## Service Account

Proyek ini memakai Service Account sendiri (nama `link-portal`; email ada di field `client_email`
file JSON), terpisah dari CMSP agar kebocoran kunci satu proyek tidak membuka data proyek lain.
Spreadsheet harus dibagikan ke email tersebut sebagai **Editor**.

Untuk Vercel, ubah file JSON menjadi base64 lalu isi `GOOGLE_SERVICE_ACCOUNT_JSON`:

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\path\ke\kredensial.json"))
```

## Tool Pengembangan

- **VS Code** + ekstensi *Vue - Official* dan *Tailwind CSS IntelliSense*.
- `npm run typecheck` untuk memeriksa TypeScript (`vue-tsc`).
- `npm run check-sheets` untuk memeriksa koneksi & header spreadsheet.
