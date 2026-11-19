<template>
  <div :class="['min-h-screen py-10 px-4 transition-colors duration-500 flex flex-col justify-between', currentThemeClass.wrapper]">
    <!-- Share Toast Notification -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showToast"
        class="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-2.5 rounded-full shadow-xl text-sm font-medium flex items-center gap-2 border border-slate-700/50 backdrop-blur-md"
      >
        <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
        {{ toastMessage }}
      </div>
    </transition>

    <div class="max-w-md w-full mx-auto">
      <!-- Top Action Bar (Share Button) -->
      <div class="flex justify-end mb-4">
        <button
          @click="sharePortal"
          class="p-2.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white transition-all transform active:scale-90 border border-white/20 shadow-sm"
          title="Bagikan Tautan"
        >
          <DynamicIcon name="Share2" :size="18" />
        </button>
      </div>

      <!-- Profile Header -->
      <div class="text-center mb-8 flex flex-col items-center">
        <!-- Avatar -->
        <div class="relative group">
          <div :class="['absolute -inset-1 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300', currentThemeClass.avatarGlow]"></div>
          <div class="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
            <img
              :src="profile.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Unit'"
              :alt="profile.name"
              class="w-full h-full object-cover"
              loading="eager"
            />
          </div>
        </div>

        <!-- Name & Bio -->
        <h1 class="mt-4 text-2xl font-bold tracking-tight text-white drop-shadow-sm flex items-center justify-center gap-1.5">
          {{ profile.name }}
        </h1>
        <p v-if="profile.bio" class="mt-2 text-sm text-white/90 max-w-sm leading-relaxed drop-shadow-sm">
          {{ profile.bio }}
        </p>

        <!-- Social Icons Bar -->
        <div v-if="hasSocials" class="flex items-center gap-3 mt-4">
          <a
            v-if="profile.socials?.whatsapp"
            :href="profile.socials.whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-all transform hover:-translate-y-0.5 active:scale-95"
            title="WhatsApp"
          >
            <DynamicIcon name="MessageCircle" :size="20" />
          </a>
          <a
            v-if="profile.socials?.instagram"
            :href="profile.socials.instagram"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-all transform hover:-translate-y-0.5 active:scale-95"
            title="Instagram"
          >
            <DynamicIcon name="Instagram" :size="20" />
          </a>
          <a
            v-if="profile.socials?.website"
            :href="profile.socials.website"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-all transform hover:-translate-y-0.5 active:scale-95"
            title="Website Resmi"
          >
            <DynamicIcon name="Globe" :size="20" />
          </a>
          <a
            v-if="profile.socials?.email"
            :href="`mailto:${profile.socials.email}`"
            class="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-all transform hover:-translate-y-0.5 active:scale-95"
            title="Email"
          >
            <DynamicIcon name="Mail" :size="20" />
          </a>
          <a
            v-if="profile.socials?.youtube"
            :href="profile.socials.youtube"
            target="_blank"
            rel="noopener noreferrer"
            class="p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-sm transition-all transform hover:-translate-y-0.5 active:scale-95"
            title="YouTube"
          >
            <DynamicIcon name="Youtube" :size="20" />
          </a>
        </div>
      </div>

      <!-- Links Container -->
      <div class="space-y-3.5">
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-14 rounded-2xl bg-white/20 animate-pulse backdrop-blur-md"></div>
        </div>

        <div v-else-if="links.length === 0" class="text-center py-10 bg-white/15 backdrop-blur-md rounded-2xl p-6 text-white border border-white/20">
          <DynamicIcon name="HelpCircle" :size="32" className="mx-auto mb-2 opacity-75" />
          <p class="font-medium text-base">Belum ada tombol tautan yang aktif.</p>
          <p class="text-xs text-white/80 mt-1">Silakan tambahkan tautan melalui dashboard admin.</p>
        </div>

        <a
          v-for="link in links"
          :key="link.id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          :class="[
            'group relative w-full flex items-center justify-between p-4 rounded-2xl font-semibold transition-all duration-300 transform active:scale-[0.98] border shadow-md',
            link.isFeatured ? currentThemeClass.featuredButton : currentThemeClass.normalButton
          ]"
        >
          <!-- Featured Badge -->
          <span
            v-if="link.isFeatured"
            class="absolute -top-2 right-4 bg-amber-400 text-slate-900 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shadow-sm animate-pulse"
          >
            Unggulan
          </span>

          <div class="flex items-center gap-3.5 min-w-0 pr-2">
            <div :class="['w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110', currentThemeClass.iconContainer]">
              <DynamicIcon :name="link.icon" :size="20" />
            </div>
            <span class="truncate text-sm sm:text-base tracking-wide">{{ link.title }}</span>
          </div>

          <div class="text-current/60 group-hover:text-current group-hover:translate-x-0.5 transition-all shrink-0">
            <DynamicIcon name="ExternalLink" :size="18" />
          </div>
        </a>
      </div>
    </div>

    <!-- Footer -->
    <footer class="mt-12 text-center text-xs text-white/70 pb-4">
      <p class="font-medium">&copy; {{ new Date().getFullYear() }} {{ profile.name }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface LinkItem {
  id: string
  title: string
  url: string
  icon: string
  isActive: boolean
  order: number
  isFeatured?: boolean
}

interface ProfileData {
  name: string
  bio: string
  avatarUrl: string
  theme: string
  socials: Record<string, string>
}

const loading = ref(true)
const profile = ref<ProfileData>({
  name: 'Portal Resmi Unit',
  bio: '',
  avatarUrl: '',
  theme: 'indigo',
  socials: {}
})
const links = ref<LinkItem[]>([])
const showToast = ref(false)
const toastMessage = ref('')

const hasSocials = computed(() => {
  if (!profile.value.socials) return false
  return Object.values(profile.value.socials).some(val => Boolean(val && val.trim()))
})

// Theme definitions
const themes: Record<string, any> = {
  indigo: {
    wrapper: 'bg-gradient-to-br from-indigo-900 via-indigo-700 to-slate-900 text-white',
    avatarGlow: 'bg-gradient-to-r from-indigo-400 to-purple-400',
    normalButton: 'bg-white/90 hover:bg-white text-indigo-950 border-white/30 backdrop-blur-md shadow-indigo-950/20',
    featuredButton: 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 hover:from-amber-200 hover:to-amber-100 text-slate-900 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-950/20',
    iconContainer: 'bg-indigo-100 text-indigo-700'
  },
  emerald: {
    wrapper: 'bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 text-white',
    avatarGlow: 'bg-gradient-to-r from-emerald-400 to-teal-300',
    normalButton: 'bg-white/90 hover:bg-white text-emerald-950 border-white/30 backdrop-blur-md shadow-emerald-950/20',
    featuredButton: 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 hover:from-amber-200 hover:to-amber-100 text-slate-900 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-950/20',
    iconContainer: 'bg-emerald-100 text-emerald-700'
  },
  sunset: {
    wrapper: 'bg-gradient-to-br from-rose-900 via-orange-800 to-purple-950 text-white',
    avatarGlow: 'bg-gradient-to-r from-orange-400 to-rose-400',
    normalButton: 'bg-white/90 hover:bg-white text-slate-900 border-white/30 backdrop-blur-md shadow-rose-950/20',
    featuredButton: 'bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-300 hover:from-yellow-200 hover:to-yellow-100 text-slate-900 border-yellow-300 ring-2 ring-yellow-400/50 shadow-yellow-950/20',
    iconContainer: 'bg-rose-100 text-rose-700'
  },
  ocean: {
    wrapper: 'bg-gradient-to-br from-cyan-900 via-blue-800 to-slate-950 text-white',
    avatarGlow: 'bg-gradient-to-r from-cyan-400 to-blue-400',
    normalButton: 'bg-white/90 hover:bg-white text-slate-900 border-white/30 backdrop-blur-md shadow-blue-950/20',
    featuredButton: 'bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 hover:from-amber-200 hover:to-amber-100 text-slate-900 border-amber-300 ring-2 ring-amber-400/50 shadow-amber-950/20',
    iconContainer: 'bg-blue-100 text-blue-700'
  },
  midnight: {
    wrapper: 'bg-gradient-to-br from-slate-950 via-slate-900 to-zinc-950 text-white',
    avatarGlow: 'bg-gradient-to-r from-slate-600 to-zinc-400',
    normalButton: 'bg-slate-900/90 hover:bg-slate-800 text-white border-slate-700/60 backdrop-blur-md shadow-black/50',
    featuredButton: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-indigo-400 ring-2 ring-indigo-400/40 shadow-indigo-950/50',
    iconContainer: 'bg-slate-800 text-slate-200'
  }
}

const currentThemeClass = computed(() => {
  return themes[profile.value.theme] || themes.indigo
})

async function fetchData() {
  try {
    const res = await $fetch<{ profile: ProfileData; links: LinkItem[] }>('/api/data')
    if (res) {
      profile.value = res.profile
      links.value = res.links
      useHead({
        title: res.profile.name
      })
    }
  } catch (err) {
    console.error('Failed to load portal data:', err)
  } finally {
    loading.value = false
  }
}

function triggerToast(msg: string) {
  toastMessage.value = msg
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

function sharePortal() {
  if (process.client) {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: profile.value.name,
        text: profile.value.bio,
        url: url
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(url)
      triggerToast('Tautan berhasil disalin ke clipboard!')
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>
