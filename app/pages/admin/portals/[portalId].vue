<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { Link, Portal, PortalDetail } from '~~/shared/types/portal'

definePageMeta({ layout: 'admin' })

type Tab = 'links' | 'profile'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const copyText = useCopyText()
const { getPortalUrl, getPortalUrlLabel } = usePortalUrl()

const portalId = computed(() => String(route.params.portalId))

const {
  data: detailResponse,
  status: fetchStatus,
  error: fetchError,
  refresh,
} = await useFetch<{ success: boolean, data: PortalDetail }>(() => `/api/admin/portals/${portalId.value}`)

const portal = ref<Portal | null>(null)
const links = ref<Link[]>([])
const draft = ref<PortalDraft | null>(null)

watch(detailResponse, (response) => {
  if (!response?.data) return
  const { links: portalLinks, ...portalData } = response.data
  portal.value = portalData
  links.value = portalLinks
  draft.value = toPortalDraft(portalData)
}, { immediate: true })

useHead(() => ({ title: portal.value ? `Kelola ${portal.value.name}` : 'Kelola Portal' }))

const isNotFound = computed(() => fetchError.value?.statusCode === 404)

const activeTab = computed<Tab>({
  get: () => (route.query.tab === 'profile' ? 'profile' : 'links'),
  set: (tab) => router.replace({ query: tab === 'links' ? {} : { tab } }),
})

function tabClass(tab: Tab) {
  return activeTab.value === tab
    ? 'border-indigo-600 text-indigo-600'
    : 'border-transparent text-slate-500 hover:text-slate-800'
}

const previewPortal = computed(() => (draft.value ? toPreviewPortal(draft.value, links.value) : null))
const activeLinkCount = computed(() => links.value.filter((link) => link.is_active).length)
const isProfileDirty = computed(() => (
  !!portal.value && !!draft.value && !isSameDraft(draft.value, toPortalDraft(portal.value))
))

function onProfileSaved(saved: Portal) {
  portal.value = saved
}

// Peringatan bila meninggalkan halaman dengan perubahan profil yang belum disimpan.
onBeforeRouteLeave(() => {
  if (isProfileDirty.value && !window.confirm('Perubahan profil belum disimpan. Tetap tinggalkan halaman?')) {
    return false
  }
})

// Status aktif
const isUpdatingStatus = ref(false)

async function setActive(isActive: boolean) {
  if (!portal.value || isUpdatingStatus.value) return

  isUpdatingStatus.value = true

  try {
    const response = await $fetch<{ data: Portal, message: string }>(`/api/admin/portals/${portal.value.portal_id}/status`, {
      method: 'PATCH',
      body: { isActive },
    })
    portal.value = { ...portal.value, is_active: response.data.is_active, updated_at: response.data.updated_at }
    toast.add({ title: response.message, color: 'success', icon: 'i-lucide-circle-check' })
  } catch (error) {
    toast.add({
      title: 'Status gagal diubah',
      description: getApiErrorMessage(error, 'Terjadi kesalahan. Silakan coba lagi.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    isUpdatingStatus.value = false
  }
}

// Duplikat & hapus
const isDuplicateOpen = ref(false)
const isDeleteOpen = ref(false)

function onDuplicated(copy: PortalDetail) {
  navigateTo(`/admin/portals/${copy.portal_id}`)
}

function onDeleted() {
  // Tidak perlu peringatan "belum disimpan" karena portal sudah tidak ada.
  if (portal.value && draft.value) draft.value = toPortalDraft(portal.value)
  navigateTo('/admin')
}

const menuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Salin link portal',
      icon: 'i-lucide-copy',
      onSelect: () => portal.value && copyText(getPortalUrl(portal.value.code)),
    },
    {
      label: 'Duplikat portal',
      icon: 'i-lucide-files',
      onSelect: () => {
        isDuplicateOpen.value = true
      },
    },
  ],
  [
    {
      label: 'Hapus permanen',
      icon: 'i-lucide-trash-2',
      color: 'error',
      onSelect: () => {
        isDeleteOpen.value = true
      },
    },
  ],
])

// Pratinjau di layar kecil
const isPreviewOpen = ref(false)
</script>

