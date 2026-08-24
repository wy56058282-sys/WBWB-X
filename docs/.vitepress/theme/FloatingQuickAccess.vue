<script setup lang="ts">
import { withBase } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const isExpanded = ref(false)
const showQrDialog = ref(false)
const showCopiedToast = ref(false)
const hoveredItem = ref<string | null>(null)
const qrDialog = ref<HTMLElement | null>(null)
const qrPopupStyle = ref<Record<string, string>>({})

const TEACHING_MATERIALS_URL = 'https://pan.quark.cn/s/4b2488289c79'
const SPARKX_URL = 'https://www.sparkx.zone/'
const CONTACT_EMAIL = 'contact@sparkx.zone'
const QR_IMAGE_PATH = '/brand/wechat-official-qr.png'

const menuItems = [
  { id: 'share', label: '分享', icon: 'share' },
  { id: 'materials', label: '教学资料', icon: 'download' },
  { id: 'sparkx', label: '星火集', icon: 'spark' },
  { id: 'qrcode', label: '公众号', icon: 'qrcode' },
  { id: 'contact', label: '联系主理人', icon: 'mail' },
] as const

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

function expandOnHover() {
  isExpanded.value = true
}

function collapseOnLeave() {
  isExpanded.value = false
}

function collapse() {
  isExpanded.value = false
}

const SHARE_URL = 'https://wbx.sparkx.zone/'

async function copyLink() {
  try {
    await navigator.clipboard.writeText(SHARE_URL)
    showCopiedToast.value = true
    setTimeout(() => {
      showCopiedToast.value = false
    }, 2000)
  } catch {
    // Fallback for older browsers
    const input = document.createElement('input')
    input.value = SHARE_URL
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
    showCopiedToast.value = true
    setTimeout(() => {
      showCopiedToast.value = false
    }, 2000)
  }
  collapse()
}

function onItemHover(itemId: string) {
  hoveredItem.value = itemId
  if (itemId === 'qrcode') {
    positionQrPopup()
    showQrDialog.value = true
  }
}

function onItemLeave(itemId: string) {
  hoveredItem.value = null
  if (itemId === 'qrcode') {
    showQrDialog.value = false
  }
}

function handleItemClick(itemId: string) {
  switch (itemId) {
    case 'share':
      copyLink()
      break
    case 'materials':
      window.open(TEACHING_MATERIALS_URL, '_blank', 'noopener,noreferrer')
      collapse()
      break
    case 'sparkx':
      window.open(SPARKX_URL, '_blank', 'noopener,noreferrer')
      collapse()
      break
    case 'contact':
      window.location.href = `mailto:${CONTACT_EMAIL}`
      collapse()
      break
  }
}

function positionQrPopup() {
  void nextTick(() => {
    const qrButton = document.querySelector<HTMLElement>(
      '.wbx-fab__item[aria-label="公众号"]',
    )
    if (!qrButton) return
    const rect = qrButton.getBoundingClientRect()
    const popupWidth = 224 // 200px image + 24px padding
    qrPopupStyle.value = {
      position: 'fixed',
      right: `${window.innerWidth - rect.left + 10}px`,
      bottom: `${window.innerHeight - rect.bottom}px`,
      width: `${popupWidth}px`,
    }
  })
}

