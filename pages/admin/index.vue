<template>
  <div class="min-h-screen bg-slate-100/90 text-slate-800 pb-20">
    <!-- Toast Notification -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toast.show"
        :class="[
          'fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold flex items-center gap-2.5 text-white',
          toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
        ]"
      >
        <span class="w-2.5 h-2.5 rounded-full" :class="toast.type === 'error' ? 'bg-white' : 'bg-emerald-400'"></span>
        <span>{{ toast.message }}</span>
      </div>
    </transition>

    <!-- Top Navigation Bar -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-600/20">
            <DynamicIcon name="Link" :size="20" />
          </div>
          <div>
            <h1 class="text-base font-bold text-slate-900 leading-none">Dashboard Admin</h1>
            <p class="text-xs text-slate-500 mt-1">Pengaturan Link Portal Unit</p>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <NuxtLink
            to="/"
            target="_blank"
            class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            <DynamicIcon name="ExternalLink" :size="15" />
            <span>Lihat Halaman Publik</span>
          </NuxtLink>

          <button
            @click="handleLogout"
            class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs transition"
            title="Keluar dari Admin"
          >
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Container -->
    <main class="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
      <!-- Tabs Navigation -->
      <div class="flex border-b border-slate-200 gap-2 sm:gap-6 mb-8 overflow-x-auto pb-1">
        <button
          @click="activeTab = 'links'"
          :class="[
            'pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 px-1',
            activeTab === 'links'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <DynamicIcon name="Link" :size="18" />
          <span>Kelola Tombol ({{ links.length }})</span>
        </button>

        <button
          @click="activeTab = 'profile'"
          :class="[
            'pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 px-1',
            activeTab === 'profile'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <DynamicIcon name="Star" :size="18" />
          <span>Profil & Tampilan</span>
        </button>

        <button
          @click="activeTab = 'database'"
          :class="[
            'pb-3 font-semibold text-sm transition-all border-b-2 whitespace-nowrap flex items-center gap-2 px-1',
            activeTab === 'database'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          ]"
        >
          <DynamicIcon name="FileText" :size="18" />
          <span>Status Database</span>
        </button>
      </div>

      <!-- TAB 1: KELOLA TOMBOL (LINKS) -->
      <div v-show="activeTab === 'links'" class="space-y-6">
        <!-- Action Bar -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-base font-bold text-slate-900">Daftar Tombol Tautan</h2>
            <p class="text-xs text-slate-500 mt-0.5">
              💡 Geser ikon pegangan (drag handle) untuk mengatur ulang urutan tombol secara langsung.
            </p>
          </div>

          <button
            @click="openAddModal"
            class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition"
          >
            <span>+ Tambah Tombol Baru</span>
          </button>
        </div>

        <!-- Draggable Links List -->
        <div ref="sortableListRef" class="space-y-3">
          <div
            v-for="link in links"
            :key="link.id"
            :data-id="link.id"
            class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between gap-4 transition hover:border-slate-300"
          >
            <!-- Left: Drag handle + Icon + Details -->
            <div class="flex items-center gap-3.5 min-w-0 flex-1">
              <!-- Drag Handle -->
              <div class="cursor-grab active:cursor-grabbing p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 drag-handle">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16" />
                </svg>
              </div>

              <!-- Icon Preview -->
              <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <DynamicIcon :name="link.icon" :size="20" />
              </div>

              <!-- Title & URL -->
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-bold text-slate-900 truncate">{{ link.title }}</h3>
                  <span
                    v-if="link.isFeatured"
                    class="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0"
                  >
                    Unggulan
                  </span>
                </div>
                <a
                  :href="link.url"
                  target="_blank"
                  class="text-xs text-slate-400 hover:text-indigo-600 truncate block transition max-w-sm"
                >
                  {{ link.url }}
                </a>
              </div>
            </div>

            <!-- Right: Toggle Active + Edit + Delete -->
            <div class="flex items-center gap-2 shrink-0">
              <!-- Toggle Active Switch -->
              <button
                @click="toggleActive(link)"
                type="button"
                :class="[
                  'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  link.isActive ? 'bg-emerald-500' : 'bg-slate-300'
                ]"
                :title="link.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'"
              >
                <span
                  :class="[
                    'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    link.isActive ? 'translate-x-5' : 'translate-x-0'
                  ]"
                />
              </button>

              <!-- Edit Button -->
              <button
                @click="openEditModal(link)"
                class="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="Edit Tombol"
              >
                <DynamicIcon name="FileText" :size="16" />
              </button>

              <!-- Delete Button -->
              <button
                @click="confirmDelete(link)"
                class="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                title="Hapus Tombol"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <div v-if="links.length === 0" class="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
            <DynamicIcon name="Link" :size="32" className="mx-auto text-slate-300 mb-2" />
            <p class="font-bold text-slate-700">Belum ada tombol</p>
            <p class="text-xs text-slate-400 mt-1">Klik tombol "+ Tambah Tombol Baru" di atas untuk menambahkan link pertama Anda.</p>
          </div>
        </div>
      </div>

      <!-- TAB 2: PENGATURAN PROFIL & TEMA -->
      <div v-show="activeTab === 'profile'" class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-3xl">
        <h2 class="text-lg font-bold text-slate-900 mb-1">Pengaturan Profil & Tema Tampilan</h2>
        <p class="text-xs text-slate-500 mb-6">Sesuaikan identitas unit, warna tema, serta tautan media sosial</p>

        <form @submit.prevent="saveProfileSettings" class="space-y-6">
          <!-- Nama Unit -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nama Unit / Judul Portal</label>
            <input
              v-model="profileForm.name"
              type="text"
              placeholder="Contoh: Unit Inovasi & Layanan Digital"
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              required
            />
          </div>

          <!-- Bio / Keterangan -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bio / Deskripsi Singkat</label>
            <textarea
              v-model="profileForm.bio"
              rows="3"
              placeholder="Deskripsi singkat tentang unit Anda..."
              class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            ></textarea>
          </div>

          <!-- URL Avatar / Logo -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">URL Foto Profil / Logo Unit</label>
            <div class="flex items-center gap-3">
              <img
                :src="profileForm.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Unit'"
                class="w-12 h-12 rounded-full border border-slate-200 bg-slate-50 object-cover shrink-0"
              />
              <input
                v-model="profileForm.avatarUrl"
                type="text"
                placeholder="https://..."
                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <!-- Pilihan Tema Warna -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Pilihan Tema Warna</label>
            <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div
                v-for="(t, key) in themeOptions"
                :key="key"
                @click="profileForm.theme = key"
                :class="[
                  'cursor-pointer p-3 rounded-2xl border-2 text-center transition-all flex flex-col items-center gap-2',
                  profileForm.theme === key ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                ]"
              >
                <div :class="['w-8 h-8 rounded-full shadow-inner', t.colorClass]"></div>
                <span class="text-xs font-bold text-slate-800">{{ t.label }}</span>
              </div>
            </div>
          </div>

          <!-- Social Links -->
          <div class="border-t border-slate-100 pt-6 space-y-4">
            <h3 class="text-sm font-bold text-slate-900">Tautan Media Sosial & Kontak</h3>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">WhatsApp (URL / wa.me)</label>
                <input
                  v-model="profileForm.socials.whatsapp"
                  type="text"
                  placeholder="https://wa.me/6281234567890"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Instagram URL</label>
                <input
                  v-model="profileForm.socials.instagram"
                  type="text"
                  placeholder="https://instagram.com/akununit"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Website Resmi</label>
                <input
                  v-model="profileForm.socials.website"
                  type="text"
                  placeholder="https://unit.instansi.id"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-600 mb-1">Alamat Email</label>
                <input
                  v-model="profileForm.socials.email"
                  type="email"
                  placeholder="kontak@instansi.id"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div class="sm:col-span-2">
                <label class="block text-xs font-medium text-slate-600 mb-1">YouTube Channel URL</label>
                <input
                  v-model="profileForm.socials.youtube"
                  type="text"
                  placeholder="https://youtube.com/@unitkami"
                  class="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4 flex justify-end">
            <button
              type="submit"
              :disabled="savingProfile"
              class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center gap-2 disabled:opacity-50"
            >
              <span v-if="savingProfile" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ savingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- TAB 3: STATUS DATABASE & SPREADSHEET -->
      <div v-show="activeTab === 'database'" class="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm max-w-3xl space-y-6">
        <div>
          <h2 class="text-lg font-bold text-slate-900 mb-1">Status Database & Integrasi Spreadsheet</h2>
          <p class="text-xs text-slate-500">Informasi penyimpanan data yang sedang aktif pada sistem ini.</p>
        </div>

        <!-- Current Status Banner -->
        <div class="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3.5">
          <div class="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <DynamicIcon name="FileText" :size="18" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-indigo-950">Mode Penyimpanan: Penyimpanan Lokal Cepat (data.json)</h4>
            <p class="text-xs text-indigo-800/80 mt-1 leading-relaxed">
              Sistem saat ini otomatis menyimpan semua tombol dan profil ke dalam file JSON lokal. Sistem sudah siap 100% dan dapat langsung digunakan tanpa kendala!
            </p>
          </div>
        </div>

        <!-- Panduan Google Sheets -->
        <div class="border border-slate-200 rounded-2xl p-5 space-y-4">
          <h3 class="text-sm font-bold text-slate-900">Kapan & Bagaimana Menghubungkan ke Google Sheets?</h3>
          <p class="text-xs text-slate-600 leading-relaxed">
            Jika unit Anda ingin agar data tombol bisa dilihat atau diedit juga lewat Google Spreadsheet, Anda cukup mengisi 3 baris variabel di file <code class="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-mono">.env</code>:
          </p>

          <ol class="list-decimal list-inside text-xs text-slate-700 space-y-2 pl-1 leading-relaxed">
            <li>
              <span class="font-bold">GOOGLE_SHEET_ID:</span> ID spreadsheet dari URL Google Sheet Anda.
            </li>
            <li>
              <span class="font-bold">GOOGLE_SERVICE_ACCOUNT_EMAIL:</span> Email service account dari Google Cloud Console.
            </li>
            <li>
              <span class="font-bold">GOOGLE_PRIVATE_KEY:</span> Private key dari file JSON Service Account.
            </li>
          </ol>

          <div class="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            # Di file .env:<br>
            GOOGLE_SHEET_ID=1abc...xyz<br>
            GOOGLE_SERVICE_ACCOUNT_EMAIL=unit-portal@project.iam.gserviceaccount.com<br>
            GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
          </div>

          <p class="text-[11px] text-slate-500">
            Begitu ketiga variabel tersebut diisi, sistem akan otomatis beralih menggunakan Google Spreadsheet tanpa perlu mengubah kode apapun.
          </p>
        </div>
      </div>
    </main>

    <!-- MODAL: TAMBAH / EDIT TOMBOL -->
    <div
      v-if="modal.show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div class="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 sm:p-7 space-y-5">
        <div class="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 class="text-base font-bold text-slate-900">
            {{ modal.isEdit ? 'Edit Tombol Tautan' : 'Tambah Tombol Baru' }}
          </h3>
          <button @click="modal.show = false" class="text-slate-400 hover:text-slate-600 p-1">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="submitLinkModal" class="space-y-4">
          <!-- Judul -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Judul Tombol</label>
            <input
              v-model="modal.form.title"
              type="text"
              placeholder="Contoh: Formulir Pendaftaran Kegiatan"
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <!-- URL -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">URL Tujuan Link</label>
            <input
              v-model="modal.form.url"
              type="url"
              placeholder="https://..."
              class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              required
            />
          </div>

          <!-- Icon Selector -->
          <div>
            <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Pilihan Ikon</label>
            <div class="grid grid-cols-6 gap-2">
              <button
                v-for="icon in availableIcons"
                :key="icon"
                type="button"
                @click="modal.form.icon = icon"
                :class="[
                  'p-2.5 rounded-xl border flex items-center justify-center transition',
                  modal.form.icon === icon
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/30'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                ]"
                :title="icon"
              >
                <DynamicIcon :name="icon" :size="18" />
              </button>
            </div>
          </div>

          <!-- Toggles -->
          <div class="space-y-3 pt-2">
            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="modal.form.isActive"
                type="checkbox"
                class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span class="text-sm font-medium text-slate-700">Tampilkan tombol ini (Aktif)</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer">
              <input
                v-model="modal.form.isFeatured"
                type="checkbox"
                class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span class="text-sm font-medium text-slate-700">Tombol Unggulan (Efek sorot khusus)</span>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              @click="modal.show = false"
              class="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="modal.saving"
              class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition flex items-center gap-2"
            >
              <span v-if="modal.saving" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>{{ modal.saving ? 'Menyimpan...' : 'Simpan Tombol' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import Sortable from 'sortablejs'

interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
  isActive: boolean
  order: number
  isFeatured?: boolean
}

const activeTab = ref<'links' | 'profile' | 'database'>('links')
const links = ref<LinkItem[]>([])
const sortableListRef = ref<HTMLElement | null>(null)
let sortableInstance: Sortable | null = null

const availableIcons = [
  'Globe',
  'FileText',
  'MessageCircle',
  'Download',
  'Calendar',
  'HelpCircle',
  'Video',
  'BookOpen',
  'Link',
  'Phone',
  'Mail',
  'Star'
]

const themeOptions = {
  indigo: { label: 'Indigo Purple', colorClass: 'bg-indigo-600' },
  emerald: { label: 'Emerald Mint', colorClass: 'bg-emerald-600' },
  sunset: { label: 'Sunset Glow', colorClass: 'bg-rose-600' },
  ocean: { label: 'Ocean Blue', colorClass: 'bg-cyan-600' },
  midnight: { label: 'Midnight Dark', colorClass: 'bg-slate-900' }
}

const profileForm = reactive({
  name: '',
  bio: '',
  avatarUrl: '',
  theme: 'indigo',
  socials: {
    whatsapp: '',
    instagram: '',
    website: '',
    email: '',
    youtube: ''
  }
})

const savingProfile = ref(false)

const toast = reactive({
  show: false,
  message: '',
  type: 'success'
})

function showToast(message: string, type: 'success' | 'error' = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => {
    toast.show = false
  }, 3000)
}

