<script setup lang="ts">
/** Switch hijau gaya desain awal. `v-model` boolean. */
const model = defineModel<boolean>({ required: true })

defineProps<{
  /** Teks untuk pembaca layar, mis. "Aktifkan tombol Website". */
  label: string
  disabled?: boolean
}>()
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    :class="model ? 'bg-emerald-500' : 'bg-slate-300'"
    @click="model = !model"
  >
    <span
      class="pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
      :class="model ? 'translate-x-5' : 'translate-x-0'"
    />
  </button>
</template>
