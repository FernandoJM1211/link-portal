<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Portal, PortalDetail, PortalSummary } from '~~/shared/types/portal'

definePageMeta({ layout: 'admin' })
useHead({ title: 'Daftar Portal' })

type Tab = 'portals' | 'database'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const copyText = useCopyText()
const { getPortalUrl, getPortalUrlLabel } = usePortalUrl()

const activeTab = computed<Tab>({
  get: () => (route.query.tab === 'database' ? 'database' : 'portals'),
  set: (tab) => router.replace({ query: tab === 'portals' ? {} : { tab } }),
})

const {
  data: portalsResponse,
  status: fetchStatus,
  error: fetchError,
  refresh,
} = await useFetch<{ success: boolean, data: PortalSummary[] }>('/api/admin/portals')

const portals = ref<PortalSummary[]>([])
watch(portalsResponse, (response) => {
  portals.value = response?.data ?? []
}, { immediate: true })

const search = ref('')
const filteredPortals = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return portals.value
  return portals.value.filter((portal) => (
    portal.name.toLowerCase().includes(keyword) || portal.code.includes(keyword)
  ))
})

const activeCount = computed(() => portals.value.filter((portal) => portal.is_active).length)

// Modal
const isCreateOpen = ref(false)
const isDuplicateOpen = ref(false)
const isDeleteOpen = ref(false)
const selectedPortal = ref<PortalSummary | null>(null)

function openDuplicate(portal: PortalSummary) {
  selectedPortal.value = portal
  isDuplicateOpen.value = true
}

function openDelete(portal: PortalSummary) {
  selectedPortal.value = portal
  isDeleteOpen.value = true
}

function onCreated(portal: Portal) {
  navigateTo(`/admin/portals/${portal.portal_id}`)
}

function onDuplicated(portal: PortalDetail) {
  navigateTo(`/admin/portals/${portal.portal_id}`)
}

function onDeleted(portalId: string) {
  portals.value = portals.value.filter((portal) => portal.portal_id !== portalId)
}

// Aktif / nonaktif langsung dari daftar
const busyPortalIds = ref(new Set<string>())

