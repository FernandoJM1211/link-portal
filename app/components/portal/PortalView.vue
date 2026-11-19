<script setup lang="ts">
import type { PublicPortal } from '~~/shared/types/portal'

/**
 * Tampilan halaman portal (Linktree). Dipakai halaman publik `/<kode>`
 * dan pratinjau di dashboard (`preview`: ukuran menyesuaikan wadah, tombol bagikan nonaktif).
 */
const props = defineProps<{
  portal: PublicPortal
  preview?: boolean
}>()

const theme = computed(() => getPortalTheme(props.portal.theme).classes)

const avatarFailed = ref(false)
watch(() => props.portal.avatar_url, () => {
  avatarFailed.value = false
})

const initial = computed(() => props.portal.name.trim().charAt(0).toUpperCase() || '?')

const socialItems = computed(() => {
  const socials = props.portal.socials

  return [
    { key: 'whatsapp', href: socials.whatsapp, icon: 'i-lucide-message-circle', label: 'WhatsApp' },
    { key: 'instagram', href: socials.instagram, icon: 'i-lucide-instagram', label: 'Instagram' },
    { key: 'website', href: socials.website, icon: 'i-lucide-globe', label: 'Website' },
    { key: 'email', href: socials.email ? `mailto:${socials.email}` : '', icon: 'i-lucide-mail', label: 'Email' },
    { key: 'youtube', href: socials.youtube, icon: 'i-lucide-youtube', label: 'YouTube' },
  ].filter((item) => item.href)
})

const year = new Date().getFullYear()

// Notifikasi kecil "tautan disalin".
const toastMessage = ref('')
let toastTimer: ReturnType<typeof setTimeout> | undefined

function showToast(message: string) {
  toastMessage.value = message
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastMessage.value = ''
  }, 3000)
}

async function sharePortal() {
  if (props.preview) return

  const url = window.location.href

  if (navigator.share) {
    await navigator.share({ title: props.portal.name, text: props.portal.bio, url }).catch(() => {})
    return
  }

  try {
    await navigator.clipboard.writeText(url)
    showToast('Tautan berhasil disalin!')
  } catch {
    showToast('Tautan gagal disalin.')
  }
}
</script>

<template>
  <div
    class="flex flex-col justify-between px-4 py-10 transition-colors duration-500"
    :class="[theme.wrapper, preview ? 'min-h-full' : 'min-h-screen']"
  >
    <!-- Notifikasi -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-2 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="toastMessage"
        role="status"
        class="fixed left-1/2 top-5 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/95 px-5 py-2.5 text-sm font-medium text-white shadow-xl backdrop-blur-md"
      >
        <span class="size-2 rounded-full bg-emerald-400" />
        {{ toastMessage }}
      </div>
    </Transition>

    <div class="mx-auto w-full max-w-md">
      <!-- Tombol bagikan -->
      <div class="mb-4 flex justify-end">
        <button
          type="button"
          class="flex rounded-full border border-white/20 bg-white/20 p-2.5 text-white shadow-sm backdrop-blur-md transition-all hover:bg-white/30 active:scale-90"
          :class="{ 'pointer-events-none': preview }"
          :tabindex="preview ? -1 : undefined"
          title="Bagikan Tautan"
          aria-label="Bagikan tautan portal"
          @click="sharePortal"
        >
          <UIcon name="i-lucide-share-2" class="size-[18px]" />
        </button>
      </div>

      <!-- Profil -->
      <div class="mb-8 flex flex-col items-center text-center">
        <div class="group relative">
          <div
            class="absolute -inset-1 rounded-full opacity-75 blur transition duration-300 group-hover:opacity-100"
            :class="theme.avatarGlow"
          />
          <div class="relative flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl">
            <img
              v-if="portal.avatar_url && !avatarFailed"
              :src="portal.avatar_url"
              :alt="`Logo ${portal.name}`"
              class="size-full object-cover"
              referrerpolicy="no-referrer"
              @error="avatarFailed = true"
            >
            <span v-else class="text-3xl font-extrabold text-slate-700">{{ initial }}</span>
          </div>
        </div>

        <h1 class="mt-4 text-2xl font-bold tracking-tight text-white drop-shadow-sm">
          {{ portal.name || 'Nama Portal' }}
        </h1>
        <p v-if="portal.bio" class="mt-2 max-w-sm whitespace-pre-line text-sm leading-relaxed text-white/90 drop-shadow-sm">
          {{ portal.bio }}
        </p>

        <!-- Media sosial -->
        <div v-if="socialItems.length" class="mt-4 flex items-center gap-3">
          <a
            v-for="item in socialItems"
            :key="item.key"
            :href="item.href"
            target="_blank"
            rel="noopener noreferrer"
            class="flex rounded-full bg-white/15 p-2.5 text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/30 active:scale-95"
            :title="item.label"
            :aria-label="item.label"
          >
            <UIcon :name="item.icon" class="size-5" />
          </a>
        </div>
      </div>

      <!-- Tombol link -->
      <div class="space-y-3.5">
        <div
          v-if="portal.links.length === 0"
          class="rounded-2xl border border-white/20 bg-white/15 p-6 py-10 text-center text-white backdrop-blur-md"
        >
          <UIcon name="i-lucide-circle-help" class="mx-auto mb-2 size-8 opacity-75" />
          <p class="text-base font-medium">
            Belum ada tombol tautan yang aktif.
          </p>
        </div>

        <a
          v-for="link in portal.links"
          :key="link.link_id"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative flex w-full items-center justify-between rounded-2xl border p-4 font-semibold shadow-md transition-all duration-300 active:scale-[0.98]"
          :class="link.is_featured ? theme.featuredButton : theme.normalButton"
        >
          <span
            v-if="link.is_featured"
            class="absolute -top-2 right-4 animate-pulse rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 shadow-sm"
          >
            Unggulan
          </span>

          <span class="flex min-w-0 items-center gap-3.5 pr-2">
            <span
              class="flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
              :class="theme.iconContainer"
            >
              <UIcon :name="toLucideIconName(link.icon)" class="size-5" />
            </span>
            <span class="truncate text-sm tracking-wide sm:text-base">{{ link.title }}</span>
          </span>

          <UIcon
            name="i-lucide-external-link"
            class="size-[18px] shrink-0 opacity-60 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
          />
        </a>
      </div>
    </div>

    <footer class="mt-12 pb-4 text-center text-xs text-white/70">
      <p class="font-medium">
        &copy; {{ year }} {{ portal.name }}
      </p>
    </footer>
  </div>
</template>
