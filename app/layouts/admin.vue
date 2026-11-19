<script setup lang="ts">
const toast = useToast()
const isLoggingOut = ref(false)

const { admin } = await useAdminSession()

async function handleLogout() {
  if (isLoggingOut.value) return

  isLoggingOut.value = true

  try {
    await logout()
  } catch {
    toast.add({
      title: 'Gagal keluar',
      description: 'Sesi belum berhasil diakhiri. Silakan coba lagi.',
      color: 'error',
      icon: 'i-lucide-circle-alert',
    })
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-100/90 pb-20 text-slate-800">
    <!-- Header atas -->
    <header class="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <NuxtLink to="/admin" class="flex min-w-0 items-center gap-3">
          <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <UIcon name="i-lucide-link" class="size-5" />
          </div>
          <div class="min-w-0">
            <h1 class="truncate text-base font-bold leading-none text-slate-900">
              Dashboard Admin
            </h1>
            <p class="mt-1 truncate text-xs text-slate-500">
              Pengaturan Link Portal
            </p>
          </div>
        </NuxtLink>

        <div class="flex shrink-0 items-center gap-2.5">
          <span class="hidden items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 sm:inline-flex">
            <UIcon name="i-lucide-user-round" class="size-4" />
            {{ admin?.username || 'admin' }}
          </span>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
            :disabled="isLoggingOut"
            title="Keluar dari Admin"
            @click="handleLogout"
          >
            <UIcon
              :name="isLoggingOut ? 'i-lucide-loader-circle' : 'i-lucide-log-out'"
              class="size-4"
              :class="{ 'animate-spin': isLoggingOut }"
            />
            <span>{{ isLoggingOut ? 'Keluar...' : 'Keluar' }}</span>
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto mt-8 max-w-6xl px-4 sm:px-6">
      <slot />
    </main>
  </div>
</template>
