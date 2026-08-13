<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useData, useRoute, withBase } from 'vitepress'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  isCaseDetailRoute,
  isCaseIndexRoute,
  isHomeRoute,
  isReadingRoute,
} from '../route-state'
import CommunityQr, {
  cancelCommunityQrClose,
  pinCommunityQr,
  previewCommunityQr,
  scheduleCommunityQrClose,
} from './CommunityQr.vue'
import DocImageLightbox from './DocImageLightbox.vue'
import FloatingQuickAccess from './FloatingQuickAccess.vue'
import HomePage from './HomePage.vue'

const route = useRoute()
const { site } = useData()
const isHome = computed(() => isHomeRoute(route.path, site.value.base))
const isReading = computed(() => isReadingRoute(route.path, site.value.base))
const isCaseIndex = computed(() => isCaseIndexRoute(route.path, site.value.base))
const isCaseDetail = computed(() => isCaseDetailRoute(route.path, site.value.base))
let hoverMedia: MediaQueryList | null = null

function communityQrTrigger(target: EventTarget | null) {
  if (!(target instanceof Element)) return null
  const trigger = target.closest<HTMLAnchorElement>('a[href="#community"]')
  return trigger?.textContent?.trim() === '交流群' ? trigger : null
}

function handleCommunityQrTrigger(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !communityQrTrigger(event.target)
  ) {
    return
  }

  const trigger = communityQrTrigger(event.target)
  if (!trigger) return

  event.preventDefault()
  event.stopPropagation()
  pinCommunityQr(trigger)
}

function handleCommunityQrPointerOver(event: PointerEvent) {
  if (!hoverMedia?.matches) return
  const trigger = communityQrTrigger(event.target)
  if (!trigger || (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) {
    return
  }

  cancelCommunityQrClose()
  previewCommunityQr(trigger)
}

function handleCommunityQrPointerOut(event: PointerEvent) {
  if (!hoverMedia?.matches) return
  const trigger = communityQrTrigger(event.target)
  if (!trigger || (event.relatedTarget instanceof Node && trigger.contains(event.relatedTarget))) {
    return
  }

  scheduleCommunityQrClose()
}

onMounted(() => {
  hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)')
  document.addEventListener('click', handleCommunityQrTrigger, true)
  document.addEventListener('pointerover', handleCommunityQrPointerOver, true)
  document.addEventListener('pointerout', handleCommunityQrPointerOut, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleCommunityQrTrigger, true)
  document.removeEventListener('pointerover', handleCommunityQrPointerOver, true)
  document.removeEventListener('pointerout', handleCommunityQrPointerOut, true)
  hoverMedia = null
})
</script>

<template>
  <DefaultTheme.Layout
    :class="{
      'wbx-home-layout': isHome,
      'wbx-reading-layout': isReading,
      'wbx-cases-layout': isCaseIndex,
      'wbx-case-detail-layout': isCaseDetail,
    }"
  >
    <template #home-hero-before>
      <HomePage v-if="isHome" />
    </template>

    <template #doc-before>
      <a
        v-if="isCaseDetail"
        class="wbx-case-detail-back"
        :href="withBase('/cases/')"
      >
        <i class="hn hn-arrow-left-solid" aria-hidden="true" />
        返回案例集
      </a>
    </template>

    <template #layout-bottom>
      <CommunityQr />
      <DocImageLightbox />
      <FloatingQuickAccess />
    </template>
  </DefaultTheme.Layout>
</template>
