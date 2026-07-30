<script setup lang="ts">
import { ref } from 'vue'
import type { HeroStickerPartner } from './heroPartners'

defineProps<{ partners: HeroStickerPartner[] }>()

const isOpen = ref(false)
const trigger = ref<HTMLButtonElement | null>(null)
const open = () => { isOpen.value = true }
const close = () => { isOpen.value = false }
const toggle = () => { isOpen.value = !isOpen.value }
const onPointerenter = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') open()
}
const onPointerleave = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') close()
}
const onClick = (event: MouseEvent & { pointerType?: string }) => {
  if (event.pointerType === 'mouse') open()
  else toggle()
}
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
    trigger.value?.focus()
  }
}
</script>

<template>
  <div
    class="wbx-sticker-page"
    :data-open="String(isOpen)"
    @pointerleave="onPointerleave"
    @keydown="onKeydown"
  >
    <button
      ref="trigger"
      class="wbx-sticker-page__trigger"
      type="button"
      :aria-expanded="isOpen"
      aria-label="翻开合作伙伴贴纸页"
      @pointerenter="onPointerenter"
      @click="onClick"
    >
      <span aria-hidden="true">翻开看看</span>
    </button>
    <div class="wbx-sticker-page__inside" aria-label="合作伙伴">
      <a
        v-for="partner in partners"
        :key="partner.name"
        class="wbx-partner-sticker"
        :href="partner.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`访问${partner.name === '星火集' ? '' : ' '}${partner.name}`"
        :tabindex="isOpen ? 0 : -1"
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
  </div>
</template>
