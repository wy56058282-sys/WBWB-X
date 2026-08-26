import { readFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))

import AboutPage from '../docs/.vitepress/theme/AboutPage.vue'
import { nav } from '../docs/.vitepress/navigation'

const apps: App[] = []
afterEach(() => { apps.splice(0).forEach((app) => app.unmount()); document.body.replaceChildren() })

function mountAboutPage(props: Record<string, unknown> = {}) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(AboutPage, props)
  app.mount(host)
  apps.push(app)
}

function readPngAlpha(path: string, targetX: number, targetY: number) {
  const png = readFileSync(path)
  const idatChunks: Buffer[] = []
  const width = png.readUInt32BE(16)
  let offset = 8

  while (offset < png.length) {
    const length = png.readUInt32BE(offset)
    const type = png.toString('ascii', offset + 4, offset + 8)
    if (type === 'IDAT') idatChunks.push(png.subarray(offset + 8, offset + 8 + length))
    offset += length + 12
  }

  const compressed = inflateSync(Buffer.concat(idatChunks))
  const bytesPerPixel = 4
  const scanlineLength = width * bytesPerPixel
  let previous = Buffer.alloc(scanlineLength)
  let decoded = Buffer.alloc(scanlineLength)

  for (let y = 0; y <= targetY; y += 1) {
    const scanlineOffset = y * (scanlineLength + 1)
    const filter = compressed[scanlineOffset]
    decoded = Buffer.alloc(scanlineLength)

    for (let index = 0; index < scanlineLength; index += 1) {
      const raw = compressed[scanlineOffset + index + 1]
      const left = index >= bytesPerPixel ? decoded[index - bytesPerPixel] : 0
      const up = previous[index]
      const upperLeft = index >= bytesPerPixel ? previous[index - bytesPerPixel] : 0
      let predictor = 0
      if (filter === 1) predictor = left
      if (filter === 2) predictor = up
      if (filter === 3) predictor = Math.floor((left + up) / 2)
      if (filter === 4) {
        const estimate = left + up - upperLeft
        const leftDistance = Math.abs(estimate - left)
        const upDistance = Math.abs(estimate - up)
        const upperLeftDistance = Math.abs(estimate - upperLeft)
        predictor = leftDistance <= upDistance && leftDistance <= upperLeftDistance
          ? left
          : upDistance <= upperLeftDistance ? up : upperLeft
      }
      decoded[index] = (raw + predictor) & 0xff
    }
    previous = decoded
  }

  return decoded[targetX * bytesPerPixel + 3]
}

