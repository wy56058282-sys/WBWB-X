<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { isZoomableDocImage } from './doc-image-lightbox'

const activeSrc = ref('')
const activeCaption = ref('')
let sourceImage: HTMLImageElement | undefined
let previousBodyOverflow = ''

function enhanceImage(image: HTMLImageElement) {
  if (!isZoomableDocImage(image)) return

  image.classList.add('wbx-doc-image--zoomable')
  image.tabIndex = 0
  image.setAttribute('role', 'button')

  const alt = image.alt.trim()
  image.setAttribute('aria-label', alt ? `放大查看：${alt}` : '放大查看图片')
}

function enhanceImages(root: ParentNode = document) {
  if (root instanceof HTMLImageElement) enhanceImage(root)
  root
    .querySelectorAll<HTMLImageElement>('.vp-doc img')
    .forEach(enhanceImage)
}

let observer: MutationObserver | undefined

function open(image: HTMLImageElement) {
  sourceImage = image
  activeSrc.value = image.currentSrc || image.getAttribute('src') || ''
  activeCaption.value = image.alt.trim()
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
}

async function close() {
  const trigger = sourceImage
  activeSrc.value = ''
  activeCaption.value = ''
  sourceImage = undefined
  document.body.style.overflow = previousBodyOverflow
  await nextTick()
  if (trigger && document.contains(trigger)) trigger.focus()
}

function handleClick(event: MouseEvent) {
  if (!isZoomableDocImage(event.target)) return
  event.preventDefault()
  open(event.target)
}

function handleKeydown(event: KeyboardEvent) {
  if (activeSrc.value && event.key === 'Escape') {
    event.preventDefault()
    void close()
    return
  }
  if (
    isZoomableDocImage(event.target) &&
    (event.key === 'Enter' || event.key === ' ')
  ) {
    event.preventDefault()
    open(event.target)
  }
}

onMounted(() => {
  enhanceImages()
  document.addEventListener('click', handleClick)
  document.addEventListener('keydown', handleKeydown)
  observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) enhanceImages(node)
      })
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
})

onBeforeUnmount(() => {
  observer?.disconnect()
  document.removeEventListener('click', handleClick)
  document.removeEventListener('keydown', handleKeydown)
  if (activeSrc.value) document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <span class="wbx-doc-lightbox-root" aria-hidden="true" />
  <Teleport to="body">
    <Transition name="wbx-doc-lightbox">
      <div
        v-if="activeSrc"
        class="wbx-doc-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="图片放大预览"
        @click.self="close"
      >
        <button class="wbx-doc-lightbox__close" type="button" aria-label="关闭图片预览" @click="close">
          <span aria-hidden="true">×</span>
        </button>
        <figure class="wbx-doc-lightbox__figure">
          <img :src="activeSrc" :alt="activeCaption" @error="close">
          <figcaption v-if="activeCaption">{{ activeCaption }}</figcaption>
        </figure>
      </div>
    </Transition>
  </Teleport>
</template>
