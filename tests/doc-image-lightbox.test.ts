import { afterEach, describe, expect, it } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import DocImageLightbox from '../docs/.vitepress/theme/DocImageLightbox.vue'
import { isZoomableDocImage } from '../docs/.vitepress/theme/doc-image-lightbox'

const apps: App[] = []

function mountLightbox(markup: string) {
  document.body.innerHTML = `<main class="vp-doc">${markup}</main><div id="host"></div>`
  const app = createApp(DocImageLightbox)
  app.mount('#host')
  apps.push(app)
}

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

describe('document image eligibility', () => {
  it('enhances ordinary document images with keyboard semantics', async () => {
    mountLightbox('<img src="/diagram.png" alt="能力架构图">')
    await nextTick()

    const image = document.querySelector<HTMLImageElement>('.vp-doc img')!
    expect(isZoomableDocImage(image)).toBe(true)
    expect(image.classList.contains('wbx-doc-image--zoomable')).toBe(true)
    expect(image.tabIndex).toBe(0)
    expect(image.getAttribute('role')).toBe('button')
    expect(image.getAttribute('aria-label')).toBe('放大查看：能力架构图')
  })

  it('does not enhance linked, empty-src, or non-document images', async () => {
    mountLightbox(
      '<a href="/full.png"><img src="/linked.png" alt="链接图"></a><img src="" alt="空图"><img alt="缺少地址">',
    )
    document.body.insertAdjacentHTML(
      'afterbegin',
      '<img src="/logo.png" alt="Logo">',
    )
    await nextTick()

    expect(document.querySelectorAll('.wbx-doc-image--zoomable')).toHaveLength(0)
  })
})

describe('document image lightbox interaction', () => {
  it('opens by click and shows the image caption', async () => {
    mountLightbox('<img src="/diagram.png" alt="能力架构图">')
    await nextTick()

    document.querySelector<HTMLImageElement>('.vp-doc img')!.click()
    await nextTick()

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!
    expect(dialog).toBeTruthy()
    expect(dialog.querySelector('img')?.getAttribute('src')).toBe('/diagram.png')
    expect(dialog.querySelector('figcaption')?.textContent).toBe('能力架构图')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it.each(['Enter', ' '])('opens with the %s key', async (key) => {
    mountLightbox('<img src="/diagram.png" alt="能力架构图">')
    await nextTick()
    const image = document.querySelector<HTMLImageElement>('.vp-doc img')!

    image.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeTruthy()
  })

  it('omits the caption when alt text is empty', async () => {
    mountLightbox('<img src="/diagram.png" alt="">')
    await nextTick()
    document.querySelector<HTMLImageElement>('.vp-doc img')!.click()
    await nextTick()

    expect(document.querySelector('[role="dialog"] figcaption')).toBeNull()
  })

  it.each([
    ['close button', '.wbx-doc-lightbox__close'],
    ['backdrop', '.wbx-doc-lightbox'],
  ])('closes from the %s', async (_label, selector) => {
    mountLightbox('<img src="/diagram.png" alt="能力架构图">')
    await nextTick()
    document.querySelector<HTMLImageElement>('.vp-doc img')!.click()
    await nextTick()

    document.querySelector<HTMLElement>(selector)!.click()
    await new Promise((resolve) => setTimeout(resolve, 180))

    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('closes with Escape and restores focus and body scrolling', async () => {
    document.body.style.overflow = 'auto'
    mountLightbox('<img src="/diagram.png" alt="能力架构图">')
    await nextTick()
    const image = document.querySelector<HTMLImageElement>('.vp-doc img')!
    image.click()
    await nextTick()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 180))

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.style.overflow).toBe('auto')
    expect(document.activeElement).toBe(image)
  })

  it('enhances images added after navigation', async () => {
    mountLightbox('')
    await nextTick()
    const image = document.createElement('img')
    image.src = '/late.png'
    image.alt = '动态图片'
    document.querySelector('.vp-doc')!.append(image)
    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(image.classList.contains('wbx-doc-image--zoomable')).toBe(true)
  })
})
