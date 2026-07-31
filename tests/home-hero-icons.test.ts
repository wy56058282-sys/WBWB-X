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

  it('uses a book icon for the first reading path', () => {
    mountHomePage()

    const readingCards = document.querySelectorAll('.wbx-reading-card')

    expect(readingCards[0]?.querySelector('.hn-book')).not.toBeNull()
    expect(readingCards[0]?.querySelector('.hn-user')).toBeNull()
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
      ['查看 Part 1 使用手册', '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/'],
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

  it('renders the footer outside the constrained home content with an aligned inner container', () => {
    mountHomePage()

    const home = document.querySelector('.wbx-home')
    const footer = document.querySelector('.wbx-home-footer')
    const inner = footer?.querySelector('.wbx-home-footer__inner')

    expect(home?.contains(footer)).toBe(false)
    expect(footer?.parentElement).toBe(home?.parentElement)
    expect(inner).not.toBeNull()
  })
})
