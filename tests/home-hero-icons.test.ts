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
      ['查看 Part 1 使用手册', '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/'],
      ['查看阅读指南', '/reading-guide'],
      ['查看工作系统进阶篇', '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/'],
      ['查看 Part 2 案例篇', '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/'],
    ])
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
