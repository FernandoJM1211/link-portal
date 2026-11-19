<script setup lang="ts">
useHead({
  titleTemplate: (title?: string) => (title ? `${title} · Link Portal` : 'Link Portal'),
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
