import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'
import { useHomePageHarness } from './helpers/home-page-harness'
import { readHomeStyle } from './helpers/read-theme-style'

const harness = useHomePageHarness()

describe('home hero icon navigation', () => {
  it('uses the approved homepage value labels', () => {
    harness.mountHomePage()

    expect(
      document.querySelector('.wbx-hero__copy > .wbx-pixel-label')?.textContent,
    ).toBe('27 CHAPTERS / 4 PARTS / ∞ WORKFLOWS')
    expect(document.querySelector('.wbx-hero__metrics')).toBeNull()

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

  it('keeps the value strip green with black icons and text in both themes', () => {
    const css = readHomeStyle()

    expect(css).toMatch(
      /\.wbx-value-strip\s*\{[^}]*color:\s*#0d100d;[^}]*background:\s*var\(--wbx-accent\);/s,
    )
    expect(css).toMatch(
      /\.wbx-value-strip__item\s*>\s*\.hn\s*\{[^}]*color:\s*#0d100d;/s,
    )
    expect(css).toMatch(
      /\.wbx-value-strip__item small\s*\{[^}]*color:\s*#0d100d;/s,
    )
  })

  it('uses a book icon for the first reading path', () => {
    harness.mountHomePage()

    const readingCards = document.querySelectorAll('.wbx-reading-card')

    expect(readingCards[0]?.querySelector('.hn-book')).not.toBeNull()
    expect(readingCards[0]?.querySelector('.hn-user')).toBeNull()
  })

  it('uses the WorkBuddy Team lift and shadow on reading-path cards', () => {
    const css = readHomeStyle()
    const card = baseRule(css, '.wbx-reading-card')
    const interaction = css.match(
      /\.wbx-reading-card:hover,\s*\.wbx-reading-card:focus-visible\s*\{([^}]*)\}/s,
    )?.[1]

    expect(card).toMatch(
      /transition:\s*border-color 0\.3s ease, box-shadow 0\.3s ease, transform 0\.3s ease;/,
    )
    expect(interaction).toBeDefined()
    expect(interaction).toMatch(/border-color:\s*var\(--wbx-line\);/)
    expect(interaction).toMatch(
      /box-shadow:\s*0 12px 32px rgba\(0, 0, 0, 0\.08\);/,
    )
    expect(interaction).toMatch(/transform:\s*translateY\(-4px\);/)
    expect(interaction).not.toMatch(/translate\(/)
  })

  it('aligns mobile reading icons with titles and arrows with tags', () => {
    const css = readHomeStyle()
    const mobileStart = css.indexOf('@media (max-width: 760px)')
    const narrowStart = css.indexOf('@media (max-width: 420px)')
    const mobile = css.slice(mobileStart, css.indexOf('@media (max-width: 444px)'))
    const narrow = css.slice(narrowStart)

    expect(mobile).toMatch(
      /\.wbx-reading-card\s*\{[^}]*grid-template-columns:\s*70px minmax\(0, 1fr\) auto;[^}]*align-items:\s*start;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-reading-card__icon\s*\{[^}]*align-self:\s*start;[^}]*margin-top:\s*32px;/s,
    )
    expect(mobile).toMatch(
      /\.wbx-reading-card__arrow\s*\{[^}]*display:\s*block;[^}]*align-self:\s*end;[^}]*justify-self:\s*end;/s,
    )
    expect(narrow).toMatch(
      /\.wbx-reading-card\s*\{[^}]*grid-template-columns:\s*56px minmax\(0, 1fr\) auto;/s,
    )
    expect(narrow).toMatch(
      /\.wbx-reading-card__arrow\s*\{[^}]*display:\s*block;[^}]*align-self:\s*end;[^}]*justify-self:\s*end;/s,
    )
  })

  it('aligns the system panel with the reading cards and rounds it by 20px', () => {
    const css = readHomeStyle()
    const system = baseRule(css, '.wbx-system')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(system).toMatch(/margin:\s*72px 52px 0;/)
    expect(system).toMatch(/border-radius:\s*20px;/)
    expect(mobile).toMatch(
      /\.wbx-system\s*\{[^}]*margin:\s*52px 4px 0;/s,
    )
  })

  it('uses the approved light-gray system panel palette', () => {
    const css = readHomeStyle()
    const system = baseRule(css, '.wbx-system')
    const introLabel = baseRule(css, '.wbx-system__intro .wbx-pixel-label')
    const introCopy = baseRule(css, '.wbx-system__intro > p:last-child')
    const steps = baseRule(css, '.wbx-system__steps')
    const step = baseRule(css, '.wbx-system__steps li')
    const number = baseRule(css, '.wbx-system__steps b')
    const title = baseRule(css, '.wbx-system__steps strong')
    const copy = baseRule(css, '.wbx-system__steps span')

    expect(system).toMatch(/color:\s*#0d100d;/)
    expect(system).toMatch(/--wbx-ink:\s*#0d100d;/)
    expect(system).toMatch(/background:\s*#f3f4f2;/)
    expect(introLabel).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(introCopy).toMatch(/color:\s*#0d100d;/)
    expect(steps).toMatch(/background:\s*#d9e0dc;/)
    expect(step).toMatch(/background:\s*#ffffff;/)
    expect(number).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(title).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(copy).toMatch(/color:\s*#0d100d;/)
  })

  it('uses the approved system heading and community download copy', () => {
    harness.mountHomePage()

    expect(document.querySelector('#wbx-system-title')?.textContent).toBe(
      'AI 时代，一起象限跃迁',
    )
    expect(document.body.textContent).not.toContain('一次成功，不该只发生一次。')
    expect(document.querySelector('#wbx-community-title')?.textContent).toBe(
      '获取 WorkBuddy 小白书与配套资料',
    )
    expect(document.querySelector('.wbx-community__description')?.textContent).toBe(
      '下载完整读本、案例资料与后续更新内容。',
    )
    expect(document.querySelector('.wbx-community__code')).toBeNull()
    expect(document.body.textContent).not.toContain('提取码：WPc9')
  })

  it('removes the task heading divider while keeping the task-grid border', () => {
    const css = readHomeStyle()
    const heading = baseRule(css, '.wbx-section__heading--compact')
    const taskGrid = baseRule(css, '.wbx-task-grid')

    expect(heading).toMatch(/padding-top:\s*18px;/)
    expect(heading).not.toMatch(/border-top:/)
    expect(taskGrid).toMatch(/border-top:\s*1px solid var\(--wbx-line\);/)
  })
})
