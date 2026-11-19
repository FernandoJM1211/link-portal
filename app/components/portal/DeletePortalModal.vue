<script setup lang="ts">
import type { Portal } from '~~/shared/types/portal'

/** Konfirmasi hapus permanen: admin harus mengetik ulang kode portal. */
const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  portal: (Pick<Portal, 'portal_id' | 'code' | 'name'> & { link_count?: number }) | null
}>()

const emit = defineEmits<{
  deleted: [portalId: string]
}>()

const toast = useToast()

const confirmCode = ref('')
const isSubmitting = ref(false)

watch(open, (isOpen) => {
  if (isOpen) confirmCode.value = ''
})

const isConfirmed = computed(() => (
  !!props.portal && normalizePortalCode(confirmCode.value) === props.portal.code
))

async function submit() {
  if (isSubmitting.value || !props.portal || !isConfirmed.value) return

  isSubmitting.value = true

  try {
    const response = await $fetch<{ message: string }>(`/api/admin/portals/${props.portal.portal_id}`, {
      method: 'DELETE',
      body: { confirmCode: confirmCode.value },
    })

    toast.add({ title: response.message, color: 'success', icon: 'i-lucide-circle-check' })
    open.value = false
    emit('deleted', props.portal.portal_id)
  } catch (error) {
    toast.add({
      title: 'Portal gagal dihapus',
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
    title="Hapus Portal Permanen"
    description="Tindakan ini tidak bisa dibatalkan."
    :dismissible="!isSubmitting"
  >
    <form v-if="portal" id="delete-portal-form" class="space-y-4" @submit.prevent="submit">
      <div class="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
        <UIcon name="i-lucide-triangle-alert" class="mt-0.5 size-5 shrink-0 text-rose-500" />
        <p class="text-sm leading-relaxed text-rose-800">
          Portal <span class="font-bold">{{ portal.name }}</span>
          <template v-if="portal.link_count !== undefined">
            beserta <span class="font-bold">{{ portal.link_count }} tombol link</span>-nya
          </template>
          akan dihapus dari spreadsheet. Alamat <span class="font-mono font-bold">/{{ portal.code }}</span> tidak bisa dibuka lagi.
        </p>
      </div>

      <p class="text-xs text-slate-500">
        💡 Hanya ingin menyembunyikan sementara? Cukup <span class="font-semibold text-slate-700">nonaktifkan</span> portal.
      </p>

      <BaseField :label="`Ketik kode portal (${portal.code}) untuk konfirmasi`" for-id="delete-confirm">
        <input
          id="delete-confirm"
          v-model="confirmCode"
          type="text"
          autocomplete="off"
          :placeholder="portal.code"
          :class="inputClass"
          :disabled="isSubmitting"
        >
      </BaseField>
    </form>

    <template #footer>
      <button type="button" :class="secondaryButtonClass" :disabled="isSubmitting" @click="open = false">
        Batal
      </button>
      <button type="submit" form="delete-portal-form" :class="dangerButtonClass" :disabled="isSubmitting || !isConfirmed">
        <UIcon :name="isSubmitting ? 'i-lucide-loader-circle' : 'i-lucide-trash-2'" class="size-4" :class="{ 'animate-spin': isSubmitting }" />
        {{ isSubmitting ? 'Menghapus...' : 'Hapus Permanen' }}
      </button>
    </template>
  </BaseModal>
</template>
