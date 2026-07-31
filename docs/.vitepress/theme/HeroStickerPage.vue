<script setup lang="ts">
import { withBase } from 'vitepress'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { HeroStickerPartner } from './heroPartners'

defineProps<{ partners: HeroStickerPartner[] }>()

const isOpen = ref(false)
const page = ref<HTMLElement | null>(null)
const inside = ref<HTMLElement | null>(null)
const cover = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const open = () => {
  const shouldMoveFocus = cover.value?.contains(document.activeElement)
  isOpen.value = true
  if (shouldMoveFocus) trigger.value?.focus()
}
const close = (restoreFocus = false) => {
  if (!isOpen.value) return

  const shouldRestoreFocus =
    restoreFocus || inside.value?.contains(document.activeElement)
  isOpen.value = false
  if (shouldRestoreFocus) trigger.value?.focus()
}
const toggle = () => {
  if (isOpen.value) close()
  else open()
}
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
const onDocumentKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) close()
}
const onDocumentPointerdown = (event: PointerEvent) => {
  if (
    isOpen.value &&
    event.target instanceof Node &&
    !page.value?.contains(event.target)
  ) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerdown)
  document.addEventListener('keydown', onDocumentKeydown)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerdown)
  document.removeEventListener('keydown', onDocumentKeydown)
})
</script>

<template>
  <div
    ref="page"
    class="wbx-sticker-page"
    :data-open="String(isOpen)"
    @pointerleave="onPointerleave"
  >
    <button
      ref="trigger"
      class="wbx-sticker-page__trigger"
      type="button"
      :aria-expanded="isOpen"
      :aria-label="isOpen ? '关闭合作伙伴贴纸页' : '翻开合作伙伴贴纸页'"
      @pointerenter="onPointerenter"
      @click="onClick"
    >
      <span aria-hidden="true">{{ isOpen ? '关闭贴纸' : '翻开看看' }}</span>
    </button>
    <div
      ref="inside"
      class="wbx-sticker-page__inside"
      aria-label="合作伙伴"
      :aria-hidden="String(!isOpen)"
      :inert="!isOpen ? '' : null"
    >
      <a
        v-for="partner in partners"
        :key="partner.name"
        class="wbx-partner-sticker"
        :href="partner.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="partner.ariaLabel"
        :tabindex="isOpen ? 0 : -1"
      >
        <img
          :src="withBase(partner.logo)"
          :alt="partner.name"
          @error="($event.currentTarget as HTMLImageElement).hidden = true"
        />
        <span class="wbx-partner-sticker__fallback">{{ partner.name }}</span>
      </a>
    </div>
    <div
      ref="cover"
      class="wbx-sticker-page__cover"
      :aria-hidden="String(isOpen)"
      :inert="isOpen ? '' : null"
    >
      <slot />
    </div>
  </div>
</template>