const modal = reactive({
  show: false,
  isEdit: false,
  saving: false,
  editId: '',
  form: {
    title: '',
    url: '',
    icon: 'Globe',
    isActive: true,
    isFeatured: false
  }
})

async function fetchAdminData() {
  try {
    const res = await $fetch<{ profile: any; links: LinkItem[] }>('/api/admin/data')
    if (res) {
      links.value = res.links
      profileForm.name = res.profile.name || ''
      profileForm.bio = res.profile.bio || ''
      profileForm.avatarUrl = res.profile.avatarUrl || ''
      profileForm.theme = res.profile.theme || 'indigo'
      profileForm.socials = {
        whatsapp: res.profile.socials?.whatsapp || '',
        instagram: res.profile.socials?.instagram || '',
        website: res.profile.socials?.website || '',
        email: res.profile.socials?.email || '',
        youtube: res.profile.socials?.youtube || ''
      }
    }
  } catch (err: any) {
    if (err?.statusCode === 401) {
      await navigateTo('/login')
    } else {
      showToast('Gagal memuat data admin', 'error')
    }
  }
}

function initSortable() {
  if (sortableInstance) {
    sortableInstance.destroy()
  }

  if (sortableListRef.value) {
    sortableInstance = new Sortable(sortableListRef.value, {
      handle: '.drag-handle',
      animation: 200,
      ghostClass: 'bg-indigo-50/70',
      onEnd: async () => {
        const orderedIds: string[] = []
        const elements = sortableListRef.value?.querySelectorAll('[data-id]')
        elements?.forEach((el) => {
          const id = el.getAttribute('data-id')
          if (id) orderedIds.push(id)
        })

        try {
          await $fetch('/api/admin/links/reorder', {
            method: 'POST',
            body: { orderedIds }
          })
          showToast('Urutan tombol berhasil diperbarui!')
        } catch {
          showToast('Gagal menyimpan urutan tombol', 'error')
          fetchAdminData()
        }
      }
    })
  }
}

