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

  it('uses theme surface icon cards with green pixel icons and soft shadows', () => {
    const css = readHomeStyle()

    expect(css).not.toMatch(
      /\.wbx-hero__art\s*\{[^}]*background:\s*#0d100d;/s,
    )
    const themes = [
      { surface: '#ffffff', expected: 'rgb(255, 255, 255)' },
      { surface: '#181b15', expected: 'rgb(24, 27, 21)' },
    ]
    themes.forEach(({ surface, expected }) => {
      const style = document.createElement('style')
      style.textContent = css
        .replaceAll('var(--wbx-surface)', surface)
        .replaceAll('var(--wbx-line)', '#e3e7e4')
        .replaceAll('var(--wbx-accent)', '#32e6b9')
        .replaceAll('var(--wbx-shadow-soft)', '0 8px 24px rgb(13 16 13 / 6%)')
      document.head.append(style)
      document.body.innerHTML = '<a class="wbx-icon-card"><i class="hn"></i></a>'

      const card = getComputedStyle(document.querySelector('.wbx-icon-card')!)
      expect(card.backgroundColor).toBe(expected)
      expect(card.color).toBe('rgb(50, 230, 185)')
      expect(card.boxShadow).toBe('0 8px 24px rgb(13 16 13 / 6%)')

      style.remove()
      document.body.replaceChildren()
    })
    expect(css).toMatch(
      /\.wbx-hero__copy\s*>\s*\.wbx-pixel-label\s*\{[^}]*color:\s*var\(--wbx-ink\);/s,
    )
    expect(css).toMatch(
      /\.wbx-hero__monogram\s*\{[^}]*top:\s*42px;[^}]*right:\s*48px;/s,
    )
  })

  it('reverses the hero copy and secondary action in dark mode', () => {
    const style = document.createElement('style')
    style.textContent = readHomeStyle().replaceAll('var(--wbx-ink)', '#f3f5ed')
    document.head.append(style)
    document.documentElement.classList.add('dark')
    harness.mountHomePage()

    const expected = 'rgb(243, 245, 237)'
    expect(getComputedStyle(document.querySelector('#wbx-hero-title')!).color).toBe(expected)
    expect(getComputedStyle(document.querySelector('.wbx-hero__summary')!).color).toBe(expected)
    expect(getComputedStyle(document.querySelector('.wbx-update-ticker')!).color).toBe(expected)
    expect(getComputedStyle(document.querySelector('.wbx-button--outline')!).color).toBe(expected)

    style.remove()
    document.documentElement.classList.remove('dark')
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
      /\.wbx-hero-cta__arrow\s*\{[^}]*border-radius:\s*0 var\(--wbx-radius-md\) var\(--wbx-radius-md\) 0;/s,
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
      ['了解 WorkBuddy', '/tools/'],
      ['查看第一篇目录', '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/'],
      ['查看工作系统进阶篇', '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/'],
      ['查看 Part 2 案例篇', '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/'],
      ['查看 Part 4 岗位与行业篇', '/wb-x/第四篇 岗位与行业落地/'],
    ])
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
