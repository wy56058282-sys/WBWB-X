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
    sectionSoft: '#f7f9f8',
    line: '#e3e7e4',
    shadowSoft: '0 8px 24px rgb(13 16 13 / 6%)',
    hoverSurface: '#eceee9',
    vpBrand: '#176b55',
  },
  dark: {
    accent: '#32e6b9',
    ink: '#f3f5ed',
    surface: '#181b15',
    sectionSoft: '#151812',
    line: '#343a2f',
    shadowSoft: '0 10px 30px rgb(0 0 0 / 24%)',
    hoverSurface: '#252922',
    vpBrand: '#32e6b9',
  },
} as const

function resolveThemeTokens(css: string, theme: (typeof themes)[keyof typeof themes]) {
  return css
    .replaceAll('var(--wbx-accent)', theme.accent)
    .replaceAll('var(--wbx-ink)', theme.ink)
    .replaceAll('var(--wbx-surface)', theme.surface)
    .replaceAll('var(--wbx-section-soft)', theme.sectionSoft)
    .replaceAll('var(--wbx-line)', theme.line)
    .replaceAll('var(--wbx-shadow-soft)', theme.shadowSoft)
    .replaceAll('var(--wbx-radius-lg)', '16px')
    .replaceAll('var(--wbx-radius-md)', '10px')
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

        const eyebrowStyle = getComputedStyle(document.querySelector('.submit-eyebrow')!)
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
            <div class="wbx-workshop__left"><div class="wbx-workshop__copy"><div class="wbx-workshop__heading"><p class="wbx-workshop__eyebrow">WORKSHOP</p><h2 id="workshop-title">WorkBuddy X 工作坊 <span class="wbx-workshop__title-edition">第二期</span></h2></div><div class="wbx-workshop__actions"><div class="wbx-home-workshop__registration"><button class="wbx-workshop__action wbx-workshop__action--primary">报名</button></div></div></div><div class="wbx-workshop__editions"><button class="wbx-workshop__edition" aria-selected="true">第二期</button></div></div>
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
      if (viewportWidth === 1440) expect(panel.justifyContent).toBe('space-between')
      const workshopTitle = getComputedStyle(document.querySelector('#workshop-title')!)
      expect(workshopTitle.fontSize).toBe('clamp(30px, 3vw, 43px)')
      expect(workshopTitle.fontWeight).toBe('820')
      expect(workshopTitle.lineHeight).toBe('1.2')
      expect(workshopTitle.letterSpacing).toBe('-0.045em')

      const left = getComputedStyle(document.querySelector('.wbx-workshop__left')!)
      const media = getComputedStyle(document.querySelector('.wbx-workshop__media')!)
      const navigation = getComputedStyle(document.querySelector('.wbx-workshop__poster-navigation')!)
      const editions = getComputedStyle(document.querySelector('.wbx-workshop__editions')!)
      if (viewportWidth === 1440) {
        expect(left.display).toBe('flex')
        expect(left.flexDirection).toBe('column')
        expect(editions.marginTop).toBe('auto')
        expect(media.gridArea).toBe('media')
        expect(navigation.gridArea).toBe('navigation')
      } else {
        expect(left.display).toBe('contents')
        expect(getComputedStyle(document.querySelector('.wbx-workshop__copy')!).order).toBe('1')
        expect(media.order).toBe('2')
        expect(navigation.order).toBe('3')
        expect(editions.order).toBe('4')
      }

      if (viewportWidth === 390) {
        expect(getComputedStyle(document.querySelector('.wbx-workshop')!).minWidth).toBe('0')
        expect(getComputedStyle(document.querySelector('.wbx-workshop__action')!).width).toBe('100%')
      }
    },
  )
})
