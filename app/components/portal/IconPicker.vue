<script setup lang="ts">
/** Pemilih ikon tombol link. `v-model` = nama ikon Lucide (`globe`, `file-text`, ...). */
const model = defineModel<string>({ required: true })

defineProps<{ disabled?: boolean }>()

const selectedLabel = computed(() => (
  LINK_ICON_OPTIONS.find((option) => option.value === model.value)?.label ?? model.value
))
</script>

<template>
  <div>
    <div class="grid grid-cols-6 gap-2 sm:grid-cols-10" role="radiogroup" aria-label="Pilihan ikon">
      <button
        v-for="option in LINK_ICON_OPTIONS"
        :key="option.value"
        type="button"
        role="radio"
        :aria-checked="model === option.value"
        :aria-label="option.label"
        :title="option.label"
        :disabled="disabled"
        class="flex items-center justify-center rounded-xl border p-2.5 transition disabled:opacity-60"
        :class="model === option.value
          ? 'border-indigo-600 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500/30'
          : 'border-slate-200 text-slate-600 hover:bg-slate-50'"
        @click="model = option.value"
      >
        <UIcon :name="toLucideIconName(option.value)" class="size-[18px]" />
      </button>
    </div>
    <p class="mt-2 text-[11px] text-slate-400">
      Ikon terpilih: <span class="font-semibold text-slate-600">{{ selectedLabel }}</span>
    </p>
  </div>
</template>