function openAddModal() {
  modal.isEdit = false
  modal.editId = ''
  modal.form = {
    title: '',
    url: '',
    icon: 'Globe',
    isActive: true,
    isFeatured: false
  }
  modal.show = true
}

function openEditModal(link: LinkItem) {
  modal.isEdit = true
  modal.editId = link.id
  modal.form = {
    title: link.title,
    url: link.url,
    icon: link.icon || 'Globe',
    isActive: link.isActive,
    isFeatured: Boolean(link.isFeatured)
  }
  modal.show = true
}

async function submitLinkModal() {
  modal.saving = true
  try {
    if (modal.isEdit) {
      await $fetch(`/api/admin/links/${modal.editId}`, {
        method: 'PUT',
        body: modal.form
      })
      showToast('Tombol berhasil diperbarui!')
    } else {
      await $fetch('/api/admin/links', {
        method: 'POST',
        body: modal.form
      })
      showToast('Tombol baru berhasil ditambahkan!')
    }
    modal.show = false
    await fetchAdminData()
    await nextTick()
    initSortable()
  } catch (err: any) {
    showToast(err?.data?.statusMessage || 'Gagal menyimpan tombol', 'error')
  } finally {
    modal.saving = false
  }
}

async function toggleActive(link: LinkItem) {
  const newStatus = !link.isActive
  link.isActive = newStatus
  try {
    await $fetch(`/api/admin/links/${link.id}`, {
      method: 'PUT',
      body: { isActive: newStatus }
    })
    showToast(`Tombol "${link.title}" kini ${newStatus ? 'Aktif' : 'Nonaktif'}`)
  } catch {
    link.isActive = !newStatus
    showToast('Gagal mengubah status tombol', 'error')
  }
}

async function confirmDelete(link: LinkItem) {
  if (confirm(`Apakah Anda yakin ingin menghapus tombol "${link.title}"?`)) {
    try {
      await $fetch(`/api/admin/links/${link.id}`, {
        method: 'DELETE'
      })
      showToast('Tombol berhasil dihapus')
      await fetchAdminData()
      await nextTick()
      initSortable()
    } catch {
      showToast('Gagal menghapus tombol', 'error')
    }
  }
}

async function saveProfileSettings() {
  savingProfile.value = true
  try {
    await $fetch('/api/admin/profile', {
      method: 'POST',
      body: profileForm
    })
    showToast('Pengaturan profil dan tema berhasil disimpan!')
  } catch (err: any) {
    showToast(err?.data?.statusMessage || 'Gagal menyimpan profil', 'error')
  } finally {
    savingProfile.value = false
  }
}

async function handleLogout() {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    await navigateTo('/login')
  } catch {
    await navigateTo('/login')
  }
}

onMounted(async () => {
  await fetchAdminData()
  await nextTick()
  initSortable()
})
</script>
