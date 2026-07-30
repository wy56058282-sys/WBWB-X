<script lang="ts">
type CommunityQrListener = (trigger: HTMLElement | null) => void

const listeners = new Set<CommunityQrListener>()

/** Opens the globally mounted community dialog from a VitePress nav control. */
export function openCommunityQr(trigger: HTMLElement | null = null) {
  listeners.forEach((listener) => listener(trigger))
}
</script>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { brand } from '../brand'

const isOpen = ref(false)
const dialog = ref<HTMLElement | null>(null)
let activeTrigger: HTMLElement | null = null
let previousBodyOverflow = ''

function lockBackgroundScroll() {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

function unlockBackgroundScroll() {
  document.body.style.overflow = previousBodyOverflow
}

function open(trigger: HTMLElement | null) {
  if (isOpen.value) return

  activeTrigger = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null)
  isOpen.value = true
  lockBackgroundScroll()
  void nextTick(() => dialog.value?.focus())
}

function close() {
  if (!isOpen.value) return

  isOpen.value = false
  unlockBackgroundScroll()
  activeTrigger?.focus()
  activeTrigger = null
}

function focusableElements() {
  return dialog.value
    ? Array.from(
        dialog.value.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute('hidden'))
    : []
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab') return

  const focusable = focusableElements()
  if (focusable.length === 0) {
    event.preventDefault()
    dialog.value?.focus()
    return
  }

  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const activeElement = document.activeElement

  if (event.shiftKey && (activeElement === first || activeElement === dialog.value)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  listeners.add(open)
})

onBeforeUnmount(() => {
  listeners.delete(open)
  if (isOpen.value) unlockBackgroundScroll()
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="wbx-community-qr__backdrop" @click.self="close">
      <section
        ref="dialog"
        class="wbx-community-qr"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wbx-community-qr-title"
        aria-describedby="wbx-community-qr-help wbx-community-qr-maintenance"
        tabindex="-1"
        @keydown="handleKeydown"
      >
        <div class="wbx-community-qr__heading">
          <h2 id="wbx-community-qr-title">加入交流群</h2>
          <button class="wbx-community-qr__close" type="button" aria-label="关闭" @click="close">
            <span aria-hidden="true">×</span>
            <span class="wbx-community-qr__close-label">关闭</span>
          </button>
        </div>

        <img
          class="wbx-community-qr__image"
          :src="brand.qrPath"
          alt="WorkBuddy WB-X 微信交流群二维码"
          width="800"
          height="800"
        />

        <p id="wbx-community-qr-help" class="wbx-community-qr__help">按 Escape 关闭</p>
        <p id="wbx-community-qr-maintenance" class="wbx-community-qr__maintenance">
          二维码过期后，在 GitHub 中覆盖同名文件即可更新。
        </p>
      </section>
    </div>
  </Teleport>
</template>
