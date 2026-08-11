<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute } from 'vitepress'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { isCaseIndexRoute, isHomeRoute, isReadingRoute } from '../route-state'
import CommunityQr, { openCommunityQr } from './CommunityQr.vue'
import DocImageLightbox from './DocImageLightbox.vue'
import FloatingQuickAccess from './FloatingQuickAccess.vue'
import HomePage from './HomePage.vue'

const route = useRoute()
const { site } = useData()
const isHome = computed(() => isHomeRoute(route.path, site.value.base))
const isReading = computed(() => isReadingRoute(route.path, site.value.base))
const isCaseIndex = computed(() => isCaseIndexRoute(route.path, site.value.base))

function handleCommunityQrTrigger(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  ) {
    return
  }

  const trigger = event.target.closest<HTMLAnchorElement>('a[href="#community"]')
  if (!trigger || trigger.textContent?.trim() !== '交流群') return

  event.preventDefault()
  event.stopPropagation()
  openCommunityQr(trigger)
}

onMounted(() => {
  document.addEventListener('click', handleCommunityQrTrigger, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleCommunityQrTrigger, true)
})
</script>

<template>
  <DefaultTheme.Layout
    :class="{
      'wbx-home-layout': isHome,
      'wbx-reading-layout': isReading,
      'wbx-cases-layout': isCaseIndex,
    }"
  >
    <template #home-hero-before>
      <HomePage v-if="isHome" />
    </template>

    <template #layout-bottom>
      <CommunityQr />
      <DocImageLightbox />
      <FloatingQuickAccess />
    </template>
  </DefaultTheme.Layout>
</template>
