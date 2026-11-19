<script setup lang="ts">
definePageMeta({ layout: 'admin' })
useHead({ title: 'Dashboard' })

type SheetStatus = {
  name: string
  exists: boolean
  headerMatches: boolean
  expectedHeaders: string[]
  actualHeaders: string[]
  rowCount: number
}

type DatabaseStatus = {
  configured: boolean
  connected: boolean
  spreadsheetTitle: string
  sheets: SheetStatus[]
  ok: boolean
  error: string
}

const SHEET_LABELS: Record<string, string> = {
  portals: 'portal',
  links: 'tombol link',
}

const { admin } = await useAdminSession()

const {
  data: statusResponse,
  status: fetchStatus,
  error: fetchError,
  refresh,
} = await useFetch<{ success: boolean, data: DatabaseStatus }>('/api/admin/database-status', {
  lazy: true,
})

const databaseStatus = computed(() => statusResponse.value?.data ?? null)
const isLoading = computed(() => fetchStatus.value === 'pending')

function getSheetBadge(sheet: SheetStatus): { label: string, classes: string } {
  if (!sheet.exists) return { label: 'Belum dibuat', classes: 'bg-rose-100 text-rose-700' }
  if (!sheet.headerMatches) return { label: 'Kolom tidak sesuai', classes: 'bg-amber-100 text-amber-800' }
  return { label: 'Siap', classes: 'bg-emerald-100 text-emerald-700' }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Sapaan -->
    <div class="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 class="text-base font-bold text-slate-900">
        Halo, {{ admin?.username || 'Admin' }} 👋
      </h2>
      <p class="mt-0.5 text-xs text-slate-500">
        Dari sini Anda akan membuat portal baru, mengatur tampilannya, dan menyusun tombol link setiap portal.
      </p>
    </div>

    <!-- Status database -->
    <div class="max-w-3xl space-y-6 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="mb-1 text-lg font-bold text-slate-900">
            Status Database
          </h2>
          <p class="text-xs text-slate-500">
            Koneksi ke Google Spreadsheet dan kesesuaian kolom setiap sheet.
          </p>
        </div>

        <button
          type="button"
          class="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
          :disabled="isLoading"
          @click="refresh()"
        >
          <UIcon name="i-lucide-refresh-cw" class="size-4" :class="{ 'animate-spin': isLoading }" />
          Periksa Ulang
        </button>
      </div>

      <!-- Memuat -->
      <div v-if="isLoading && !databaseStatus" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-14 animate-pulse rounded-2xl bg-slate-100" />
      </div>

      <!-- Gagal memuat -->
      <div v-else-if="fetchError && !databaseStatus" class="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <UIcon name="i-lucide-circle-alert" class="mt-0.5 size-5 shrink-0 text-rose-500" />
        <p class="text-sm text-rose-700">
          {{ getApiErrorMessage(fetchError, 'Status database gagal dimuat.') }}
        </p>
      </div>

      <template v-else-if="databaseStatus">
        <!-- Banner koneksi -->
        <div
          v-if="!databaseStatus.connected"
          class="flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50 p-4"
        >
          <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
            <UIcon name="i-lucide-unplug" class="size-[18px]" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-rose-950">
              Belum terhubung ke Google Spreadsheet
            </h4>
            <p class="mt-1 text-xs leading-relaxed text-rose-800/80">
              {{ databaseStatus.error }}
            </p>
          </div>
        </div>

        <div
          v-else
          class="flex items-start gap-3.5 rounded-2xl border p-4"
          :class="databaseStatus.ok ? 'border-indigo-100 bg-indigo-50' : 'border-amber-200 bg-amber-50'"
        >
          <div
            class="flex size-8 shrink-0 items-center justify-center rounded-xl text-white"
            :class="databaseStatus.ok ? 'bg-indigo-600' : 'bg-amber-500'"
          >
            <UIcon name="i-lucide-sheet" class="size-[18px]" />
          </div>
          <div class="min-w-0">
            <h4 class="text-sm font-bold" :class="databaseStatus.ok ? 'text-indigo-950' : 'text-amber-950'">
              Terhubung ke "{{ databaseStatus.spreadsheetTitle }}"
            </h4>
            <p class="mt-1 text-xs leading-relaxed" :class="databaseStatus.ok ? 'text-indigo-800/80' : 'text-amber-800/80'">
              {{ databaseStatus.ok
                ? 'Semua sheet sudah siap dipakai. Data portal dan tombol link akan tersimpan langsung ke spreadsheet ini.'
                : 'Ada sheet yang belum dibuat atau kolomnya belum sesuai. Lihat rincian di bawah.' }}
            </p>
          </div>
        </div>

        <!-- Rincian per sheet -->
        <div v-if="databaseStatus.connected" class="space-y-3">
          <div
            v-for="sheet in databaseStatus.sheets"
            :key="sheet.name"
            class="rounded-2xl border border-slate-200/80 p-4"
          >
            <div class="flex items-center justify-between gap-4">
              <div class="flex min-w-0 items-center gap-3.5">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <UIcon name="i-lucide-table-2" class="size-5" />
                </div>
                <div class="min-w-0">
                  <h3 class="truncate font-mono text-sm font-bold text-slate-900">
                    {{ sheet.name }}
                  </h3>
                  <p class="text-xs text-slate-400">
                    {{ sheet.exists ? `${sheet.rowCount} data ${SHEET_LABELS[sheet.name] ?? ''}` : 'Sheet tidak ditemukan' }}
                  </p>
                </div>
              </div>
              <span
                class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                :class="getSheetBadge(sheet).classes"
              >
                {{ getSheetBadge(sheet).label }}
              </span>
            </div>

            <div v-if="sheet.exists && !sheet.headerMatches" class="mt-3 space-y-1 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600">
              <p>
                <span class="font-bold">Diharapkan:</span>
                <span class="break-words font-mono"> {{ sheet.expectedHeaders.join(', ') }}</span>
              </p>
              <p>
                <span class="font-bold">Ditemukan:</span>
                <span class="break-words font-mono"> {{ sheet.actualHeaders.join(', ') || '(kosong)' }}</span>
              </p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Info tahap pengembangan -->
    <p class="max-w-3xl text-xs text-slate-500">
      💡 Fitur <span class="font-semibold text-slate-700">Kelola Portal</span> sedang dikembangkan dan akan muncul di halaman ini setelah tahap berikutnya selesai.
    </p>
  </div>
</template>
