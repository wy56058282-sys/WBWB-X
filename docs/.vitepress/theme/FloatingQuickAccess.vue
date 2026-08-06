<script setup lang="ts">
import { withBase } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const isExpanded = ref(false)
const showQrDialog = ref(false)
const showCopiedToast = ref(false)
const hoveredItem = ref<string | null>(null)
const qrDialog = ref<HTMLElement | null>(null)

const TEACHING_MATERIALS_URL = 'https://pan.quark.cn/s/bf6971c32304?pwd=4yCv'
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

async function copyLink() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    showCopiedToast.value = true
    setTimeout(() => {
      showCopiedToast.value = false
    }, 2000)
  } catch {
    // Fallback for older browsers
    const input = document.createElement('input')
    input.value = window.location.href
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

function openQrDialog() {
  showQrDialog.value = true
  void nextTick(() => {
    qrDialog.value?.focus()
  })
}

function closeQrDialog() {
  showQrDialog.value = false
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
    case 'qrcode':
      openQrDialog()
      collapse()
      break
    case 'contact':
      window.location.href = `mailto:${CONTACT_EMAIL}`
      collapse()
      break
  }
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
      closeQrDialog()
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
          @mouseenter="hoveredItem = item.id"
          @mouseleave="hoveredItem = null"
          @click="handleItemClick(item.id)"
        >
          <span class="wbx-fab__icon" aria-hidden="true">
            <!-- Share icon -->
            <svg v-if="item.icon === 'share'" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.15c-.05.21-.08.43-.08.66 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"
              />
            </svg>
            <!-- Download icon -->
            <svg v-else-if="item.icon === 'download'" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
              />
            </svg>
            <!-- Spark/star icon -->
            <svg v-else-if="item.icon === 'spark'" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
              />
            </svg>
            <!-- QR code icon -->
            <svg v-else-if="item.icon === 'qrcode'" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zm-6 4h2v2h-2zM15 15h2v2h-2zM17 17h2v2h-2zM13 17h2v2h-2zM19 13h2v2h-2zM17 9h2v2h-2zM19 7h2v2h-2z"
              />
            </svg>
            <!-- Mail icon -->
            <svg v-else-if="item.icon === 'mail'" viewBox="0 0 24 24" width="20" height="20">
              <path
                fill="currentColor"
                d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>
          </span>
          <span class="wbx-fab__tooltip">{{ item.label }}</span>
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

    <!-- QR Code Dialog -->
    <Teleport to="body">
      <div v-if="showQrDialog" class="wbx-fab-qr__layer">
        <section
          ref="qrDialog"
          class="wbx-fab-qr"
          role="dialog"
          aria-labelledby="wbx-fab-qr-title"
          tabindex="-1"
          @keydown="handleKeydown"
        >
          <div class="wbx-fab-qr__heading">
            <h2 id="wbx-fab-qr-title">关注公众号</h2>
            <button
              class="wbx-fab-qr__close"
              type="button"
              aria-label="关闭"
              @click="closeQrDialog"
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
          <img
            class="wbx-fab-qr__image"
            :src="withBase(QR_IMAGE_PATH)"
            alt="公众号二维码"
            width="300"
            height="300"
          />
          <p class="wbx-fab-qr__help">扫描二维码关注公众号</p>
        </section>
      </div>
    </Teleport>
  </div>
</template>
