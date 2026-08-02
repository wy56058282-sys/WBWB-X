import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import { readFileSync } from 'node:fs'
import HomePage from '../docs/.vitepress/theme/HomePage.vue'

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
  it('renders the hero copy and art directly inside a static stage', () => {
    mountHomePage()

    const stage = document.querySelector('.wbx-hero__stage')

    expect(stage?.querySelector(':scope > .wbx-hero__copy')).not.toBeNull()
    expect(stage?.querySelector(':scope > .wbx-hero__art')).not.toBeNull()
    expect(stage?.classList.contains('wbx-sticker-page')).toBe(false)
    expect(document.querySelector('.wbx-sticker-page__inside')).toBeNull()
    expect(document.querySelector('.wbx-sticker-page__trigger')).toBeNull()
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
    ).toBe('REAL TASKS · 27 CHAPTERS · OPEN SOURCE')

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
      ['查看阅读指南', '/reading-guide'],
      ['查看工作系统进阶篇', '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/'],
      ['查看 Part 2 案例篇', '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/'],
      ['查看 Part 4 岗位与行业篇', '/wb-x/第四篇 岗位与行业落地/'],
    ])
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
    expect(document.querySelector('.wbx-community__heart')).not.toBeNull()
    expect(document.querySelector('.wbx-community__icon')).toBeNull()
    expect(document.body.textContent).not.toContain('前往 GitHub')
  })

  it('keeps the IP static and animates only its heart', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const community = baseRule(css, '.wbx-community')
    const copy = baseRule(css, '.wbx-community__copy')
    const actions = baseRule(css, '.wbx-community__actions')
    const art = baseRule(css, '.wbx-community__art')
    const download = baseRule(css, '.wbx-community .wbx-button.wbx-community__download')
    const ip = baseRule(css, '.wbx-community__ip')
    const tablet = css.slice(
      css.indexOf('@media (max-width: 960px)'),
      css.indexOf('@media (min-width: 761px)'),
    )
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(community).toMatch(
      /grid-template-columns:\s*minmax\(0, 1fr\) minmax\(240px, 0\.72fr\);/,
    )
    expect(community).toMatch(/margin-top:\s*48px;/)
    expect(community).toMatch(/min-height:\s*270px;/)
    expect(copy).toMatch(/max-width:\s*680px;/)
    expect(copy).toMatch(/padding:\s*31px 0 31px 52px;/)
    expect(actions).toMatch(/flex-direction:\s*row;/)
    expect(art).toMatch(/overflow:\s*hidden;/)
    expect(art).toMatch(/min-height:\s*270px;/)
    expect(download).toMatch(/background:\s*var\(--wbx-accent\);/)
    expect(download).toMatch(/color:\s*#0d100d !important;/)
    expect(download).toMatch(/border-color:\s*var\(--wbx-accent\);/)
    expect(css).toMatch(
      /\.wbx-community \.wbx-button\.wbx-community__download:(?:hover|focus-visible)[^{]*\{[^}]*color:\s*#0d100d !important;[^}]*border-color:\s*var\(--wbx-accent\);/s,
    )
    expect(ip).toMatch(/width:\s*min\(100%, 424px\);/)
    expect(ip).not.toMatch(/animation:/)
    expect(css).toMatch(
      /\.wbx-community__heart\s*\{[^}]*animation:\s*wbx-community-heart-pulse 2\.4s ease-in-out infinite;/s,
    )
    expect(css).toMatch(/@keyframes wbx-community-heart-pulse\s*\{/)
    expect(css).not.toContain('wbx-community-book-float')
    expect(tablet).not.toContain('.wbx-community')
    expect(mobile).toMatch(
      /\.wbx-community\s*\{[^}]*grid-template-columns:\s*1fr;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__actions\s*\{[^}]*flex-direction:\s*column;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__ip-stage\s*\{[^}]*max-width:\s*300px;/s,
    )
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-community__heart\s*\{[^}]*animation:\s*none;/,
    )
  })
})