describe('about page', () => {
  it('keeps resources addressable while moving the team into enterprise services', async () => {
    expect(nav.map((item) => item.text)).toEqual(['首页', '开始阅读', 'OPC 专区', '案例集', '工具集', '企业服务', '交流群'])
    expect(nav.find((item) => item.text === '企业服务')?.link).toBe('/services/')
    const resources = await import('../docs/resources/index.md?raw')
    expect(resources.default).toContain('title: 资料')
  })

  it('keeps the retired About page out of search and points to enterprise services', () => {
    const source = readFileSync('docs/about/index.md', 'utf8')
    expect(source).toContain('search: false')
    expect(source).toContain('robots')
    expect(source).toContain('<LegacyPageRedirect target="/services/#team" />')
    expect(nav.some((item) => item.link === '/about/')).toBe(false)
  })

  it('renders seven AI service architects in the approved order with coded profile text', async () => {
    mountAboutPage()
    const cards = Array.from(document.querySelectorAll<HTMLElement>('.wbx-about-member'))
    const people = cards.map((card) => card.querySelector<HTMLImageElement>('img')!)
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-about-join__trigger')
    const popover = document.querySelector('.wbx-about-join__popover')

    expect(document.querySelector('#about-team-title')?.textContent).toBe('AI 服务架构师（ASC）')
    expect(document.querySelector('.wbx-about')?.tagName).toBe('DIV')
    expect(cards).toHaveLength(7)
    expect(cards.map((card) => card.querySelector('h3')?.textContent)).toEqual([
      '王翎旭', '黄学铃', '李泽慧', '王劲松', '刘鹏振', '魏心语', '丁怡豪',
    ])
    expect(cards[0]?.querySelector('strong')?.textContent).toBe('Quadr-X 产品总监')
    expect(cards[0]?.querySelector('span')?.textContent).toBe('三分设 主理人')
    expect(cards[0]?.querySelector('p')?.textContent).toBe('原平安、汇丰产品负责人\n原阿里、腾讯设计专家')
    expect(cards[4]?.querySelector('strong')?.textContent).toBe('dwin 青年 OPC 主理人')
    expect(cards[4]?.querySelector('span')?.textContent).toBe('AI 内容创作者、\n青年创业者')
    expect(cards[5]?.textContent).toContain('WorkBuddy 讲师')
    expect(cards[5]?.textContent).toContain('合肥大学 硕士')
    expect(people.every((person) => person.alt.endsWith('AI 服务架构师照片'))).toBe(true)
    expect(cards.every((card) => {
      const copy = card.querySelector('.wbx-about-member__copy')
      const picture = card.querySelector('picture')
      return Boolean(copy && picture && (copy.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_FOLLOWING))
    })).toBe(true)
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    expect(trigger?.textContent).toBe('申请入驻')
    trigger?.click()
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
    expect(popover?.textContent).toContain('主理人微信：NICKY_YI')
  })

  it('uses a four-column ASC grid with aligned copy and interactive contained portraits', () => {
    const css = readFileSync('docs/.vitepress/theme/about.css', 'utf8')

    expect(css).toMatch(/\.wbx-about-members\s*{[^}]*grid-template-columns:\s*repeat\(4,/s)
    expect(css).toMatch(/\.wbx-about-member__copy\s*{[^}]*align-self:\s*stretch;[^}]*justify-content:\s*flex-start;[^}]*padding:\s*62px 4px 22px 20px;/s)
    expect(css).toMatch(/\.wbx-about-member__copy span,[\s\S]*?\.wbx-about-member__copy p\s*{[^}]*white-space:\s*pre-line;/s)
    expect(css).toMatch(/\.wbx-about-member picture\s*{[^}]*align-items:\s*end;[^}]*justify-content:\s*flex-end;/s)
    expect(css).toMatch(/\.wbx-about-member img\s*{[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*contain;[^}]*transform:\s*translateX\(20px\) scale\(1\.4\);[^}]*transform-origin:\s*right bottom;[^}]*transition:\s*transform var\(--wbx-motion-base\) var\(--wbx-ease-standard\);/s)
    expect(css).toMatch(/@media \(hover: hover\) and \(pointer: fine\)[\s\S]*?\.wbx-about-member:(?:hover|focus-within)\s*{[^}]*transform:\s*translateY\(-3px\);[^}]*}[\s\S]*?\.wbx-about-member:(?:hover|focus-within) img\s*{[^}]*transform:\s*translateX\(0\) scale\(1\.5\);/s)
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.wbx-about-member:(?:hover|focus-within) img,[\s\S]*?\.wbx-about-member:(?:hover|focus-within) img\s*{[^}]*transition:\s*none;[^}]*transform:\s*translateX\(20px\) scale\(1\.4\);/s)
    expect(css).toMatch(/@media \(max-width: 900px\)[\s\S]*?\.wbx-about-members\s*{[^}]*repeat\(2,/s)
    expect(css).toMatch(/@media \(max-width: 640px\)[\s\S]*?\.wbx-about-members\s*{[^}]*grid-template-columns:\s*1fr;/s)
  })

  it('keeps Wang Lingxu portrait background transparent for dark mode', () => {
    expect(readPngAlpha('docs/public/article-assets/service/asc/asc-05.png', 50, 50)).toBe(0)
  })

  it('renders FDE members as white cards with text before the complete photo', () => {
    mountAboutPage({
      fdeMembers: [{
        name: '测试工程师',
        primaryTitle: '主抬头',
        secondaryTitle: '副抬头',
        description: '可选个人介绍',
        image: '/fde.png',
        optimizedImage: '/fde.webp',
      }],
    })

    const card = document.querySelector('.wbx-fde-member')
    const copy = card?.querySelector('.wbx-fde-member__copy')
    const picture = card?.querySelector('picture')

    expect(copy?.textContent).toContain('测试工程师')
    expect(copy?.textContent).toContain('主抬头')
    expect(copy?.textContent).toContain('副抬头')
    expect(copy?.textContent).toContain('可选个人介绍')
    expect(copy?.compareDocumentPosition(picture!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(card?.querySelector<HTMLSourceElement>('source')?.getAttribute('srcset')).toBe('/WBWB-X/fde.webp')
    expect(card?.querySelector<HTMLImageElement>('img')?.alt).toBe('测试工程师白底照片')
    expect(readFileSync('docs/.vitepress/theme/about.css', 'utf8')).toMatch(/\.wbx-fde-member img\s*{[^}]*object-fit:\s*contain;/s)
  })

  it('closes the join contact on Escape and outside pointer input', async () => {
    mountAboutPage()
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-about-join__trigger')

    trigger?.click()
    await nextTick()
    trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')

    trigger?.click()
    await nextTick()
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
  })
})
