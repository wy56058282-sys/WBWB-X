import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
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
  vi.restoreAllMocks()
})

function mountComponent() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () =>
      h(HeroStickerPage, { partners }, {
        default: () =>
          h('a', { class: 'cover-proof', href: '#cover' }, 'cover link'),
      }),
  })
  app.mount(host)
  apps.push(app)
  return app
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

    root.dispatchEvent(pointerEvent('pointerleave', 'mouse'))
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

  it('exposes only the active layer to focus and assistive technology', async () => {
    mountComponent()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!
    const inside = document.querySelector<HTMLElement>('.wbx-sticker-page__inside')!
    const cover = document.querySelector<HTMLElement>('.wbx-sticker-page__cover')!
    const coverLink = document.querySelector<HTMLAnchorElement>('.cover-proof')!
    const partnerLinks = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-partner-sticker'),
    )
    const availableFocusables = () =>
      [trigger, coverLink, ...partnerLinks].filter(
        (element) =>
          !element.closest('[inert]') &&
          !element.closest('[aria-hidden="true"]'),
      )

    expect(inside.hasAttribute('inert')).toBe(true)
    expect(inside.getAttribute('aria-hidden')).toBe('true')
    expect(cover.hasAttribute('inert')).toBe(false)
    expect(cover.getAttribute('aria-hidden')).toBe('false')
    expect(availableFocusables()).toEqual([trigger, coverLink])

    trigger.click()
    await Promise.resolve()

    expect(inside.hasAttribute('inert')).toBe(false)
    expect(inside.getAttribute('aria-hidden')).toBe('false')
    expect(cover.hasAttribute('inert')).toBe(true)
    expect(cover.getAttribute('aria-hidden')).toBe('true')
    expect(availableFocusables()).toEqual([trigger, ...partnerLinks])
  })

  it('moves focus out of the cover when mouse hover opens the page', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!
    const coverLink = document.querySelector<HTMLAnchorElement>('.cover-proof')!

    coverLink.focus()
    expect(document.activeElement).toBe(coverLink)

    trigger.dispatchEvent(pointerEvent('pointerenter', 'mouse'))
    await Promise.resolve()

    expect(root.dataset.open).toBe('true')
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps mouse hover open through its click and lets touch click toggle', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!

    trigger.dispatchEvent(pointerEvent('pointerenter', 'mouse'))
    trigger.dispatchEvent(pointerEvent('click', 'mouse'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')

    root.dispatchEvent(pointerEvent('pointerleave', 'mouse'))
    trigger.dispatchEvent(pointerEvent('pointerenter', 'touch'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')

    trigger.dispatchEvent(pointerEvent('click', 'touch'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')

    trigger.dispatchEvent(pointerEvent('click', 'touch'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')
  })

  it('ignores touch and synthesized mouse leave after touch opens', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!

    trigger.dispatchEvent(pointerEvent('pointerenter', 'touch'))
    trigger.dispatchEvent(pointerEvent('click', 'touch'))
    root.dispatchEvent(pointerEvent('pointerleave', 'touch'))
    root.dispatchEvent(new MouseEvent('mouseleave'))
    await Promise.resolve()

    expect(root.dataset.open).toBe('true')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
  })

  it('closes a touch-opened page on outside pointerdown and restores hidden-layer focus', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!
    const link = document.querySelector<HTMLAnchorElement>('.wbx-partner-sticker')!

    trigger.dispatchEvent(pointerEvent('click', 'touch'))
    await Promise.resolve()
    link.focus()
    link.dispatchEvent(pointerEvent('pointerdown', 'touch'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')

    document.body.dispatchEvent(pointerEvent('pointerdown', 'touch'))
    await Promise.resolve()

    expect(root.dataset.open).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('removes its outside-pointer listener when unmounted', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener')
    const removeEventListener = vi.spyOn(document, 'removeEventListener')
    const app = mountComponent()
    const registration = addEventListener.mock.calls.find(
      ([type]) => type === 'pointerdown',
    )

    expect(registration).toBeDefined()
    if (!registration) return

    app.unmount()
    apps.splice(apps.indexOf(app), 1)

    expect(removeEventListener).toHaveBeenCalledWith(
      'pointerdown',
      registration[1],
    )
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

  it('does not handle Escape or steal cover focus while already closed', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const coverLink = document.querySelector<HTMLAnchorElement>('.cover-proof')!

    coverLink.focus()
    coverLink.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await Promise.resolve()

    expect(root.dataset.open).toBe('false')
    expect(document.activeElement).toBe(coverLink)
  })

  it('renders safe external links and a text fallback', () => {
    mountComponent()
    const link = document.querySelector<HTMLAnchorElement>('.wbx-partner-sticker')!

    expect(link.target).toBe('_blank')
    expect(link.rel).toBe('noopener noreferrer')
    expect(link.getAttribute('aria-label')).toBe('访问星火集')
    expect(link.querySelector('.wbx-partner-sticker__fallback')?.textContent).toBe('星火集')
  })

  it('reveals the inside layer diagonally from the lower-right corner', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

    expect(css).not.toMatch(/perspective:\s*1400px/)
    expect(css).not.toMatch(/rotateY\(/)
    expect(css).not.toMatch(/transform-origin:\s*left center/)
    expect(css).not.toMatch(/backface-visibility:/)
    expect(css).not.toMatch(/transform-style:/)
    expect(css).not.toMatch(/drop-shadow\(/)
    expect(css).not.toMatch(
      /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__cover\s*\{[^}]*opacity:/s,
    )

    expect(css).toMatch(
      /\.wbx-sticker-page__inside\s*\{[^}]*z-index:\s*3;[^}]*clip-path:\s*polygon\(100% 88%,\s*100% 100%,\s*88% 100%,\s*88% 100%\);[^}]*transition:\s*clip-path 280ms cubic-bezier\(0\.77,\s*0,\s*0\.175,\s*1\)/s,
    )
    expect(css).toMatch(
      /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__inside\s*\{[^}]*clip-path:\s*polygon\(0 0,\s*100% 0,\s*100% 100%,\s*0 100%\);/s,
    )
    expect(css).toMatch(
      /\.wbx-sticker-page__trigger\s*\{[^}]*z-index:\s*4;[^}]*width:\s*72px;[^}]*height:\s*72px;/s,
    )
    expect(css).toMatch(
      /\.wbx-sticker-page\[data-open="false"\]\s+\.wbx-sticker-page__inside\s*\{[^}]*pointer-events:\s*none;/s,
    )
    expect(css).toMatch(
      /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__cover\s*\{[^}]*pointer-events:\s*none;/s,
    )
    expect(css).toMatch(
      /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-sticker-page__inside\s*\{[^}]*transition:\s*none !important;/s,
    )
    expect(css).toMatch(
      /\.wbx-partner-sticker\s*\{[^}]*transition:\s*none;/s,
    )
  })

  it('keeps the mobile hero turn and trigger within the viewport', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const mobileCss = css.slice(css.indexOf('@media (max-width: 420px)'))
    const artRule = mobileCss.match(/\.wbx-hero__art\s*\{[^}]*\}/s)?.[0] ?? ''
    const heroRule = mobileCss.match(/\.wbx-hero\s*\{[^}]*\}/s)?.[0] ?? ''
    const triggerRule =
      css.match(/\.wbx-sticker-page__trigger\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(css).toMatch(
      /\.wbx-home-layout\s*\{[^}]*overflow-x:\s*clip;/s,
    )
    expect(mobileCss).not.toMatch(/--wbx-mobile-hero-width/)
    expect(heroRule).not.toMatch(/\b(?:width|max-width)\s*:/)
    expect(artRule).not.toMatch(/\bwidth\s*:/)
    expect(mobileCss).not.toMatch(/\.wbx-sticker-page\s*\{[^}]*\bwidth\s*:/s)
    expect(mobileCss).not.toMatch(/\.wbx-sticker-page__cover\s*\{[^}]*\bwidth\s*:/s)
    expect(triggerRule).toMatch(/right:\s*0;[^}]*width:\s*72px;[^}]*height:\s*72px;/s)
    expect(mobileCss).toMatch(
      /\.wbx-sticker-page__inside\s*\{[^}]*grid-template-areas:\s*"sparkx sparkx"\s*"workbuddy zai";[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s,
    )
    expect(mobileCss).toMatch(
      /\.wbx-partner-sticker\s*\{[^}]*min-width:\s*0;/s,
    )
  })

  it('keeps the compact cover as a one-column layer for the diagonal reveal', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const compactCss = css.slice(
      css.indexOf('@media (max-width: 960px)'),
      css.indexOf('@media (max-width: 760px)'),
    )

    expect(compactCss).toMatch(
      /\.wbx-sticker-page__cover\s*\{[^}]*grid-template-columns:\s*1fr;/s,
    )
    expect(compactCss).not.toMatch(/perspective:|opacity:|rotateY\(/)
  })

  it('keeps the visible fold clear of the workflow metrics without shrinking its hit target', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const compactCss = css.slice(
      css.indexOf('@media (max-width: 760px)'),
      css.indexOf('@media (max-width: 420px)'),
    )
    const triggerRule =
      css.match(/\.wbx-sticker-page__trigger\s*\{[^}]*\}/s)?.[0] ?? ''
    const metricsRule =
      css.match(/\.wbx-hero__metrics\s*\{[^}]*\}/s)?.[0] ?? ''
    const foldSize = Number(
      triggerRule.match(/--wbx-fold-visual-size:\s*(\d+)px/)?.[1],
    )
    const metricsInset = Number(metricsRule.match(/right:\s*(\d+)px/)?.[1])
    const compactTriggerRule =
      compactCss.match(/\.wbx-sticker-page__trigger\s*\{[^}]*\}/s)?.[0] ?? ''
    const compactMetricsRule =
      compactCss.match(/\.wbx-hero__metrics\s*\{[^}]*\}/s)?.[0] ?? ''
    const compactFoldSize = Number(
      compactTriggerRule.match(/--wbx-fold-visual-size:\s*(\d+)px/)?.[1],
    )
    const compactMetricsInset = Number(
      compactMetricsRule.match(/right:\s*(\d+)px/)?.[1],
    )

    expect(triggerRule).toMatch(/width:\s*72px;[^}]*height:\s*72px;/s)
    expect(triggerRule).toMatch(/background:\s*transparent;/)
    expect(foldSize).toBeGreaterThan(0)
    expect(foldSize).toBeLessThan(metricsInset)
    expect(css).toMatch(
      /\.wbx-sticker-page__trigger::before\s*\{[^}]*width:\s*var\(--wbx-fold-visual-size\);[^}]*height:\s*var\(--wbx-fold-visual-size\);[^}]*linear-gradient/s,
    )
    expect(css).toMatch(
      /\.wbx-sticker-page__trigger span\s*\{[^}]*width:\s*32px;/s,
    )
    expect(compactFoldSize).toBeGreaterThan(0)
    expect(compactFoldSize).toBeLessThan(compactMetricsInset)
    expect(compactCss).toMatch(
      /\.wbx-sticker-page__trigger span\s*\{[^}]*display:\s*none;/s,
    )
  })
})
