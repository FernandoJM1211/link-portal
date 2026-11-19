# 🌐 Link Portal Unit (Self-Hosted Linktree Clone)

Aplikasi portal tautan resmi untuk unit/tim kerja, dibuat menggunakan **Nuxt 3**, **Tailwind CSS**, dan siap diintegrasikan dengan **Google Sheets** sebagai database.

## ✨ Fitur Utama

- 📱 **Halaman Publik Modern & Responsif**: Tampilan mobile-first yang bersih dengan berbagai pilihan tema warna (Indigo, Emerald, Sunset, Ocean, Midnight).
- 🛠️ **Dashboard Admin (`/admin`)**:
  - Tambah, edit, dan hapus tombol secara dinamis tanpa batas.
  - **Drag & Drop / Reorder**: Urutkan posisi tombol hanya dengan menggeser (drag handle), otomatis tersimpan secara real-time.
  - **Toggle Cepat**: Aktifkan atau sembunyikan tombol dalam 1 klik tanpa harus menghapusnya.
  - **Tombol Unggulan (Featured)**: Sorot tombol prioritas tinggi dengan animasi khusus.
  - **Pengaturan Profil**: Nama unit, bio, logo/avatar, dan tautan media sosial (WhatsApp, Instagram, Website, Email, YouTube).
- 💾 **Dual Storage Engine**:
  - **Mode Lokal (Default)**: Langsung berjalan menggunakan file data lokal (`data/data.json`) tanpa perlu setup DB.
  - **Mode Google Sheets**: Cukup masukkan Service Account & ID Spreadsheet di `.env`, sistem otomatis membaca & menulis langsung ke spreadsheet.

---

## 🚀 Cara Menjalankan Aplikasi

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka browser di [http://localhost:3000](http://localhost:3000).

3. **Akses Dashboard Admin**:
   - URL: [http://localhost:3000/admin](http://localhost:3000/admin)
   - Password default: `admin123` (bisa diubah di file `.env`).

---

## 📊 Cara Mengaktifkan Google Sheets (Opsional / Kapanpun Siap)

Jika ingin data tombol tersinkronisasi ke Google Spreadsheet:

1. Buat Spreadsheet baru di Google Drive.
2. Buat Service Account di Google Cloud Console, aktifkan **Google Sheets API**, lalu unduh JSON Key.
3. Bagikan (*Share*) spreadsheet Anda ke alamat email Service Account sebagai **Editor**.
4. Buka file `.env` di folder ini, lalu isi:
   ```env
   GOOGLE_SHEET_ID=id_spreadsheet_anda
   GOOGLE_SERVICE_ACCOUNT_EMAIL=email-service-account@project.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgk...-----END PRIVATE KEY-----\n"
   ```
5. Simpan file `.env` dan restart server Nuxt.
