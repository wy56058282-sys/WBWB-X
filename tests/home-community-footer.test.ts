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
    expect(footer?.textContent).toContain('Copyright © 2026 安徽象限跃迁人工智能科技有限公司')
    expect(footer?.textContent).not.toContain('WB-X.SparkX')
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

  it('places the material actions directly after the system description', () => {
    harness.mountHomePage()

    const intro = document.querySelector('.wbx-system__intro')
    const description = intro?.querySelector(':scope > p:last-of-type')
    const actions = intro?.querySelector('.wbx-system__actions')
    const download = document.querySelector<HTMLAnchorElement>(
      '.wbx-system__download',
    )
    const contribution = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-system__actions a'),
    ).find((link) => link.textContent === '参与共创')

    expect(description?.nextElementSibling).toBe(actions)
    expect(document.querySelectorAll('.wbx-system__actions')).toHaveLength(1)
    expect(download?.textContent).toBe('教学资料')
    expect(download?.getAttribute('href')).toBe(
      'https://pan.quark.cn/s/4b2488289c79',
    )
    expect(download?.getAttribute('target')).toBe('_blank')
    expect(download?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(contribution?.getAttribute('href')).toBe('/community/contributing')
    expect(document.querySelector('.wbx-community__copy')).toBeNull()
    expect(document.body.textContent).not.toContain('前往 GitHub')
  })

  it('keeps the moved actions in two equal columns at desktop and mobile widths', () => {
    const css = readHomeStyle()
    const actions = baseRule(css, '.wbx-system__actions')
    const button = baseRule(css, '.wbx-system__actions .wbx-button')
    const download = baseRule(css, '.wbx-system__actions .wbx-system__download')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(actions).toMatch(/display:\s*grid;/)
    expect(actions).toMatch(
      /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/,
    )
    expect(actions).toMatch(/width:\s*min\(100%, 370px\);/)
    expect(actions).toMatch(/margin-top:\s*24px;/)
    expect(button).toMatch(/min-width:\s*0;/)
    expect(download).toMatch(/background:\s*var\(--wbx-accent\);/)
    expect(download).toMatch(/color:\s*#0d100d !important;/)
    expect(download).toMatch(/border-color:\s*var\(--wbx-accent\);/)
    expect(css).toMatch(
      /\.wbx-system__actions \.wbx-system__download:(?:hover|focus-visible)[^{]*\{[^}]*color:\s*#0d100d !important;[^}]*border-color:\s*var\(--wbx-accent\);/s,
    )
    expect(mobile).toMatch(
      /\.wbx-system__actions\s*\{[^}]*width:\s*100%;/s,
    )
  })

  it('renders the halved IP as a borderless footer decoration', () => {
    harness.mountHomePage()

    const css = readHomeStyle()
    const decoration = baseRule(css, '.wbx-community-ip')
    const ip = baseRule(css, '.wbx-community__ip')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))
    const image = document.querySelector<HTMLImageElement>('.wbx-community__ip')

    expect(document.querySelector('.wbx-community-ip')?.getAttribute('aria-hidden')).toBe('true')
    expect(image?.getAttribute('src')).toBe('/brand/workbuddy-ip.png')
    expect(image?.getAttribute('alt')).toBe('')
    expect(decoration).toMatch(/justify-content:\s*flex-end;/)
    expect(decoration).toMatch(/border:\s*0;/)
    expect(decoration).toMatch(/background:\s*transparent;/)
    expect(ip).toMatch(/width:\s*min\(100%, 187px\);/)
    expect(ip).toMatch(/height:\s*auto;/)
    expect(ip).not.toMatch(/animation:/)
    expect(mobile).toMatch(
      /\.wbx-community-ip\s*\{[^}]*justify-content:\s*center;[^}]*padding-right:\s*0;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-community__ip\s*\{[^}]*width:\s*min\(100%, 150px\);/s,
    )
  })

})
