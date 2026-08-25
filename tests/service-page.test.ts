import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'

vi.mock('vitepress', () => ({ withBase: (path: string) => `/WBWB-X${path}` }))
vi.mock('../docs/.vitepress/case-catalog.data', () => ({ data: [] }))

import ServicePage from '../docs/.vitepress/theme/ServicePage.vue'
import { readFileSync } from 'node:fs'

const apps: App[] = []

beforeEach(() => {
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

function mountServicePage() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(ServicePage)
  app.mount(host)
  apps.push(app)
}

describe('WorkBuddy product service page', () => {
  it('is published through the tools route while help becomes a hidden redirect', () => {
    const tools = readFileSync('docs/tools/index.md', 'utf8')
    const help = readFileSync('docs/help/index.md', 'utf8')

    expect(tools).toContain('title: 工具集')
    expect(tools).toContain('<ToolsPage />')
    expect(help).toContain('search: false')
    expect(help).toContain('<LegacyPageRedirect target="/tools/" preserve-hash />')
  })
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
    expect(Array.from(document.querySelectorAll('.wbx-service-tag')).map((tag) => tag.textContent?.trim())).toEqual([
      'AI-NATIVE DESKTOP AGENT · 桌面智能体工作台',
      '01 · MINDSET',
      '02 · AGENT SWARM',
      '03 · CAPABILITIES',
      '04 · REMOTE CONTROL',
      '05 · SKILLS',
      '06 · GET STARTED',
    ])
  })

  it('uses the approved deliberate line breaks for remote control and document output headings', () => {
    mountServicePage()

    const remoteTitle = document.querySelector('#remote-title')!
    const documentTitle = document.querySelectorAll('.wbx-service-capability h3')[1]!

    expect(remoteTitle.querySelector('br')).toBeNull()
    expect(remoteTitle.textContent?.replace(/\s+/g, '')).toBe('人不在电脑前，活照样推进。')
    expect(documentTitle.querySelector('br')).not.toBeNull()
    expect(documentTitle.innerHTML).toContain('PPT，<br>一句话产出')
  })

  it('keeps every original dynamic visual structure', () => {
    mountServicePage()

    expect(document.querySelector('#top > canvas#heroCanvas')).toBeNull()
    expect(document.querySelector('#top .wbx-service-console__bar + .wbx-service-console__body')).not.toBeNull()
    expect(document.querySelector('#top .console-window')).toBeNull()
    expect(document.querySelector('#shift .wbx-service-compare > .wbx-service-compare__card.is-muted')).not.toBeNull()
    expect(document.querySelector('#shift .vs-grid')).toBeNull()
    expect(document.querySelector('#swarm .wbx-service-swarm__map[viewBox="0 0 900 560"]')).not.toBeNull()
    expect(document.querySelectorAll('#swarm .wbx-service-swarm__grid circle')).toHaveLength(3)
    expect(document.querySelectorAll('#swarm .wbx-service-swarm__path')).toHaveLength(7)
    expect(document.querySelectorAll('#swarm .wbx-service-swarm__agent')).toHaveLength(7)
    expect(document.querySelector('#swarm .net-box')).toBeNull()
    expect(document.querySelector('#capabilities .wbx-service-flow')).not.toBeNull()
    expect(document.querySelector('#capabilities .wbx-service-deliverables')).not.toBeNull()
    expect(document.querySelector('#capabilities .wbx-service-files')).not.toBeNull()
    expect(document.querySelector('#capabilities .wbx-service-model__tabs + .wbx-service-model__detail')).not.toBeNull()
    expect(document.querySelector('#capabilities .flowbox')).toBeNull()
    expect(document.querySelector('#remote > .wbx-service-remote > .wbx-service-phone')).not.toBeNull()
    expect(document.querySelector('#remote .wbx-service-remote__channels + .wbx-service-laptop')).not.toBeNull()
    expect(document.querySelector('#remote .remote-stage')).toBeNull()
    expect(document.querySelectorAll('#skills .wbx-service-skills__marquee > div')).toHaveLength(2)
    expect(document.querySelector('#skills .mq')).toBeNull()
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
    const consoleBody = document.querySelector<HTMLElement>('.wbx-service-console__body')!
    const progress = document.querySelector<HTMLElement>('.wbx-service-console__progress')!
    Object.defineProperty(consoleBody, 'scrollHeight', { configurable: true, value: 640 })

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
    expect(consoleBody.scrollTop).toBe(640)
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
    expect(document.querySelector('.wbx-service-remote__state')?.textContent).toContain('已交付 · 3 个文件')
  })

  it('automatically animates agent dispatch and the remote delivery loop', async () => {
    vi.useFakeTimers()
    mountServicePage()

    const swarm = document.querySelector<HTMLElement>('.wbx-service-swarm')!
    const remote = document.querySelector<HTMLElement>('.wbx-service-remote')!
    expect(swarm.dataset.motionState).toBe('idle')
    expect(remote.dataset.stage).toBe('idle')

    await vi.advanceTimersByTimeAsync(1600)
    await nextTick()
    expect(swarm.dataset.motionState).toBe('dispatching')
    expect(document.querySelectorAll('.wbx-service-swarm__agent.is-active').length).toBeGreaterThan(0)
    expect(remote.dataset.stage).toBe('running')

    await vi.advanceTimersByTimeAsync(1800)
    await nextTick()
    expect(remote.dataset.stage).toBe('complete')
    expect(document.querySelector('.wbx-service-remote__state')?.textContent).toContain('已交付 · 3 个文件')
  })

  it('moves dispatched agents through task, completion, and ready states', async () => {
    vi.useFakeTimers()
    mountServicePage()

    await vi.advanceTimersByTimeAsync(1600)
    await nextTick()
    expect(document.querySelectorAll('.wbx-service-swarm__agent.is-active').length).toBeGreaterThan(0)
    expect(document.querySelector('.wbx-service-swarm__agent.is-active .wbx-service-swarm__status')?.textContent).toContain('撰写报告')

    await vi.advanceTimersByTimeAsync(3200)
    await nextTick()
    expect(document.querySelectorAll('.wbx-service-swarm__agent.is-done').length).toBeGreaterThan(0)
    expect(document.querySelector('.wbx-service-swarm__agent.is-done .wbx-service-swarm__status')?.textContent).toContain('完成')

    await vi.advanceTimersByTimeAsync(800)
    await nextTick()
    expect(document.querySelectorAll('.wbx-service-swarm__agent:is(.is-active, .is-done)')).toHaveLength(0)
  })

  it('plays the original mindset comparison sequence when the section becomes active', async () => {
    vi.useFakeTimers()
    mountServicePage()
    await nextTick()

    const compare = document.querySelector<HTMLElement>('.wbx-service-compare')!
    expect(compare.dataset.motionState).toBe('running')
    expect(document.querySelectorAll('.wbx-service-compare__message')).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(700)
    await nextTick()
    expect(document.querySelectorAll('.wbx-service-compare__message.is-user')).toHaveLength(2)

    await vi.advanceTimersByTimeAsync(3800)
    await nextTick()
    expect(document.querySelector('.wbx-service-compare__message.is-system')?.textContent).toContain('指挥官已接管')

    await vi.advanceTimersByTimeAsync(2800)
    await nextTick()
    expect(compare.dataset.motionState).toBe('complete')
    expect(document.querySelectorAll('.wbx-service-compare__process span')).toHaveLength(3)
    expect(document.querySelectorAll('.wbx-service-compare__deliverable')).toHaveLength(2)
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
