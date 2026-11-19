# Link Portal

Pengganti Linktree yang di-host sendiri (tanpa iklan). Satu admin mengelola banyak portal;
setiap portal punya alamat `domain/<kode>`, profil, tema warna, dan daftar tombol link sendiri.
Data disimpan di **Google Sheets**.

Dibangun dengan **Nuxt 4**, **Nuxt UI 4**, dan **Tailwind CSS 4**; di-deploy ke **Vercel**.

## Setup Lokal

1. Install dependency:
   ```bash
   npm install
   ```
2. Salin `.env.example` menjadi `.env`, lalu isi (penjelasan tiap variabel ada di
   [docs/02-tech-stack.md](docs/02-tech-stack.md)).
3. Siapkan spreadsheet dengan sheet `portals` dan `links` sesuai
   [docs/04-database.md](docs/04-database.md), lalu bagikan ke email Service Account sebagai **Editor**.
4. Periksa koneksi:
   ```bash
   npm run check-sheets
   ```
5. Jalankan:
   ```bash
   npm run dev
   ```
   Buka <http://localhost:3000/login> dan masuk dengan `ADMIN_USERNAME` / `ADMIN_PASSWORD`.

## Dokumentasi

Lihat [CLAUDE.md](CLAUDE.md) dan folder [docs/](docs/).
