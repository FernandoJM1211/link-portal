<script setup lang="ts">
import type { Portal } from '~~/shared/types/portal'

/** Modal buat portal baru: kode, nama, tema. Profil lain diatur di editor. */
const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  created: [portal: Portal]
}>()

const toast = useToast()
const { getPortalUrlLabel } = usePortalUrl()

const form = reactive({
  code: '',
  name: '',
  theme: DEFAULT_PORTAL_THEME,
})
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

watch(open, (isOpen) => {
  if (!isOpen) return
  form.code = ''
  form.name = ''
  form.theme = DEFAULT_PORTAL_THEME
  errors.value = {}
})

const normalizedCode = computed(() => normalizePortalCode(form.code))

async function submit() {
  if (isSubmitting.value) return

  const clientErrors: Record<string, string> = {}
  const codeError = getPortalCodeError(normalizedCode.value)
  if (codeError) clientErrors.code = codeError
  if (!form.name.trim()) clientErrors.name = 'Nama portal wajib diisi.'

  errors.value = clientErrors
  if (Object.keys(clientErrors).length) return

  isSubmitting.value = true

  try {
    const response = await $fetch<{ data: Portal, message: string }>('/api/admin/portals', {
      method: 'POST',
      body: {
        code: normalizedCode.value,
        name: form.name.trim(),
        theme: form.theme,
        // Portal baru disembunyikan dulu sampai profil & tombol siap.
        isActive: false,
      },
    })

    toast.add({ title: response.message, color: 'success', icon: 'i-lucide-circle-check' })
    open.value = false
    emit('created', response.data)
  } catch (error) {
    errors.value = getApiFieldErrors(error)
    toast.add({
      title: 'Portal gagal dibuat',
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
    title="Buat Portal Baru"
    description="Profil, logo, dan tombol link bisa diatur setelah portal dibuat."
    :dismissible="!isSubmitting"
  >
    <form id="create-portal-form" class="space-y-4" @submit.prevent="submit">
      <BaseField
        label="Kode Portal"
        for-id="portal-code"
        :error="errors.code"
        hint="Huruf kecil, angka, dan tanda hubung. Contoh: 01, 02, pmb-2026. Sebaiknya tidak diganti setelah dibagikan."
        required
      >
        <input
          id="portal-code"
          v-model="form.code"
          type="text"
          placeholder="Contoh: 01"
          autocomplete="off"
          :maxlength="PORTAL_CODE_MAX_LENGTH"
          :class="fieldClass(errors.code)"
          :disabled="isSubmitting"
        >
        <p v-if="normalizedCode && !errors.code" class="mt-1.5 text-xs text-slate-500">
          Alamat portal:
          <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-indigo-600">{{ getPortalUrlLabel(normalizedCode) }}</span>
        </p>
      </BaseField>

      <BaseField label="Nama Portal" for-id="portal-name" :error="errors.name" required>
        <input
          id="portal-name"
          v-model="form.name"
          type="text"
          placeholder="Contoh: Unit Inovasi & Layanan Digital"
          maxlength="100"
          :class="fieldClass(errors.name)"
          :disabled="isSubmitting"
        >
      </BaseField>

      <BaseField label="Tema Warna">
        <PortalThemePicker v-model="form.theme" :disabled="isSubmitting" />
      </BaseField>

      <p class="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        💡 Portal baru dibuat dalam keadaan <span class="font-bold">nonaktif</span> (belum bisa dibuka publik).
        Setelah profil dan tombol link siap, nyalakan switch <span class="font-bold">"Tampilkan ke publik"</span>.
      </p>
    </form>

    <template #footer>
      <button type="button" :class="secondaryButtonClass" :disabled="isSubmitting" @click="open = false">
        Batal
      </button>
      <button type="submit" form="create-portal-form" :class="primaryButtonClass" :disabled="isSubmitting">
        <UIcon v-if="isSubmitting" name="i-lucide-loader-circle" class="size-4 animate-spin" />
        {{ isSubmitting ? 'Membuat...' : 'Buat Portal' }}
      </button>
    </template>
  </BaseModal>
</template>
