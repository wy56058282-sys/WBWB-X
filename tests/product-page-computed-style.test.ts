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
  tools: readFileSync('docs/.vitepress/theme/tools.css', 'utf8'),
  enterprise: readFileSync('docs/.vitepress/theme/enterprise-services.css', 'utf8'),
  service: readFileSync('docs/.vitepress/theme/service.css', 'utf8'),
  workshop: readFileSync('docs/.vitepress/theme/workshop.css', 'utf8'),
}
const sharedStyles = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

const themes = {
  light: {
    accent: '#32e6b9',
    ink: '#0d100d',
    muted: '#656b60',
    surface: '#ffffff',
    sectionSoft: '#f7f9f8',
    sectionSoftRgb: 'rgb(247, 249, 248)',
    accentSoft: '#dafaf2',
    accentSoftRgb: 'rgb(218, 250, 242)',
    line: '#e3e7e4',
    shadowSoft: '0 8px 24px rgb(13 16 13 / 6%)',
    hoverSurface: '#eceee9',
    vpBrand: '#176b55',
  },
  dark: {
    accent: '#32e6b9',
    ink: '#f3f5ed',
    muted: '#aeb4a7',
    surface: '#181b15',
    sectionSoft: '#151812',
    sectionSoftRgb: 'rgb(21, 24, 18)',
    accentSoft: '#1d3a31',
    accentSoftRgb: 'rgb(29, 58, 49)',
    line: '#343a2f',
    shadowSoft: '0 10px 30px rgb(0 0 0 / 24%)',
    hoverSurface: '#252922',
    vpBrand: '#32e6b9',
  },
} as const

function resolveThemeTokens(
  css: string,
  theme: (typeof themes)[keyof typeof themes],
  viewportWidth = 1440,
) {
  const type = viewportWidth <= 640
    ? { hero: '40px', page: '38px', section: '30px', card: '20px', lead: '17px', body: '16px', aux: '13px', control: '14px', eyebrow: '10px' }
    : { hero: '58px', page: '52px', section: '40px', card: '22px', lead: '20px', body: '17px', aux: '14px', control: '15px', eyebrow: '11px' }

  return css
    .replaceAll('var(--wbx-accent)', theme.accent)
    .replaceAll('var(--wbx-ink)', theme.ink)
    .replaceAll('var(--wbx-muted)', theme.muted)
    .replaceAll('var(--wbx-surface)', theme.surface)
    .replaceAll('var(--wbx-section-soft)', theme.sectionSoft)
    .replaceAll('var(--wbx-accent-soft)', theme.accentSoft)
    .replaceAll('var(--wbx-line)', theme.line)
    .replaceAll('var(--wbx-shadow-soft)', theme.shadowSoft)
    .replaceAll('var(--wbx-radius-lg)', '16px')
    .replaceAll('var(--wbx-radius-xl)', '20px')
    .replaceAll('var(--wbx-radius-md)', '10px')
    .replaceAll('var(--wbx-hover-surface)', theme.hoverSurface)
    .replaceAll('var(--vp-c-brand-1)', theme.vpBrand)
    .replaceAll('var(--wbx-pixel)', 'Silkscreen')
    .replaceAll('var(--wbx-type-hero-size)', type.hero)
    .replaceAll('var(--wbx-type-page-size)', type.page)
    .replaceAll('var(--wbx-type-section-size)', type.section)
    .replaceAll('var(--wbx-type-card-size)', type.card)
    .replaceAll('var(--wbx-type-lead-size)', type.lead)
    .replaceAll('var(--wbx-type-body-size)', type.body)
    .replaceAll('var(--wbx-type-aux-size)', type.aux)
    .replaceAll('var(--wbx-type-control-size)', type.control)
    .replaceAll('var(--wbx-type-eyebrow-size)', type.eyebrow)
    .replaceAll('var(--wbx-leading-hero)', '1.18')
    .replaceAll('var(--wbx-leading-page)', '1.2')
    .replaceAll('var(--wbx-leading-section)', '1.25')
    .replaceAll('var(--wbx-leading-card)', '1.35')
    .replaceAll('var(--wbx-leading-lead)', '1.6')
    .replaceAll('var(--wbx-leading-body)', '1.65')
    .replaceAll('var(--wbx-leading-aux)', '1.5')
    .replaceAll('var(--wbx-leading-control)', '1.5')
    .replaceAll('var(--wbx-leading-eyebrow)', '1.6')
    .replaceAll('var(--wbx-weight-regular)', '400')
    .replaceAll('var(--wbx-weight-medium)', '500')
    .replaceAll('var(--wbx-weight-semibold)', '600')
    .replaceAll('var(--wbx-weight-bold)', '700')
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
    viewportWidth,
  )
  document.head.append(style)
}