<template>
  <div>
    <!-- Memuat -->
    <div v-if="fetchStatus === 'pending' && !portal" class="space-y-4">
      <div class="h-28 animate-pulse rounded-2xl bg-white" />
      <div class="h-14 animate-pulse rounded-2xl bg-white" />
      <div class="h-14 animate-pulse rounded-2xl bg-white" />
    </div>

    <!-- Tidak ditemukan / gagal -->
    <div v-else-if="!portal" class="mx-auto max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
      <div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <UIcon :name="isNotFound ? 'i-lucide-link-2-off' : 'i-lucide-circle-alert'" class="size-7" />
      </div>
      <h2 class="text-lg font-bold text-slate-900">
        {{ isNotFound ? 'Portal tidak ditemukan' : 'Portal gagal dimuat' }}
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        {{ isNotFound
          ? 'Portal ini mungkin sudah dihapus.'
          : getApiErrorMessage(fetchError, 'Terjadi kesalahan. Silakan coba lagi.') }}
      </p>
      <div class="mt-6 flex justify-center gap-2.5">
        <NuxtLink to="/admin" :class="secondaryButtonClass">
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          Semua Portal
        </NuxtLink>
        <button v-if="!isNotFound" type="button" :class="primaryButtonClass" @click="refresh()">
          Muat Ulang
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Kepala portal -->
      <div class="mb-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <NuxtLink to="/admin" class="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800">
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          Semua Portal
        </NuxtLink>

        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex min-w-0 items-center gap-3.5">
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
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <h1 class="truncate text-lg font-bold text-slate-900">
                  {{ portal.name }}
                </h1>
                <span
                  class="rounded-full px-2.5 py-1 text-[11px] font-bold"
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
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-2.5">
            <label class="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
              <BaseToggleSwitch
                :model-value="portal.is_active"
                :label="portal.is_active ? 'Nonaktifkan portal' : 'Aktifkan portal'"
                :disabled="isUpdatingStatus"
                @update:model-value="setActive"
              />
              Tampilkan ke publik
            </label>

            <a
              v-if="portal.is_active"
              :href="getPortalUrl(portal.code)"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <UIcon name="i-lucide-external-link" class="size-4" />
              Lihat Halaman Publik
            </a>

            <UDropdownMenu :items="menuItems" :content="{ align: 'end' }">
              <button
                type="button"
                class="flex rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
                aria-label="Menu lainnya"
                title="Menu lainnya"
              >
                <UIcon name="i-lucide-ellipsis-vertical" class="size-4" />
              </button>
            </UDropdownMenu>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <!-- Kolom kiri: tab -->
        <div class="min-w-0">
          <div class="mb-6 border-b border-slate-200">
            <div class="flex gap-4 overflow-x-auto pb-1 sm:gap-6" role="tablist">
              <button
                type="button"
                role="tab"
                :aria-selected="activeTab === 'links'"
                class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition-all"
                :class="tabClass('links')"
                @click="activeTab = 'links'"
              >
                <UIcon name="i-lucide-link" class="size-[18px]" />
                <span class="hidden sm:inline">Kelola</span> Tombol ({{ links.length }})
              </button>
              <button
                type="button"
                role="tab"
                :aria-selected="activeTab === 'profile'"
                class="flex items-center gap-2 whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-semibold transition-all"
                :class="tabClass('profile')"
                @click="activeTab = 'profile'"
              >
                <UIcon name="i-lucide-palette" class="size-[18px]" />
                <span class="hidden sm:inline">Profil &</span> Tampilan
                <span v-if="isProfileDirty" class="size-2 rounded-full bg-amber-500" title="Belum disimpan" />
              </button>
            </div>
          </div>

          <!-- Tombol pratinjau melayang (layar kecil) -->
          <button
            type="button"
            class="fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 lg:hidden"
            @click="isPreviewOpen = true"
          >
            <UIcon name="i-lucide-smartphone" class="size-4" />
            Pratinjau
          </button>

          <!-- v-show agar isian form tidak hilang saat berpindah tab -->
          <div v-show="activeTab === 'links'">
            <PortalLinkManager v-model:links="links" :portal-id="portal.portal_id" />
          </div>
          <div v-show="activeTab === 'profile'">
            <PortalProfileForm v-if="draft" v-model:draft="draft" :portal="portal" @saved="onProfileSaved" />
          </div>
        </div>

        <!-- Kolom kanan: pratinjau (desktop) -->
        <aside class="hidden lg:block">
          <div class="sticky top-24">
            <p class="mb-3 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span class="flex items-center gap-1.5">
                <UIcon name="i-lucide-smartphone" class="size-4" />
                Pratinjau langsung
              </span>
              <span class="font-normal text-slate-400">{{ activeLinkCount }} tombol tampil</span>
            </p>
            <div class="h-[640px] overflow-hidden rounded-[2.5rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
              <div class="h-full overflow-y-auto rounded-[1.8rem]">
                <PortalView v-if="previewPortal" :portal="previewPortal" preview />
              </div>
            </div>
            <p v-if="isProfileDirty" class="mt-3 text-center text-[11px] text-amber-600">
              Pratinjau menampilkan perubahan yang belum disimpan.
            </p>
          </div>
        </aside>
      </div>

      <!-- Pratinjau (layar kecil) -->
      <BaseModal v-model:open="isPreviewOpen" title="Pratinjau Portal" description="Tampilan halaman publik portal ini.">
        <div class="h-[65vh] overflow-hidden rounded-3xl border-[6px] border-slate-900 bg-slate-900">
          <div class="h-full overflow-y-auto rounded-2xl">
            <PortalView v-if="previewPortal" :portal="previewPortal" preview />
          </div>
        </div>
      </BaseModal>

      <PortalDuplicatePortalModal v-model:open="isDuplicateOpen" :source="portal" @duplicated="onDuplicated" />
      <PortalDeletePortalModal
        v-model:open="isDeleteOpen"
        :portal="{ ...portal, link_count: links.length }"
        @deleted="onDeleted"
      />
    </template>
  </div>
</template>
