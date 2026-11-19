<script setup lang="ts">
/**
 * Pembungkus label + input + pesan error (gaya desain awal).
 * Contoh:
 *   <BaseField label="Nama Portal" for-id="name" :error="errors.name" required>
 *     <input id="name" v-model="form.name" :class="inputClass">
 *   </BaseField>
 */
defineProps<{
  label: string
  forId?: string
  error?: string
  hint?: string
  required?: boolean
  /** Label huruf kapital kecil (form panjang seperti editor profil). */
  caps?: boolean
}>()
</script>

<template>
  <div>
    <label
      :for="forId"
      class="mb-1.5 block text-slate-700"
      :class="caps ? 'text-xs font-bold uppercase tracking-wider' : 'text-sm font-semibold'"
    >
      {{ label }}<span v-if="required" class="text-rose-500"> *</span>
    </label>
    <slot />
    <p v-if="error" class="mt-1.5 text-xs font-medium text-rose-600">
      {{ error }}
    </p>
    <p v-else-if="hint" class="mt-1.5 text-[11px] leading-relaxed text-slate-400">
      {{ hint }}
    </p>
  </div>
</template>
