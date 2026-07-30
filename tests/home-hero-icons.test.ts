import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
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

describe('home hero icon navigation', () => {
  it('offers four labelled links to distinct site sections', () => {
    mountHomePage()

    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-hero__art .wbx-icon-card'),
    )

    expect(links.map((link) => [link.getAttribute('aria-label'), link.getAttribute('href')])).toEqual([
      ['查看章节总览', '/wb-x/'],
      ['查看阅读指南', '/reading-guide'],
      ['查看工作系统进阶篇', '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/'],
      ['查看社区案例集', '/cases/'],
    ])
  })
})