async function setActive(portal: PortalSummary, isActive: boolean) {
  busyPortalIds.value = new Set(busyPortalIds.value).add(portal.portal_id)

  try {
    const response = await $fetch<{ data: Portal, message: string }>(`/api/admin/portals/${portal.portal_id}/status`, {
      method: 'PATCH',
      body: { isActive },
    })
    portals.value = portals.value.map((item) => (
      item.portal_id === portal.portal_id ? { ...item, is_active: response.data.is_active } : item
    ))
    toast.add({ title: response.message, color: 'success', icon: 'i-lucide-circle-check' })
  } catch (error) {
    toast.add({
      title: 'Status gagal diubah',
      description: getApiErrorMessage(error, 'Terjadi kesalahan. Silakan coba lagi.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    const next = new Set(busyPortalIds.value)
    next.delete(portal.portal_id)
    busyPortalIds.value = next
  }
}

function getMenuItems(portal: PortalSummary): DropdownMenuItem[][] {
  return [
    [
      {
        label: 'Buka halaman publik',
        icon: 'i-lucide-external-link',
        disabled: !portal.is_active,
        onSelect: () => window.open(getPortalUrl(portal.code), '_blank', 'noopener'),
      },
      {
        label: 'Salin link portal',
        icon: 'i-lucide-copy',
        onSelect: () => copyText(getPortalUrl(portal.code)),
      },
      {
        label: 'Duplikat portal',
        icon: 'i-lucide-files',
        onSelect: () => openDuplicate(portal),
      },
    ],
    [
      {
        label: 'Hapus permanen',
        icon: 'i-lucide-trash-2',
        color: 'error',
        onSelect: () => openDelete(portal),
      },
    ],
  ]
}

function tabClass(tab: Tab) {
  return activeTab.value === tab
    ? 'border-indigo-600 text-indigo-600'
    : 'border-transparent text-slate-500 hover:text-slate-800'
}
</script>

<template>
  <div>
    <!-- Tab -->
    <div class="mb-8 flex gap-2 overflow-x-auto border-b border-slate-200 pb-1 sm:gap-6" role="tablist">
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'portals'"
        class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition-all"
        :class="tabClass('portals')"
        @click="activeTab = 'portals'"
      >
        <UIcon name="i-lucide-layout-grid" class="size-[18px]" />
        Daftar Portal ({{ portals.length }})
      </button>
      <button
        type="button"
        role="tab"
        :aria-selected="activeTab === 'database'"
        class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition-all"
        :class="tabClass('database')"
        @click="activeTab = 'database'"
      >
        <UIcon name="i-lucide-sheet" class="size-[18px]" />
        Status Database
      </button>
    </div>

    <!-- TAB: DAFTAR PORTAL -->
    <div v-if="activeTab === 'portals'" class="space-y-6">
      <div class="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <h2 class="text-base font-bold text-slate-900">
            Semua Link Portal
          </h2>
          <p class="mt-0.5 text-xs text-slate-500">
            {{ portals.length }} portal · {{ activeCount }} aktif. 💡 Klik "Kelola" untuk mengatur tombol dan tampilan portal.
          </p>
        </div>

        <button type="button" :class="primaryButtonClass" @click="isCreateOpen = true">
          <UIcon name="i-lucide-plus" class="size-4" />
          Buat Portal Baru
        </button>
      </div>

      <!-- Pencarian -->
      <div v-if="portals.length > 3" class="relative max-w-sm">
        <UIcon name="i-lucide-search" class="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          v-model="search"
          type="search"
          placeholder="Cari nama atau kode portal..."
          aria-label="Cari portal"
          class="pl-10"
          :class="inputClass"
        >
      </div>

      <!-- Memuat -->
      <div v-if="fetchStatus === 'pending' && portals.length === 0" class="grid gap-4 sm:grid-cols-2">
        <div v-for="i in 4" :key="i" class="h-40 animate-pulse rounded-2xl bg-white" />
      </div>

      <!-- Gagal -->
      <div v-else-if="fetchError && portals.length === 0" class="flex flex-col items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 sm:flex-row sm:items-center">
        <UIcon name="i-lucide-circle-alert" class="size-6 shrink-0 text-rose-500" />
        <p class="flex-1 text-sm text-rose-700">
          {{ getApiErrorMessage(fetchError, 'Daftar portal gagal dimuat.') }}
        </p>
        <button type="button" :class="secondaryButtonClass" @click="refresh()">
          <UIcon name="i-lucide-refresh-cw" class="size-4" />
          Muat Ulang
        </button>
      </div>

      <!-- Kosong -->
      <div v-else-if="portals.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <div class="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <UIcon name="i-lucide-link" class="size-7" />
        </div>
        <p class="font-bold text-slate-700">
          Belum ada portal
        </p>
        <p class="mx-auto mt-1 max-w-sm text-xs text-slate-400">
          Buat portal pertama Anda, lalu tambahkan tombol link dan atur tampilannya.
        </p>
        <button type="button" class="mt-5" :class="primaryButtonClass" @click="isCreateOpen = true">
          <UIcon name="i-lucide-plus" class="size-4" />
          Buat Portal Pertama
        </button>
      </div>

      <p v-else-if="filteredPortals.length === 0" class="py-10 text-center text-sm text-slate-500">
        Tidak ada portal yang cocok dengan "{{ search }}".
      </p>

      <!-- Daftar -->
      <div v-else class="grid gap-4 sm:grid-cols-2">
        <div
          v-for="portal in filteredPortals"
          :key="portal.portal_id"
          class="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:border-slate-300"
        >
          <div class="flex items-start gap-3.5">
            <div
              class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-extrabold text-white shadow-inner"
              :class="getPortalTheme(portal.theme).swatch"
            >
              <img
                v-if="portal.avatar_url"
                :src="portal.avatar_url"
                :alt="`Logo ${portal.name}`"
                class="size-full bg-white object-cover"
                referrerpolicy="no-referrer"
              >
              <span v-else>{{ portal.name.charAt(0).toUpperCase() }}</span>
            </div>

            <div class="min-w-0 flex-1">
              <div class="flex items-start justify-between gap-2">
                <h3 class="truncate text-base font-bold text-slate-900" :title="portal.name">
                  {{ portal.name }}
                </h3>
                <span
                  class="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold"
                  :class="portal.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                >
                  {{ portal.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </div>

              <button
                type="button"
                class="mt-0.5 flex max-w-full items-center gap-1 text-xs text-slate-500 transition hover:text-indigo-600"
                title="Salin link portal"
                @click="copyText(getPortalUrl(portal.code))"
              >
                <span class="truncate font-mono">{{ getPortalUrlLabel(portal.code) }}</span>
                <UIcon name="i-lucide-copy" class="size-3.5 shrink-0" />
              </button>

              <p class="mt-2 text-xs text-slate-500">
                <UIcon name="i-lucide-link" class="inline size-3.5 align-text-bottom" />
                {{ portal.link_count }} tombol
                <span v-if="portal.link_count !== portal.active_link_count" class="text-slate-400">
                  ({{ portal.active_link_count }} tampil)
                </span>
              </p>
            </div>
          </div>

          <div class="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <label class="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <BaseToggleSwitch
                :model-value="portal.is_active"
                :label="portal.is_active ? `Nonaktifkan portal ${portal.name}` : `Aktifkan portal ${portal.name}`"
                :disabled="busyPortalIds.has(portal.portal_id)"
                @update:model-value="setActive(portal, $event)"
              />
              Tampilkan ke publik
            </label>

            <div class="flex items-center gap-2">
              <UDropdownMenu :items="getMenuItems(portal)" :content="{ align: 'end' }">
                <button
                  type="button"
                  class="flex rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                  aria-label="Menu lainnya"
                  title="Menu lainnya"
                >
                  <UIcon name="i-lucide-ellipsis-vertical" class="size-4" />
                </button>
              </UDropdownMenu>

              <NuxtLink
                :to="`/admin/portals/${portal.portal_id}`"
                class="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-700"
              >
                <UIcon name="i-lucide-settings-2" class="size-4" />
                Kelola
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: STATUS DATABASE -->
    <AdminDatabaseStatusCard v-else />

    <PortalCreatePortalModal v-model:open="isCreateOpen" @created="onCreated" />
    <PortalDuplicatePortalModal v-model:open="isDuplicateOpen" :source="selectedPortal" @duplicated="onDuplicated" />
    <PortalDeletePortalModal v-model:open="isDeleteOpen" :portal="selectedPortal" @deleted="onDeleted" />
  </div>
</template>
