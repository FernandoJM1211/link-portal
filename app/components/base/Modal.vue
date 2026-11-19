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
      content: `rounded-3xl border border-slate-100 shadow-2xl ring-0 divide-y-0 ${size === 'lg' ? 'sm:max-w-2xl' : 'sm:max-w-md'}`,
    }"
  >
    <template #content>
      <div class="space-y-5 p-6 sm:p-7">
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
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

        <slot />

        <div v-if="$slots.footer" class="flex justify-end gap-2.5 pt-1">
          <slot name="footer" />
        </div>
      </div>
    </template>
  </UModal>
</template>
