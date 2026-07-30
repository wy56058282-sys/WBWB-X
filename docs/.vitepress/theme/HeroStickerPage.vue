<script setup lang="ts">
import { ref } from 'vue'
import type { HeroStickerPartner } from './heroPartners'

defineProps<{ partners: HeroStickerPartner[] }>()

const isOpen = ref(false)
const open = () => { isOpen.value = true }
const close = () => { isOpen.value = false }
const toggle = () => { isOpen.value = !isOpen.value }
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}
</script>

<template>
  <div
    class="wbx-sticker-page"
    :data-open="String(isOpen)"
    @mouseleave="close"
    @keydown="onKeydown"
  >
    <div class="wbx-sticker-page__inside" aria-label="合作伙伴">
      <a
        v-for="partner in partners"
        :key="partner.name"
        class="wbx-partner-sticker"
        :href="partner.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`访问${partner.name === '星火集' ? '' : ' '}${partner.name}`"
      >
        <img
          :src="partner.logo"
          :alt="partner.name"
          @error="($event.currentTarget as HTMLImageElement).hidden = true"
        />
        <span class="wbx-partner-sticker__fallback">{{ partner.name }}</span>
      </a>
    </div>
    <div class="wbx-sticker-page__cover">
      <slot />
    </div>
    <button
      class="wbx-sticker-page__trigger"
      type="button"
      :aria-expanded="isOpen"
      aria-label="翻开合作伙伴贴纸页"
      @mouseenter="open"
      @click="toggle"
    >
      <span aria-hidden="true">翻开看看</span>
    </button>
  </div>
</template>
