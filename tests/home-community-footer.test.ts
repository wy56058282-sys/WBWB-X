import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'
import { useHomePageHarness } from './helpers/home-page-harness'
import { readHomeStyle } from './helpers/read-theme-style'

const harness = useHomePageHarness()

describe('home hero icon navigation', () => {
  it('renders the approved borderless homepage product footer', () => {
    harness.mountHomePage()

    const css = readHomeStyle()
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
    const css = readHomeStyle()
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

  it('links to Quark and contribution without a GitHub action', () => {
    harness.mountHomePage()

    const download = document.querySelector<HTMLAnchorElement>(
      '.wbx-community__download',
    )
    const contribution = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-community__actions a'),
    ).find((link) => link.textContent === '参与共创')

    expect(download?.textContent).toBe('教学资料')
    expect(download?.getAttribute('href')).toBe(
      'https://pan.quark.cn/s/4b2488289c79',
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
    const css = readHomeStyle()
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
    expect(stage).toMatch(/width:\s*min\(92%, 374px\);/)
    expect(ip).toMatch(/width:\s*min\(100%, 374px\);/)
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

})
