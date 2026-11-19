# 03 — Struktur Proyek

Peta seluruh file dan fungsinya. **Perbarui dokumen ini setiap menambah/menghapus file.**

```
.
├── app/            Frontend (Vue/Nuxt) — halaman, layout, komponen
├── server/         Backend (Nitro) — API, logika bisnis, akses Google Sheets
├── shared/         Kode yang dipakai frontend & backend
├── scripts/        Script CLI
├── public/         Aset statis yang disajikan apa adanya
├── docs/           Dokumentasi pengembangan (folder ini)
└── CLAUDE.md       Ringkasan aturan untuk asisten AI
```

## File Root

| File | Fungsi |
| --- | --- |
| `nuxt.config.ts` | Modul `@nuxt/ui`, CSS global, light mode, bundel ikon Lucide di server, header keamanan (`routeRules`). |
| `package.json` | Dependency dan perintah `npm run ...`. |
| `tsconfig.json` | Merujuk tsconfig yang dibuat otomatis oleh Nuxt di `.nuxt/`. |
| `.env.example` | Contoh environment variable (lihat [02-tech-stack.md](02-tech-stack.md)). `.env` asli tidak di-commit. |
| `.gitignore` | `.env`, `.nuxt`, `.output`, `node_modules`, `data/` (data lokal versi lama). |
| `.vscode/settings.json` | Arahkan VS Code ke TypeScript milik proyek. |
| `README.md` | Pengenalan singkat dan cara setup. |
| `CLAUDE.md` | Aturan & indeks dokumentasi untuk asisten AI. |

## `app/` — Frontend

### Dasar

| File | Fungsi |
| --- | --- |
| `app/app.vue` | Root: `<UApp>` → layout → halaman; `titleTemplate` "… · Link Portal". |
| `app/app.config.ts` | Tema Nuxt UI: `primary` = indigo, `neutral` = slate. |
| `app/error.vue` | Halaman error/404 (juga dipakai untuk portal tidak aktif/tidak ada). |
| `app/assets/css/main.css` | Import Tailwind + Nuxt UI, `@source` folder `shared/`, font Plus Jakarta Sans, gaya dasar `body`. |
| `app/middleware/auth.global.ts` | `/admin/**` tanpa login → `/login?redirect=…`; `/login` saat sudah login → `/admin`. Hanya UX. |
| `app/composables/useAdminSession.ts` | `useAdminSession()` (data admin login, key `admin-session`) dan `logout()`. |
| `app/utils/api-error.ts` | `getApiErrorMessage(error, fallback)` — ambil `statusMessage` dari error `$fetch`. |

### Layouts (`app/layouts/`)

| File | Dipakai oleh | Isi |
| --- | --- | --- |
| `default.vue` | `/` | Pembungkus polos. |
| `auth.vue` | `/login` | Latar `slate-100`, konten di tengah. |
| `admin.vue` | `/admin/**` | Header atas sticky (logo indigo, "Dashboard Admin", username, tombol Keluar) + konten `max-w-5xl`. |

### Komponen (`app/components/`)

Belum ada — komponen portal/link dibuat di tahap 3.

### Halaman (`app/pages/`)

| Route | File | Fungsi |
| --- | --- | --- |
| `/` | `index.vue` | Halaman netral (bukan daftar portal). |
| `/login` | `login.vue` | Form login admin; kembali ke `redirect` (hanya `/admin/**`). |
| `/admin` | `admin/index.vue` | Beranda admin + kartu **Status Database**. |

## `server/` — Backend

### API (`server/api/`)

| Endpoint | Akses | Fungsi |
| --- | --- | --- |
| `POST /api/auth/login` | Publik (rate limit) | Cek username/kata sandi, set cookie sesi. |
| `POST /api/auth/logout` | Publik | Hapus cookie sesi. |
| `GET /api/auth/me` | Admin | Data sesi admin. |
| `GET /api/admin/database-status` | Admin | Koneksi spreadsheet + kecocokan header setiap sheet. |
| `GET /api/admin/portals` | Admin | Daftar portal + `link_count`, `active_link_count` (urut nama). |
| `POST /api/admin/portals` | Admin | Buat portal. Body: `code, name, bio, avatarUrl, theme, instagram, whatsapp, website, youtube, email, isActive?` |
| `GET /api/admin/portals/:portalId` | Admin | Detail portal + semua link (urut `sort_order`). |
| `PATCH /api/admin/portals/:portalId` | Admin | Ubah profil & tampilan (body sama dengan buat; `isActive` diabaikan). |
| `PATCH /api/admin/portals/:portalId/status` | Admin | Aktif/nonaktifkan. Body: `{ isActive }` |
| `POST /api/admin/portals/:portalId/duplicate` | Admin | Salin portal + link ke portal baru (nonaktif). Body: `{ code, name }` |
| `DELETE /api/admin/portals/:portalId` | Admin | Hapus permanen portal + semua link. Body: `{ confirmCode }` = kode portal |
| `POST /api/admin/portals/:portalId/links` | Admin | Tambah link (di urutan terakhir). Body: `title, url, icon?, isActive?, isFeatured?` |
| `PATCH /api/admin/portals/:portalId/links/:linkId` | Admin | Ubah sebagian field link (mis. toggle aktif/unggulan saja). |
| `DELETE /api/admin/portals/:portalId/links/:linkId` | Admin | Hapus permanen satu link. |
| `PUT /api/admin/portals/:portalId/links/order` | Admin | Simpan urutan. Body: `{ linkIds }` berisi **semua** ID link portal (409 bila tidak lengkap/usang). |
| `GET /api/portals/:code` | **Publik** | Data halaman publik: portal aktif + link aktif saja (cache 60 detik). 404 bila tidak ada/nonaktif. |

