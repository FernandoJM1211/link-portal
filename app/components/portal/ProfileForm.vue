<script setup lang="ts">
import type { Portal } from '~~/shared/types/portal'

/**
 * Form Profil & Tampilan portal. `v-model:draft` dipegang halaman agar pratinjau
 * ikut berubah saat mengetik; tersimpan ke server hanya saat tombol Simpan ditekan.
 */
const draft = defineModel<PortalDraft>('draft', { required: true })

const props = defineProps<{
  portal: Portal
}>()

const emit = defineEmits<{
  saved: [portal: Portal]
}>()

const toast = useToast()
const { getPortalUrlLabel } = usePortalUrl()

const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

const savedDraft = computed(() => toPortalDraft(props.portal))
const isDirty = computed(() => !isSameDraft(draft.value, savedDraft.value))
const isCodeChanged = computed(() => normalizePortalCode(draft.value.code) !== props.portal.code)

const avatarPreviewUrl = computed(() => toDirectImageUrl(draft.value.avatarUrl))
const isDriveLink = computed(() => !!getGoogleDriveFileId(draft.value.avatarUrl))
const avatarFailed = ref(false)
watch(avatarPreviewUrl, () => {
  avatarFailed.value = false
})

function resetForm() {
  draft.value = { ...savedDraft.value }
  errors.value = {}
}

