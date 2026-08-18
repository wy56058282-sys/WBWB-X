import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule, cardClearance, rotatedCardBounds } from './helpers/css-rules'
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

  it('keeps the desktop hero copy boundary on the card centerline', () => {
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
    expect(compactDesktop).toMatch(
      /\.wbx-icon-card--buddy\s*\{[^}]*left:\s*calc\(35% \+ 10px\);/s,
    )
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

  it('uses black icon cards with green pixel icons', () => {
    const css = readHomeStyle()

    expect(css).not.toMatch(
      /\.wbx-hero__art\s*\{[^}]*background:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-icon-card\s*\{[^}]*color:\s*var\(--wbx-accent\);[^}]*background:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero__copy\s*>\s*\.wbx-pixel-label\s*\{[^}]*color:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero__monogram\s*\{[^}]*top:\s*42px;[^}]*right:\s*48px;/s,
    )
  })

  it('uses only the outer hero border', () => {
    const css = readHomeStyle()

    expect(css).toMatch(
      /\.wbx-hero\s*\{[^}]*border:\s*2px solid #0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero\s*\{[^}]*border-radius:\s*20px;/s,
    )
    expect(css).not.toMatch(
      /\.wbx-hero__stage\s*\{[^}]*border:\s*2px solid #0d100d;/s,
    )
  })

  it('gives only the homepage primary CTA the approved arrow handoff motion', () => {
    harness.mountHomePage()

    const cta = document.querySelector<HTMLAnchorElement>('.wbx-hero-cta')
    const css = readHomeStyle()

    expect(cta?.getAttribute('href')).toBe('/wb-x/')
    expect(cta?.textContent).toContain('开始阅读')
    expect(cta?.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
    expect(document.querySelector('.wbx-button--outline .wbx-hero-cta__arrow')).toBeNull()

    expect(css).toMatch(
      /\.wbx-hero-cta::before\s*\{[^}]*linear-gradient\(90deg, transparent, rgba\(255, 255, 255, 0\.2\), transparent\);[^}]*transition:\s*left 0\.5s ease;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta:is\(:hover, :focus-visible\) \.wbx-hero-cta__arrow::before\s*\{[^}]*transform:\s*scale\(1\);/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta__arrow\s*>\s*\.hn\s*\{[^}]*font-size:\s*28px;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta__arrow--in\s*\{[^}]*transform:\s*translate\(-56px, 56px\) rotate\(-45deg\);/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta:is\(:hover, :focus-visible\) \.wbx-hero-cta__arrow--out\s*\{[^}]*transform:\s*translate\(56px, -56px\) rotate\(-45deg\);/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta:is\(:hover, :focus-visible\) \.wbx-hero-cta__arrow--in\s*\{[^}]*opacity:\s*1;[^}]*transform:\s*translate\(0, 0\) rotate\(-45deg\);/s,
    )
    expect(css).toMatch(
      /\.wbx-hero-cta:active\s*\{[^}]*box-shadow:\s*0 4px 12px rgba\(50, 230, 185, 0\.28\);/s,
    )
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-hero-cta::before[\s\S]*?\.wbx-hero-cta__arrow/s,
    )
  })

  it('offers five labelled links to distinct site sections', () => {
    harness.mountHomePage()

    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-hero__art .wbx-icon-card'),
    )

    expect(links).toHaveLength(5)

    expect(
      links.map((link) => [
        link.getAttribute('aria-label'),
        decodeURI(link.getAttribute('href') ?? ''),
      ]),
    ).toEqual([
      ['前往定制服务', '/help/'],
      ['查看第一篇目录', '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/'],
      ['查看工作系统进阶篇', '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/'],
      ['查看 Part 2 案例篇', '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/'],
      ['查看 Part 4 岗位与行业篇', '/wb-x/第四篇 岗位与行业落地/'],
    ])
  })

  it('adds a labelled WorkBuddy official-site IP link to the hero', () => {
    harness.mountHomePage()

    const official = document.querySelector<HTMLAnchorElement>('.wbx-hero__official:not(.wbx-hero__official--cn)')
    const image = official?.querySelector<HTMLImageElement>('.wbx-hero__official-ip')

    expect(official?.getAttribute('href')).toBe('https://www.workbuddy.ai/')
    expect(official?.getAttribute('target')).toBe('_blank')
    expect(official?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(official?.getAttribute('aria-label')).toBe('访问 WorkBuddy 国际版 v5.2.7')
    expect(official?.querySelector('.wbx-hero__official-label')?.textContent).toBe(
      '国际版 v5.2.7',
    )
    expect(image?.getAttribute('src')).toBe('/brand/workbuddy-official-ip.png')
    expect(image?.getAttribute('alt')).toBe('')
  })

  it('adds a workbuddy.cn label above the official-site IP link', () => {
    harness.mountHomePage()

    const cn = document.querySelector<HTMLAnchorElement>('.wbx-hero__official--cn')

    expect(cn?.getAttribute('href')).toBe('https://www.workbuddy.cn/')
    expect(cn?.getAttribute('target')).toBe('_blank')
    expect(cn?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(cn?.getAttribute('aria-label')).toBe('访问 WorkBuddy 中国版 v5.3.13')
    expect(cn?.querySelector('.wbx-hero__official-label')?.textContent).toBe(
      '中国版 v5.3.13',
    )
  })

  it('positions the official-site IP link without duplicate hero metrics', () => {
    const css = readHomeStyle()
    const official = baseRule(css, '.wbx-hero__official')
    const label = baseRule(css, '.wbx-hero__official-label')
    const image = baseRule(css, '.wbx-hero__official-ip')
    const officialInteraction = css.match(
      /\.wbx-hero__official:hover,\s*\.wbx-hero__official:focus-visible\s*\{([^}]*)\}/s,
    )?.[1]
    const labelInteraction = css.match(
      /\.wbx-hero__official:hover \.wbx-hero__official-label,\s*\.wbx-hero__official:focus-visible \.wbx-hero__official-label\s*\{([^}]*)\}/s,
    )?.[1]
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(official).toMatch(/right:\s*24px;/)
    expect(official).toMatch(/bottom:\s*0;/)
    expect(official).toMatch(/width:\s*154px;/)
    expect(label).toMatch(/background:\s*#0d100d;/)
    expect(label).toMatch(/color:\s*#fff;/)
    expect(label).toMatch(/box-shadow:\s*0 10px 25px rgb\(0 0 0 \/ 28%\);/)
    expect(label).toMatch(/animation:\s*wbx-official-label-float 4\.2s ease-in-out infinite;/)
    expect(label).toMatch(/transition:\s*color 180ms ease, scale 180ms ease;/)
    expect(label).toMatch(/scale:\s*1;/)
    expect(image).toMatch(/width:\s*145px;/)
    expect(image).not.toMatch(/animation:/)
    expect(css).not.toContain('.wbx-hero__metrics')
    expect(official).not.toMatch(/transition:/)
    expect(officialInteraction).toBeDefined()
    expect(officialInteraction).toMatch(/transform:\s*none;/)
    expect(officialInteraction).not.toMatch(/translate/)
    expect(labelInteraction).toBeDefined()
    expect(labelInteraction).toMatch(/color:\s*var\(--wbx-accent\);/)
    expect(labelInteraction).toMatch(/scale:\s*1\.08;/)
    expect(css).toMatch(
      /\.wbx-hero__official:(?:hover|focus-visible) \.wbx-hero__official-label\s*\{[^}]*animation-play-state:\s*paused;/s,
    )
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)\s*\{[\s\S]*?\.wbx-hero__official-label\s*\{[^}]*animation:\s*none;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-hero__official\s*\{[^}]*right:\s*12px;[^}]*bottom:\s*0;[^}]*width:\s*108px;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-hero__official-ip\s*\{[^}]*width:\s*106px;/s,
    )
  })

  it('uses the approved mobile hero card placement', () => {
    const css = readHomeStyle()
    const mobile = css.slice(
      css.indexOf('@media (max-width: 760px)'),
      css.indexOf('@media (max-width: 444px)'),
    )

    expect(mobile).toMatch(
      /\.wbx-icon-card--book\s*\{[^}]*--wbx-icon-rotation:\s*-30deg;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-icon-card--flow\s*\{[^}]*right:\s*calc\(8% \+ 10px\);/s,
    )
  })

  it('positions the Part 4 people icon safely at every hero breakpoint', () => {
    const css = readHomeStyle()
    const people = baseRule(css, '.wbx-icon-card--people')
    const work = baseRule(css, '.wbx-icon-card--work')
    const boundaryStart = css.indexOf('@media (max-width: 444px)')
    const mobileStart = css.indexOf('@media (max-width: 420px)')

    expect(boundaryStart, 'missing the 444px collision boundary').toBeGreaterThan(
      -1,
    )
    expect(mobileStart, 'missing the 420px mobile layout boundary').toBeGreaterThan(
      boundaryStart,
    )

    const boundaryCss = css.slice(boundaryStart, mobileStart)
    const boundaryPeople = boundaryCss.match(
      /\.wbx-icon-card--people\s*\{([^}]*)\}/s,
    )?.[1]

    expect(
      boundaryPeople,
      'missing the people-card override at the 444px boundary',
    ).toBeDefined()

    const desktopCases = [
      { viewport: 961, artWidth: 445, cardSize: 108 },
      { viewport: 1080, artWidth: 504, cardSize: 108 },
    ]

    for (const { viewport, artWidth, cardSize } of desktopCases) {
      expect(
        cardClearance(
          rotatedCardBounds(people, artWidth, cardSize),
          rotatedCardBounds(work, artWidth, cardSize),
        ),
        `${viewport}px viewport must retain 24px between the rotated people and work cards`,
      ).toBeGreaterThanOrEqual(24)
    }

    expect(css).toMatch(
      /\.wbx-icon-card--people\s*\{[^}]*bottom:\s*55px;[^}]*left:\s*5%;/s,
    )
    expect(css).toMatch(
      /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*?\.wbx-icon-card--people\s*\{[^}]*top:\s*270px;[^}]*bottom:\s*auto;[^}]*left:\s*1%;/,
    )
    expect(css).not.toMatch(
      /@media\s*\(max-width:\s*780px\)\s*\{[\s\S]*?\.wbx-icon-card--people/,
    )
    expect(boundaryPeople).toMatch(
      /top:\s*auto;[^}]*bottom:\s*50px;[^}]*left:\s*4%;/s,
    )

    for (const viewport of [421, 444]) {
      const paintedPeople = rotatedCardBounds(
        `${boundaryPeople}\n${people}`,
        viewport - 28,
        90,
        380,
      )

      expect(
        paintedPeople.bottom,
        `${viewport}px viewport must keep the painted people card above the metrics band`,
      ).toBeLessThanOrEqual(340)
    }
  })

})
