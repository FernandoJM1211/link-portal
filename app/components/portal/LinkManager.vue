<script setup lang="ts">
import type Sortable from 'sortablejs'
import type { Link } from '~~/shared/types/portal'

/**
 * Kelola tombol link satu portal: tambah, edit, hapus, aktif/nonaktif,
 * dan atur urutan dengan drag & drop (tersimpan otomatis).
 * `v-model:links` = daftar link portal (terurut).
 */
const links = defineModel<Link[]>('links', { required: true })

const props = defineProps<{
  portalId: string
}>()

const toast = useToast()

const listRef = ref<HTMLElement | null>(null)
let sortable: Sortable | null = null
const isSavingOrder = ref(false)
const busyLinkIds = ref(new Set<string>())

// Modal tambah/edit
const isFormOpen = ref(false)
const editingLink = ref<Link | null>(null)

// Modal hapus
const isDeleteOpen = ref(false)
const deletingLink = ref<Link | null>(null)
const isDeleting = ref(false)

function openAdd() {
  editingLink.value = null
  isFormOpen.value = true
}

function openEdit(link: Link) {
  editingLink.value = link
  isFormOpen.value = true
}

function openDelete(link: Link) {
  deletingLink.value = link
  isDeleteOpen.value = true
}

defineExpose({ openAdd })

function onSaved(saved: Link, isNew: boolean) {
  links.value = isNew
    ? [...links.value, saved]
    : links.value.map((link) => (link.link_id === saved.link_id ? saved : link))
}

function setBusy(linkId: string, busy: boolean) {
  const next = new Set(busyLinkIds.value)
  if (busy) next.add(linkId)
  else next.delete(linkId)
  busyLinkIds.value = next
}

