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
| `app/composables/usePortalUrl.ts` | `usePortalUrl()` → `getPortalUrl(code)` / `getPortalUrlLabel(code)` dari domain yang sedang dibuka; `useCopyText()` salin + toast. |
| `app/utils/api-error.ts` | `getApiErrorMessage(error, fallback)` — ambil `statusMessage` dari error `$fetch`. |
| `app/utils/ui-classes.ts` | Kelas gaya desain awal: `inputClass`, `primaryButtonClass`, `secondaryButtonClass`, `dangerButtonClass`, `fieldClass(error)`; `getApiFieldErrors(error)` (error per field dari API). |
| `app/utils/portal-draft.ts` | `PortalDraft` (isian form profil), `toPortalDraft()`, `isSameDraft()`, `toPreviewPortal(draft, links)` untuk pratinjau. |

### Layouts (`app/layouts/`)

| File | Dipakai oleh | Isi |
| --- | --- | --- |
| `default.vue` | `/` | Pembungkus polos. |
| `auth.vue` | `/login` | Latar `slate-100`, konten di tengah. |
| `admin.vue` | `/admin/**` | Header atas sticky (logo indigo, "Dashboard Admin", username, tombol Keluar) + konten `max-w-6xl`. |

### Komponen (`app/components/`)

| File | Tag | Fungsi |
| --- | --- | --- |
| `base/Modal.vue` | `<BaseModal>` | Modal gaya awal (rounded-3xl) di atas `UModal`. Props: `v-model:open`, `title`, `description`, `dismissible`, `size` (`md`/`lg`); slot default + `footer`. |
| `base/Field.vue` | `<BaseField>` | Label + slot input + error/hint. Props: `label`, `forId`, `error`, `hint`, `required`, `caps`. |
| `base/ToggleSwitch.vue` | `<BaseToggleSwitch>` | Switch hijau. `v-model` boolean, `label` (aria), `disabled`. |
| `admin/DatabaseStatusCard.vue` | `<AdminDatabaseStatusCard>` | Kartu Status Database (memuat `/api/admin/database-status`). |
| `portal/PortalView.vue` | `<PortalView>` | Tampilan halaman portal (tema, avatar, sosial, tombol). Dipakai pratinjau (`preview`) dan halaman publik (tahap 4). Props: `portal: PublicPortal`, `preview?`. |
| `portal/LinkManager.vue` | `<PortalLinkManager>` | Daftar tombol satu portal: drag & drop (sortablejs, simpan otomatis), toggle tampil/unggulan, edit, hapus (konfirmasi). `v-model:links`, `portalId`. |
| `portal/LinkFormModal.vue` | `<PortalLinkFormModal>` | Modal tambah/edit tombol (judul, URL, ikon, tampil, unggulan). |
| `portal/IconPicker.vue` | `<PortalIconPicker>` | Grid pilihan ikon dari `LINK_ICON_OPTIONS`. |
| `portal/ThemePicker.vue` | `<PortalThemePicker>` | Pilihan tema dari `PORTAL_THEMES`. |
| `portal/ProfileForm.vue` | `<PortalProfileForm>` | Form Profil & Tampilan; `v-model:draft` (dipakai pratinjau langsung), simpan via PATCH; peringatan bila kode diubah; bantuan link logo Google Drive. |
| `portal/CreatePortalModal.vue` | `<PortalCreatePortalModal>` | Buat portal (kode, nama, tema); dibuat nonaktif. Emit `created`. |
| `portal/DuplicatePortalModal.vue` | `<PortalDuplicatePortalModal>` | Duplikat portal (kode & nama baru). Emit `duplicated`. |
| `portal/DeletePortalModal.vue` | `<PortalDeletePortalModal>` | Hapus permanen dengan mengetik ulang kode. Emit `deleted`. |

### Halaman (`app/pages/`)

| Route | File | Fungsi |
| --- | --- | --- |
| `/` | `index.vue` | Halaman netral (bukan daftar portal). |
| `/login` | `login.vue` | Form login admin; kembali ke `redirect` (hanya `/admin/**`). |
| `/admin` | `admin/index.vue` | Tab **Daftar Portal** (kartu portal, cari, buat, aktif/nonaktif, menu salin/duplikat/hapus) dan **Status Database** (`?tab=database`). |
| `/admin/portals/:portalId` | `admin/portals/[portalId].vue` | Editor portal: kepala (status, salin link, lihat publik, duplikat, hapus), tab **Kelola Tombol** & **Profil & Tampilan** (`?tab=profile`), pratinjau HP di kanan (desktop) / tombol Pratinjau melayang (HP). Peringatan saat keluar dengan perubahan profil belum disimpan. |

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
| `link-icons.ts` | `LINK_ICON_OPTIONS` (30 ikon Lucide + label), `toLucideIconName(icon)` → `i-lucide-<icon>`. |

## `shared/types/`

| File | Fungsi |
| --- | --- |
| `portal.ts` | Tipe `Portal`, `Link`, `PortalSummary`, `PortalDetail`, `PublicPortal` — satu sumber untuk backend & frontend (import: `~~/shared/types/portal` di app, relatif di server). |

## `scripts/`

| File | Perintah | Fungsi |
| --- | --- | --- |
| `check-sheets.ts` | `npm run check-sheets` | Cek koneksi & header setiap sheet dari terminal. |

## `public/`

| File | Fungsi |
| --- | --- |
| `favicon.svg` | Ikon tab browser (ikon link indigo). |
