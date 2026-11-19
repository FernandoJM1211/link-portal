<script setup lang="ts">
/** Pilihan tema warna portal. `v-model` = nilai tema (`indigo`, `emerald`, ...). */
const model = defineModel<string>({ required: true })

defineProps<{ disabled?: boolean }>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-5" role="radiogroup" aria-label="Tema warna">
    <button
      v-for="theme in PORTAL_THEMES"
      :key="theme.value"
      type="button"
      role="radio"
      :aria-checked="model === theme.value"
      :disabled="disabled"
      class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 p-3 text-center transition-all disabled:cursor-not-allowed disabled:opacity-60"
      :class="model === theme.value
        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
        : 'border-slate-200 hover:border-slate-300'"
      @click="model = theme.value"
    >
      <span class="size-8 rounded-full shadow-inner" :class="theme.swatch" />
      <span class="text-xs font-bold text-slate-800">{{ theme.label }}</span>
    </button>
  </div>
</template>
