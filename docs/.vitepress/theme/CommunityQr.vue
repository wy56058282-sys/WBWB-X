<script lang="ts">
type CommunityQrAction = 'preview' | 'open-touch' | 'schedule-close' | 'cancel-close'
type CommunityQrListener = (action: CommunityQrAction, trigger?: HTMLElement | null) => void

const listeners = new Set<CommunityQrListener>()

/** Opens the globally mounted community dialog from a VitePress nav control. */
export function openCommunityQr(trigger: HTMLElement | null = null) {
  listeners.forEach((listener) => listener('open-touch', trigger))
}

export function previewCommunityQr(trigger: HTMLElement | null = null) {
  listeners.forEach((listener) => listener('preview', trigger))
}

export function scheduleCommunityQrClose() {
  listeners.forEach((listener) => listener('schedule-close'))
}

export function cancelCommunityQrClose() {
  listeners.forEach((listener) => listener('cancel-close'))
}
</script>

<script setup lang="ts">
import { withBase } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { brand } from '../brand'
import { computeCommunityPopoverPosition } from '../community-popover-position'

const isOpen = ref(false)
const dialog = ref<HTMLElement | null>(null)
const position = ref({ left: 12, top: 12, placement: 'below' as const })
const mode = ref<'closed' | 'preview' | 'touch-open'>('closed')
const CLOSE_DELAY_MS = 180
let activeTrigger: HTMLElement | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

function updatePosition() {
  if (!isOpen.value || !activeTrigger || !dialog.value) return

  position.value = computeCommunityPopoverPosition({
    trigger: activeTrigger.getBoundingClientRect(),
    popover: dialog.value.getBoundingClientRect(),
    viewport: { width: window.innerWidth, height: window.innerHeight },
  })
}

function cancelClose() {
  if (closeTimer === null) return
  clearTimeout(closeTimer)
  closeTimer = null
}

function preview(trigger: HTMLElement | null) {
  cancelClose()
  if (mode.value === 'touch-open') return

  activeTrigger = trigger
  mode.value = 'preview'
  isOpen.value = true
  void nextTick(updatePosition)
}

function openTouch(trigger: HTMLElement | null) {
  cancelClose()
  activeTrigger =
    trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
  mode.value = 'touch-open'
  isOpen.value = true
  void nextTick(updatePosition)
}

function close() {
  if (!isOpen.value) return

  cancelClose()
  isOpen.value = false
  mode.value = 'closed'
  activeTrigger = null
}

function scheduleClose() {
  cancelClose()
  if (mode.value !== 'preview') return
  closeTimer = setTimeout(close, CLOSE_DELAY_MS)
}

function handleAction(action: CommunityQrAction, trigger?: HTMLElement | null) {
  if (action === 'preview') preview(trigger ?? null)
  else if (action === 'open-touch') openTouch(trigger ?? null)
  else if (action === 'schedule-close') scheduleClose()
  else cancelClose()
}

function handleDocumentClick(event: MouseEvent) {
  if (
    !isOpen.value ||
    !(event.target instanceof Node) ||
    dialog.value?.contains(event.target) ||
    activeTrigger?.contains(event.target)
  ) {
    return
  }

  close()
}

function handleKeydown(event: KeyboardEvent) {
  if (isOpen.value && event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

onMounted(() => {
  listeners.add(handleAction)
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('scroll', updatePosition, true)
  window.addEventListener('resize', updatePosition)
})

onBeforeUnmount(() => {
  cancelClose()
  listeners.delete(handleAction)
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('scroll', updatePosition, true)
  window.removeEventListener('resize', updatePosition)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="wbx-community-qr__layer">
      <section
        ref="dialog"
        class="wbx-community-qr"
        role="dialog"
        aria-labelledby="wbx-community-qr-title"
        aria-describedby="wbx-community-qr-help"
        :data-placement="position.placement"
        :style="{ left: `${position.left}px`, top: `${position.top}px` }"
        @pointerenter="cancelClose"
        @pointerleave="scheduleClose"
      >
        <div class="wbx-community-qr__heading">
          <h2 id="wbx-community-qr-title">加入交流群</h2>
        </div>

        <img
          class="wbx-community-qr__image"
          :src="withBase(brand.qrPath)"
          alt="WorkBuddy WB-X 微信交流群二维码"
          width="490"
          height="490"
        />

        <p id="wbx-community-qr-help" class="wbx-community-qr__help">
          欢迎创客一起共创 · 二维码有效期至 8 月 20 日
        </p>
      </section>
    </div>
  </Teleport>
</template>
