import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App } from 'vue'
import { readFileSync } from 'node:fs'
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
  it('uses the sticker page as the whole hero stage cover', () => {
    mountHomePage()

    const stage = document.querySelector('.wbx-hero__stage')
    const cover = stage?.querySelector(':scope > .wbx-sticker-page__cover')

    expect(stage?.classList.contains('wbx-sticker-page')).toBe(true)
    expect(cover?.querySelector('.wbx-hero__copy')).not.toBeNull()
    expect(cover?.querySelector('.wbx-hero__art')).not.toBeNull()
    expect(
      document.querySelector('.wbx-hero__art > .wbx-sticker-page'),
    ).toBeNull()
  })

  it('uses black icon cards with green pixel icons', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

    expect(css).not.toMatch(
      /\.wbx-hero__art\s*\{[^}]*background:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-icon-card\s*\{[^}]*color:\s*var\(--wbx-accent\);[^}]*background:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero__copy\s*>\s*\.wbx-pixel-label\s*\{[^}]*color:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-hero__monogram\s*\{[^}]*top:\s*62px;[^}]*right:\s*48px;/s,
    )
  })

  it('uses the approved homepage value labels', () => {
    mountHomePage()

    expect(
      document.querySelector('.wbx-hero__copy > .wbx-pixel-label')?.textContent,
    ).toBe('REAL TASKS · 27 CHAPTERS · OPEN SOURCE')

    const labels = Array.from(
      document.querySelectorAll<HTMLElement>('.wbx-value-strip__item'),
      (item) => [
        item.querySelector('b')?.textContent,
        item.querySelector('small')?.textContent,
      ],
    )

    expect(labels).toEqual([
      ['场景实战', 'REAL-WORLD TASKS'],
      ['技能叠加', 'SKILL STACKING'],
      ['社区共创', 'COMMUNITY-BUILT'],
      ['系统沉淀', 'SYSTEM BUILDING'],
    ])
  })

  it('uses a book icon for the first reading path', () => {
    mountHomePage()

    const readingCards = document.querySelectorAll('.wbx-reading-card')

    expect(readingCards[0]?.querySelector('.hn-book')).not.toBeNull()
    expect(readingCards[0]?.querySelector('.hn-user')).toBeNull()
  })

  it('offers five labelled links to distinct site sections', () => {
    mountHomePage()

    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-hero__art .wbx-icon-card'),
    )

    expect(links).toHaveLength(5)

    expect(
      links.map((link) => [
        link.getAttribute('aria-label'),
        decodeURI(link.getAttribute('href') ?? ''),
      ]),
    ).toEqual([
      ['查看 Part 1 使用手册', '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/'],
      ['查看阅读指南', '/reading-guide'],
      ['查看工作系统进阶篇', '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/'],
      ['查看 Part 2 案例篇', '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/'],
      ['查看 Part 4 岗位与行业篇', '/wb-x/第四篇 岗位与行业落地/'],
    ])
  })

  it('positions the Part 4 people icon safely at every hero breakpoint', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

    expect(css).toMatch(
      /\.wbx-icon-card--people\s*\{[^}]*top:\s*350px;[^}]*left:\s*16%;/s,
    )
    expect(css).toMatch(
      /@media\s*\(max-width:\s*960px\)\s*\{[\s\S]*?\.wbx-icon-card--people\s*\{[^}]*top:\s*270px;[^}]*left:\s*5%;/,
    )
    expect(css).toMatch(
      /@media\s*\(max-width:\s*780px\)\s*\{[\s\S]*?\.wbx-icon-card--people\s*\{[^}]*left:\s*3%;/,
    )
    expect(css).toMatch(
      /@media\s*\(max-width:\s*420px\)\s*\{[\s\S]*?\.wbx-icon-card--people\s*\{[^}]*top:\s*auto;[^}]*bottom:\s*50px;[^}]*left:\s*4%;/,
    )
  })

  it('renders the approved partner stickers as safe external links', () => {
    mountHomePage()

    const links = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-partner-sticker'),
      (link) => ({
        label: link.getAttribute('aria-label'),
        href: link.href,
        target: link.target,
        rel: link.rel,
        image: link.querySelector('img')?.getAttribute('src'),
      }),
    )

    expect(links).toEqual([
      {
        label: '访问星火集',
        href: 'https://www.sparkx.zone/',
        target: '_blank',
        rel: 'noopener noreferrer',
        image: '/brand/partners/sparkx.svg',
      },
      {
        label: '访问 WorkBuddy',
        href: 'https://www.workbuddy.ai/',
        target: '_blank',
        rel: 'noopener noreferrer',
        image: '/brand/partners/workbuddy.svg',
      },
      {
        label: '访问 Z.ai',
        href: 'https://z.ai/subscribe',
        target: '_blank',
        rel: 'noopener noreferrer',
        image: '/brand/partners/z-ai.svg',
      },
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
