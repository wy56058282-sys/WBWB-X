import { describe, expect, it } from 'vitest'
import { homeUpdates } from '../docs/.vitepress/theme/homeUpdates'
import { baseRule } from './helpers/css-rules'
import { useHomePageHarness } from './helpers/home-page-harness'
import { readHomeStyle } from './helpers/read-theme-style'

const harness = useHomePageHarness()

describe('home update ticker', () => {
  it('lists only the supplied newly added capabilities in release order', () => {
    expect(homeUpdates).toHaveLength(18)
    expect(homeUpdates.map(({ date }) => date)).toEqual([
      '2026-08-17',
      '2026-08-13',
      '2026-08-12',
      ...Array(14).fill('2026-08-07'),
      '2026-07-28',
    ])
    expect(homeUpdates.every(({ title }) => /^5\.3\.\d+：新增/.test(title))).toBe(true)
  })

  it('duplicates the complete update sequence for one seamless loop', () => {
    harness.mountHomePage()

    const ticker = document.querySelector('.wbx-update-ticker')
    const groups = ticker?.querySelectorAll('.wbx-update-ticker__title-group')
    const expectedTitles = homeUpdates.map(({ title }) => title)

    expect(ticker?.getAttribute('aria-label')).toBe('内容更新')
    expect(ticker?.querySelector('.wbx-update-ticker__icon')).not.toBeNull()
    expect(groups).toHaveLength(2)
    expect(
      [...(groups?.[0]?.querySelectorAll('.wbx-update-ticker__title') ?? [])]
        .map((title) => title.textContent),
    ).toEqual(expectedTitles)
    expect(
      [...(groups?.[1]?.querySelectorAll('.wbx-update-ticker__title') ?? [])]
        .map((title) => title.textContent),
    ).toEqual(expectedTitles)
    expect(groups?.[1]?.getAttribute('aria-hidden')).toBe('true')
    expect(groups?.[1]?.querySelectorAll('a[tabindex="-1"]')).toHaveLength(homeUpdates.length)
  })

  it('keeps each update title, date, and destination synchronized', () => {
    harness.mountHomePage()

    const links = document.querySelectorAll<HTMLAnchorElement>(
      '.wbx-update-ticker__title-group:first-child .wbx-update-ticker__link',
    )

    expect(links).toHaveLength(homeUpdates.length)
    links.forEach((link, index) => {
      expect(link.getAttribute('aria-label')).toBe(
        `${homeUpdates[index].date} ${homeUpdates[index].title}`,
      )
      expect(link.getAttribute('href')).toBe(homeUpdates[index].href)
      expect(link.textContent).toBe(homeUpdates[index].title)
    })
  })

  it('centers the icon and update track and uses a single linear animation', () => {
    const css = readHomeStyle()
    const stageRule = baseRule(css, '.wbx-hero__stage')
    const tickerRule = baseRule(css, '.wbx-update-ticker')
    const monogramRule = baseRule(css, '.wbx-hero__monogram')
    const trackRule = baseRule(css, '.wbx-update-ticker__title-track')

    expect(stageRule).toMatch(/--wbx-hero-meta-center:\s*54px;/)
    expect(tickerRule).toMatch(/display:\s*flex;/)
    expect(tickerRule).toMatch(/align-items:\s*center;/)
    expect(tickerRule).toMatch(/justify-content:\s*center;/)
    expect(tickerRule).toMatch(/position:\s*absolute;/)
    expect(tickerRule).toMatch(/top:\s*calc\(var\(--wbx-hero-meta-center\) - 14px\);/)
    expect(tickerRule).toMatch(/transform:\s*none;/)
    expect(monogramRule).toMatch(/top:\s*calc\(var\(--wbx-hero-meta-center\) - 12px\);/)
    expect(trackRule).toMatch(/animation:\s*wbx-update-title-marquee 160s linear infinite;/)
    expect(css).toMatch(
      /@keyframes wbx-update-title-marquee[\s\S]*transform:\s*translate3d\(calc\(-50% - 24px\), 0, 0\);/,
    )
  })

  it('pauses without rebuilding the track and provides a static reduced-motion view', () => {
    const css = readHomeStyle()

    expect(css).toMatch(
      /\.wbx-update-ticker:hover \.wbx-update-ticker__title-track,[\s\S]*animation-play-state:\s*paused;/,
    )
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.wbx-update-ticker__title-track\s*\{[^}]*animation:\s*none;/,
    )
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.wbx-update-ticker__title-group\[aria-hidden='true'\][\s\S]*display:\s*none;/,
    )
  })
})
