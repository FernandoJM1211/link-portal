<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

useHead({ title: isNotFound.value ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' })
</script>

<template>
  <UApp>
    <div class="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div class="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl sm:p-10">
        <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <UIcon :name="isNotFound ? 'i-lucide-link-2-off' : 'i-lucide-circle-alert'" class="size-8" />
        </div>
        <p class="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Error {{ error.statusCode }}
        </p>
        <h1 class="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">
          {{ isNotFound ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan' }}
        </h1>
        <p class="mt-2 text-sm leading-relaxed text-slate-500">
          {{ isNotFound
            ? 'Alamat yang Anda buka tidak tersedia atau portal sedang tidak aktif.'
            : 'Silakan coba lagi beberapa saat lagi.' }}
        </p>
        <button
          type="button"
          class="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          @click="clearError({ redirect: '/' })"
        >
          <UIcon name="i-lucide-house" class="size-4" />
          Kembali ke Beranda
        </button>
      </div>
    </div>
  </UApp>
</template>
