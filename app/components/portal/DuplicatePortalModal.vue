<script setup lang="ts">
import type { Portal, PortalDetail } from '~~/shared/types/portal'

/** Salin portal (profil, tema, semua tombol) ke portal baru. Hasil salinan nonaktif. */
const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  source: Pick<Portal, 'portal_id' | 'code' | 'name'> | null
}>()

const emit = defineEmits<{
  duplicated: [portal: PortalDetail]
}>()

const toast = useToast()
const { getPortalUrlLabel } = usePortalUrl()

const form = reactive({ code: '', name: '' })
const errors = ref<Record<string, string>>({})
const isSubmitting = ref(false)

watch(open, (isOpen) => {
  if (!isOpen || !props.source) return
  form.code = ''
  form.name = `${props.source.name} (Salinan)`
  errors.value = {}
})

const normalizedCode = computed(() => normalizePortalCode(form.code))

async function submit() {
  if (isSubmitting.value || !props.source) return

  const clientErrors: Record<string, string> = {}
  const codeError = getPortalCodeError(normalizedCode.value)
  if (codeError) clientErrors.code = codeError
  if (!form.name.trim()) clientErrors.name = 'Nama portal wajib diisi.'

  errors.value = clientErrors
  if (Object.keys(clientErrors).length) return

  isSubmitting.value = true

  try {
    const response = await $fetch<{ data: PortalDetail, message: string }>(
      `/api/admin/portals/${props.source.portal_id}/duplicate`,
      { method: 'POST', body: { code: normalizedCode.value, name: form.name.trim() } },
    )

    toast.add({ title: response.message, color: 'success', icon: 'i-lucide-circle-check' })
    open.value = false
    emit('duplicated', response.data)
  } catch (error) {
    errors.value = getApiFieldErrors(error)
    toast.add({
      title: 'Portal gagal disalin',
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
    title="Duplikat Portal"
    :description="source ? `Menyalin profil, tema, dan semua tombol dari “${source.name}”.` : ''"
    :dismissible="!isSubmitting"
  >
    <form id="duplicate-portal-form" class="space-y-4" @submit.prevent="submit">
      <BaseField
        label="Kode Portal Baru"
        for-id="duplicate-code"
        :error="errors.code"
        hint="Harus berbeda dari kode portal lain."
        required
      >
        <input
          id="duplicate-code"
          v-model="form.code"
          type="text"
          placeholder="Contoh: 02"
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

      <BaseField label="Nama Portal Baru" for-id="duplicate-name" :error="errors.name" required>
        <input
          id="duplicate-name"
          v-model="form.name"
          type="text"
          maxlength="100"
          :class="fieldClass(errors.name)"
          :disabled="isSubmitting"
        >
      </BaseField>

      <p class="rounded-xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-800">
        💡 Portal salinan dibuat <span class="font-bold">nonaktif</span> agar bisa dicek dulu. Nyalakan switch <span class="font-bold">"Tampilkan ke publik"</span> bila sudah siap.
      </p>
    </form>

    <template #footer>
      <button type="button" :class="secondaryButtonClass" :disabled="isSubmitting" @click="open = false">
        Batal
      </button>
      <button type="submit" form="duplicate-portal-form" :class="primaryButtonClass" :disabled="isSubmitting">
        <UIcon v-if="isSubmitting" name="i-lucide-loader-circle" class="size-4 animate-spin" />
        {{ isSubmitting ? 'Menyalin...' : 'Duplikat Portal' }}
      </button>
    </template>
  </BaseModal>
</template>
