import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, type App } from 'vue'
import HeroStickerPage from '../docs/.vitepress/theme/HeroStickerPage.vue'

vi.mock('vitepress', () => ({
  withBase: (path: string) => `/WBWB-X${path}`,
}))

const apps: App[] = []
const partners = [
  {
    name: '星火集',
    ariaLabel: '访问星火集',
    logo: '/sparkx.svg',
    href: 'https://www.sparkx.zone/',
  },
  {
    name: 'WorkBuddy',
    ariaLabel: '访问 WorkBuddy',
    logo: '/workbuddy.svg',
    href: 'https://www.workbuddy.ai/',
  },
  {
    name: 'Z.ai',
    ariaLabel: '访问 Z.ai',
    logo: '/z-ai.svg',
    href: 'https://z.ai/subscribe',
  },
]

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

function mountComponent(componentPartners = partners) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () =>
      h(HeroStickerPage, { partners: componentPartners }, {
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
  it('closes a hover-open reveal when Escape starts outside the hero', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!
    const outside = document.createElement('button')
    document.body.append(outside)
    outside.focus()

    expect(root.dataset.open).toBe('false')
    trigger.dispatchEvent(pointerEvent('pointerenter', 'mouse'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    expect(document.activeElement).toBe(outside)
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')
    expect(document.activeElement).toBe(outside)
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

  it('describes the trigger action for both closed and open states', async () => {
    mountComponent()
    const trigger = document.querySelector<HTMLButtonElement>(
      '.wbx-sticker-page__trigger',
    )!

    expect(trigger.getAttribute('aria-label')).toBe('翻开合作伙伴贴纸页')
    expect(trigger.textContent?.trim()).toBe('翻开看看')

    trigger.click()
    await Promise.resolve()

    expect(trigger.getAttribute('aria-label')).toBe('关闭合作伙伴贴纸页')
    expect(trigger.textContent?.trim()).toBe('关闭贴纸')

    trigger.click()
    await Promise.resolve()

    expect(trigger.getAttribute('aria-label')).toBe('翻开合作伙伴贴纸页')
    expect(trigger.textContent?.trim()).toBe('翻开看看')
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

  it('removes its document listeners when unmounted', () => {
    const addEventListener = vi.spyOn(document, 'addEventListener')
    const removeEventListener = vi.spyOn(document, 'removeEventListener')
    const app = mountComponent()
    const pointerRegistration = addEventListener.mock.calls.find(
      ([type]) => type === 'pointerdown',
    )
    const keyRegistration = addEventListener.mock.calls.find(
      ([type]) => type === 'keydown',
    )

    expect(pointerRegistration).toBeDefined()
    expect(keyRegistration).toBeDefined()
    if (!pointerRegistration || !keyRegistration) return

    app.unmount()
    apps.splice(apps.indexOf(app), 1)

    expect(removeEventListener).toHaveBeenCalledWith(
      'pointerdown',
      pointerRegistration[1],
    )
    expect(removeEventListener).toHaveBeenCalledWith(
      'keydown',
      keyRegistration[1],
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

  it('uses partner-provided accessible labels for generic sticker data', () => {
    mountComponent([
      {
        name: 'Example Partner',
        ariaLabel: '前往 Example Partner 官网',
        logo: '/example.svg',
        href: 'https://example.com/',
      },
    ])
    const link = document.querySelector<HTMLAnchorElement>(
      '.wbx-partner-sticker',
    )

    expect(link?.getAttribute('aria-label')).toBe('前往 Example Partner 官网')
  })

  it('resolves partner logos through a non-root VitePress base', () => {
    mountComponent()
    const image = document.querySelector<HTMLImageElement>(
      '.wbx-partner-sticker img',
    )

    expect(image?.getAttribute('src')).toBe('/WBWB-X/sparkx.svg')
  })

  it('reveals the inside layer diagonally from the lower-right corner', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const stickerPageRules = css.match(
      /(?:^|[{}])\s*\.wbx-sticker-page\s*\{[^}]*\}/gs,
    ) ?? []
    const coverRules = css.match(
      /(?:^|[{}])\s*[^{}]*\.wbx-sticker-page__cover[^{}]*\{[^}]*\}/gs,
    ) ?? []
    const openCoverRules = css.match(
      /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__cover\s*\{[^}]*\}/gs,
    ) ?? []
    const pageTurnRules = [
      ...stickerPageRules,
      ...coverRules,
      ...openCoverRules,
    ].join('\n')

    expect(pageTurnRules).not.toMatch(/perspective(?:-origin)?\s*:/)
    expect(pageTurnRules).not.toMatch(/rotateY\(/)
    expect(pageTurnRules).not.toMatch(/transform-origin:\s*left center/)
    expect(pageTurnRules).not.toMatch(/backface-visibility:/)
    expect(pageTurnRules).not.toMatch(/transform-style:/)
    expect(pageTurnRules).not.toMatch(/drop-shadow\(/)
    expect(openCoverRules.join('\n')).not.toMatch(/opacity:/)

    expect(css).toMatch(
      /\.wbx-sticker-page\s*\{[^}]*--wbx-fold-visual-size:\s*40px;/s,
    )
    expect(css).toMatch(
      /\.wbx-sticker-page__inside\s*\{[^}]*z-index:\s*3;[^}]*clip-path:\s*polygon\(\s*100% calc\(100% - var\(--wbx-fold-visual-size\)\),\s*100% 100%,\s*calc\(100% - var\(--wbx-fold-visual-size\)\) 100%,\s*calc\(100% - var\(--wbx-fold-visual-size\)\) 100%\s*\);[^}]*transition:\s*clip-path 280ms cubic-bezier\(0\.77,\s*0,\s*0\.175,\s*1\)/s,
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
    const heroRules =
      css.match(/(?:^|})\s*\.wbx-hero\s*\{[^}]*\}/gs) ?? []
    const artRules =
      css.match(/(?:^|})\s*\.wbx-hero__art\s*\{[^}]*\}/gs) ?? []
    const pageRules =
      css.match(/(?:^|})\s*\.wbx-sticker-page\s*\{[^}]*\}/gs) ?? []
    const coverRules =
      css.match(/(?:^|})\s*\.wbx-sticker-page__cover\s*\{[^}]*\}/gs) ?? []
    const triggerRule =
      css.match(/\.wbx-sticker-page__trigger\s*\{[^}]*\}/s)?.[0] ?? ''

    expect(heroRules.length, 'missing hero width contracts').toBeGreaterThan(0)
    expect(artRules.length, 'missing hero-art width contracts').toBeGreaterThan(
      0,
    )
    expect(pageRules.length, 'missing sticker-page width contracts').toBeGreaterThan(
      0,
    )
    expect(coverRules.length, 'missing cover width contracts').toBeGreaterThan(0)
    expect(css).toMatch(
      /\.wbx-home-layout\s*\{[^}]*overflow-x:\s*clip;/s,
    )
    expect(mobileCss).not.toMatch(/--wbx-mobile-hero-width/)
    expect(heroRules.join('\n')).not.toMatch(/\b(?:width|max-width)\s*:/)
    expect(artRules.join('\n')).not.toMatch(/\bwidth\s*:/)
    expect(pageRules.join('\n')).not.toMatch(/\bwidth\s*:/)
    expect(coverRules.join('\n')).not.toMatch(/\bwidth\s*:/)
    expect(triggerRule).toMatch(/right:\s*0;[^}]*width:\s*72px;[^}]*height:\s*72px;/s)
    expect(mobileCss).toMatch(
      /\.wbx-sticker-page__inside\s*\{[^}]*grid-template-areas:\s*"sparkx sparkx"\s*"workbuddy zai";[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\);/s,
    )
    expect(mobileCss).toMatch(
      /\.wbx-partner-sticker\s*\{[^}]*min-width:\s*0;/s,
    )
  })

  it('lets the compact cover define the full stage height for the diagonal reveal', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const compactCss = css.slice(
      css.indexOf('@media (max-width: 960px)'),
      css.indexOf('@media (max-width: 760px)'),
    )
    const positionedLayersRule = css.match(
      /\.wbx-sticker-page__inside,\s*\.wbx-sticker-page__cover\s*\{[^}]*\}/s,
    )?.[0]
    const compactCoverRule = compactCss.match(
      /\.wbx-sticker-page__cover\s*\{[^}]*\}/s,
    )?.[0]

    expect(
      positionedLayersRule,
      'missing the shared absolute layer-positioning rule',
    ).toBeDefined()
    expect(positionedLayersRule).toMatch(
      /position:\s*absolute;[^}]*inset:\s*0;/s,
    )
    expect(
      compactCoverRule,
      'missing the compact cover override in the 960px breakpoint',
    ).toBeDefined()
    expect(compactCoverRule).toMatch(
      /position:\s*relative;[^}]*inset:\s*auto;[^}]*grid-template-columns:\s*1fr;/s,
    )
    expect(compactCss).not.toMatch(/perspective(?:-origin)?\s*:/)
    expect(compactCss).not.toMatch(/opacity:/)
    expect(compactCss).not.toMatch(/rotateY\(/)
  })

  it('keeps the visible fold clear of the workflow metrics without shrinking its hit target', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const compactCss = css.slice(
      css.indexOf('@media (max-width: 760px)'),
      css.indexOf('@media (max-width: 420px)'),
    )
    const pageRule =
      css.match(/\.wbx-sticker-page\s*\{[^}]*\}/s)?.[0] ?? ''
    const insideRule =
      css.match(/\.wbx-sticker-page__inside\s*\{[^}]*\}/s)?.[0] ?? ''
    const triggerRule =
      css.match(/\.wbx-sticker-page__trigger\s*\{[^}]*\}/s)?.[0] ?? ''
    const metricsRule =
      css.match(/\.wbx-hero__metrics\s*\{[^}]*\}/s)?.[0] ?? ''
    const foldSize = Number(
      pageRule.match(/--wbx-fold-visual-size:\s*(\d+)px/)?.[1],
    )
    const metricsInset = Number(metricsRule.match(/right:\s*(\d+)px/)?.[1])
    const compactPageRule =
      compactCss.match(/\.wbx-sticker-page\s*\{[^}]*\}/s)?.[0] ?? ''
    const compactMetricsRule =
      compactCss.match(/\.wbx-hero__metrics\s*\{[^}]*\}/s)?.[0] ?? ''
    const compactFoldSize = Number(
      compactPageRule.match(/--wbx-fold-visual-size:\s*(\d+)px/)?.[1],
    )
    const compactMetricsInset = Number(
      compactMetricsRule.match(/right:\s*(\d+)px/)?.[1],
    )

    expect(triggerRule).toMatch(/width:\s*72px;[^}]*height:\s*72px;/s)
    expect(triggerRule).toMatch(/background:\s*transparent;/)
    expect(triggerRule).not.toMatch(/--wbx-fold-visual-size:/)
    expect(insideRule).toMatch(
      /clip-path:\s*polygon\([^;]*var\(--wbx-fold-visual-size\)[^;]*var\(--wbx-fold-visual-size\)/s,
    )
    expect(foldSize).toBeGreaterThan(0)
    expect(foldSize).toBeLessThan(metricsInset)
    expect(css).toMatch(
      /\.wbx-sticker-page__trigger::before\s*\{[^}]*width:\s*var\(--wbx-fold-visual-size\);[^}]*height:\s*var\(--wbx-fold-visual-size\);[^}]*linear-gradient/s,
    )
    expect(css).toMatch(
      /\.wbx-sticker-page__trigger span\s*\{[^}]*width:\s*32px;/s,
    )
    expect(compactPageRule).toMatch(
      /--wbx-fold-visual-size:\s*14px;/,
    )
    expect(compactFoldSize).toBeGreaterThan(0)
    expect(compactFoldSize).toBeLessThan(compactMetricsInset)
    expect(compactCss).toMatch(
      /\.wbx-sticker-page__trigger span\s*\{[^}]*display:\s*none;/s,
    )
  })
})