function assertCompactSurfaces(doc: Document, viewportWidth: number) {
  const size = (selector: string, expected: string) => {
    expect(getComputedStyle(doc.querySelector(selector)!).fontSize).toBe(expected)
  }

  if (doc.querySelector('.wbx-cases')) {
    size('.gallery-eyebrow', viewportWidth <= 640 ? '10px' : '11px')
    size('.submit-eyebrow', viewportWidth <= 640 ? '10px' : '11px')
    size('.cta-eyebrow', viewportWidth <= 640 ? '10px' : '11px')
    size('.wbx-cases-categories button', viewportWidth <= 640 ? '14px' : '15px')
    size('.wbx-case-card__meta', '12px')
    size('.wbx-case-card__title', viewportWidth <= 640 ? '20px' : '22px')
    size('.wbx-case-card__outcome', '14px')
    size('.wbx-case-card__product', '11px')
    size('.wbx-cases-submit .wbx-cases-action', viewportWidth <= 640 ? '14px' : '15px')
    size('.wbx-case-service-cta .wbx-cases-action', viewportWidth <= 640 ? '14px' : '15px')
  }

}

afterEach(() => {
  document.head.querySelectorAll('style').forEach((style) => style.remove())
  document.body.replaceChildren()
  document.documentElement.className = ''
})

