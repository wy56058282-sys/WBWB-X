import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))

import AboutPage from '../docs/.vitepress/theme/AboutPage.vue'
import { nav } from '../docs/.vitepress/navigation'

const apps: App[] = []
afterEach(() => { apps.splice(0).forEach((app) => app.unmount()); document.body.replaceChildren() })

function mountAboutPage() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(AboutPage)
  app.mount(host)
  apps.push(app)
}

describe('about page', () => {
  it('replaces the top-navigation resources item while leaving resources addressable', async () => {
    expect(nav.map((item) => item.text)).toEqual(['首页', '开始阅读', '案例集', '服务', '关于我们', '交流群'])
    expect(nav.find((item) => item.text === '关于我们')?.link).toBe('/about/')
    const resources = await import('../docs/resources/index.md?raw')
    expect(resources.default).toContain('title: 资料')
  })

  it('uses VitePress-compatible About metadata without a literal title placeholder', () => {
    const source = readFileSync('docs/about/index.md', 'utf8')
    expect(source).toContain('title: 关于我们')
    expect(source).toContain('description: 认识 WorkBuddy-X 的场景教练和前线部署工程师团队。')
    expect(source).toContain('breadcrumbTitle: 关于我们')
    expect(source).toContain('titleTemplate: false')
    expect(source).not.toContain('%s')
    expect(nav.find((item) => item.link === '/about/')?.text).toBe('关于我们')
  })

  it('contains the existing six team members and accessible join interaction', async () => {
    mountAboutPage()
    const people = Array.from(document.querySelectorAll<HTMLImageElement>('.wbx-about-member img'))
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-about-join__trigger')
    const popover = document.querySelector('.wbx-about-join__popover')

    expect(document.querySelector('#about-team-title')?.textContent).toBe('场景教练和前线部署工程师（FDE）')
    expect(document.querySelector('.wbx-about')?.tagName).toBe('DIV')
    expect(people).toHaveLength(6)
    expect(people.map((person) => person.alt)).toEqual(['嘉宾老师王翔旭', '嘉宾老师黄学铃', '嘉宾老师李泽慧', '嘉宾老师王劲松', '嘉宾老师刘鹏振', '嘉宾老师丁怡豪'])
    expect(trigger?.getAttribute('aria-expanded')).toBe('false')
    trigger?.click()
    await nextTick()
    expect(trigger?.getAttribute('aria-expanded')).toBe('true')
    expect(popover?.textContent).toContain('主理人微信：NICKY_YI')
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