/** Toggle aktif/unggulan langsung dari daftar (optimistis, dibatalkan bila gagal). */
async function updateFlag(link: Link, field: 'is_active' | 'is_featured', value: boolean) {
  const previous = link[field]
  links.value = links.value.map((item) => (item.link_id === link.link_id ? { ...item, [field]: value } : item))
  setBusy(link.link_id, true)

  try {
    const response = await $fetch<{ data: Link }>(`/api/admin/portals/${props.portalId}/links/${link.link_id}`, {
      method: 'PATCH',
      body: field === 'is_active' ? { isActive: value } : { isFeatured: value },
    })
    links.value = links.value.map((item) => (item.link_id === link.link_id ? response.data : item))
  } catch (error) {
    links.value = links.value.map((item) => (item.link_id === link.link_id ? { ...item, [field]: previous } : item))
    toast.add({
      title: 'Perubahan gagal disimpan',
      description: getApiErrorMessage(error, 'Terjadi kesalahan. Silakan coba lagi.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    setBusy(link.link_id, false)
  }
}

async function confirmDelete() {
  const link = deletingLink.value
  if (!link || isDeleting.value) return

  isDeleting.value = true

  try {
    await $fetch(`/api/admin/portals/${props.portalId}/links/${link.link_id}`, { method: 'DELETE' })
    links.value = links.value.filter((item) => item.link_id !== link.link_id)
    toast.add({ title: 'Tombol berhasil dihapus', color: 'success', icon: 'i-lucide-circle-check' })
    isDeleteOpen.value = false
  } catch (error) {
    toast.add({
      title: 'Tombol gagal dihapus',
      description: getApiErrorMessage(error, 'Terjadi kesalahan. Silakan coba lagi.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    isDeleting.value = false
  }
}

/** Simpan urutan baru; bila gagal, kembalikan urutan sebelumnya. */
async function saveOrder(newOrder: Link[], previousOrder: Link[]) {
  isSavingOrder.value = true
  sortable?.option('disabled', true)

  try {
    const response = await $fetch<{ data: Link[] }>(`/api/admin/portals/${props.portalId}/links/order`, {
      method: 'PUT',
      body: { linkIds: newOrder.map((link) => link.link_id) },
    })
    links.value = response.data
    toast.add({ title: 'Urutan tombol tersimpan', color: 'success', icon: 'i-lucide-circle-check' })
  } catch (error) {
    links.value = previousOrder
    toast.add({
      title: 'Urutan gagal disimpan',
      description: getApiErrorMessage(error, 'Terjadi kesalahan. Silakan coba lagi.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    isSavingOrder.value = false
    sortable?.option('disabled', false)
  }
}

onMounted(async () => {
  const { default: SortableJs } = await import('sortablejs')
  if (!listRef.value) return

  sortable = SortableJs.create(listRef.value, {
    handle: '.drag-handle',
    animation: 180,
    ghostClass: 'opacity-40',
    onEnd(event) {
      const { oldIndex, newIndex, item, from } = event
      if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) return

      // Kembalikan DOM ke posisi semula, biarkan Vue yang merender urutan baru.
      from.removeChild(item)
      from.insertBefore(item, from.children[oldIndex] ?? null)

      const previousOrder = [...links.value]
      const newOrder = [...previousOrder]
      const [moved] = newOrder.splice(oldIndex, 1)
      newOrder.splice(newIndex, 0, moved!)
      links.value = newOrder

      saveOrder(newOrder, previousOrder)
    },
  })
})

onBeforeUnmount(() => {
  sortable?.destroy()
  sortable = null
})
</script>

<template>
  <div class="space-y-6">
    <!-- Bar aksi -->
    <div class="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
      <div>
        <h2 class="text-base font-bold text-slate-900">
          Daftar Tombol Tautan
        </h2>
        <p class="mt-0.5 text-xs text-slate-500">
          💡 Geser ikon pegangan (⋮⋮) di sebelah kiri untuk mengatur ulang urutan tombol. Tersimpan otomatis.
        </p>
      </div>

      <button type="button" :class="primaryButtonClass" @click="openAdd">
        <UIcon name="i-lucide-plus" class="size-4" />
        Tambah Tombol Baru
      </button>
    </div>

    <p v-if="isSavingOrder" class="flex items-center gap-2 text-xs font-medium text-indigo-600">
      <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin" />
      Menyimpan urutan...
    </p>

    <!-- Daftar (wadah selalu dirender agar drag & drop siap) -->
    <div ref="listRef" class="space-y-3">
      <div
        v-for="link in links"
        :key="link.link_id"
        class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm transition hover:border-slate-300 sm:gap-4 sm:p-4"
        :class="{ 'opacity-60': !link.is_active }"
      >
        <div class="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3.5">
          <button
            type="button"
            class="drag-handle flex shrink-0 cursor-grab rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
            aria-label="Geser untuk mengubah urutan"
            title="Geser untuk mengubah urutan"
          >
            <UIcon name="i-lucide-grip-vertical" class="size-5" />
          </button>

          <div class="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
            <UIcon :name="toLucideIconName(link.icon)" class="size-5" />
          </div>

          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <UIcon
                v-if="link.is_featured"
                name="i-lucide-star"
                class="size-3.5 shrink-0 text-amber-500 sm:hidden"
                aria-label="Unggulan"
              />
              <h3 class="truncate text-sm font-bold text-slate-900" :title="link.title">
                {{ link.title }}
              </h3>
              <span
                v-if="link.is_featured"
                class="hidden shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-800 sm:inline"
              >
                Unggulan
              </span>
              <span
                v-if="!link.is_active"
                class="hidden shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500 sm:inline"
              >
                Disembunyikan
              </span>
            </div>
            <a
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="block truncate text-xs text-slate-400 transition hover:text-indigo-600"
            >
              {{ link.url }}
            </a>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <BaseToggleSwitch
            :model-value="link.is_active"
            :label="link.is_active ? `Sembunyikan tombol ${link.title}` : `Tampilkan tombol ${link.title}`"
            :disabled="busyLinkIds.has(link.link_id)"
            @update:model-value="updateFlag(link, 'is_active', $event)"
          />

          <!-- Di layar kecil, unggulan diatur lewat tombol Edit agar judul tetap terbaca -->
          <button
            type="button"
            class="hidden rounded-xl p-2 transition sm:flex"
            :class="link.is_featured ? 'bg-amber-100 text-amber-600 hover:bg-amber-200' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'"
            :aria-label="link.is_featured ? 'Batalkan unggulan' : 'Jadikan unggulan'"
            :title="link.is_featured ? 'Batalkan unggulan' : 'Jadikan unggulan'"
            :disabled="busyLinkIds.has(link.link_id)"
            @click="updateFlag(link, 'is_featured', !link.is_featured)"
          >
            <UIcon name="i-lucide-star" class="size-4" />
          </button>

          <button
            type="button"
            class="flex rounded-xl bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200"
            aria-label="Edit tombol"
            title="Edit tombol"
            @click="openEdit(link)"
          >
            <UIcon name="i-lucide-pencil" class="size-4" />
          </button>

          <button
            type="button"
            class="flex rounded-xl bg-rose-50 p-2 text-rose-600 transition hover:bg-rose-100"
            aria-label="Hapus tombol"
            title="Hapus tombol"
            @click="openDelete(link)"
          >
            <UIcon name="i-lucide-trash-2" class="size-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Kosong -->
    <div v-if="links.length === 0" class="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
      <UIcon name="i-lucide-link" class="mx-auto mb-2 size-8 text-slate-300" />
      <p class="font-bold text-slate-700">
        Belum ada tombol
      </p>
      <p class="mt-1 text-xs text-slate-400">
        Klik "Tambah Tombol Baru" di atas untuk menambahkan link pertama.
      </p>
    </div>

    <PortalLinkFormModal
      v-model:open="isFormOpen"
      :portal-id="portalId"
      :link="editingLink"
      @saved="onSaved"
    />

    <BaseModal
      v-model:open="isDeleteOpen"
      title="Hapus Tombol?"
      description="Tombol akan dihapus permanen dari spreadsheet."
      :dismissible="!isDeleting"
    >
      <div v-if="deletingLink" class="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
        <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <UIcon :name="toLucideIconName(deletingLink.icon)" class="size-5" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-bold text-slate-900">
            {{ deletingLink.title }}
          </p>
          <p class="truncate text-xs text-slate-400">
            {{ deletingLink.url }}
          </p>
        </div>
      </div>
      <p class="text-xs text-slate-500">
        💡 Hanya ingin menyembunyikan? Matikan saja tombol hijau di daftar.
      </p>

      <template #footer>
        <button type="button" :class="secondaryButtonClass" :disabled="isDeleting" @click="isDeleteOpen = false">
          Batal
        </button>
        <button type="button" :class="dangerButtonClass" :disabled="isDeleting" @click="confirmDelete">
          <UIcon :name="isDeleting ? 'i-lucide-loader-circle' : 'i-lucide-trash-2'" class="size-4" :class="{ 'animate-spin': isDeleting }" />
          {{ isDeleting ? 'Menghapus...' : 'Hapus Tombol' }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
