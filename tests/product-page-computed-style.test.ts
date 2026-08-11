import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const vpDocStyles = readFileSync(
  'node_modules/vitepress/dist/client/theme-default/styles/components/vp-doc.css',
  'utf8',
)
const vpDocLinkRule = vpDocStyles.match(/\.vp-doc a\s*\{[^}]*\}/)?.[0]

if (!vpDocLinkRule) {
  throw new Error('Unable to read the installed VitePress .vp-doc a rule')
}

const pageStyles = {
  cases: readFileSync('docs/.vitepress/theme/cases.css', 'utf8'),
  service: readFileSync('docs/.vitepress/theme/service.css', 'utf8'),
}

const themes = {
  light: {
    accent: '#32e6b9',
    ink: '#0d100d',
    surface: '#ffffff',
    vpBrand: '#176b55',
  },
  dark: {
    accent: '#32e6b9',
    ink: '#f3f5ed',
    surface: '#181b15',
    vpBrand: '#32e6b9',
  },
} as const

function resolveThemeTokens(css: string, theme: (typeof themes)[keyof typeof themes]) {
  return css
    .replaceAll('var(--wbx-accent)', theme.accent)
    .replaceAll('var(--wbx-ink)', theme.ink)
    .replaceAll('var(--wbx-surface)', theme.surface)
    .replaceAll('var(--vp-c-brand-1)', theme.vpBrand)
}

function installStyles(css: string, theme: (typeof themes)[keyof typeof themes]) {
  const style = document.createElement('style')
  style.textContent = resolveThemeTokens(`${vpDocLinkRule}\n${css}`, theme)
  document.head.append(style)
}

type Specificity = readonly [number, number, number]

function getSpecificity(selector: string): Specificity {
  const ids = selector.match(/#[\w-]+/g)?.length ?? 0
  const classesAndAttributes = selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g)?.length ?? 0
  const elements = selector
    .replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|::?[\w-]+/g, '')
    .split(/[\s>+~]+/)
    .filter(Boolean).length
  return [ids, classesAndAttributes, elements]
}

function compareSpecificity(left: Specificity, right: Specificity) {
  return left[0] - right[0] || left[1] - right[1] || left[2] - right[2]
}

function applyCascadedStyle(element: HTMLElement) {
  const winners = new Map<string, { order: number; specificity: Specificity; value: string }>()
  let order = 0

  for (const sheet of Array.from(document.styleSheets)) {
    for (const rule of Array.from(sheet.cssRules)) {
      if (!(rule instanceof CSSStyleRule)) continue

      for (const selector of rule.selectorText.split(',')) {
        const normalizedSelector = selector.trim()
        if (!element.matches(normalizedSelector)) continue

        const specificity = getSpecificity(normalizedSelector)
        for (const property of Array.from(rule.style)) {
          const current = winners.get(property)
          if (
            !current ||
            compareSpecificity(specificity, current.specificity) > 0 ||
            (compareSpecificity(specificity, current.specificity) === 0 && order >= current.order)
          ) {
            winners.set(property, {
              order,
              specificity,
              value: rule.style.getPropertyValue(property),
            })
          }
        }
      }
      order += 1
    }
  }

  for (const [property, winner] of winners) {
    element.style.setProperty(property, winner.value)
  }
}

afterEach(() => {
  document.head.querySelectorAll('style').forEach((style) => style.remove())
  document.body.replaceChildren()
  document.documentElement.className = ''
})

describe('product page computed styles', () => {
  it.each(Object.entries(themes))(
    'keeps %s idle primary actions legible over the VitePress link rule',
    (themeName, theme) => {
      document.documentElement.className = themeName === 'dark' ? 'dark' : ''

      const pages = [
        {
          css: pageStyles.cases,
          markup: '<div class="vp-doc"><div class="wbx-cases"><a class="wbx-cases-action wbx-cases-action--primary">案例操作</a></div></div>',
          selector: '.wbx-cases-action--primary',
        },
        {
          css: pageStyles.service,
          markup: '<div class="vp-doc"><div class="wbx-service"><a class="wbx-service-action wbx-service-action--primary">服务操作</a></div></div>',
          selector: '.wbx-service-action--primary',
        },
      ]

      for (const page of pages) {
        installStyles(page.css, theme)
        document.body.innerHTML = page.markup

        const action = document.querySelector<HTMLElement>(page.selector)
        applyCascadedStyle(action!)
        const computed = getComputedStyle(action!)

        expect(computed.color).toBe('rgb(13, 16, 13)')
        expect(computed.backgroundColor).toBe('rgb(50, 230, 185)')
        expect(computed.fontWeight).toBe('700')
        expect(computed.textDecoration).toBe('none')
        expect(computed.transition).toContain('background 160ms ease')

        document.head.querySelectorAll('style').forEach((style) => style.remove())
      }
    },
  )

  it('gives the light-theme case search a high-contrast focus ring', () => {
    installStyles(pageStyles.cases, themes.light)
    document.body.innerHTML = '<div class="wbx-cases"><label class="wbx-cases-search"><input type="search"></label></div>'

    const input = document.querySelector<HTMLInputElement>('input')!
    input.focus()
    const computed = getComputedStyle(input)

    expect(document.activeElement).toBe(input)
    expect(computed.outlineColor).toBe('rgb(13, 16, 13)')
    expect(computed.outlineStyle).toBe('solid')
    expect(computed.outlineWidth).toBe('2px')
    expect(computed.boxShadow).toMatch(/(?:rgb\(13, 16, 13\)|#0d100d)/)
  })
})
