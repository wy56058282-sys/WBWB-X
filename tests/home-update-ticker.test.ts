import { describe, expect, it, vi } from 'vitest'
import { homeUpdates } from '../docs/.vitepress/theme/homeUpdates'
import { baseRule } from './helpers/css-rules'
import { useHomePageHarness } from './helpers/home-page-harness'
import { readHomeStyle } from './helpers/read-theme-style'

const harness = useHomePageHarness()

describe('home hero icon navigation', () => {
  it('rotates one synchronized update link every six seconds and loops a full cycle', async () => {
    vi.useFakeTimers()
    harness.mountHomePage()

    expect(homeUpdates.length).toBeGreaterThanOrEqual(3)
    expect(homeUpdates.map(({ date }) => date)).toEqual(
      [...homeUpdates].map(({ date }) => date).sort().reverse(),
    )

    const ticker = document.querySelector('.wbx-update-ticker')
    const initialTime = ticker?.querySelector('time')
    const initialDay = ticker?.querySelector('.wbx-update-ticker__date-day')
    expect(ticker?.getAttribute('aria-label')).toBe('内容更新')
    expect(ticker?.querySelectorAll('.wbx-update-ticker__link')).toHaveLength(1)
    expect(initialTime?.textContent).toBe(homeUpdates[0].date)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[0].title,
    )

    await vi.advanceTimersByTimeAsync(6000)

    expect(ticker?.querySelector('time')).toBe(initialTime)
    expect(ticker?.querySelector('.wbx-update-ticker__date-day')).toBe(initialDay)
    expect(initialTime?.textContent).toBe(homeUpdates[1].date)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[1].title,
    )
    expect(ticker?.querySelector<HTMLAnchorElement>('a')?.getAttribute('href')).toBe(
      homeUpdates[1].href,
    )
    expect(ticker?.querySelectorAll('.wbx-update-ticker__link')).toHaveLength(1)

    await vi.advanceTimersByTimeAsync((homeUpdates.length - 1) * 6000)

    expect(ticker?.querySelector('time')?.textContent).toBe(homeUpdates[0].date)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[0].title,
    )
    expect(ticker?.querySelector<HTMLAnchorElement>('a')?.getAttribute('href')).toBe(
      homeUpdates[0].href,
    )
    expect(ticker?.querySelectorAll('.wbx-update-ticker__link')).toHaveLength(1)
  })

  it('always duplicates the current update title for the marquee', () => {
    harness.mountHomePage()

    const marqueeTitles = document.querySelectorAll(
      '.wbx-update-ticker__title',
    )
    expect(marqueeTitles).toHaveLength(2)
    expect(marqueeTitles[0]?.textContent).toBe(homeUpdates[0].title)
    expect(marqueeTitles[1]?.textContent).toBe(homeUpdates[0].title)
    expect(marqueeTitles[1]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('pauses on hover and starts a fresh interval after the pointer leaves', async () => {
    vi.useFakeTimers()
    harness.mountHomePage()

    const ticker = document.querySelector<HTMLElement>('.wbx-update-ticker')

    await vi.advanceTimersByTimeAsync(3000)
    ticker?.dispatchEvent(new MouseEvent('mouseenter'))
    await vi.advanceTimersByTimeAsync(18000)

    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[0].title,
    )
    expect(ticker?.classList.contains('is-paused')).toBe(true)

    ticker?.dispatchEvent(new MouseEvent('mouseleave'))
    await vi.advanceTimersByTimeAsync(5999)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[0].title,
    )

    await vi.advanceTimersByTimeAsync(1)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[1].title,
    )
  })

  it('stays paused until both overlapping hover and focus states end', async () => {
    vi.useFakeTimers()
    harness.mountHomePage()

    const ticker = document.querySelector<HTMLElement>('.wbx-update-ticker')
    const outside = document.createElement('button')
    document.body.append(outside)

    ticker?.dispatchEvent(new MouseEvent('mouseenter'))
    const firstLink = ticker?.querySelector<HTMLAnchorElement>('a')
    firstLink?.focus()
    expect(document.activeElement).toBe(firstLink)
    await vi.advanceTimersByTimeAsync(12000)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[0].title,
    )

    ticker?.dispatchEvent(new MouseEvent('mouseleave'))
    await vi.advanceTimersByTimeAsync(6000)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[0].title,
    )

    outside.focus()
    expect(document.activeElement).toBe(outside)
    await vi.advanceTimersByTimeAsync(6000)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[1].title,
    )

    ticker?.dispatchEvent(new MouseEvent('mouseenter'))
    const secondLink = ticker?.querySelector<HTMLAnchorElement>('a')
    secondLink?.focus()
    expect(document.activeElement).toBe(secondLink)
    outside.focus()
    expect(document.activeElement).toBe(outside)
    await vi.advanceTimersByTimeAsync(6000)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[1].title,
    )

    ticker?.dispatchEvent(new MouseEvent('mouseleave'))
    await vi.advanceTimersByTimeAsync(6000)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[2].title,
    )
  })

  it('clears timers and media listeners when unmounted', () => {
    vi.useFakeTimers()
    const app = harness.mountHomePage()

    expect(vi.getTimerCount()).toBeGreaterThan(0)

    app.unmount()

    expect(vi.getTimerCount()).toBe(0)
    expect(harness.mediaQueryRemoveEventListener()).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    )
  })

  it('keeps the first update visible when reduced motion is preferred', async () => {
    vi.useFakeTimers()
    harness.stubMatchMedia(true)
    harness.mountHomePage()

    const ticker = document.querySelector('.wbx-update-ticker')
    await vi.advanceTimersByTimeAsync(18000)

    expect(ticker?.querySelector('time')?.textContent).toBe(homeUpdates[0].date)
    expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
      homeUpdates[0].title,
    )
  })

  it('styles the synchronized update ticker as a vertically changing date with a persistent title marquee', () => {
    const css = readHomeStyle()
    const ticker = baseRule(css, '.wbx-update-ticker')
    const date = baseRule(css, '.wbx-update-ticker__date')
    const titleLink = baseRule(css, '.wbx-update-ticker__link')
    const titleTrack = baseRule(css, '.wbx-update-ticker__title-track')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))
    const reducedMotion = css.slice(
      css.indexOf('@media (prefers-reduced-motion: reduce)'),
      css.indexOf('.wbx-hero__official'),
    )

    expect(ticker).toMatch(/height:\s*28px;/)
    expect(ticker).toMatch(
      /grid-template-columns:\s*92px minmax\(0, 1fr\);/,
    )
    expect(ticker).toMatch(/background:\s*transparent;/)
    expect(ticker).toMatch(/transform:\s*translateY\(-60px\);/)
    expect(css).toMatch(
      /\.wbx-update-ticker__date-viewport,[\s\S]*?\.wbx-update-ticker__content\s*\{[^}]*height:\s*28px;[^}]*overflow:\s*hidden;/s,
    )
    expect(date).toMatch(/position:\s*absolute;/)
    expect(css).toMatch(
      /\.wbx-update-date-enter-active,\s*\.wbx-update-date-leave-active\s*\{[^}]*transition:\s*transform 400ms ease, opacity 400ms ease;/s,
    )
    expect(css).toMatch(
      /\.wbx-update-date-enter-from\s*\{[^}]*transform:\s*translateY\(100%\);[^}]*opacity:\s*0;/s,
    )
    expect(css).toMatch(
      /\.wbx-update-date-leave-to\s*\{[^}]*transform:\s*translateY\(-100%\);[^}]*opacity:\s*0;/s,
    )
    expect(titleTrack).toMatch(/display:\s*inline-flex;/)
    expect(titleTrack).toMatch(/width:\s*max-content;/)
    expect(titleTrack).toMatch(/gap:\s*32px;/)
    expect(titleTrack).toMatch(
      /animation:\s*wbx-update-title-marquee 12s linear 400ms infinite;/,
    )
    expect(titleLink).toMatch(/width:\s*100%;/)
    expect(titleLink).toMatch(/height:\s*100%;/)
    expect(css).not.toMatch(/\.is-overflowing/)
    expect(css).toMatch(
      /@keyframes wbx-update-title-marquee\s*\{[\s\S]*?to\s*\{[^}]*transform:\s*translateX\(calc\(-50% - 16px\)\);/,
    )
    expect(css).toMatch(
      /\.wbx-update-ticker:hover\s+\.wbx-update-ticker__title-track,\s*\.wbx-update-ticker:focus-within\s+\.wbx-update-ticker__title-track,\s*\.wbx-update-ticker\.is-paused\s+\.wbx-update-ticker__title-track\s*\{[^}]*animation-play-state:\s*paused;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-update-ticker\s*\{[^}]*width:\s*min\(100%, 320px\);[^}]*grid-template-columns:\s*82px minmax\(0, 1fr\);/s,
    )
    expect(reducedMotion).toMatch(
      /\.wbx-update-date-enter-active,\s*\.wbx-update-date-leave-active\s*\{[^}]*transition:\s*none;/s,
    )
    expect(reducedMotion).toMatch(
      /\.wbx-update-ticker__title-track\s*\{[^}]*animation:\s*none;/s,
    )
    expect(reducedMotion).not.toMatch(
      /\.wbx-update-ticker__link\s*\{[^}]*display:\s*none;/s,
    )
  })

  it('keeps the mobile ticker inside the hero without moving subsequent copy content', () => {
    const css = readHomeStyle()
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))
    const mobileCopy = mobile.match(/\.wbx-hero__copy\s*\{([^}]*)\}/)?.[1]
    const mobileTicker = mobile.match(/\.wbx-update-ticker\s*\{([^}]*)\}/)?.[1]
    const mobileTopInset = Number(
      mobileCopy?.match(/padding:\s*(\d+)px/)?.[1],
    )
    const tickerTranslation = Number(
      mobileTicker?.match(/transform:\s*translateY\((-?\d+)px\);/)?.[1],
    )
    const tickerFlowCompensation = Number(
      mobileTicker?.match(/margin-bottom:\s*(-?\d+)px;/)?.[1],
    )

    expect(mobileTopInset + tickerTranslation).toBe(12)
    expect(mobileTopInset + tickerFlowCompensation).toBe(46)
  })

})
