<template>
  <div class="min-h-screen bg-slate-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 sm:p-10">
      <div class="text-center mb-8">
        <div class="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/30">
          <DynamicIcon name="Link" :size="32" />
        </div>
        <h2 class="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Link Portal</h2>
        <p class="text-sm text-slate-500 mt-1">Masukkan kata sandi untuk mengelola portal tautan unit Anda</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-slate-700 mb-2">Kata Sandi Admin</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Masukkan password admin..."
              class="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-sm pr-12 text-slate-900"
              required
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <DynamicIcon :name="showPassword ? 'FileText' : 'Star'" :size="18" />
            </button>
          </div>
          <p class="text-[11px] text-slate-400 mt-1.5">
            Default awal: <span class="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">admin123</span> (bisa diubah di file <code class="font-mono">.env</code>)
          </p>
        </div>

        <div v-if="errorMessage" class="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <DynamicIcon name="HelpCircle" :size="18" className="shrink-0 text-rose-500" />
          <span>{{ errorMessage }}</span>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ loading ? 'Memeriksa...' : 'Masuk ke Dashboard' }}</span>
        </button>

        <div class="text-center pt-2">
          <NuxtLink to="/" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1">
            <span>&larr; Kembali ke Halaman Publik</span>
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/auth/login', {
      method: 'POST',
      body: { password: password.value }
    })
    if (res.success) {
      await navigateTo('/admin')
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.statusMessage || err?.message || 'Password yang Anda masukkan salah.'
  } finally {
    loading.value = false
  }
}
</script>
