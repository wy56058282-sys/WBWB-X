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
const sharedStyles = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

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

function mediaMatches(media: string, viewportWidth: number) {
  const constraints = Array.from(media.matchAll(/\((min|max)-width:\s*(\d+)px\)/g))
  if (!constraints.length) return false

  return constraints.every(([, boundary, width]) => (
    boundary === 'min'
      ? viewportWidth >= Number(width)
      : viewportWidth <= Number(width)
  ))
}

function flattenStylesAtViewport(source: string, viewportWidth: number) {
  const sourceElement = document.createElement('style')
  sourceElement.textContent = source
  document.head.append(sourceElement)

  const rules: string[] = []

  function visit(ruleList: CSSRuleList) {
    Array.from(ruleList).forEach((rule) => {
      if (rule.type === CSSRule.STYLE_RULE) {
        rules.push(rule.cssText)
        return
      }

      if (
        rule.type === CSSRule.MEDIA_RULE
        && mediaMatches((rule as CSSMediaRule).media.mediaText, viewportWidth)
      ) {
        visit((rule as CSSMediaRule).cssRules)
      }
    })
  }

  visit(sourceElement.sheet!.cssRules)
  sourceElement.remove()
  return rules.join('\n')
}

function installStyles(
  css: string,
  theme: (typeof themes)[keyof typeof themes],
  viewportWidth = 1440,
) {
  const style = document.createElement('style')
  style.textContent = resolveThemeTokens(
    flattenStylesAtViewport(`${vpDocLinkRule}\n${sharedStyles}\n${css}`, viewportWidth),
    theme,
  )
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
  it.each([
    { label: 'desktop', viewportWidth: 1440, fontSize: '51.2px', lineHeight: '58.88px' },
    { label: 'tablet', viewportWidth: 900, fontSize: '44px', lineHeight: '52.8px' },
    { label: 'mobile', viewportWidth: 390, fontSize: '36px', lineHeight: '43.2px' },
  ])(
    'matches guide page typography at $label width without enlarging compact surfaces',
    ({ viewportWidth, fontSize, lineHeight }) => {
      const pages = [
        {
          css: pageStyles.cases,
          markup: `
            <div class="VPDoc"><div class="vp-doc"><section class="wbx-cases">
              <header class="wbx-cases-header"><div>
                <h1>案例集</h1><p class="primary-copy">案例正文</p>
              </div></header>
              <h2>浏览案例</h2>
              <article class="wbx-case-card">
                <span class="wbx-case-card__meta">元数据</span>
                <strong class="wbx-case-card__title">卡片标题</strong>
                <span class="wbx-case-card__outcome">辅助结果</span>
                <span class="wbx-case-card__product">产品标签</span>
              </article>
            </section></div></div>
          `,
          h1: '.wbx-cases h1',
          h2: '.wbx-cases h2',
          body: '.wbx-cases-header > div > p:last-child',
          compact: {
            '.wbx-case-card__meta': '12px',
            '.wbx-case-card__title': '18px',
            '.wbx-case-card__outcome': '14px',
            '.wbx-case-card__product': '11px',
          },
        },
        {
          css: pageStyles.service,
          markup: `
            <div class="VPDoc"><div class="vp-doc"><section class="wbx-service">
              <div class="wbx-service-offer__copy">
                <h1>定制服务</h1><p>服务正文</p>
              </div>
              <h2>服务范围</h2>
              <a class="wbx-service-case">
                <span><small>案例标签</small><strong>卡片标题</strong><span>辅助结果</span></span>
              </a>
              <div class="wbx-service-output-list"><dd>辅助说明</dd></div>
            </section></div></div>
          `,
          h1: '.wbx-service h1',
          h2: '.wbx-service h2',
          body: '.wbx-service-offer__copy > p',
          compact: {
            '.wbx-service-case small': '10px',
            '.wbx-service-case strong': '15px',
            '.wbx-service-case span span': '13px',
            '.wbx-service-output-list dd': '14px',
          },
        },
      ]

      for (const page of pages) {
        installStyles(page.css, themes.light, viewportWidth)
        document.body.innerHTML = page.markup

        const selectors = [page.h1, page.h2, page.body, ...Object.keys(page.compact)]
        selectors.forEach((selector) => applyCascadedStyle(document.querySelector<HTMLElement>(selector)!))

        const h1Style = getComputedStyle(document.querySelector(page.h1)!)
        const h2Style = getComputedStyle(document.querySelector(page.h2)!)
        const bodyStyle = getComputedStyle(document.querySelector(page.body)!)

        expect({
          fontSize: h1Style.fontSize,
          lineHeight: h1Style.lineHeight,
          fontWeight: h1Style.fontWeight,
        }).toMatchObject({
          fontSize,
          lineHeight,
          fontWeight: '850',
        })
        expect({
          fontSize: h2Style.fontSize,
          fontWeight: h2Style.fontWeight,
        }).toMatchObject({
          fontSize: '28px',
          fontWeight: '600',
        })
        expect({
          fontSize: bodyStyle.fontSize,
          lineHeight: bodyStyle.lineHeight,
        }).toMatchObject({
          fontSize: '16px',
          lineHeight: '1.75',
        })

        for (const [selector, expectedSize] of Object.entries(page.compact)) {
          expect(getComputedStyle(document.querySelector(selector)!).fontSize).toBe(expectedSize)
        }

        document.head.querySelectorAll('style').forEach((style) => style.remove())
      }
    },
  )

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
