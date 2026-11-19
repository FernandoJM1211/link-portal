<script setup lang="ts">
import type { PublicPortal } from '~~/shared/types/portal'

/**
 * Halaman publik portal: `domain/<kode>`.
 * Dirender di server (SSR) agar isi & meta tag langsung ada di HTML —
 * dibutuhkan untuk preview link di WhatsApp/Telegram/media sosial.
 */

const route = useRoute()
const code = normalizePortalCode(String(route.params.code ?? ''))

// Kode yang formatnya tidak mungkin valid langsung 404 tanpa memanggil API.
if (getPortalCodeError(code)) {
  throw createError({ statusCode: 404, statusMessage: 'Portal tidak ditemukan.', fatal: true })
}

const { data, error } = await useFetch<{ success: boolean, data: PublicPortal }>(`/api/portals/${code}`, {
  key: `public-portal-${code}`,
})

if (error.value || !data.value?.data) {
  const statusCode = error.value?.statusCode ?? 404
  throw createError({
    statusCode: statusCode === 404 ? 404 : 500,
    statusMessage: statusCode === 404 ? 'Portal tidak ditemukan atau sedang tidak aktif.' : 'Portal gagal dimuat.',
    fatal: true,
  })
}

const portal = computed(() => data.value!.data)
const theme = computed(() => getPortalTheme(portal.value.theme))

// Cache di CDN Vercel 60 detik (+ sajikan versi lama sambil memperbarui) agar
// kunjungan ramai tidak membebani server maupun kuota Google Sheets.
if (import.meta.server) {
  useResponseHeader('Cache-Control').value = 'public, max-age=0, s-maxage=60, stale-while-revalidate=300'
}

const requestUrl = useRequestURL()
const pageUrl = `${requestUrl.origin}/${code}`
const description = computed(() => (
  portal.value.bio || `Kumpulan tautan resmi ${portal.value.name}.`
))

useHead({
  // Halaman publik memakai nama portal saja (tanpa akhiran "· Link Portal").
  titleTemplate: null,
  title: () => portal.value.name,
  htmlAttrs: { lang: 'id' },
  link: [
    { rel: 'canonical', href: pageUrl },
    ...(portal.value.avatar_url ? [{ rel: 'icon' as const, href: portal.value.avatar_url }] : []),
  ],
})

useSeoMeta({
  description: () => description.value,
  themeColor: () => theme.value.themeColor,
  ogType: 'website',
  ogUrl: pageUrl,
  ogTitle: () => portal.value.name,
  ogDescription: () => description.value,
  ogImage: () => portal.value.avatar_url || undefined,
  ogLocale: 'id_ID',
  twitterCard: 'summary',
  twitterTitle: () => portal.value.name,
  twitterDescription: () => description.value,
  twitterImage: () => portal.value.avatar_url || undefined,
})
</script>

<template>
  <PortalView :portal="portal" />
</template>
