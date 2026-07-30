// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { brand } from '../docs/.vitepress/brand'
import vitepressConfig from '../docs/.vitepress/config'

function readPngDimensions(path: string) {
  const png = readFileSync(path)

  expect(png.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  )
  expect(png.subarray(12, 16).toString('ascii')).toBe('IHDR')

  return {
    width: png.readUInt32BE(16),
    height: png.readUInt32BE(20),
  }
}

describe('brand configuration', () => {
  it('contains the approved WB-X identity', () => {
    expect(brand.siteName).toBe('WorkBuddy WB-X')
    expect(brand.contentName).toBe('WorkBuddy 实战小白书')
    expect(brand.contentShortName).toBe('WorkBuddy小白书')
    expect(brand.shortMark).toBe('WBWB-X')
    expect(brand.accent).toBe('#32E6B9')
    expect(brand.origin).toBe('https://www.wbwb-x.sparkx.zone')
    expect(brand.repository).toBe('https://github.com/wy56058282-sys/WBWB-X')
    expect(brand.author).toBe('WorkBuddy WB-X Contributors')
    expect(brand.logoPath).toBe('/brand/wb-x-logo.svg')
    expect(brand.qrPath).toBe('/community/wechat-group.png')
  })

  it('ships a social share image at the required dimensions', () => {
    expect(readPngDimensions('docs/public/og/workbuddy-wb-x-guide.png')).toEqual(
      {
        width: 1280,
        height: 720,
      },
    )
  })

  it('publishes absolute social image metadata with explicit dimensions', () => {
    const meta = Object.fromEntries(
      (vitepressConfig.head ?? [])
        .filter(([tag]) => tag === 'meta')
        .map(([, attributes]) => [
          attributes.property ?? attributes.name,
          attributes.content,
        ]),
    )

    expect(meta).toMatchObject({
      'og:image':
        'https://www.wbwb-x.sparkx.zone/og/workbuddy-wb-x-guide.png',
      'og:image:width': '1280',
      'og:image:height': '720',
      'twitter:image':
        'https://www.wbwb-x.sparkx.zone/og/workbuddy-wb-x-guide.png',
    })
  })

  it('renders homepage identity from the shared brand module', () => {
    const source = readFileSync('docs/.vitepress/theme/HomePage.vue', 'utf8')
    expect(source).toContain("import { brand } from '../brand'")
    expect(source).not.toContain('WorkBuddy Guide')
    expect(source).not.toContain('#d8f238')
  })

  it('loads the local Silkscreen weights used by pixel labels', () => {
    const themeSource = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const customCss = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))

    expect(themeSource).toContain("import '@fontsource/silkscreen/400.css'")
    expect(themeSource).toContain("import '@fontsource/silkscreen/700.css'")
    expect(customCss).toContain('--wbx-pixel: "Silkscreen"')
    expect(packageJson.devDependencies['@fontsource/silkscreen']).toBe('5.2.7')
    expect(existsSync('node_modules/@fontsource/silkscreen/400.css')).toBe(true)
    expect(existsSync('node_modules/@fontsource/silkscreen/700.css')).toBe(true)
  })

  it('derives branded greens from the approved accent token', () => {
    const css = ['custom.css', 'home.css']
      .map((file) => readFileSync(`docs/.vitepress/theme/${file}`, 'utf8'))
      .join('\n')
    const hexColors = css.match(/#[0-9a-f]{6}\b/gi) ?? []
    const offBrandGreens = [
      ...new Set(
        hexColors.filter((hex) => {
          if (hex.toLowerCase() === '#32e6b9') return false
          const value = Number.parseInt(hex.slice(1), 16)
          const red = value >> 16
          const green = (value >> 8) & 0xff
          const blue = value & 0xff
          return green - Math.max(red, blue) >= 8
        }),
      ),
    ]

    expect(offBrandGreens).toEqual([])
  })

  it('clips the oversized 390px hero without enabling page scroll', () => {
    const source = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const narrowRules = source.slice(source.indexOf('@media (max-width: 420px)'))

    expect(source).toMatch(
      /\.wbx-home-layout\s*\{[^}]*overflow-x:\s*clip;/s,
    )
    expect(narrowRules).toMatch(
      /\.wbx-hero\s*\{[^}]*width:\s*var\(--wbx-mobile-hero-width\);[^}]*max-width:\s*none;/s,
    )
    expect(narrowRules).toMatch(
      /\.wbx-hero__copy h1\s*\{[^}]*font-size:\s*64px;[^}]*white-space:\s*nowrap;/s,
    )
    expect(narrowRules).toMatch(
      /\.wbx-hero \.wbx-button\s*\{[^}]*width:\s*472px;[^}]*min-height:\s*126px;/s,
    )
  })

  it('keeps the QR modal on the stable replacement path', () => {
    const source = readFileSync('docs/.vitepress/theme/CommunityQr.vue', 'utf8')
    expect(source).toContain('brand.qrPath')
    expect(source).toContain('aria-modal="true"')
    expect(source).toContain('按 Escape 关闭')
  })

  it('keeps the QR close control named when mobile hides its visible label', () => {
    const component = readFileSync('docs/.vitepress/theme/CommunityQr.vue', 'utf8')
    const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
    const closeButton = component.match(/<button class="wbx-community-qr__close"[^>]*>/)

    expect(css).toMatch(
      /@media \(max-width: 760px\)\s*\{[\s\S]*\.wbx-community-qr__close-label\s*\{\s*display:\s*none;/,
    )
    expect(closeButton?.[0]).toContain('aria-label="关闭"')
  })
})
