import { readFileSync } from 'node:fs'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { baseRule } from './helpers/css-rules'
import { useHomePageHarness } from './helpers/home-page-harness'
import { readHomeStyle } from './helpers/read-theme-style'

const harness = useHomePageHarness()

describe('home hero icon navigation', () => {
  it('opens the canonical reading guide from the secondary hero action', () => {
    harness.mountHomePage()

    const route = [...document.querySelectorAll<HTMLAnchorElement>('a')].find(
      (link) => link.textContent?.trim() === '查看阅读路线',
    )

    expect(route?.getAttribute('href')).toBe('/wb-x/reading-guide/')
  })

  it('renders the hero copy and art directly inside a static stage', () => {
    harness.mountHomePage()

    const stage = document.querySelector('.wbx-hero__stage')

    expect(stage?.querySelector(':scope > .wbx-hero__copy')).not.toBeNull()
    expect(stage?.querySelector(':scope > .wbx-hero__art')).not.toBeNull()
    expect(stage?.classList.contains('wbx-sticker-page')).toBe(false)
    expect(document.querySelector('.wbx-sticker-page__inside')).toBeNull()
    expect(document.querySelector('.wbx-sticker-page__trigger')).toBeNull()
  })

  it('keeps a balanced two-column hero with a staggered whitepaper shelf', () => {
    const css = readHomeStyle()
    const stage = baseRule(css, '.wbx-hero__stage')
    const compactDesktop = css.slice(
      css.indexOf('@media (max-width: 1200px)'),
      css.indexOf('@media (max-width: 960px)'),
    )

    expect(stage).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/)
    expect(compactDesktop).toMatch(
      /\.wbx-hero__stage\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s,
    )
    expect(baseRule(css, '.wbx-hero__whitepapers')).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(compactDesktop).not.toMatch(/\.wbx-whitepaper-card--wbx\s*\{[^}]*position:\s*absolute/s)
  })

  it('does not import or style the retired partner reveal', () => {
    const homeSource = readFileSync(
      'docs/.vitepress/theme/HomePage.vue',
      'utf8',
    )
    const homeCss = readHomeStyle()

    expect(homeSource).not.toContain('HeroStickerPage')
    expect(homeSource).not.toContain('heroPartners')
    expect(homeCss).not.toContain('.wbx-sticker-page')
    expect(homeCss).not.toContain('.wbx-partner-sticker')
  })

  it('uses two labelled whitepaper covers instead of the retired icon grid', () => {
    harness.mountHomePage()

    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-whitepaper-card'),
    )

    expect(links).toHaveLength(2)
    expect(
      links.map((link) => [
        link.getAttribute('aria-label'),
        link.getAttribute('href'),
        link.querySelector('img')?.getAttribute('src'),
      ]),
    ).toEqual([
      ['阅读 WorkBuddy X 白皮书', '/wb-x/', '/whitepapers/workbuddy-x-cover.webp'],
      ['阅读 WorkBuddy OPC 白皮书', '/opc/', '/whitepapers/workbuddy-opc-cover.webp'],
    ])
    expect(document.querySelector('.wbx-icon-card')).toBeNull()
  })

  it('floats staggered covers without moving them in reduced-motion mode', () => {
    const css = readHomeStyle()
    const shelf = baseRule(css, '.wbx-hero__whitepapers')
    const card = baseRule(css, '.wbx-whitepaper-card')
    const wbxCard = baseRule(css, '.wbx-whitepaper-card--wbx')
    const opcCard = baseRule(css, '.wbx-whitepaper-card--opc')

    expect(shelf).toMatch(/align-items:\s*start/)
    expect(card).toMatch(/aspect-ratio:\s*210\s*\/\s*297/)
    expect(wbxCard).toMatch(/animation:\s*wbx-whitepaper-float-a 5\.2s/)
    expect(opcCard).toMatch(/margin-top:\s*52px/)
    expect(opcCard).toMatch(/animation:\s*wbx-whitepaper-float-b 5\.8s/)
    expect(css).toMatch(/\.wbx-whitepaper-card:is\(:hover, :focus-visible\)\s*\{[^}]*animation-play-state:\s*paused;/s)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.wbx-whitepaper-card\s*\{[^}]*animation:\s*none;/s)
    expect(css).toMatch(
      /\.wbx-hero__copy\s*>\s*\.wbx-pixel-label\s*\{[^}]*color:\s*var\(--wbx-ink\);/s,
    )
    expect(css).toMatch(
      /\.wbx-hero__stage\s*\{[^}]*--wbx-hero-meta-center:\s*54px;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero__monogram\s*\{[^}]*top:\s*calc\(var\(--wbx-hero-meta-center\) - 12px\);[^}]*right:\s*48px;/s,
    )
  })

  it('types X and OPC after a fixed WorkBuddy label and keeps whitepaper on line two', async () => {
    vi.useFakeTimers()
    harness.mountHomePage()

    const title = document.querySelector('#wbx-hero-title')
    const rotating = title?.querySelector('.wbx-hero-title__rotating')

    expect(title?.getAttribute('aria-label')).toBe('WorkBuddy X 与 OPC 白皮书')
    expect(title?.querySelector('.wbx-hero-title__brand')?.textContent).toBe('WorkBuddy')
    expect(title?.querySelector('.wbx-hero-title__line--subtitle')?.textContent).toBe('白皮书')
    expect(rotating?.textContent).toBe('')

    await vi.advanceTimersByTimeAsync(120)
    expect(rotating?.textContent).toBe('X')

    await vi.advanceTimersByTimeAsync(1840)
    expect(rotating?.textContent).toBe('O')
    await vi.advanceTimersByTimeAsync(240)
    expect(rotating?.textContent).toBe('OPC')

    await vi.advanceTimersByTimeAsync(2000)
    expect(rotating?.textContent).toBe('X')
  })

  it('uses a darker brand accent for the rotating X and OPC title', () => {
    const css = readHomeStyle()
    const rotating = baseRule(css, '.wbx-hero-title__rotating')

    expect(rotating).toMatch(/margin-left:\s*0\.22em;/)
    expect(rotating).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 60%, var\(--wbx-ink\)\);/,
    )
  })

  it('shows a static complete title and starts no typing timer for reduced motion', async () => {
    vi.useFakeTimers()
    const setTimer = vi.spyOn(globalThis, 'setTimeout')
    harness.stubMatchMedia(true)
    harness.mountHomePage()
    await nextTick()

    expect(document.querySelector('.wbx-hero-title__rotating')?.textContent).toBe('X / OPC')
    expect(setTimer).not.toHaveBeenCalledWith(expect.any(Function), 120)
    setTimer.mockRestore()
  })

  it('clears the title typing timer when the homepage unmounts', () => {
    vi.useFakeTimers()
    const clearTimer = vi.spyOn(globalThis, 'clearTimeout')
    const app = harness.mountHomePage()
    const rotating = document.querySelector('.wbx-hero-title__rotating')

    expect(rotating).not.toBeNull()
    app.unmount()
    expect(clearTimer).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
    clearTimer.mockRestore()
  })

  it('reverses the hero copy and secondary action in dark mode', () => {
    const style = document.createElement('style')
    style.textContent = readHomeStyle()
      .replaceAll('var(--wbx-ink)', '#f3f5ed')
      .replaceAll('var(--wbx-text-strong)', '#f3f5ed')
      .replaceAll('var(--wbx-text-body)', '#d7dcd3')
      .replaceAll('var(--wbx-text-muted)', '#aeb4a7')
    document.head.append(style)
    document.documentElement.classList.add('dark')
    harness.mountHomePage()

    expect(getComputedStyle(document.querySelector('#wbx-hero-title')!).color).toBe('rgb(243, 245, 237)')
    expect(getComputedStyle(document.querySelector('.wbx-hero__summary')!).color).toBe('rgb(215, 220, 211)')
    expect(getComputedStyle(document.querySelector('.wbx-update-ticker')!).color).toBe('rgb(174, 180, 167)')
    expect(getComputedStyle(document.querySelector('.wbx-button--outline')!).color).toBe('rgb(243, 245, 237)')

    style.remove()
    document.documentElement.classList.remove('dark')
  })

  it('keeps update copy secondary until the link is hovered or focused', () => {
    const css = readHomeStyle()
    const ticker = baseRule(css, '.wbx-update-ticker')
    const tickerIcon = baseRule(css, '.wbx-update-ticker__icon')
    const interaction = css.match(
      /\.wbx-update-ticker__link:hover,\s*\.wbx-update-ticker__link:focus-visible\s*\{([^}]*)\}/s,
    )?.[1]

    expect(ticker).toMatch(/color:\s*var\(--wbx-text-muted\);/)
    expect(tickerIcon).toMatch(/color:\s*inherit;/)
    expect(interaction).toMatch(/color:\s*var\(--wbx-text-body\);/)
  })

  it('uses only the outer hero border', () => {
    const css = readHomeStyle()

    expect(css).toMatch(
      /\.wbx-hero\s*\{[^}]*border:\s*1px solid var\(--wbx-line\);/s,
    )
    expect(css).toMatch(
      /\.wbx-hero\s*\{[^}]*border-radius:\s*var\(--wbx-radius-lg\);/s,
    )
    expect(css).not.toMatch(
      /\.wbx-hero__stage\s*\{[^}]*border:\s*2px solid #0d100d;/s,
    )
  })

  it('gives the homepage CTA a restrained two-pixel arrow response', () => {
    harness.mountHomePage()

    const cta = document.querySelector<HTMLAnchorElement>('.wbx-hero-cta')
    const css = readHomeStyle()

    expect(cta?.getAttribute('href')).toBe('/wb-x/')
    expect(cta?.textContent).toContain('开始阅读')
    expect(cta?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(1)
    expect(cta?.querySelector('.hn-arrow-right')).not.toBeNull()
    expect(document.querySelector('.wbx-button--outline .wbx-hero-cta__arrow')).toBeNull()

    expect(css).toMatch(/\.wbx-hero-cta::before\s*\{[^}]*display:\s*none;/s)
    expect(css).toMatch(
      /\.wbx-hero-cta__arrow\s*>\s*\.hn\s*\{[^}]*font-size:\s*28px;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta__arrow\s*\{[^}]*border-radius:\s*0 var\(--wbx-radius-md\) var\(--wbx-radius-md\) 0;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta:is\(:hover, :focus-visible\) \.wbx-hero-cta__arrow > \.hn\s*\{[^}]*transform:\s*translateX\(2px\);/s,
    )
    expect(css).not.toMatch(/\.wbx-hero-cta__arrow--(?:in|out)/)
    expect(css).not.toMatch(/\.wbx-hero-cta[^}]*rotate\(-45deg\)/s)
    expect(css).toMatch(/\.wbx-hero-cta:active\s*\{[^}]*transform:\s*translateY\(0\);/s)
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-hero-cta::before[\s\S]*?\.wbx-hero-cta__arrow/s,
    )
  })

  it('replaces the WorkBuddy version links with one SparkX bubble', () => {
    harness.mountHomePage()

    const sparkx = document.querySelector<HTMLAnchorElement>(
      '.wbx-hero__sparkx-bubble',
    )
    const logo = sparkx?.querySelector<HTMLImageElement>(
      '.wbx-hero__sparkx-logo',
    )
    const robot = document.querySelector<HTMLImageElement>(
      '.wbx-hero__official-ip',
    )

    expect(sparkx?.getAttribute('href')).toBe('https://www.sparkx.zone/')
    expect(sparkx?.getAttribute('target')).toBe('_blank')
    expect(sparkx?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(sparkx?.getAttribute('aria-label')).toBe('访问星火集')
    expect(logo?.getAttribute('src')).toBe('/brand/partners/sparkx.svg')
    expect(logo?.getAttribute('alt')).toBe('')
    expect(robot?.getAttribute('src')).toBe('/brand/workbuddy-official-ip.png')
    expect(robot?.getAttribute('alt')).toBe('')
    expect(document.querySelector('.wbx-hero__official-label')).toBeNull()
    expect(
      document.querySelector('a[href="https://www.workbuddy.cn/"]'),
    ).toBeNull()
    expect(
      document.querySelector('a[href="https://www.workbuddy.ai/"]'),
    ).toBeNull()
  })

  it('floats the SparkX bubble above the retained robot', () => {
    const css = readHomeStyle()
    const bubble = baseRule(css, '.wbx-hero__sparkx-bubble')
    const tail = baseRule(css, '.wbx-hero__sparkx-bubble::after')
    const logo = baseRule(css, '.wbx-hero__sparkx-logo')
    const robotWrap = baseRule(css, '.wbx-hero__official-ip-wrap')
    const robot = baseRule(css, '.wbx-hero__official-ip')
    const bubbleInteraction = css.match(
      /\.wbx-hero__sparkx-bubble:hover,\s*\.wbx-hero__sparkx-bubble:focus-visible\s*\{([^}]*)\}/s,
    )?.[1]
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(bubble).toMatch(/right:\s*75px;/)
    expect(bubble).toMatch(/bottom:\s*107px;/)
    expect(bubble).toMatch(/width:\s*52px;/)
    expect(bubble).toMatch(/height:\s*52px;/)
    expect(bubble).toMatch(/border-radius:\s*10px;/)
    expect(bubble).toMatch(/background:\s*#6c5ce7;/i)
    expect(bubble).toMatch(/box-shadow:\s*none;/)
    expect(bubble).toMatch(
      /animation:\s*wbx-sparkx-bubble-float 4\.2s ease-in-out infinite;/,
    )
    expect(bubble).not.toMatch(/transform:/)
    expect(tail).toMatch(/bottom:\s*-6px;/)
    expect(tail).toMatch(/background:\s*#6c5ce7;/i)
    expect(tail).toMatch(/clip-path:\s*polygon\(0 0, 100% 0, 50% 100%\);/)
    expect(logo).toMatch(/width:\s*100%;/)
    expect(logo).toMatch(/height:\s*100%;/)
    expect(robotWrap).toMatch(/right:\s*24px;/)
    expect(robotWrap).toMatch(/bottom:\s*0;/)
    expect(robotWrap).toMatch(/width:\s*154px;/)
    expect(robot).toMatch(/width:\s*145px;/)
    expect(robot).not.toMatch(/animation:/)
    expect(css).not.toContain('.wbx-hero__metrics')
    expect(bubbleInteraction).toBeDefined()
    expect(bubbleInteraction).toMatch(/border-color:\s*var\(--wbx-ink\);/)
    expect(bubbleInteraction).toMatch(/animation-play-state:\s*paused;/)
    expect(bubbleInteraction).not.toMatch(/transform:/)
    expect(css).toMatch(
      /@keyframes wbx-sparkx-bubble-float\s*\{[\s\S]*?50%\s*\{[^}]*transform:\s*translateY\(-6px\);/s,
    )
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.wbx-hero__sparkx-bubble\s*\{[^}]*animation:\s*none;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-hero__sparkx-bubble\s*\{[^}]*right:\s*47px;[^}]*bottom:\s*78px;[^}]*width:\s*38px;[^}]*height:\s*38px;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-hero__official-ip-wrap\s*\{[^}]*right:\s*12px;[^}]*bottom:\s*0;[^}]*width:\s*108px;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-hero__official-ip\s*\{[^}]*width:\s*106px;/s,
    )
  })

  it('uses a compact staggered whitepaper shelf on mobile', () => {
    const css = readHomeStyle()
    const mobile = css.slice(
      css.indexOf('@media (max-width: 760px)'),
      css.indexOf('@media (max-width: 420px)'),
    )

    expect(mobile).toMatch(/\.wbx-hero__whitepapers\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);[^}]*gap:\s*16px;/s)
    expect(mobile).toMatch(/\.wbx-whitepaper-card--opc\s*\{[^}]*margin-top:\s*24px;/s)
  })

})
