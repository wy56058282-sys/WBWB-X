import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, type App } from 'vue'
import HeroStickerPage from '../docs/.vitepress/theme/HeroStickerPage.vue'

const apps: App[] = []
const partners = [
  { name: '星火集', logo: '/sparkx.svg', href: 'https://www.sparkx.zone/' },
  { name: 'WorkBuddy', logo: '/workbuddy.svg', href: 'https://www.workbuddy.ai/' },
  { name: 'Z.ai', logo: '/z-ai.svg', href: 'https://z.ai/subscribe' },
]

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
})

function mountComponent() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () =>
      h(HeroStickerPage, { partners }, {
        default: () => h('span', { class: 'cover-proof' }, 'cover'),
      }),
  })
  app.mount(host)
  apps.push(app)
}

function pointerEvent(type: string, pointerType: string) {
  const event = new MouseEvent(type, { bubbles: true })
  Object.defineProperty(event, 'pointerType', { value: pointerType })
  return event
}

describe('HeroStickerPage', () => {
  it('opens with the trigger and closes with Escape', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!

    expect(root.dataset.open).toBe('false')
    trigger.click()
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')
  })

  it('opens on lower-right pointer entry and closes when leaving the region', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLElement>('.wbx-sticker-page__trigger')!

    trigger.dispatchEvent(pointerEvent('pointerenter', 'mouse'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')

    root.dispatchEvent(new MouseEvent('mouseleave'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')
  })

  it('keeps closed stickers out of the tab order and places them after the trigger', async () => {
    mountComponent()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!
    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-partner-sticker'),
    )

    expect(links.map((link) => link.tabIndex)).toEqual([-1, -1, -1])
    expect(
      links.every(
        (link) =>
          trigger.compareDocumentPosition(link) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
    ).toBe(true)

    trigger.focus()
    trigger.click()
    await Promise.resolve()
    expect(document.activeElement).toBe(trigger)
    expect(links.map((link) => link.tabIndex)).toEqual([0, 0, 0])
  })

  it('keeps mouse hover open through its click and lets touch click toggle', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!

    trigger.dispatchEvent(pointerEvent('pointerenter', 'mouse'))
    trigger.dispatchEvent(pointerEvent('click', 'mouse'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')

    root.dispatchEvent(new MouseEvent('mouseleave'))
    trigger.dispatchEvent(pointerEvent('pointerenter', 'touch'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')

    trigger.dispatchEvent(pointerEvent('click', 'touch'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')
  })

  it('returns focus to the trigger when Escape closes focused stickers', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!
    const link = document.querySelector<HTMLAnchorElement>('.wbx-partner-sticker')!

    trigger.click()
    await Promise.resolve()
    link.focus()
    expect(document.activeElement).toBe(link)

    link.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')
    expect(link.tabIndex).toBe(-1)
    expect(document.activeElement).toBe(trigger)
  })

  it('renders safe external links and a text fallback', () => {
    mountComponent()
    const link = document.querySelector<HTMLAnchorElement>('.wbx-partner-sticker')!

    expect(link.target).toBe('_blank')
    expect(link.rel).toBe('noopener noreferrer')
    expect(link.getAttribute('aria-label')).toBe('访问星火集')
    expect(link.querySelector('.wbx-partner-sticker__fallback')?.textContent).toBe('星火集')
  })
})
