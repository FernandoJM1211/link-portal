<script setup lang="ts">
/**
 * Modal gaya desain awal (kartu putih rounded-3xl).
 * Memakai UModal untuk fokus, Esc, dan overlay; isi lewat slot default & `footer`.
 */
const open = defineModel<boolean>('open', { required: true })

withDefaults(defineProps<{
  title: string
  description?: string
  /** `false` saat sedang memproses agar tidak tertutup tanpa sengaja. */
  dismissible?: boolean
  size?: 'md' | 'lg'
}>(), {
  description: '',
  dismissible: true,
  size: 'md',
})
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="description || title"
    :dismissible="dismissible"
    :ui="{
      overlay: 'bg-slate-900/60 backdrop-blur-sm',
      content: `flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-100 shadow-2xl ring-0 divide-y-0 sm:max-h-[calc(100dvh-4rem)] ${size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'}`,
    }"
  >
    <!-- Judul & tombol tetap terlihat; hanya isi di tengah yang di-scroll bila layar pendek. -->
    <template #content>
      <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-6 pb-4 pt-6 sm:px-7 sm:pt-7">
          <div class="min-w-0">
            <h3 class="text-base font-bold text-slate-900">
              {{ title }}
            </h3>
            <p v-if="description" class="mt-0.5 text-xs text-slate-500">
              {{ description }}
            </p>
          </div>
          <button
            type="button"
            class="flex shrink-0 p-1 text-slate-400 hover:text-slate-600 disabled:opacity-50"
            aria-label="Tutup"
            :disabled="!dismissible"
            @click="open = false"
          >
            <UIcon name="i-lucide-x" class="size-5" />
          </button>
        </div>

        <div class="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5 sm:px-7">
          <slot />
        </div>

        <div v-if="$slots.footer" class="flex shrink-0 justify-end gap-2.5 border-t border-slate-100 px-6 pb-6 pt-4 sm:px-7 sm:pb-7">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </UModal>
</template>
