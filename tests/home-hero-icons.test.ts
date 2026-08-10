import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import { readFileSync } from 'node:fs'
import HomePage from '../docs/.vitepress/theme/HomePage.vue'
import { homeUpdates } from '../docs/.vitepress/theme/homeUpdates'

vi.mock('vitepress', () => ({
  withBase: (path: string) => path,
}))

const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
})

function mountHomePage() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(HomePage)
  app.mount(host)
  apps.push(app)
}

function baseRule(css: string, selector: string) {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const declarations = css.match(
    new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`),
  )?.[1]

  expect(declarations, `missing base rule for ${selector}`).toBeDefined()
  return declarations ?? ''
}

function numericDeclaration(
  declarations: string,
  property: string,
  unit: 'deg' | 'px' | '%',
) {
  const value = optionalNumericDeclaration(declarations, property, unit)

  expect(value, `missing ${property} in ${declarations}`).toBeDefined()
  return Number(value)
}

function optionalNumericDeclaration(
  declarations: string,
  property: string,
  unit: 'deg' | 'px' | '%',
) {
  const value = declarations.match(
    new RegExp(`${property}:\\s*(-?[\\d.]+)${unit};`),
  )?.[1]

  return value === undefined ? undefined : Number(value)
}

function rotatedCardBounds(
  declarations: string,
  artWidth: number,
  cardSize: number,
  artHeight = 568,
) {
  const angle =
    (numericDeclaration(declarations, '--wbx-icon-rotation', 'deg') *
      Math.PI) /
    180
  const paintedSize =
    cardSize * (Math.abs(Math.cos(angle)) + Math.abs(Math.sin(angle)))
  const rotationOverflow = (paintedSize - cardSize) / 2
  const left =
    (numericDeclaration(declarations, 'left', '%') / 100) * artWidth
  const declaredTop = optionalNumericDeclaration(declarations, 'top', 'px')
  const declaredBottom = optionalNumericDeclaration(
    declarations,
    'bottom',
    'px',
  )

  expect(
    declaredTop ?? declaredBottom,
    `missing vertical position in ${declarations}`,
  ).toBeDefined()

  const top =
    declaredTop ?? artHeight - (declaredBottom ?? 0) - cardSize

  return {
    left: left - rotationOverflow,
    right: left + cardSize + rotationOverflow,
    top: top - rotationOverflow - 8,
    bottom: top + cardSize + rotationOverflow,
  }
}

function cardClearance(
  first: ReturnType<typeof rotatedCardBounds>,
  second: ReturnType<typeof rotatedCardBounds>,
) {
  const horizontal = Math.max(
    second.left - first.right,
    first.left - second.right,
  )
  const vertical = Math.max(
    second.top - first.bottom,
    first.top - second.bottom,
  )

  return Math.max(horizontal, vertical)
}

describe('home hero icon navigation', () => {
  it('defines the update ticker motion, pause, and reduced-motion contracts', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const hero = baseRule(css, '.wbx-hero')
    const stage = baseRule(css, '.wbx-hero__stage')

    expect(css).toMatch(
      /\.wbx-update-ticker\s*\{[^}]*height:\s*40px;[^}]*display:\s*grid;[^}]*border:\s*0;[^}]*transform:\s*translateY\(-10px\);/s,
    )
    expect(css).toMatch(
      /\.wbx-update-ticker__group\s*>\s*\*\s*\{[^}]*min-height:\s*40px;/s,
    )
    expect(css).toMatch(
      /@media\s*\(max-width:\s*760px\)[\s\S]*\.wbx-update-ticker\s*\{[^}]*height:\s*40px;/s,
    )
    expect(css).toMatch(
      /\.wbx-update-ticker__viewport\s*\{[^}]*overflow:\s*hidden;/s,
    )
    expect(css).toMatch(
      /\.wbx-update-ticker__track\s*\{[^}]*animation:\s*wbx-update-ticker-scroll[^;]*infinite;/s,
    )
    expect(css).toMatch(
      /\.wbx-update-ticker:hover\s+\.wbx-update-ticker__track\s*\{[^}]*animation-play-state:\s*paused;/s,
    )
    expect(css).toMatch(
      /\.wbx-update-ticker:focus-within\s+\.wbx-update-ticker__track\s*\{[^}]*transform:\s*none;[^}]*animation:\s*none;/s,
    )
    expect(css).toMatch(
      /\.wbx-update-ticker:focus-within\s+\.wbx-update-ticker__viewport\s*\{[^}]*overflow-x:\s*auto;[^}]*scrollbar-width:\s*none;/s,
    )
    expect(css).toMatch(
      /@keyframes\s+wbx-update-ticker-scroll[\s\S]*transform:\s*translateX\(-50%\);/,
    )
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.wbx-update-ticker__track\s*\{[^}]*animation:\s*none;/s,
    )
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.wbx-update-ticker__group\[aria-hidden='true'\]\s*\{[^}]*display:\s*none;/s,
    )
    expect(hero).not.toMatch(/min-width:\s*0;/)
    expect(stage).not.toMatch(/min-width:\s*0;/)
  })

  it('keeps ticker dates legible on the fixed white surface', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const date = baseRule(css, '.wbx-update-ticker__group time')

    expect(date).toMatch(/color:\s*#4f5752;/)
    expect(date).not.toMatch(/var\(--wbx-muted\)/)
  })

  it('renders sorted update links once and keeps the duplicate group hidden', () => {
    mountHomePage()

    expect(homeUpdates.length).toBeGreaterThanOrEqual(3)
    expect(homeUpdates.map(({ date }) => date)).toEqual(
      [...homeUpdates].map(({ date }) => date).sort().reverse(),
    )

    const ticker = document.querySelector('.wbx-update-ticker')
    const groups = ticker?.querySelectorAll('.wbx-update-ticker__group')
    expect(ticker?.getAttribute('aria-label')).toBe('内容更新')
    expect(groups).toHaveLength(2)
    expect(groups?.[1].getAttribute('aria-hidden')).toBe('true')
    expect(groups?.[1].querySelectorAll('a')).toHaveLength(0)

    const links = groups?.[0].querySelectorAll<HTMLAnchorElement>('a') ?? []
    expect(Array.from(links, (link) => link.getAttribute('href'))).toEqual(
      homeUpdates.map(({ href }) => href),
    )
  })

  it('renders the hero copy and art directly inside a static stage', () => {
    mountHomePage()

    const stage = document.querySelector('.wbx-hero__stage')

    expect(stage?.querySelector(':scope > .wbx-hero__copy')).not.toBeNull()
    expect(stage?.querySelector(':scope > .wbx-hero__art')).not.toBeNull()
    expect(stage?.classList.contains('wbx-sticker-page')).toBe(false)
    expect(document.querySelector('.wbx-sticker-page__inside')).toBeNull()
    expect(document.querySelector('.wbx-sticker-page__trigger')).toBeNull()
  })

  it('keeps the desktop hero copy boundary on the card centerline', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const stage = baseRule(css, '.wbx-hero__stage')
    const compactDesktop = css.slice(
      css.indexOf('@media (max-width: 1200px)'),
      css.indexOf('@media (max-width: 960px)'),
    )

    expect(stage).toMatch(/grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/)
    expect(compactDesktop).toMatch(
      /\.wbx-hero__stage\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s,
    )
  })

  it('does not import or style the retired partner reveal', () => {
    const homeSource = readFileSync(
      'docs/.vitepress/theme/HomePage.vue',
      'utf8',
    )
    const homeCss = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

    expect(homeSource).not.toContain('HeroStickerPage')
    expect(homeSource).not.toContain('heroPartners')
    expect(homeCss).not.toContain('.wbx-sticker-page')
    expect(homeCss).not.toContain('.wbx-partner-sticker')
  })

  it('uses black icon cards with green pixel icons', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

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

  it('uses the approved homepage value labels', () => {
    mountHomePage()

    expect(
      document.querySelector('.wbx-hero__copy > .wbx-pixel-label')?.textContent,
    ).toBe('27 CHAPTERS / 4 PARTS / ∞ WORKFLOWS')
    expect(document.querySelector('.wbx-hero__metrics')).toBeNull()

    const labels = Array.from(
      document.querySelectorAll<HTMLElement>('.wbx-value-strip__item'),
      (item) => [
        item.querySelector('b')?.textContent,
        item.querySelector('small')?.textContent,
      ],
    )

    expect(labels).toEqual([
      ['场景实战', 'REAL-WORLD TASKS'],
      ['技能叠加', 'SKILL STACKING'],
      ['社区共创', 'COMMUNITY-BUILT'],
      ['系统沉淀', 'SYSTEM BUILDING'],
    ])
  })

  it('keeps the value strip green with black icons and text in both themes', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

    expect(css).toMatch(
      /\.wbx-value-strip\s*\{[^}]*color:\s*#0d100d;[^}]*background:\s*var\(--wbx-accent\);/s,
    )
    expect(css).toMatch(
      /\.wbx-value-strip__item\s*>\s*\.hn\s*\{[^}]*color:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-value-strip__item small\s*\{[^}]*color:\s*#0d100d;/s,
    )
  })

  it('uses only the outer hero border', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

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
    mountHomePage()

    const cta = document.querySelector<HTMLAnchorElement>('.wbx-hero-cta')
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

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

  it('uses a book icon for the first reading path', () => {
    mountHomePage()

    const readingCards = document.querySelectorAll('.wbx-reading-card')

    expect(readingCards[0]?.querySelector('.hn-book')).not.toBeNull()
    expect(readingCards[0]?.querySelector('.hn-user')).toBeNull()
  })

  it('uses the WorkBuddy Team lift and shadow on reading-path cards', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const card = baseRule(css, '.wbx-reading-card')
    const interaction = css.match(
      /\.wbx-reading-card:hover,\s*\.wbx-reading-card:focus-visible\s*\{([^}]*)\}/s,
    )?.[1]

    expect(card).toMatch(
      /transition:\s*border-color 0\.3s ease, box-shadow 0\.3s ease, transform 0\.3s ease;/,
    )
    expect(interaction).toBeDefined()
    expect(interaction).toMatch(/border-color:\s*var\(--wbx-line\);/)
    expect(interaction).toMatch(
      /box-shadow:\s*0 12px 32px rgba\(0, 0, 0, 0\.08\);/,
    )
    expect(interaction).toMatch(/transform:\s*translateY\(-4px\);/)
    expect(interaction).not.toMatch(/translate\(/)
  })

  it('offers five labelled links to distinct site sections', () => {
    mountHomePage()

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
      ['前往提需求', '/help/'],
      ['查看第一篇目录', '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/'],
      ['查看工作系统进阶篇', '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/'],
      ['查看 Part 2 案例篇', '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/'],
      ['查看 Part 4 岗位与行业篇', '/wb-x/第四篇 岗位与行业落地/'],
    ])
  })

  it('adds a labelled WorkBuddy official-site IP link to the hero', () => {
    mountHomePage()

    const official = document.querySelector<HTMLAnchorElement>('.wbx-hero__official:not(.wbx-hero__official--cn)')
    const image = official?.querySelector<HTMLImageElement>('.wbx-hero__official-ip')

    expect(official?.getAttribute('href')).toBe('https://www.workbuddy.ai/')
    expect(official?.getAttribute('target')).toBe('_blank')
    expect(official?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(official?.getAttribute('aria-label')).toBe('访问 WorkBuddy 官网')
    expect(official?.querySelector('.wbx-hero__official-label')?.textContent).toBe(
      'workbuddy.ai',
    )
    expect(image?.getAttribute('src')).toBe('/brand/workbuddy-official-ip.png')
    expect(image?.getAttribute('alt')).toBe('')
  })

  it('adds a workbuddy.cn label above the official-site IP link', () => {
    mountHomePage()

    const cn = document.querySelector<HTMLAnchorElement>('.wbx-hero__official--cn')

    expect(cn?.getAttribute('href')).toBe('https://www.workbuddy.cn/')
    expect(cn?.getAttribute('target')).toBe('_blank')
    expect(cn?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(cn?.getAttribute('aria-label')).toBe('访问 WorkBuddy 中国站')
    expect(cn?.querySelector('.wbx-hero__official-label')?.textContent).toBe(
      'workbuddy.cn',
    )
  })

  it('positions the official-site IP link without duplicate hero metrics', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
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
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
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

  it('keeps mobile reading arrows in a right-aligned third column', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const mobileStart = css.indexOf('@media (max-width: 760px)')
    const narrowStart = css.indexOf('@media (max-width: 420px)')
    const mobile = css.slice(mobileStart, css.indexOf('@media (max-width: 444px)'))
    const narrow = css.slice(narrowStart)

    expect(mobile).toMatch(
      /\.wbx-reading-card\s*\{[^}]*grid-template-columns:\s*70px minmax\(0, 1fr\) auto;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-reading-card__arrow\s*\{[^}]*display:\s*block;[^}]*align-self:\s*center;[^}]*justify-self:\s*end;/s,
    )
    expect(narrow).toMatch(
      /\.wbx-reading-card\s*\{[^}]*grid-template-columns:\s*56px minmax\(0, 1fr\) auto;/s,
    )
    expect(narrow).toMatch(
      /\.wbx-reading-card__arrow\s*\{[^}]*display:\s*block;[^}]*align-self:\s*center;[^}]*justify-self:\s*end;/s,
    )
  })

  it('positions the Part 4 people icon safely at every hero breakpoint', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
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

  it('renders the approved borderless homepage product footer', () => {
    mountHomePage()

    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const footer = document.querySelector('.wbx-home-footer')
    const attribution = footer?.querySelector<HTMLAnchorElement>('a')
    const footerRule = baseRule(css, '.wbx-home-footer')
    const innerRule = baseRule(css, '.wbx-home-footer__inner')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(footer?.textContent).toContain('以真实场景为主线的 WB-X 实战读本')
    expect(footer?.textContent).toContain('Pixel icons by HackerNoon')
    expect(footer?.textContent).toContain('Copyright © 2026 WB-X.SparkX')
    expect(attribution?.getAttribute('href')).toBe(
      'https://hackernoon.com/pixel-icon-library',
    )
    expect(footerRule).toMatch(/border:\s*0;/)
    expect(footerRule).toMatch(/background:\s*transparent;/)
    expect(innerRule).toMatch(/display:\s*flex;/)
    expect(innerRule).toMatch(/box-sizing:\s*border-box;/)
    expect(innerRule).toMatch(/justify-content:\s*space-between;/)
    expect(mobile).toMatch(
      /\.wbx-home-footer__inner\s*\{[^}]*align-items:\s*center;[^}]*flex-direction:\s*column;[^}]*text-align:\s*center;/s,
    )
  })

  it('runs the community callout viewport-wide without an outer border', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const community = baseRule(css, '.wbx-community')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(community).toMatch(/width:\s*100vw;/)
    expect(community).toMatch(/margin-top:\s*48px;/)
    expect(community).toMatch(/margin-right:\s*calc\(50% - 50vw\);/)
    expect(community).toMatch(/margin-left:\s*calc\(50% - 50vw\);/)
    expect(community).toMatch(/border:\s*0;/)
    expect(mobile).toMatch(
      /\.wbx-community\s*\{[^}]*margin-top:\s*38px;/s,
    )
  })

  it('aligns the system panel with the reading cards and rounds it by 20px', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const system = baseRule(css, '.wbx-system')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(system).toMatch(/margin:\s*72px 52px 0;/)
    expect(system).toMatch(/border-radius:\s*20px;/)
    expect(mobile).toMatch(
      /\.wbx-system\s*\{[^}]*margin:\s*52px 4px 0;/s,
    )
  })

  it('uses the approved light-gray system panel palette', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const system = baseRule(css, '.wbx-system')
    const introLabel = baseRule(css, '.wbx-system__intro .wbx-pixel-label')
    const introCopy = baseRule(css, '.wbx-system__intro > p:last-child')
    const steps = baseRule(css, '.wbx-system__steps')
    const step = baseRule(css, '.wbx-system__steps li')
    const number = baseRule(css, '.wbx-system__steps b')
    const title = baseRule(css, '.wbx-system__steps strong')
    const copy = baseRule(css, '.wbx-system__steps span')

    expect(system).toMatch(/color:\s*#0d100d;/)
    expect(system).toMatch(/--wbx-ink:\s*#0d100d;/)
    expect(system).toMatch(/background:\s*#f3f4f2;/)
    expect(introLabel).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(introCopy).toMatch(/color:\s*#0d100d;/)
    expect(steps).toMatch(/background:\s*#d9e0dc;/)
    expect(step).toMatch(/background:\s*#ffffff;/)
    expect(number).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(title).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(copy).toMatch(/color:\s*#0d100d;/)
  })

  it('uses the approved system heading and community download copy', () => {
    mountHomePage()

    expect(document.querySelector('#wbx-system-title')?.textContent).toBe(
      'AI 时代，一起象限跃迁',
    )
    expect(document.body.textContent).not.toContain('一次成功，不该只发生一次。')
    expect(document.querySelector('#wbx-community-title')?.textContent).toBe(
      '获取 WorkBuddy 小白书与配套资料',
    )
    expect(document.querySelector('.wbx-community__description')?.textContent).toBe(
      '下载完整读本、案例资料与后续更新内容。',
    )
    expect(document.querySelector('.wbx-community__code')).toBeNull()
    expect(document.body.textContent).not.toContain('提取码：WPc9')
  })

  it('links to Quark and contribution without a GitHub action', () => {
    mountHomePage()

    const download = document.querySelector<HTMLAnchorElement>(
      '.wbx-community__download',
    )
    const contribution = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-community__actions a'),
    ).find((link) => link.textContent === '参与共创')

    expect(download?.textContent).toBe('教学资料')
    expect(download?.getAttribute('href')).toBe(
      'https://pan.quark.cn/s/ca7b76d97d59?pwd=WPc9',
    )
    expect(download?.getAttribute('target')).toBe('_blank')
    expect(download?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(contribution?.getAttribute('href')).toBe('/community/contributing')
    expect(document.querySelector<HTMLImageElement>('.wbx-community__ip')?.getAttribute('src'))
      .toBe('/brand/workbuddy-ip.png')
    expect(document.querySelector('.wbx-community__heart')).toBeNull()
    expect(document.querySelector('.wbx-community__icon')).toBeNull()
    expect(document.body.textContent).not.toContain('前往 GitHub')
  })

  it('renders the complete IP as one static image', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const community = baseRule(css, '.wbx-community')
    const copy = baseRule(css, '.wbx-community__copy')
    const communityTitle = baseRule(css, '.wbx-community h2')
    const actions = baseRule(css, '.wbx-community__actions')
    const art = baseRule(css, '.wbx-community__art')
    const stage = baseRule(css, '.wbx-community__ip-stage')
    const footer = baseRule(css, '.wbx-home-footer')
    const download = baseRule(css, '.wbx-community .wbx-button.wbx-community__download')
    const ip = baseRule(css, '.wbx-community__ip')
    const tablet = css.slice(
      css.indexOf('@media (max-width: 960px)'),
      css.indexOf('@media (min-width: 761px)'),
    )
    const compactDesktop = css.slice(
      css.indexOf('@media (max-width: 1200px)'),
      css.indexOf('@media (max-width: 960px)'),
    )
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(community).toMatch(
      /grid-template-columns:\s*minmax\(0, 1fr\) minmax\(240px, 0\.72fr\);/,
    )
    expect(community).toMatch(/margin-top:\s*48px;/)
    expect(community).toMatch(/min-height:\s*270px;/)
    expect(community).toMatch(/height:\s*299px;/)
    expect(copy).toMatch(/max-width:\s*680px;/)
    expect(communityTitle).toMatch(/font-size:\s*36px;/)
    expect(communityTitle).toMatch(/white-space:\s*nowrap;/)
    expect(copy).toMatch(
      /padding:\s*31px 0 31px calc\(max\(\(100vw - 1480px\) \/ 2, 0px\) \+ 140px\);/,
    )
    expect(compactDesktop).toMatch(
      /\.wbx-community__copy\s*\{[^}]*padding-left:\s*132px;/s,
    )
    expect(compactDesktop).toMatch(
      /\.wbx-community h2\s*\{[^}]*white-space:\s*normal;/s,
    )
    expect(compactDesktop).not.toMatch(/\.wbx-community h2\s*\{[^}]*font-size:/s)
    expect(actions).toMatch(/display:\s*grid;/)
    expect(actions).toMatch(
      /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/,
    )
    expect(actions).toMatch(/width:\s*min\(100%, 370px\);/)
    expect(baseRule(css, '.wbx-community .wbx-button')).toMatch(/min-width:\s*0;/)
    expect(community).toMatch(/overflow:\s*visible;/)
    expect(art).toMatch(/overflow:\s*visible;/)
    expect(art).toMatch(/min-height:\s*270px;/)
    expect(art).toMatch(/background:\s*#f3f4f2;/)
    expect(art).not.toMatch(/linear-gradient/)
    expect(stage).toMatch(/position:\s*absolute;/)
    expect(stage).toMatch(/bottom:\s*-24px;/)
    expect(stage).toMatch(/left:\s*50%;/)
    expect(stage).toMatch(/transform:\s*translateX\(-50%\);/)
    expect(footer).toMatch(/padding-top:\s*24px;/)
    expect(download).toMatch(/background:\s*var\(--wbx-accent\);/)
    expect(download).toMatch(/color:\s*#0d100d !important;/)
    expect(download).toMatch(/border-color:\s*var\(--wbx-accent\);/)
    expect(css).toMatch(
      /\.wbx-community \.wbx-button\.wbx-community__download:(?:hover|focus-visible)[^{]*\{[^}]*color:\s*#0d100d !important;[^}]*border-color:\s*var\(--wbx-accent\);/s,
    )
    expect(ip).toMatch(/width:\s*min\(100%, 424px\);/)
    expect(ip).not.toMatch(/animation:/)
    expect(ip).not.toMatch(/clip-path:/)
    expect(ip).not.toMatch(/filter:/)
    expect(css).not.toContain('.wbx-community__heart')
    expect(css).not.toContain('wbx-community-heart-pulse')
    expect(css).not.toContain('wbx-community-book-float')
    expect(tablet).not.toContain('.wbx-community')
    expect(mobile).toMatch(
      /\.wbx-community\s*\{[^}]*grid-template-columns:\s*1fr;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__actions\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__copy\s*\{[^}]*padding:\s*32px 24px;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community h2\s*\{[^}]*font-size:\s*30px;[^}]*white-space:\s*normal;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community\s*\{[^}]*overflow:\s*visible;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__art\s*\{[^}]*min-height:\s*170px;[^}]*overflow:\s*visible;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__ip-stage\s*\{[^}]*max-width:\s*300px;[^}]*margin:\s*0 auto -10px;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__ip-stage\s*\{[^}]*position:\s*relative;[^}]*transform:\s*none;/s,
    )
  })

  it('removes the task heading divider while keeping the task-grid border', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const heading = baseRule(css, '.wbx-section__heading--compact')
    const taskGrid = baseRule(css, '.wbx-task-grid')

    expect(heading).toMatch(/padding-top:\s*18px;/)
    expect(heading).not.toMatch(/border-top:/)
    expect(taskGrid).toMatch(/border-top:\s*1px solid var\(--wbx-line\);/)
  })
})
