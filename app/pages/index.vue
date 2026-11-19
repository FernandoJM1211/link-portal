<script setup lang="ts">
useHead({ title: 'Link Portal' })
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-100 p-4">
    <div class="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl sm:p-10">
      <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
        <UIcon name="i-lucide-link" class="size-8" />
      </div>
      <h1 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Link Portal
      </h1>
      <p class="mt-2 text-sm leading-relaxed text-slate-500">
        Buka alamat portal lengkap yang Anda terima, misalnya
        <span class="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-700">domain/01</span>.
      </p>
    </div>
  </div>
</template>