async function submit() {
  if (isSubmitting.value) return

  const clientErrors: Record<string, string> = {}
  const codeError = getPortalCodeError(normalizePortalCode(draft.value.code))
  if (codeError) clientErrors.code = codeError
  if (!draft.value.name.trim()) clientErrors.name = 'Nama portal wajib diisi.'

  errors.value = clientErrors
  if (Object.keys(clientErrors).length) return

  isSubmitting.value = true

  try {
    const response = await $fetch<{ data: Portal, message: string }>(`/api/admin/portals/${props.portal.portal_id}`, {
      method: 'PATCH',
      body: { ...draft.value, code: normalizePortalCode(draft.value.code) },
    })

    toast.add({ title: response.message, color: 'success', icon: 'i-lucide-circle-check' })
    emit('saved', response.data)
    // Tampilkan nilai yang sudah dinormalkan server (mis. https://, wa.me, link Drive).
    draft.value = toPortalDraft(response.data)
  } catch (error) {
    errors.value = getApiFieldErrors(error)
    toast.add({
      title: 'Pengaturan gagal disimpan',
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
  <div class="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
    <h2 class="mb-1 text-lg font-bold text-slate-900">
      Pengaturan Profil & Tema Tampilan
    </h2>
    <p class="mb-6 text-xs text-slate-500">
      Sesuaikan identitas, warna tema, serta tautan media sosial portal ini.
    </p>

    <form class="space-y-6" @submit.prevent="submit">
      <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <BaseField label="Kode Portal" for-id="profile-code" :error="errors.code" caps required>
          <input
            id="profile-code"
            v-model="draft.code"
            type="text"
            autocomplete="off"
            :maxlength="PORTAL_CODE_MAX_LENGTH"
            :class="fieldClass(errors.code)"
            :disabled="isSubmitting"
          >
        </BaseField>

        <BaseField label="Nama Unit / Judul Portal" for-id="profile-name" :error="errors.name" caps required>
          <input
            id="profile-name"
            v-model="draft.name"
            type="text"
            placeholder="Contoh: Unit Inovasi & Layanan Digital"
            maxlength="100"
            :class="fieldClass(errors.name)"
            :disabled="isSubmitting"
          >
        </BaseField>
      </div>

      <p v-if="isCodeChanged && !errors.code" class="-mt-3 rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        ⚠️ Alamat portal akan berubah menjadi
        <span class="font-mono font-bold">{{ getPortalUrlLabel(normalizePortalCode(draft.code)) }}</span>.
        Link atau QR code lama (<span class="font-mono">/{{ portal.code }}</span>) tidak akan bisa dibuka lagi.
      </p>

      <BaseField label="Bio / Deskripsi Singkat" for-id="profile-bio" :error="errors.bio" caps>
        <textarea
          id="profile-bio"
          v-model="draft.bio"
          rows="3"
          maxlength="300"
          placeholder="Deskripsi singkat tentang unit Anda..."
          class="resize-none"
          :class="fieldClass(errors.bio)"
          :disabled="isSubmitting"
        />
        <p class="mt-1 text-right text-[11px] text-slate-400">
          {{ draft.bio.length }}/300
        </p>
      </BaseField>

      <BaseField label="Logo Unit (Link Google Drive)" for-id="profile-avatar" :error="errors.avatarUrl" caps>
        <div class="flex items-center gap-3">
          <div class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
            <img
              v-if="avatarPreviewUrl && !avatarFailed"
              :src="avatarPreviewUrl"
              alt="Pratinjau logo"
              class="size-full object-cover"
              referrerpolicy="no-referrer"
              @error="avatarFailed = true"
            >
            <UIcon v-else name="i-lucide-image" class="size-5 text-slate-400" />
          </div>
          <input
            id="profile-avatar"
            v-model="draft.avatarUrl"
            type="text"
            inputmode="url"
            placeholder="https://drive.google.com/file/d/.../view"
            :class="fieldClass(errors.avatarUrl)"
            :disabled="isSubmitting"
          >
        </div>
        <p v-if="avatarFailed && draft.avatarUrl" class="mt-1.5 text-xs font-medium text-amber-700">
          Gambar tidak bisa dimuat. {{ isDriveLink ? 'Pastikan file di Google Drive dibagikan ke "Siapa saja yang memiliki link".' : 'Periksa kembali alamat gambarnya.' }}
        </p>
        <p v-else class="mt-1.5 text-[11px] leading-relaxed text-slate-400">
          Unggah logo ke Google Drive → klik <span class="font-semibold">Bagikan</span> → ubah akses menjadi
          <span class="font-semibold">"Siapa saja yang memiliki link"</span> → salin link lalu tempel di sini.
          Kosongkan untuk memakai huruf awal nama.
        </p>
      </BaseField>

      <BaseField label="Pilihan Tema Warna" caps>
        <PortalThemePicker v-model="draft.theme" :disabled="isSubmitting" />
      </BaseField>

      <div class="space-y-4 border-t border-slate-100 pt-6">
        <h3 class="text-sm font-bold text-slate-900">
          Tautan Media Sosial & Kontak
        </h3>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <BaseField label="WhatsApp (nomor atau link wa.me)" for-id="social-wa" :error="errors.whatsapp">
            <input id="social-wa" v-model="draft.whatsapp" type="text" placeholder="0812-3456-7890" :class="fieldClass(errors.whatsapp)" :disabled="isSubmitting">
          </BaseField>
          <BaseField label="Instagram" for-id="social-ig" :error="errors.instagram">
            <input id="social-ig" v-model="draft.instagram" type="text" placeholder="https://instagram.com/akununit" :class="fieldClass(errors.instagram)" :disabled="isSubmitting">
          </BaseField>
          <BaseField label="Website Resmi" for-id="social-web" :error="errors.website">
            <input id="social-web" v-model="draft.website" type="text" placeholder="https://unit.instansi.id" :class="fieldClass(errors.website)" :disabled="isSubmitting">
          </BaseField>
          <BaseField label="Alamat Email" for-id="social-email" :error="errors.email">
            <input id="social-email" v-model="draft.email" type="email" placeholder="kontak@instansi.id" :class="fieldClass(errors.email)" :disabled="isSubmitting">
          </BaseField>
          <BaseField label="YouTube" for-id="social-yt" :error="errors.youtube" class="sm:col-span-2">
            <input id="social-yt" v-model="draft.youtube" type="text" placeholder="https://youtube.com/@unitkami" :class="fieldClass(errors.youtube)" :disabled="isSubmitting">
          </BaseField>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-end gap-2.5 pt-2">
        <span v-if="isDirty" class="mr-auto text-xs font-medium text-amber-600">
          ● Ada perubahan yang belum disimpan
        </span>
        <button type="button" :class="secondaryButtonClass" :disabled="isSubmitting || !isDirty" @click="resetForm">
          Batalkan Perubahan
        </button>
        <button type="submit" :class="primaryButtonClass" :disabled="isSubmitting || !isDirty">
          <UIcon v-if="isSubmitting" name="i-lucide-loader-circle" class="size-4 animate-spin" />
          {{ isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Profil' }}
        </button>
      </div>
    </form>
  </div>
</template>
