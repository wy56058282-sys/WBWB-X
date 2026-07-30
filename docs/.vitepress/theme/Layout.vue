<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import CommunityQr, { openCommunityQr } from './CommunityQr.vue'
import HomePage from './HomePage.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')

function handleCommunityQrTrigger(event: MouseEvent) {
  if (
    event.defaultPrevented ||
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
  <DefaultTheme.Layout :class="{ 'wbx-home-layout': isHome }">
    <template #home-hero-before>
      <HomePage v-if="isHome" />
    </template>

    <template #layout-bottom>
      <CommunityQr />
    </template>
  </DefaultTheme.Layout>
</template>