describe('product page computed styles', () => {
  it.each([
    { label: 'light', theme: themes.light },
    { label: 'dark', theme: themes.dark },
  ])('uses consistent enterprise service surfaces in $label mode', ({ theme }) => {
    installStyles(pageStyles.enterprise, theme, 1440)
    document.body.innerHTML = `
      <div class="wbx-enterprise">
        <article class="wbx-enterprise-service"><a>沟通培训需求</a></article>
        <article class="wbx-enterprise-service is-recommended"><span class="wbx-enterprise-service__meta"><span>推荐起点</span></span><a>预约需求诊断</a></article>
      </div>
    `

    const cards = [...document.querySelectorAll('.wbx-enterprise-service')]
      .map((element) => getComputedStyle(element))

    expect(cards.every((style) => style.borderRadius === '20px')).toBe(true)
    expect(cards.every((style) => style.backgroundColor === theme.sectionSoftRgb)).toBe(true)
  })

  it('stacks enterprise services and stretches their actions on mobile', () => {
    installStyles(pageStyles.enterprise, themes.light, 390)
    document.body.innerHTML = `
      <div class="wbx-enterprise">
        <div class="wbx-enterprise__grid"><article class="wbx-enterprise-service"><a>预约需求诊断</a></article></div>
      </div>
    `

    const grid = getComputedStyle(document.querySelector('.wbx-enterprise__grid')!)
    const action = getComputedStyle(document.querySelector('.wbx-enterprise-service > a')!)

    expect(grid.gridTemplateColumns).toBe('1fr')
    expect(action.alignSelf).toBe('stretch')
  })

  it.each([
    { label: 'light', theme: themes.light },
    { label: 'dark', theme: themes.dark },
  ])('keeps tool navigation and placeholders calm in $label mode', ({ theme }) => {
    installStyles(pageStyles.tools, theme, 1440)
    document.body.innerHTML = `
      <div class="wbx-tools">
        <div class="wbx-tools__tabs"><button aria-selected="true">WorkBuddy</button></div>
        <section class="wbx-tools__placeholder">产品介绍筹备中</section>
      </div>
    `

    const tabs = getComputedStyle(document.querySelector('.wbx-tools__tabs')!)
    const selected = getComputedStyle(document.querySelector('.wbx-tools__tabs button')!)
    const placeholder = getComputedStyle(document.querySelector('.wbx-tools__placeholder')!)

    expect(tabs.borderRadius).toBe('16px')
    expect(tabs.backgroundColor).toBe(theme.sectionSoftRgb)
    expect(selected.backgroundColor).toBe(theme.surface === '#ffffff' ? 'rgb(255, 255, 255)' : 'rgb(24, 27, 21)')
    expect(placeholder.borderRadius).toBe('20px')
    expect(placeholder.backgroundColor).toBe(theme.sectionSoftRgb)
  })

  it('fits all product tabs within the mobile viewport without a horizontal scroller', () => {
    installStyles(pageStyles.tools, themes.light, 390)
    document.body.innerHTML = `
      <div class="wbx-tools__tabs">
        <button>WorkBuddy</button><button>SparkX</button><button>SunFun</button>
      </div>
    `

    const tabs = getComputedStyle(document.querySelector('.wbx-tools__tabs')!)
    const button = getComputedStyle(document.querySelector('.wbx-tools__tabs button')!)

    expect(tabs.display).toBe('grid')
    expect(tabs.gridTemplateColumns).toBe('repeat(3, minmax(0, 1fr))')
    expect(tabs.overflowX).not.toBe('auto')
    expect(button.minWidth).toBe('0')
  })

  it.each([
    { label: 'light', theme: themes.light },
    { label: 'dark', theme: themes.dark },
  ])('uses calm catalog surfaces and compact selected filters in $label mode', ({ theme }) => {
    installStyles(pageStyles.cases, theme, 1440)
    document.body.innerHTML = `
      <section class="wbx-cases">
        <div class="wbx-cases-primary-tabs"><button aria-selected="true">个人</button></div>
        <div class="wbx-cases-categories"><button aria-pressed="true">全部</button></div>
        <div class="wbx-cases-tools-stack"><label class="wbx-cases-search"><input></label></div>
        <ul class="wbx-cases-grid">
          <li class="wbx-case-card"><a class="wbx-case-card__link">案例</a></li>
          <li class="wbx-enterprise-case-card">企业案例</li>
        </ul>
      </section>
    `

    const personalCard = getComputedStyle(document.querySelector('.wbx-case-card__link')!)
    const enterpriseCard = getComputedStyle(document.querySelector('.wbx-enterprise-case-card')!)
    const tools = getComputedStyle(document.querySelector('.wbx-cases-tools-stack')!)
    const audienceTab = getComputedStyle(document.querySelector('.wbx-cases-primary-tabs button')!)
    const category = getComputedStyle(document.querySelector('.wbx-cases-categories button')!)

    expect(personalCard.borderRadius).toBe('20px')
    expect(enterpriseCard.borderRadius).toBe('20px')
    expect(personalCard.backgroundColor).toBe(theme.sectionSoftRgb)
    expect(enterpriseCard.backgroundColor).toBe(theme.sectionSoftRgb)
    expect(tools.borderRadius).toBe('20px')
    expect(tools.backgroundColor).toBe(theme.sectionSoftRgb)
    expect(audienceTab.backgroundColor).toBe(theme.accentSoftRgb)
    expect(category.backgroundColor).toBe(theme.accentSoftRgb)
  })

  it.each([
    { label: 'desktop', viewportWidth: 1440, fontSize: '52px', lineHeight: '1.2' },
    { label: 'desktop boundary', viewportWidth: 960, fontSize: '52px', lineHeight: '1.2' },
    { label: 'tablet upper boundary', viewportWidth: 959, fontSize: '52px', lineHeight: '1.2' },
    { label: 'tablet', viewportWidth: 900, fontSize: '52px', lineHeight: '1.2' },
    { label: 'tablet lower boundary', viewportWidth: 641, fontSize: '52px', lineHeight: '1.2' },
    { label: 'mobile boundary', viewportWidth: 640, fontSize: '38px', lineHeight: '1.2' },
    { label: 'mobile', viewportWidth: 390, fontSize: '38px', lineHeight: '1.2' },
  ])(
    'matches guide page typography at $label width without enlarging compact surfaces',
    ({ viewportWidth, fontSize, lineHeight }) => {
      const pages = [
        {
          css: pageStyles.cases,
          markup: `
            <div class="VPDoc"><div class="vp-doc">
              <section class="wbx-cases">
                <header class="wbx-cases-hero wbx-page-header">
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
          bodyFontSize: viewportWidth <= 640 ? '16px' : '17px',
          bodyLineHeight: '1.65',
          compact: {
            '.gallery-eyebrow': viewportWidth <= 640 ? '10px' : '11px',
            '.submit-eyebrow': viewportWidth <= 640 ? '10px' : '11px',
            '.cta-eyebrow': viewportWidth <= 640 ? '10px' : '11px',
            '.wbx-cases-categories button': viewportWidth <= 640 ? '14px' : '15px',
            '.wbx-case-card__meta': '12px',
            '.wbx-case-card__title': viewportWidth <= 640 ? '20px' : '22px',
            '.wbx-case-card__outcome': '14px',
            '.wbx-case-card__product': '11px',
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
          fontWeight: '700',
        })
        expect({
          fontSize: h2Style.fontSize,
          fontWeight: h2Style.fontWeight,
        }).toMatchObject({
          fontSize: viewportWidth <= 640 ? '30px' : '40px',
          fontWeight: '700',
        })
        expect({
          fontSize: bodyStyle.fontSize,
          lineHeight: bodyStyle.lineHeight,
        }).toMatchObject({
          fontSize: page.bodyFontSize,
          lineHeight: page.bodyLineHeight,
        })

        assertCompactSurfaces(document, viewportWidth)

        if (page.css === pageStyles.cases) {
          expect(getComputedStyle(document.querySelector('.gallery-eyebrow')!).position).not.toBe('absolute')
          expect(getComputedStyle(document.querySelector('.submit-eyebrow')!).position).not.toBe('absolute')
          expect(getComputedStyle(document.querySelector('.cta-eyebrow')!).position).not.toBe('absolute')
          expect(getComputedStyle(document.querySelector('.submit-copy')!).fontSize).toBe(viewportWidth <= 640 ? '16px' : '17px')
          expect(getComputedStyle(document.querySelector('.wbx-cases-action')!).fontSize).toBe(viewportWidth <= 640 ? '14px' : '15px')
        }

        const eyebrowStyle = getComputedStyle(document.querySelector('.submit-eyebrow')!)
        expect(eyebrowStyle.color).toBe('rgb(23, 107, 85)')
        expect(eyebrowStyle.fontFamily).toContain('Silkscreen')
        expect(eyebrowStyle.fontWeight).toBe('500')

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
        expect(getComputedStyle(document.querySelector(selector)!).fontSize).toBe('11px')
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
      ]

      for (const page of pages) {
        installStyles(page.css, theme)
        document.body.innerHTML = page.markup

        const action = document.querySelector<HTMLElement>(page.selector)
        const computed = getComputedStyle(action!)

        expect(computed.color).toBe('rgb(13, 16, 13)')
        expect(computed.backgroundColor).toBe('rgb(50, 230, 185)')
        expect(computed.fontWeight).toBe('600')
        expect(computed.textDecoration).toBe('none')
        expect(computed.transition).toContain('background var(--wbx-motion-fast) ease')

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

  it('uses the shared soft surface treatment for WorkBuddy dynamic visuals', () => {
    installStyles(pageStyles.service, themes.light, 1440)
    document.body.innerHTML = `
      <article class="wbx-service">
        <div class="wbx-service-console">
          <div class="wbx-service-console__bar"></div>
          <div class="wbx-service-console__body"></div>
          <form class="wbx-service-console__form">
            <div class="wbx-service-console__input"><input><button></button></div>
          </form>
        </div>
        <div class="wbx-service-flow"><strong>请求</strong><span>步骤</span><b>已交付</b></div>
        <div class="wbx-service-deliverables"><span>文档</span></div>
        <div class="wbx-service-files"><span>文件</span><strong>已归档</strong></div>
        <div class="wbx-service-model"><div class="wbx-service-model__tabs"><button class="wbx-service-model__tab" aria-selected="true">混元</button></div><div class="wbx-service-model__detail">详情</div></div>
      </article>
    `

    const consoleStyle = getComputedStyle(document.querySelector('.wbx-service-console')!)
    expect(consoleStyle.borderWidth).toBe('1px')
    expect(consoleStyle.borderColor).toBe('rgb(227, 231, 228)')
    expect(consoleStyle.borderRadius).toBe('16px')
    expect(consoleStyle.boxShadow).toBe('0 8px 24px rgb(13 16 13 / 6%)')

    for (const selector of ['.wbx-service-flow', '.wbx-service-files', '.wbx-service-model']) {
      const visual = getComputedStyle(document.querySelector(selector)!)
      expect(visual.borderWidth).toBe('1px')
      expect(visual.borderColor).toBe('rgb(227, 231, 228)')
      expect(visual.borderRadius).toBe('12px')
      expect(visual.boxShadow).toBe('0 8px 24px rgb(13 16 13 / 6%)')
    }

    expect(getComputedStyle(document.querySelector('.wbx-service-deliverables > span')!).borderRadius).toBe('10px')
    expect(getComputedStyle(document.querySelector('.wbx-service-console__input input')!).borderRadius).toBe('10px')
    expect(getComputedStyle(document.querySelector('.wbx-service-model__tab[aria-selected="true"]')!).backgroundColor).toBe('rgb(255, 255, 255)')
  })

  it('keeps the softened WorkBuddy visuals in the single-column mobile layout', () => {
    installStyles(pageStyles.service, themes.light, 390)
    document.body.innerHTML = `
      <article class="wbx-service">
        <div class="wbx-service-console"></div>
        <article class="wbx-service-capability">
          <span class="wbx-service-capability__number">01</span>
          <div class="wbx-service-capability__copy">说明</div>
          <div class="wbx-service-capability__visual"><div class="wbx-service-flow">流程</div></div>
        </article>
        <div class="wbx-service-deliverables"><span>文档</span></div>
      </article>
    `

    expect(getComputedStyle(document.querySelector('.wbx-service-console')!).boxShadow).toBe('0 8px 24px rgb(13 16 13 / 6%)')
    expect(getComputedStyle(document.querySelector('.wbx-service-capability')!).gridTemplateColumns).toBe('1fr')
    expect(getComputedStyle(document.querySelector('.wbx-service-capability__visual')!).gridColumn).toBe('1')
    expect(getComputedStyle(document.querySelector('.wbx-service-deliverables')!).gridTemplateColumns).toBe('1fr')
  })

  it('keeps service capability numbers legible in dark mode', () => {
    installStyles(pageStyles.service, themes.dark)
    document.documentElement.classList.add('dark')
    document.body.innerHTML = `
      <article class="wbx-service">
        <div class="wbx-service-capability">
          <span class="wbx-service-capability__number">01</span>
        </div>
      </article>
    `

    expect(getComputedStyle(document.querySelector('.wbx-service-capability__number')!).color)
      .toBe('rgb(174, 180, 167)')
  })

  it.each([
    { viewportWidth: 1440, panelColumns: 'minmax(0, 570px) minmax(320px, 486px)', sectionWidth: '100%', titleInset: '0px' },
    { viewportWidth: 900, panelColumns: '1fr', sectionWidth: '100%', titleInset: '0px' },
    { viewportWidth: 390, panelColumns: '1fr', sectionWidth: '100%', titleInset: '0px' },
  ])(
    'keeps the homepage workshop responsive at $viewportWidth px',
    ({ viewportWidth, panelColumns, sectionWidth, titleInset }) => {
      installStyles(pageStyles.workshop, themes.light, viewportWidth)
      document.body.innerHTML = `
        <section class="wbx-home-workshop wbx-workshop">
          <div class="wbx-workshop__panel">
            <div class="wbx-workshop__left"><div class="wbx-workshop__copy"><div class="wbx-workshop__heading"><p class="wbx-workshop__eyebrow">WORKSHOP</p><h2 id="workshop-title">WorkBuddy X 工作坊 <span class="wbx-workshop__title-edition">第二期</span></h2></div><div class="wbx-workshop__actions"><div class="wbx-home-workshop__registration"><button class="wbx-workshop__action wbx-workshop__action--primary">报名</button><div class="wbx-home-workshop__registration-popover is-open"><img src="/qr.png" alt="报名二维码"></div></div></div></div><div class="wbx-workshop__editions-row"><div class="wbx-workshop__editions"><button class="wbx-workshop__edition" aria-selected="true">第二期</button></div></div></div>
            <figure class="wbx-workshop__media"><a class="wbx-workshop__poster-link"><img class="wbx-workshop__poster"></a></figure>
            <div class="wbx-workshop__poster-navigation">海报导航</div>
          </div>
        </section>
      `

      const panel = getComputedStyle(document.querySelector('.wbx-workshop__panel')!)
      expect(panel.gridTemplateColumns).toBe(panelColumns)
      expect(getComputedStyle(document.querySelector('.wbx-workshop__poster-link')!).transition).toContain('transform var(--wbx-motion-base) var(--wbx-ease-standard)')
      expect(getComputedStyle(document.querySelector('.wbx-workshop__edition')!).boxShadow).not.toBe('')
      const workshop = getComputedStyle(document.querySelector('.wbx-workshop')!)
      expect(workshop.width).toBe(sectionWidth)
      expect(workshop.marginLeft).toBe(titleInset)
      const facts = document.createElement('dl')
      facts.className = 'wbx-workshop__facts has-city'
      document.querySelector('.wbx-workshop__copy')!.append(facts)
      expect(getComputedStyle(facts).borderTopColor).toBe('rgb(227, 231, 228)')
      expect(getComputedStyle(facts).borderBottomColor).toBe('rgb(227, 231, 228)')
      expect(getComputedStyle(facts).gridTemplateColumns).toBe(viewportWidth === 390
        ? 'repeat(2, minmax(0, 1fr))'
        : 'minmax(0, 1.4fr) minmax(0, 0.8fr) minmax(0, 0.65fr) minmax(0, 1.55fr) minmax(0, 0.8fr)')
      const registrationQr = getComputedStyle(document.querySelector('.wbx-home-workshop__registration-popover img')!)
      expect(registrationQr.marginTop).toBe('12px')
      expect(registrationQr.marginLeft).toBe('12px')
      expect(registrationQr.marginRight).toBe('12px')
      if (viewportWidth === 1440) expect(panel.justifyContent).toBe('space-between')
      const workshopTitle = getComputedStyle(document.querySelector('#workshop-title')!)
      expect(workshopTitle.fontSize).toBe(viewportWidth === 390 ? '30px' : '40px')
      expect(workshopTitle.fontWeight).toBe('700')
      expect(workshopTitle.lineHeight).toBe('1.25')
      expect(workshopTitle.letterSpacing).toBe('-0.035em')

      const left = getComputedStyle(document.querySelector('.wbx-workshop__left')!)
      const media = getComputedStyle(document.querySelector('.wbx-workshop__media')!)
      const navigation = getComputedStyle(document.querySelector('.wbx-workshop__poster-navigation')!)
      const editionsRow = getComputedStyle(document.querySelector('.wbx-workshop__editions-row')!)
      if (viewportWidth === 1440) {
        expect(left.display).toBe('flex')
        expect(left.flexDirection).toBe('column')
        expect(editionsRow.marginTop).toBe('auto')
        expect(media.gridArea).toBe('media')
        expect(navigation.gridArea).toBe('navigation')
      } else {
        expect(left.display).toBe('contents')
        expect(getComputedStyle(document.querySelector('.wbx-workshop__copy')!).order).toBe('1')
        expect(media.order).toBe('2')
        expect(navigation.order).toBe('3')
        expect(editionsRow.order).toBe('4')
      }

      if (viewportWidth === 390) {
        expect(getComputedStyle(document.querySelector('.wbx-workshop')!).minWidth).toBe('0')
        expect(getComputedStyle(document.querySelector('.wbx-workshop__action')!).width).toBe('100%')
      }
    },
  )
})
