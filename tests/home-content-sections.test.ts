import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { baseRule } from './helpers/css-rules'
import { useHomePageHarness } from './helpers/home-page-harness'
import { readHomeStyle } from './helpers/read-theme-style'

const harness = useHomePageHarness()
const workshopCss = readFileSync('docs/.vitepress/theme/workshop.css', 'utf8')

describe('home hero icon navigation', () => {
  it('keeps the homepage wide and avoids wrapping every section in a card', () => {
    const css = readHomeStyle()
    const home = baseRule(css, '.wbx-home')
    const readingCard = baseRule(css, '.wbx-reading-card')
    const taskGrid = baseRule(css, '.wbx-task-grid')
    const workshop = baseRule(workshopCss, '.wbx-workshop')

    expect(home).toMatch(/max-width:\s*1480px;/)
    expect(readingCard).not.toMatch(/box-shadow:/)
    expect(taskGrid).not.toMatch(/box-shadow:/)
    expect(workshop).toMatch(/padding:\s*var\(--wbx-section-space\) 0 64px;/)
    expect(workshop).not.toMatch(/border:/)
    expect(workshop).not.toMatch(/border-radius:/)
    expect(workshop).not.toMatch(/box-shadow:/)
  })

  it('uses the approved homepage value labels', () => {
    harness.mountHomePage()

    expect(document.querySelector('#wbx-hero-title')?.textContent).toBe(
      'WorkBuddy白皮书',
    )
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

  it('uses the calm shared lift and shadow on reading-path cards', () => {
    const css = readHomeStyle()
    const card = baseRule(css, '.wbx-reading-card')
    const interaction = css.match(
      /\.wbx-reading-card:hover,\s*\.wbx-reading-card:focus-visible\s*\{([^}]*)\}/s,
    )?.[1]

    expect(card).toMatch(
      /transition:\s*border-color var\(--wbx-motion-base\) ease, box-shadow var\(--wbx-motion-base\) ease, transform var\(--wbx-motion-base\) ease;/,
    )
    expect(interaction).toBeDefined()
    expect(interaction).toMatch(/border-color:\s*var\(--wbx-line\);/)
    expect(interaction).toMatch(
      /box-shadow:\s*var\(--wbx-shadow-soft\);/,
    )
    expect(interaction).toMatch(/transform:\s*translateY\(-2px\);/)
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

  it('aligns the system panel with the reading cards and uses the shared radius', () => {
    const css = readHomeStyle()
    const system = baseRule(css, '.wbx-system')
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(system).toMatch(/margin:\s*72px 52px 0;/)
    expect(system).toMatch(/border-radius:\s*var\(--wbx-radius-lg\);/)
    expect(mobile).toMatch(
      /\.wbx-system\s*\{[^}]*margin:\s*52px 4px 0;/s,
    )
  })

  it('uses the shared secondary surface and card palette', () => {
    const css = readHomeStyle()
    const system = baseRule(css, '.wbx-system')
    const introLabel = baseRule(css, '.wbx-system__intro .wbx-pixel-label')
    const introCopy = baseRule(css, '.wbx-system__description')
    const steps = baseRule(css, '.wbx-system__steps')
    const step = baseRule(css, '.wbx-system__steps li')
    const number = baseRule(css, '.wbx-system__steps b')
    const title = baseRule(css, '.wbx-system__steps strong')
    const copy = baseRule(css, '.wbx-system__steps span')

    expect(system).toMatch(/color:\s*#0d100d;/)
    expect(system).toMatch(/--wbx-ink:\s*#0d100d;/)
    expect(system).toMatch(/background:\s*var\(--wbx-section-soft\);/)
    expect(introLabel).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(introCopy).toMatch(/color:\s*#0d100d;/)
    expect(steps).toMatch(/background:\s*var\(--wbx-line\);/)
    expect(step).toMatch(/background:\s*var\(--wbx-surface\);/)
    expect(number).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(title).toMatch(
      /color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/,
    )
    expect(copy).toMatch(/color:\s*#0d100d;/)
  })

  it('uses the approved system heading without the retired materials callout', () => {
    harness.mountHomePage()

    expect(document.querySelector('#wbx-system-title')?.textContent).toBe(
      'AI 时代，一起象限跃迁',
    )
    expect(document.body.textContent).not.toContain('一次成功，不该只发生一次。')
    expect(document.body.textContent).not.toContain('BUILD IN PUBLIC · LEARN IN PUBLIC')
    expect(document.body.textContent).not.toContain('获取 WorkBuddy 小白书与配套资料')
    expect(document.body.textContent).not.toContain('下载完整读本、案例资料与后续更新内容。')
    expect(document.body.textContent).not.toContain('提取码：WPc9')
  })

  it('removes the task heading divider while keeping the task-grid border', () => {
    const css = readHomeStyle()
    const heading = baseRule(css, '.wbx-section__heading--compact')
    const taskGrid = baseRule(css, '.wbx-task-grid')

    expect(heading).toMatch(/padding-top:\s*18px;/)
    expect(heading).not.toMatch(/border-top:/)
    expect(taskGrid).toMatch(/border:\s*1px solid var\(--wbx-line\);/)
    expect(taskGrid).toMatch(/border-radius:\s*var\(--wbx-radius-lg\);/)
  })
})
