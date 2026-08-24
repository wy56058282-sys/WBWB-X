import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))
vi.mock('../docs/.vitepress/case-catalog.data', () => ({ data: [] }))

import ServicePage from '../docs/.vitepress/theme/ServicePage.vue'

const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  vi.useRealTimers()
})

function mountServicePage() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(ServicePage)
  app.mount(host)
  apps.push(app)
}

describe('WorkBuddy product service page', () => {
  it('renders the complete reference content flow inside the site shell', () => {
    mountServicePage()

    expect(Array.from(document.querySelectorAll<HTMLElement>('.wbx-service > :is(header, section)')).map((section) => section.id)).toEqual([
      'top',
      'shift',
      'swarm',
      'capabilities',
      'remote',
      'skills',
      'download',
    ])
    expect(document.querySelector('#top h1')?.textContent).toContain('一句话，让 AI 替你上班。')
    expect(document.querySelector('#shift h2')?.textContent).toContain('直接说「去办」')
    expect(document.querySelectorAll('.wbx-service-capability')).toHaveLength(4)
  })

  it('uses the approved download, case, and guide destinations', () => {
    mountServicePage()

    const officialLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href="https://www.workbuddy.cn/"]'))
    expect(officialLinks).toHaveLength(2)
    expect(officialLinks.every((link) => link.target === '_blank' && link.rel === 'noopener noreferrer')).toBe(true)
    expect(document.querySelector<HTMLAnchorElement>('.wbx-service-hero__cases')?.getAttribute('href')).toBe('/WBWB-X/cases/')
    expect(document.querySelector<HTMLAnchorElement>('.wbx-service-install-guide')?.getAttribute('href')).toBe(
      '/WBWB-X/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/',
    )
  })

  it('automatically runs the hero console through typing, execution, and delivery', async () => {
    vi.useFakeTimers()
    mountServicePage()

    const console = document.querySelector<HTMLElement>('.wbx-service-console')!
    const progress = document.querySelector<HTMLElement>('.wbx-service-console__progress')!

    expect(console.dataset.stage).toBe('idle')
    expect(progress.getAttribute('aria-valuenow')).toBe('0')

    await vi.advanceTimersByTimeAsync(600)
    await nextTick()
    expect(console.dataset.stage).toBe('typing')
    expect(document.querySelector<HTMLInputElement>('#service-command')?.value.length).toBeGreaterThan(0)

    await vi.advanceTimersByTimeAsync(1800)
    await nextTick()
    expect(console.dataset.stage).toBe('running')
    expect(Number(progress.getAttribute('aria-valuenow'))).toBeGreaterThan(0)
    expect(Number(progress.getAttribute('aria-valuenow'))).toBeLessThan(100)

    await vi.advanceTimersByTimeAsync(3000)
    await nextTick()
    expect(console.dataset.stage).toBe('complete')
    expect(progress.getAttribute('aria-valuenow')).toBe('100')
    expect(document.querySelector('.wbx-service-console__deliverable')?.textContent).toContain('已交付')
  })

  it('lets a user command take over the automatic hero simulation', async () => {
    vi.useFakeTimers()
    mountServicePage()

    const input = document.querySelector<HTMLInputElement>('#service-command')!
    input.value = '整理合同重点条款'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    document.querySelector<HTMLFormElement>('.wbx-service-console__form')!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await nextTick()

    expect(document.querySelector<HTMLElement>('.wbx-service-console')?.dataset.stage).toBe('planning')
    expect(document.querySelector('.wbx-service-console__progress')?.textContent).toContain('0%')
    expect(document.querySelector('.wbx-service-console__request')?.textContent).toContain('整理合同重点条款')

    await vi.advanceTimersByTimeAsync(3200)
    await nextTick()
    expect(document.querySelector<HTMLElement>('.wbx-service-console')?.dataset.stage).toBe('complete')
    expect(document.querySelector('.wbx-service-console__deliverable')?.textContent).toContain('已交付')
  })

  it('switches model details and completes the remote-control demo', async () => {
    mountServicePage()

    const kimi = Array.from(document.querySelectorAll<HTMLButtonElement>('.wbx-service-model__tab')).find((button) => button.textContent?.trim() === 'Kimi')!
    kimi.click()
    await nextTick()
    expect(kimi.getAttribute('aria-selected')).toBe('true')
    expect(document.querySelector('.wbx-service-model__detail')?.textContent).toContain('长文本')

    document.querySelector<HTMLButtonElement>('.wbx-service-remote__run')!.click()
    await nextTick()
    expect(document.querySelector('.wbx-service-remote__state')?.textContent).toContain('已交付')
  })

  it('automatically animates agent dispatch and the remote delivery loop', async () => {
    vi.useFakeTimers()
    mountServicePage()

    const swarm = document.querySelector<HTMLElement>('.wbx-service-swarm')!
    const remote = document.querySelector<HTMLElement>('.wbx-service-remote')!
    expect(swarm.dataset.motionState).toBe('idle')
    expect(remote.dataset.stage).toBe('idle')

    await vi.advanceTimersByTimeAsync(1100)
    await nextTick()
    expect(swarm.dataset.motionState).toBe('dispatching')
    expect(document.querySelectorAll('.wbx-service-swarm__node.is-active').length).toBeGreaterThan(0)
    expect(remote.dataset.stage).toBe('running')

    await vi.advanceTimersByTimeAsync(1800)
    await nextTick()
    expect(remote.dataset.stage).toBe('complete')
    expect(document.querySelector('.wbx-service-remote__state')?.textContent).toContain('已交付')
  })

  it('keeps activities, diagnosis conversion, and team content out of service', () => {
    mountServicePage()

    expect(document.querySelector('#workshop-registration')).toBeNull()
    expect(document.querySelector('#workshop-history')).toBeNull()
    expect(document.querySelector('.wbx-service-path')).toBeNull()
    expect(document.body.textContent).not.toContain('场景教练和前线部署工程师（FDE）')
    expect(document.body.textContent).not.toContain('免费诊断 3 次')
  })
})
