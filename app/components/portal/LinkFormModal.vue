<script setup lang="ts">
import type { Link } from '~~/shared/types/portal'

/** Tambah / edit tombol link. `link` = null untuk tambah baru. */
const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  portalId: string
  link: Link | null
}>()

const emit = defineEmits<{
  saved: [link: Link, isNew: boolean]
}>()

const toast = useToast()

const linkTitle = ref('')
const linkUrl = ref('')
const linkIcon = ref('link')
const linkIsActive = ref(true)
const linkIsFeatured = ref(false)
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const isEdit = computed(() => !!props.link)

watch(open, (isOpen) => {
  if (!isOpen) return
  linkTitle.value = props.link?.title ?? ''
  linkUrl.value = props.link?.url ?? ''
  linkIcon.value = props.link?.icon || 'link'
  linkIsActive.value = props.link?.is_active ?? true
  linkIsFeatured.value = props.link?.is_featured ?? false
  errors.value = {}
})

async function submit() {
  if (isSubmitting.value) return

  const clientErrors: Record<string, string> = {}
  if (!linkTitle.value.trim()) clientErrors.title = 'Judul tombol wajib diisi.'
  if (!linkUrl.value.trim()) clientErrors.url = 'URL tujuan wajib diisi.'

  errors.value = clientErrors
  if (Object.keys(clientErrors).length) return

  isSubmitting.value = true

  const body = {
    title: linkTitle.value.trim(),
    url: linkUrl.value.trim(),
    icon: linkIcon.value,
    isActive: linkIsActive.value,
    isFeatured: linkIsFeatured.value,
  }

  try {
    const response = props.link
      ? await $fetch<{ data: Link, message: string }>(
          `/api/admin/portals/${props.portalId}/links/${props.link.link_id}`,
          { method: 'PATCH', body },
        )
      : await $fetch<{ data: Link, message: string }>(
          `/api/admin/portals/${props.portalId}/links`,
          { method: 'POST', body },
        )

    toast.add({ title: response.message, color: 'success', icon: 'i-lucide-circle-check' })
    open.value = false
    emit('saved', response.data, !props.link)
  } catch (error) {
    errors.value = getApiFieldErrors(error)
    toast.add({
      title: 'Tombol gagal disimpan',
      description: getApiErrorMessage(error, 'Terjadi kesalahan. Silakan coba lagi.'),
      color: 'error',
      icon: 'i-lucide-circle-x',
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <BaseModal
    v-model:open="open"
    :title="isEdit ? 'Edit Tombol Tautan' : 'Tambah Tombol Baru'"
    size="lg"
    :dismissible="!isSubmitting"
  >
    <form id="link-form" class="space-y-4" @submit.prevent="submit">
      <BaseField label="Judul Tombol" for-id="link-title" :error="errors.title" caps required>
        <input
          id="link-title"
          v-model="linkTitle"
          type="text"
          placeholder="Contoh: Formulir Pendaftaran Kegiatan"
          :maxlength="100"
          :class="fieldClass(errors.title)"
          :disabled="isSubmitting"
        >
      </BaseField>

      <BaseField
        label="URL Tujuan Link"
        for-id="link-url"
        :error="errors.url"
        hint="Alamat web (https://...), atau mailto:email@contoh.id / tel:0812... untuk email & telepon."
        caps
        required
      >
        <input
          id="link-url"
          v-model="linkUrl"
          type="text"
          inputmode="url"
          placeholder="https://..."
          :class="fieldClass(errors.url)"
          :disabled="isSubmitting"
        >
      </BaseField>

      <BaseField label="Pilihan Ikon" :error="errors.icon" caps>
        <PortalIconPicker v-model="linkIcon" :disabled="isSubmitting" />
      </BaseField>

      <div class="space-y-3 rounded-2xl bg-slate-50 p-4">
        <div class="flex items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold text-slate-800">
              Tampilkan tombol
            </p>
            <p class="text-xs text-slate-500">
              Jika dimatikan, tombol disimpan tetapi tidak tampil di halaman publik.
            </p>
          </div>
          <BaseToggleSwitch v-model="linkIsActive" label="Tampilkan tombol" :disabled="isSubmitting" />
        </div>
        <div class="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">
          <div>
            <p class="text-sm font-semibold text-slate-800">
              Jadikan tombol unggulan ⭐
            </p>
            <p class="text-xs text-slate-500">
              Disorot dengan warna mencolok dan label "Unggulan".
            </p>
          </div>
          <BaseToggleSwitch v-model="linkIsFeatured" label="Jadikan tombol unggulan" :disabled="isSubmitting" />
        </div>
      </div>
    </form>

    <template #footer>
      <button type="button" :class="secondaryButtonClass" :disabled="isSubmitting" @click="open = false">
        Batal
      </button>
      <button type="submit" form="link-form" :class="primaryButtonClass" :disabled="isSubmitting">
        <UIcon v-if="isSubmitting" name="i-lucide-loader-circle" class="size-4 animate-spin" />
        {{ isSubmitting ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Tambah Tombol') }}
      </button>
    </template>
  </BaseModal>
</template>