function handleDocumentClick(event: MouseEvent) {
  if (!isExpanded.value) return
  const target = event.target as Node
  const fab = document.querySelector('.wbx-fab')
  if (fab && !fab.contains(target)) {
    collapse()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    if (showQrDialog.value) {
      showQrDialog.value = false
      return
    }
    if (isExpanded.value) {
      collapse()
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="wbx-fab" @mouseenter="expandOnHover" @mouseleave="collapseOnLeave">
    <!-- Toast for copy success -->
    <Transition name="wbx-fab-toast">
      <div v-if="showCopiedToast" class="wbx-fab__toast" role="status" aria-live="polite">
        链接已复制
      </div>
    </Transition>

    <!-- Expanded menu items -->
    <Transition name="wbx-fab-menu">
      <div v-if="isExpanded" class="wbx-fab__menu" role="menu">
        <button
          v-for="item in menuItems"
          :key="item.id"
          class="wbx-fab__item"
          role="menuitem"
          :aria-label="item.label"
          @mouseenter="onItemHover(item.id)"
          @mouseleave="onItemLeave(item.id)"
          @click="handleItemClick(item.id)"
        >
          <span class="wbx-fab__icon" aria-hidden="true">
            <!-- Share icon (HackerNoon Pixel) -->
            <svg v-if="item.icon === 'share'" viewBox="0 0 24 24" width="20" height="20">
              <polygon fill="currentColor" points="22 4 22 6 21 6 21 8 20 8 20 9 15 9 15 8 13 8 13 9 12 9 12 10 11 10 11 14 12 14 12 15 13 15 13 16 15 16 15 15 20 15 20 16 21 16 21 18 22 18 22 20 21 20 21 22 20 22 20 23 15 23 15 22 14 22 14 20 13 20 13 18 12 18 12 17 11 17 11 16 10 16 10 15 9 15 9 16 4 16 4 15 3 15 3 13 2 13 2 11 3 11 3 9 4 9 4 8 9 8 9 9 10 9 10 8 11 8 11 7 12 7 12 6 13 6 13 4 14 4 14 2 15 2 15 1 20 1 20 2 21 2 21 4 22 4"/>
            </svg>
            <!-- Download icon (HackerNoon Pixel) -->
            <svg v-else-if="item.icon === 'download'" viewBox="0 0 24 24" width="20" height="20">
              <rect fill="currentColor" x="2" y="20" width="20" height="3"/>
              <polygon fill="currentColor" points="20 8 20 10 19 10 19 11 18 11 18 12 17 12 17 13 16 13 16 14 15 14 15 15 14 15 14 16 13 16 13 17 11 17 11 16 10 16 10 15 9 15 9 14 8 14 8 13 7 13 7 12 6 12 6 11 5 11 5 10 4 10 4 8 5 8 5 7 7 7 7 8 8 8 8 9 9 9 9 10 10 10 10 1 14 1 14 10 15 10 15 9 16 9 16 8 17 8 17 7 19 7 19 8 20 8"/>
            </svg>
            <!-- Star icon (HackerNoon Pixel) -->
            <svg v-else-if="item.icon === 'spark'" viewBox="0 0 24 24" width="20" height="20">
              <polygon fill="currentColor" points="23 8 23 10 22 10 22 11 21 11 21 12 20 12 20 13 19 13 19 14 18 14 18 19 19 19 19 23 17 23 17 22 15 22 15 21 13 21 13 20 11 20 11 21 9 21 9 22 7 22 7 23 5 23 5 19 6 19 6 14 5 14 5 13 4 13 4 12 3 12 3 11 2 11 2 10 1 10 1 8 8 8 8 6 9 6 9 4 10 4 10 2 11 2 11 1 13 1 13 2 14 2 14 4 15 4 15 6 16 6 16 8 23 8"/>
            </svg>
            <!-- QR code icon -->
            <svg v-else-if="item.icon === 'qrcode'" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zm-6 4h2v2h-2zM15 15h2v2h-2zM17 17h2v2h-2zM13 17h2v2h-2zM19 13h2v2h-2zM17 9h2v2h-2zM19 7h2v2h-2z"
              />
            </svg>
            <!-- Mail icon (HackerNoon Pixel) -->
            <svg v-else-if="item.icon === 'mail'" viewBox="0 0 24 24" width="20" height="20">
              <polygon fill="currentColor" points="21 4 21 5 20 5 20 6 19 6 19 7 18 7 18 8 17 8 17 9 16 9 16 10 15 10 15 11 14 11 14 12 13 12 13 13 11 13 11 12 10 12 10 11 9 11 9 10 8 10 8 9 7 9 7 8 6 8 6 7 5 7 5 6 4 6 4 5 3 5 3 4 21 4"/>
              <polygon fill="currentColor" points="23 5 23 19 22 19 22 20 2 20 2 19 1 19 1 5 3 5 3 6 4 6 4 7 5 7 5 8 6 8 6 9 7 9 7 10 8 10 8 11 9 11 9 12 10 12 10 13 11 13 11 14 13 14 13 13 14 13 14 12 15 12 15 11 16 11 16 10 17 10 17 9 18 9 18 8 19 8 19 7 20 7 20 6 21 6 21 5 23 5"/>
            </svg>
          </span>
          <span v-if="item.id !== 'qrcode'" class="wbx-fab__tooltip">{{ item.label }}</span>
        </button>
      </div>
    </Transition>

    <!-- Main toggle button -->
    <button
      class="wbx-fab__toggle"
      :class="{ 'wbx-fab__toggle--active': isExpanded }"
      type="button"
      aria-label="快捷入口"
      aria-expanded="false"
      @click="toggleExpand"
    >
      <span class="wbx-fab__toggle-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <path
            fill="currentColor"
            d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
          />
        </svg>
      </span>
    </button>

    <!-- QR Code Popup (left of FAB) -->
    <Teleport to="body">
      <Transition name="wbx-fab-qr">
        <div
          v-if="showQrDialog"
          class="wbx-fab-qr-popup"
          :style="qrPopupStyle"
          @mouseenter="showQrDialog = true"
          @mouseleave="showQrDialog = false"
        >
          <img
            class="wbx-fab-qr-popup__image"
            :src="withBase(QR_IMAGE_PATH)"
            alt="公众号二维码"
            width="200"
            height="200"
          />
          <p class="wbx-fab-qr-popup__help">扫描二维码关注公众号</p>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
