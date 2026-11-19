<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

useHead({ title: 'Masuk' })
useSeoMeta({ robots: 'noindex, nofollow' })

const route = useRoute()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')

/** Hanya izinkan kembali ke halaman admin (mencegah open redirect). */
function getRedirectPath(): string {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && (redirect === '/admin' || redirect.startsWith('/admin/'))) {
    return redirect
  }

  return '/admin'
}

async function handleLogin() {
  if (isSubmitting.value) return

  errorMessage.value = ''

  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Masukkan username dan kata sandi untuk melanjutkan.'
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        username: username.value.trim(),
        password: password.value,
      },
    })

    clearNuxtData('admin-session')
    await navigateTo(getRedirectPath(), { replace: true })
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, 'Username atau kata sandi tidak sesuai.')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl sm:p-10">
    <div class="mb-8 text-center">
      <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
        <UIcon name="i-lucide-link" class="size-8" />
      </div>
      <h2 class="text-2xl font-extrabold tracking-tight text-slate-900">
        Admin Link Portal
      </h2>
      <p class="mt-1 text-sm text-slate-500">
        Masuk untuk mengelola semua link portal Anda
      </p>
    </div>

    <form class="space-y-4" @submit.prevent="handleLogin">
      <div>
        <label for="username" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Username Admin
        </label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="Masukkan username admin..."
          class="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
          autocomplete="username"
          :disabled="isSubmitting"
          required
        >
      </div>

      <div>
        <label for="password" class="mb-1.5 block text-sm font-semibold text-slate-700">
          Kata Sandi
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Masukkan kata sandi..."
            class="w-full rounded-xl border border-slate-300 px-4 py-2.5 pr-12 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            autocomplete="current-password"
            :disabled="isSubmitting"
            required
          >
          <button
            type="button"
            class="absolute right-3 top-1/2 flex -translate-y-1/2 items-center p-1 text-slate-400 hover:text-slate-600"
            :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
            @click="showPassword = !showPassword"
          >
            <UIcon :name="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-[18px]" />
          </button>
        </div>
      </div>

      <div
        v-if="errorMessage"
        role="alert"
        class="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700"
      >
        <UIcon name="i-lucide-circle-alert" class="size-[18px] shrink-0 text-rose-500" />
        <span>{{ errorMessage }}</span>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-700 active:scale-[0.99] disabled:opacity-50"
      >
        <UIcon v-if="isSubmitting" name="i-lucide-loader-circle" class="size-4 animate-spin" />
        <span>{{ isSubmitting ? 'Memeriksa...' : 'Masuk ke Dashboard' }}</span>
      </button>
    </form>
  </div>
</template>
