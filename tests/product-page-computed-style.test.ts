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
  workshop: readFileSync('docs/.vitepress/theme/workshop.css', 'utf8'),
}
const sharedStyles = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

const themes = {
  light: {
    accent: '#32e6b9',
    ink: '#0d100d',
    surface: '#ffffff',
    hoverSurface: '#eceee9',
    vpBrand: '#176b55',
  },
  dark: {
    accent: '#32e6b9',
    ink: '#f3f5ed',
    surface: '#181b15',
    hoverSurface: '#252922',
    vpBrand: '#32e6b9',
  },
} as const

function resolveThemeTokens(css: string, theme: (typeof themes)[keyof typeof themes]) {
  return css
    .replaceAll('var(--wbx-accent)', theme.accent)
    .replaceAll('var(--wbx-ink)', theme.ink)
    .replaceAll('var(--wbx-surface)', theme.surface)
    .replaceAll('var(--wbx-hover-surface)', theme.hoverSurface)
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

function assertCompactSurfaces(doc: Document) {
  const size = (selector: string, expected: string) => {
    expect(getComputedStyle(doc.querySelector(selector)!).fontSize).toBe(expected)
  }

  if (doc.querySelector('.wbx-cases')) {
    size('.gallery-eyebrow', '12px')
    size('.submit-eyebrow', '12px')
    size('.cta-eyebrow', '12px')
    size('.wbx-cases-categories button', '14px')
    size('.wbx-case-card__meta', '12px')
    size('.wbx-case-card__title', '18px')
    size('.wbx-case-card__outcome', '14px')
    size('.wbx-case-card__product', '11px')
    size('.wbx-cases-submit .wbx-cases-action', '14px')
    size('.wbx-case-service-cta .wbx-cases-action', '14px')
  }

  if (doc.querySelector('.wbx-service')) {
    size('.wbx-service-eyebrow', '12px')
    size('.wbx-service .wbx-service-action', '14px')
    size('.wbx-service-enterprise__benefit', '18px')
    size('.wbx-service-case small', '10px')
    size('.wbx-service-case strong', '15px')
    size('.wbx-service-case span span', '13px')
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
                  <h1>案例集</h1>
                  <div class="wbx-cases-filter-panel__heading"><p class="wbx-cases-eyebrow gallery-eyebrow">画廊标签</p><h2>浏览案例</h2></div>
                  <p class="primary-copy">案例正文</p>
                  </div>
                  <section class="wbx-cases-filter-panel">
                  <div class="wbx-cases-filter-panel__controls"><label class="wbx-cases-search"><input type="search"></label><div class="wbx-cases-categories"><button>分类</button></div></div>
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
          bodyFontSize: '16px',
          bodyLineHeight: '1.75',
          compact: {
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
              <header class="wbx-service-header"><div class="wbx-service-header__title">
                <p class="wbx-service-eyebrow">服务标签</p><h1>定制服务</h1><p class="wbx-service-header__summary">服务正文</p><a class="wbx-service-action">预约</a>
              </div></header>
              <section class="wbx-service-section"><div class="wbx-service-section__heading"><h2>服务范围</h2></div></section>
              <section class="wbx-service-section wbx-service-enterprise"><div class="wbx-service-enterprise__body"><p class="wbx-service-enterprise__benefit">辅助提示</p></div></section>
              <section class="wbx-service-section wbx-service-related"><div class="wbx-service-related__grid"><a class="wbx-service-case">
                <span><small>案例标签</small><strong>卡片标题</strong><span>辅助结果</span></span>
              </a></div></section>
            </section></div></div>
          `,
          h1: '.wbx-service h1',
          h2: '.wbx-service h2',
          body: '.wbx-service-header__summary',
          bodyFontSize: '15px',
          bodyLineHeight: '1.7',
          compact: {
            '.wbx-service-eyebrow': '12px',
            '.wbx-service-action': '14px',
            '.wbx-service-case small': '10px',
            '.wbx-service-case strong': '15px',
            '.wbx-service-case span span': '13px',
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
          fontSize: page.bodyFontSize,
          lineHeight: page.bodyLineHeight,
        })

        assertCompactSurfaces(document)

        if (page.css === pageStyles.cases) {
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
        <section><p class="wbx-cases-eyebrow gallery-eyebrow">画廊</p></section>
        <section><p class="wbx-cases-eyebrow submit-eyebrow">投稿</p></section>
      </div></div>
      <section class="wbx-case-service-cta"><p class="wbx-cases-eyebrow cta-eyebrow">详情服务</p></section>
    `

    const expectCompactEyebrows = () => {
      for (const selector of ['.gallery-eyebrow', '.submit-eyebrow', '.cta-eyebrow']) {
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

  it.each([
    { viewportWidth: 1440, pathColumns: 'repeat(3, minmax(0, 1fr))' },
    { viewportWidth: 900, pathColumns: '1fr' },
    { viewportWidth: 390, pathColumns: '1fr' },
  ])(
    'keeps the production service conversion hierarchy readable at $viewportWidth px',
    ({ viewportWidth, pathColumns }) => {
      installStyles(pageStyles.service, themes.light, viewportWidth)
      document.body.innerHTML = `
        <div class="vp-doc"><section class="wbx-service">
          <header class="wbx-service-header"><div class="wbx-service-header__title"><p class="wbx-service-eyebrow">CUSTOM SERVICE</p><h1>定制服务</h1></div></header>
          <section class="wbx-service-section"><ol class="wbx-service-path"><li class="wbx-service-path__item">工作坊</li><li class="wbx-service-path__item">诊断</li><li class="wbx-service-path__item">定制</li></ol></section>
          <section class="wbx-service-section wbx-service-enterprise"><div class="wbx-service-enterprise__body"><p class="wbx-service-enterprise__benefit">10 席位诊断免费</p><a class="wbx-service-action wbx-service-action--primary">先参加工作坊</a></div></section>
        </section></div>
      `

      const path = getComputedStyle(document.querySelector('.wbx-service-path')!)
      const enterprise = getComputedStyle(document.querySelector('.wbx-service-enterprise')!)
      const benefit = getComputedStyle(document.querySelector('.wbx-service-enterprise__benefit')!)
      const action = getComputedStyle(document.querySelector('.wbx-service-enterprise .wbx-service-action')!)

      expect(path.gridTemplateColumns).toBe(pathColumns)
      expect(path.listStyleType).toBe('none')
      expect(enterprise.backgroundColor).toBe('rgb(13, 16, 13)')
      expect(benefit.borderLeftWidth).toBe('6px')
      expect(action.minHeight).toBe('48px')

      if (viewportWidth === 390) {
        expect(action.width).toBe('100%')
        expect(getComputedStyle(document.querySelector('.wbx-service-section')!).minWidth).toBe('0')
      }
    },
  )

  it.each([
    { viewportWidth: 1440, panelColumns: 'minmax(0, 570px) minmax(320px, 486px)', sectionWidth: 'calc(100% - 104px)', titleInset: '52px' },
    { viewportWidth: 900, panelColumns: '1fr', sectionWidth: 'calc(100% - 104px)', titleInset: '52px' },
    { viewportWidth: 390, panelColumns: '1fr', sectionWidth: 'calc(100% - 8px)', titleInset: '4px' },
  ])(
    'keeps the homepage workshop responsive at $viewportWidth px',
    ({ viewportWidth, panelColumns, sectionWidth, titleInset }) => {
      installStyles(pageStyles.workshop, themes.light, viewportWidth)
      document.body.innerHTML = `
        <section class="wbx-home-workshop wbx-workshop">
          <div class="wbx-workshop__panel">
            <div class="wbx-workshop__copy"><div class="wbx-workshop__heading"><p class="wbx-workshop__eyebrow">WORKSHOP</p><h2 id="workshop-title">WorkBuddy X 工作坊 <span class="wbx-workshop__title-edition">第二期</span></h2></div><div class="wbx-workshop__actions"><div class="wbx-home-workshop__registration"><button class="wbx-workshop__action wbx-workshop__action--primary">报名</button></div></div></div>
            <figure class="wbx-workshop__media"><a class="wbx-workshop__poster-link"><img class="wbx-workshop__poster"></a></figure>
          </div>
          <div class="wbx-workshop__editions"><button class="wbx-workshop__edition" aria-selected="true">第二期</button></div>
        </section>
      `

      const panel = getComputedStyle(document.querySelector('.wbx-workshop__panel')!)
      expect(panel.gridTemplateColumns).toBe(panelColumns)
      expect(getComputedStyle(document.querySelector('.wbx-workshop__poster-link')!).transition).toContain('transform 180ms ease')
      expect(getComputedStyle(document.querySelector('.wbx-workshop__edition')!).boxShadow).not.toBe('')
      const workshop = getComputedStyle(document.querySelector('.wbx-workshop')!)
      expect(workshop.width).toBe(sectionWidth)
      expect(workshop.marginLeft).toBe(titleInset)
      if (viewportWidth === 1440) expect(panel.justifyContent).toBe('space-between')
      const workshopTitle = getComputedStyle(document.querySelector('#workshop-title')!)
      expect(workshopTitle.fontSize).toBe('clamp(30px, 3vw, 43px)')
      expect(workshopTitle.fontWeight).toBe('820')
      expect(workshopTitle.lineHeight).toBe('1.2')
      expect(workshopTitle.letterSpacing).toBe('-0.045em')

      if (viewportWidth === 390) {
        expect(getComputedStyle(document.querySelector('.wbx-workshop')!).minWidth).toBe('0')
        expect(getComputedStyle(document.querySelector('.wbx-workshop__action')!).width).toBe('100%')
      }
    },
  )
})