### Services (`server/services/`)

| File | Fungsi |
| --- | --- |
| `auth.service.ts` | `verifyAdminCredentials()`, `createAdminSessionToken()`, `readAdminSessionToken()` (cookie HMAC). |
| `database-status.service.ts` | `checkDatabaseStatus()` — dipakai endpoint & `scripts/check-sheets.ts`. |
| `portal.service.ts` | `listPortals()`, `getPortalDetail()`, `createPortal()`, `updatePortalProfile()`, `setPortalActive()`, `duplicatePortal()`, `deletePortalPermanently()`; cek kode unik (409). |
| `link.service.ts` | `addLink()`, `editLink()`, `removeLink()`, `reorderLinks()`; batas `MAX_LINKS_PER_PORTAL` = 100. |
| `public-portal.service.ts` | `getPublicPortal(code)` dengan cache memori 60 detik; `invalidatePublicPortalCache()` dipanggil setiap ada perubahan data. |

### Repositories (`server/repositories/`)

Kolom dipetakan dari `SHEET_HEADERS` (bukan indeks yang ditulis manual). Baris tanpa ID diabaikan.

| File | Sheet | Fungsi |
| --- | --- | --- |
| `portal.repository.ts` | `portals` | `findAllPortals`, `findPortalById`, `findPortalByCode`, `createPortal`, `updatePortal` (sebagian kolom), `deletePortal` (hapus baris fisik). |
| `link.repository.ts` | `links` | `findAllLinks`, `findLinksByPortalId` (terurut), `createLinks` (banyak sekaligus), `updateLinks` (banyak sekaligus, dibatasi satu portal), `deleteLinks`, `deleteLinksByPortalId`, `compareLinks`. |

### Utils (`server/utils/`, auto-import di server)

| File | Fungsi |
| --- | --- |
| `google-sheets.ts` | Klien Sheets (JWT Service Account); `getSpreadsheetInfo`, `getSheetValues`, `appendSheetRow(s)`, `updateSheetRow(s)`, `deleteSheetRows` (hapus baris fisik), `generateSequentialIds`, `toSheetBoolean`/`fromSheetBoolean`. Tanpa auto-import Nuxt (bisa dipakai CLI). |
| `sheet-schema.ts` | `SHEET_HEADERS` — urutan kolom resmi setiap sheet. |
| `session.ts` | `requireAdmin()`, `setSessionCookie()`, `clearSessionCookie()`, `requireRouterParam()`, `getClientIp()`. |
| `rate-limit.ts` | `assertRateLimit()`, `resetRateLimit()` (in-memory). |
| `input.ts` | Helper validasi umum: `readRequiredText`, `readOptionalText`, `readOptionalBoolean`, `readOptionalUrl`, `readOptionalEmail`, `normalizeUrl` (tanpa skema → `https://`; tolak `javascript:`), `assertNoFieldErrors` (400 + `data.errors` per field). |
| `portal-input.ts` | `readPortalInput(body)`, `readPortalCode()`; WhatsApp berupa nomor → `https://wa.me/62…`; link Drive logo → URL gambar langsung. |
| `link-input.ts` | `readNewLinkInput(body)`, `readLinkChanges(body)`; URL boleh `https`, `mailto:`, `tel:`; ikon Lucide (prefix `i-lucide-` dibuang, default `link`). |

### Middleware (`server/middleware/`)

| File | Fungsi |
| --- | --- |
| `csrf.ts` | Tolak POST/PUT/PATCH/DELETE ke `/api` dari origin lain. |

## `shared/utils/` — Dipakai app & server (auto-import)

| File | Fungsi |
| --- | --- |
| `portal-code.ts` | Aturan kode portal: `PORTAL_CODE_PATTERN`, `RESERVED_PORTAL_CODES`, `normalizePortalCode()`, `getPortalCodeError()`. |
| `portal-themes.ts` | `PORTAL_THEMES` (label + kelas Tailwind), `getPortalTheme()`, `isPortalTheme()`. |
| `drive-image.ts` | `getGoogleDriveFileId(url)`, `toDirectImageUrl(url)` — link berbagi Drive → `https://lh3.googleusercontent.com/d/<ID>`. |

## `scripts/`

| File | Perintah | Fungsi |
| --- | --- | --- |
| `check-sheets.ts` | `npm run check-sheets` | Cek koneksi & header setiap sheet dari terminal. |

## `public/`

| File | Fungsi |
| --- | --- |
| `favicon.svg` | Ikon tab browser (ikon link indigo). |
