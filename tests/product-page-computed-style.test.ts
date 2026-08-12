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
    .replaceAll('var(--wbx-pixel)', 'Silkscreen')
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

afterEach(() => {
  document.head.querySelectorAll('style').forEach((style) => style.remove())
  document.body.replaceChildren()
  document.documentElement.className = ''
})

describe('product page computed styles', () => {
  it.each([
    { label: 'desktop', viewportWidth: 1440, fontSize: '51.2px', lineHeight: '58.88px' },
    { label: 'desktop boundary', viewportWidth: 960, fontSize: '51.2px', lineHeight: '58.88px' },
    { label: 'tablet upper boundary', viewportWidth: 959, fontSize: '44px', lineHeight: '52.8px' },
    { label: 'tablet', viewportWidth: 900, fontSize: '44px', lineHeight: '52.8px' },
    { label: 'tablet lower boundary', viewportWidth: 641, fontSize: '44px', lineHeight: '52.8px' },
    { label: 'mobile boundary', viewportWidth: 640, fontSize: '36px', lineHeight: '43.2px' },
    { label: 'mobile', viewportWidth: 390, fontSize: '36px', lineHeight: '43.2px' },
  ])(
    'matches guide page typography at $label width without enlarging compact surfaces',
    ({ viewportWidth, fontSize, lineHeight }) => {
      const pages = [
        {
          css: pageStyles.cases,
          markup: `
            <div class="VPDoc"><div class="vp-doc">
              <section class="wbx-cases">
                <header class="wbx-cases-hero">
                  <div class="wbx-cases-hero__copy">
                  <p class="wbx-cases-eyebrow wbx-cases-header__eyebrow header-eyebrow">页首标签</p>
                  <h1>案例集</h1><p class="primary-copy">案例正文</p>
                  </div>
                  <section class="wbx-cases-filter-panel"><div class="wbx-cases-gallery__topline"><div><p class="wbx-cases-eyebrow gallery-eyebrow">画廊标签</p><h2>浏览案例</h2></div></div>
                  <div class="wbx-cases-categories"><button>分类</button></div>
                  </section>
                </header>
                <section class="wbx-cases-gallery-results">
                  <ul class="wbx-cases-grid"><li class="wbx-case-card"><a class="wbx-case-card__link"><span class="wbx-case-card__content">
                    <span class="wbx-case-card__meta">元数据</span><strong class="wbx-case-card__title">卡片标题</strong>
                    <span class="wbx-case-card__outcome">辅助结果</span><span class="wbx-case-card__product">产品标签</span>
                  </span></a></li></ul>
                </section>
                <section class="wbx-cases-submit"><div><p class="wbx-cases-eyebrow submit-eyebrow">投稿标签</p><h2>投稿</h2><p class="submit-copy">投稿正文</p></div><div class="wbx-cases-submit__actions"><a class="wbx-cases-action">投稿</a></div></section>
              </section>
              <section class="wbx-case-service-cta"><div><p class="wbx-cases-eyebrow cta-eyebrow">服务标签</p><h2>服务</h2></div><a class="wbx-cases-action">操作</a></section>
            </div></div>
          `,
          h1: '.wbx-cases h1',
          h2: '.wbx-cases h2',
          body: '.primary-copy',
          compact: {
            '.header-eyebrow': '12px',
            '.gallery-eyebrow': '12px',
            '.submit-eyebrow': '12px',
            '.cta-eyebrow': '12px',
            '.wbx-cases-categories button': '14px',
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
              <section class="wbx-service-offer"><div class="wbx-service-offer__copy">
                <p class="wbx-service-eyebrow">服务标签</p><h1>定制服务</h1><p>服务正文</p>
              </div></section>
              <section class="wbx-service-section"><div class="wbx-service-section__heading"><h2>服务范围</h2></div></section>
              <dl class="wbx-service-offer__facts"><div><dt>价格</dt><dd>¥999</dd></div></dl>
              <a class="wbx-service-action">预约</a>
              <a class="wbx-service-case">
                <span><small>案例标签</small><strong>卡片标题</strong><span>辅助结果</span></span>
              </a>
              <div class="wbx-service-output-list"><dd>辅助说明</dd></div>
            </section></div></div>
          `,
          h1: '.wbx-service h1',
          h2: '.wbx-service h2',
          body: '.wbx-service-offer__copy > p:not(.wbx-service-eyebrow)',
          compact: {
            '.wbx-service-eyebrow': '12px',
            '.wbx-service-offer__facts > div:first-child dd': '24px',
            '.wbx-service-action': '14px',
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

        if (page.css === pageStyles.cases) {
          expect(getComputedStyle(document.querySelector('.wbx-cases-header__eyebrow')!).position)
            .toBe(viewportWidth >= 1280 ? 'absolute' : '')
          expect(getComputedStyle(document.querySelector('.gallery-eyebrow')!).position).not.toBe('absolute')
          expect(getComputedStyle(document.querySelector('.submit-eyebrow')!).position).not.toBe('absolute')
          expect(getComputedStyle(document.querySelector('.cta-eyebrow')!).position).not.toBe('absolute')
          expect(getComputedStyle(document.querySelector('.submit-copy')!).fontSize).toBe('16px')
          expect(getComputedStyle(document.querySelector('.wbx-cases-action')!).fontSize).toBe('14px')
        }

        const eyebrowSelector = page.css === pageStyles.cases
          ? '.submit-eyebrow'
          : '.wbx-service-eyebrow'
        const eyebrowStyle = getComputedStyle(document.querySelector(eyebrowSelector)!)
        expect(eyebrowStyle.color).toBe('rgb(23, 107, 85)')
        expect(eyebrowStyle.fontFamily).toContain('Silkscreen')
        expect(eyebrowStyle.fontWeight).toBe('700')

        document.head.querySelectorAll('style').forEach((style) => style.remove())
      }
    },
  )

  it('fails the cases compact contract when main eyebrows are enlarged', () => {
    installStyles(pageStyles.cases, themes.light, 1440)
    document.body.innerHTML = `
      <div class="wbx-cases"><div class="wbx-cases-main">
        <header><p class="wbx-cases-eyebrow header-eyebrow">页首</p></header>
        <section><p class="wbx-cases-eyebrow gallery-eyebrow">画廊</p></section>
        <section><p class="wbx-cases-eyebrow submit-eyebrow">投稿</p></section>
      </div></div>
      <section class="wbx-case-service-cta"><p class="wbx-cases-eyebrow cta-eyebrow">详情服务</p></section>
    `

    const expectCompactEyebrows = () => {
      for (const selector of ['.header-eyebrow', '.gallery-eyebrow', '.submit-eyebrow', '.cta-eyebrow']) {
        expect(getComputedStyle(document.querySelector(selector)!).fontSize).toBe('12px')
      }
    }

    expectCompactEyebrows()
    const mutation = document.createElement('style')
    mutation.textContent = '.wbx-cases-main .wbx-cases-eyebrow { font-size: 20px; }'
    document.head.append(mutation)
    expect(expectCompactEyebrows).toThrow()
    mutation.remove()
    expectCompactEyebrows()
  })

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
