import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const vpContentSource = readFileSync(
  'node_modules/vitepress/dist/client/theme-default/components/VPContent.vue',
  'utf8',
)
const vpDocSource = readFileSync(
  'node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue',
  'utf8',
)

function componentStyles(source: string) {
  return source.match(/<style scoped>([\s\S]*?)<\/style>/)?.[1] ?? ''
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
        rule.type === CSSRule.MEDIA_RULE &&
        mediaMatches((rule as CSSMediaRule).media.mediaText, viewportWidth)
      ) {
        visit((rule as CSSMediaRule).cssRules)
      }
    })
  }

  visit(sourceElement.sheet!.cssRules)
  sourceElement.remove()
  return rules.join('\n')
}

function px(value: string) {
  const length = Number.parseFloat(value)
  return Number.isFinite(length) ? length : 0
}

function resolvedLength(value: string, availableWidth: number, fallback: number) {
  if (!value || value === 'auto' || value === 'none') return fallback
  if (value.endsWith('%')) return availableWidth * (px(value) / 100)

  const length = px(value)
  return Number.isFinite(length) ? length : fallback
}

function usedBlockWidth(availableWidth: number, styles: CSSStyleDeclaration) {
  const width = resolvedLength(styles.width, availableWidth, availableWidth)
  const maxWidth = resolvedLength(styles.maxWidth, availableWidth, Number.POSITIVE_INFINITY)
  return Math.min(availableWidth, width, maxWidth)
}

function inlineStartOffset(
  availableWidth: number,
  usedWidth: number,
  styles: CSSStyleDeclaration,
) {
  if (styles.marginLeft === 'auto' && styles.marginRight === 'auto') {
    return (availableWidth - usedWidth) / 2
  }

  return resolvedLength(styles.marginLeft, availableWidth, 0)
}

function paddingBoxWidth(width: number, styles: CSSStyleDeclaration) {
  return width - px(styles.paddingLeft) - px(styles.paddingRight)
}

function centeredChildLeft(parentLeft: number, parentWidth: number, childWidth: number) {
  return parentLeft + (parentWidth - childWidth) / 2
}

function usedLineHeight(styles: CSSStyleDeclaration) {
  if (styles.lineHeight === 'normal') return px(styles.fontSize) * 1.2
  if (!styles.lineHeight.endsWith('px')) return px(styles.fontSize) * px(styles.lineHeight)
  return px(styles.lineHeight)
}

function finalGridTrackWidth(template: string, availableWidth: number) {
  const max = template.match(/minmax\([\s\S]*?,\s*([\d.]+)px\)\s*$/)?.[1]
  return max ? Math.min(availableWidth, Number(max)) : Number.NaN
}

describe('case collection page styles', () => {
  it('uses a stable responsive card grid with constrained cards', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/)
    expect(source).toMatch(/@media \(max-width:\s*1024px\)\s*\{\s*\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/)
    expect(source).toMatch(/@media \(max-width:\s*640px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
    expect(source).toMatch(/\.wbx-case-card__cover\s*\{[^}]*aspect-ratio:/)
    expect(source).toMatch(/\.wbx-cases-grid\s*>\s*\.wbx-case-card\s*\{[^}]*margin:\s*0/)
    expect(source).toMatch(/\.wbx-cases\s+\.wbx-cases-grid\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;[^}]*list-style:\s*none/)
    expect(source).toMatch(/\.wbx-case-card__title\s*\{[^}]*min-height:[^}]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-case-card__outcome\s*\{[^}]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPSidebar\s*\{[^}]*display:\s*none/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPLocalNav\s*\{[^}]*display:\s*none/)
    expect(source).toMatch(/\.wbx-cases-layout \.VPContent\.has-sidebar\s*\{[^}]*padding-right:\s*0;[^}]*padding-left:\s*0;/s)
    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.content\s*\{[^}]*max-width:\s*none;/s)
  })

  it('uses a guide-style contents rail and sizes cards for the available main column', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/@media \(min-width:\s*1280px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-shell\s*\{[^}]*grid-template-columns:\s*minmax\(0, 784px\) minmax\(0, 256px\)/s)
    expect(source).toMatch(/\.wbx-cases-main\s*\{[^}]*min-width:\s*0/s)
    expect(source).toMatch(/@media \(min-width:\s*1280px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-outline\s*\{[^}]*position:\s*sticky[^}]*top:\s*calc\(var\(--vp-nav-height\) \+ 48px\)[^}]*width:\s*224px[^}]*margin-left:\s*32px/s)
    expect(source).toMatch(/@media \(max-width:\s*1024px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-outline\s*\{[^}]*display:\s*none/s)
    expect(source).toMatch(/@media \(max-width:\s*1024px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
    expect(source).toMatch(/@media \(max-width:\s*640px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-main \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*1fr/s)
  })

  it('registers the gallery and makes it the entire case-index body', () => {
    const themeSource = readFileSync('docs/.vitepress/theme/index.ts', 'utf8')
    const indexSource = readFileSync('docs/cases/index.md', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')
    const styles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(themeSource).toContain("import CasesPage from './CasesPage.vue'")
    expect(themeSource).toContain("app.component('CasesPage', CasesPage)")
    expect(indexSource).toContain('<CasesPage />')
    expect(indexSource).not.toContain('# WorkBuddy WB-X 案例集')
    expect(pageSource).toContain(
      '<span class="wbx-cases-brand">WorkBuddy WB-X</span> 案例集',
    )
    expect(pageSource).toContain('class="wbx-cases-eyebrow wbx-cases-header__eyebrow"')
    expect(styles).toMatch(
      /\.wbx-cases-brand\s*\{[^}]*font-weight:\s*850;/s,
    )
  })

  it('scopes desktop positioning to the page-header eyebrow and excludes labels from body copy', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-submit p:not\(\.wbx-cases-eyebrow\)/)
    expect(source).toMatch(/@media \(min-width:\s*1280px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-header__eyebrow\s*\{[^}]*position:\s*absolute/s)
    expect(source).not.toMatch(/@media \(min-width:\s*1280px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\n\s*\.wbx-cases-eyebrow\s*\{[^}]*position:\s*absolute/s)
  })

  it('keeps the shared content width and square category controls', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')

    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.container\s*\{[^}]*max-width:\s*1104px/s)
    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.content-container\s*\{[^}]*max-width:\s*688px/s)
    expect(source).toMatch(/@media \(min-width:\s*1280px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-layout \.VPDoc \.content-container\s*\{[^}]*max-width:\s*none/s)
    expect(source).not.toMatch(/\.wbx-cases-layout \.VPDoc[^{]*\{[^}]*padding(?:-inline|-left|-right):/s)
    expect(source).toMatch(/\.wbx-cases h1\s*\{[^}]*font-weight:\s*850[^}]*line-height:\s*58\.88px[^}]*letter-spacing:\s*0/s)
    expect(source).toMatch(/\.wbx-cases-categories button,\s*\.wbx-cases-empty button\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(source).toMatch(/\.wbx-cases-categories button:hover,\s*\.wbx-cases-categories button\[aria-pressed="true"\],\s*\.wbx-cases-empty button:hover\s*\{[^}]*color:\s*#0d100d[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action:hover,\s*\.wbx-cases \.wbx-cases-action:focus-visible\s*\{[^}]*color:\s*#0d100d[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases-categories button:focus-visible,\s*\.wbx-case-card__link:focus-visible,\s*\.wbx-cases-action:focus-visible,\s*\.wbx-cases-empty button:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action,\s*\.wbx-case-service-cta \.wbx-cases-action\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action--primary,\s*\.wbx-case-service-cta \.wbx-cases-action--primary\s*\{[^}]*background:\s*var\(--wbx-accent\)/)
    expect(pageSource).toMatch(/<i\s+class="hn hn-check-circle-solid wbx-cases-category__indicator"\s+aria-hidden="true"\s*\/>/)
  })

  it('matches the reading guide outer baseline without adding horizontal gutter overrides', () => {
    const vitepressDoc = readFileSync('node_modules/vitepress/dist/client/theme-default/components/VPDoc.vue', 'utf8')
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const serviceStyles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')
    const readingStyles = readFileSync('docs/.vitepress/theme/reading.css', 'utf8')

    expect(vitepressDoc).toMatch(/@media \(min-width: 960px\)\s*\{\s*\.VPDoc\s*\{\s*padding:\s*48px 32px 0/s)
    expect(vitepressDoc).toMatch(/@media \(min-width: 1440px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.VPDoc:not\(\.has-sidebar\) \.container\s*\{\s*max-width:\s*1104px/s)
    expect(readingStyles).not.toMatch(/\.wbx-reading-layout \.VPDoc[^{]*\{[^}]*padding(?:-inline|-left|-right):/s)
    expect(casesStyles).toMatch(/\.wbx-cases-layout \.VPDoc \.container\s*\{[^}]*max-width:\s*1104px/s)
    expect(serviceStyles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1104px/s)
  })

  it('matches the rendered reading-guide main and outline coordinates at 1440px', () => {
    const viewportWidth = 1440
    const navHeight = 64
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const appliedStyles = document.createElement('style')
    appliedStyles.textContent = [
      componentStyles(vpContentSource).replaceAll('var(--vp-sidebar-width)', '272px'),
      componentStyles(vpDocSource)
        .replaceAll('var(--vp-nav-height)', `${navHeight}px`)
        .replaceAll('var(--vp-layout-top-height, 0px)', '0px')
        .replaceAll('var(--vp-doc-top-height, 0px)', '0px'),
      casesStyles.replaceAll('var(--vp-nav-height)', `${navHeight}px`),
    ].map((styles) => flattenStylesAtViewport(styles, viewportWidth)).join('\n')
    document.head.append(appliedStyles)

    const fixture = document.createElement('div')
    fixture.innerHTML = `
      <div class="guide">
        <div class="VPContent">
          <div class="VPDoc has-aside">
            <div class="container">
              <div class="aside"><div class="aside-container"></div></div>
              <div class="content"><div class="content-container"><h1>阅读指南</h1></div></div>
            </div>
          </div>
        </div>
      </div>
      <div class="wbx-cases-layout">
        <div class="VPContent has-sidebar">
          <div class="VPDoc has-sidebar">
            <div class="container">
              <div class="content"><div class="content-container">
                <section class="wbx-cases wbx-cases-shell">
                  <div class="wbx-cases-main">
                    <header class="wbx-cases-header"><div>
                      <p class="wbx-cases-eyebrow wbx-cases-header__eyebrow">WORKBUDDY COMMUNITY</p>
                      <h1>案例集</h1><p>案例正文</p>
                    </div></header>
                  </div>
                  <aside class="wbx-cases-outline"></aside>
                </section>
              </div></div>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.append(fixture)

    try {
      const guideDoc = getComputedStyle(fixture.querySelector('.guide .VPDoc')!)
      const guideContainer = getComputedStyle(fixture.querySelector('.guide .container')!)
      const guideContent = getComputedStyle(fixture.querySelector('.guide .content')!)
      const guideContentContainer = getComputedStyle(fixture.querySelector('.guide .content-container')!)
      const guideAside = getComputedStyle(fixture.querySelector('.guide .aside')!)
      const guideAsideContainer = getComputedStyle(fixture.querySelector('.guide .aside-container')!)

      const guideDocInnerWidth = paddingBoxWidth(viewportWidth, guideDoc)
      const guideContainerWidth = usedBlockWidth(guideDocInnerWidth, guideContainer)
      const guideContainerLeft = px(guideDoc.paddingLeft)
        + inlineStartOffset(guideDocInnerWidth, guideContainerWidth, guideContainer)
      const guideContentWidth = usedBlockWidth(guideContainerWidth, guideContent)
      const guideAsideWidth = usedBlockWidth(guideContainerWidth, guideAside)
      const guideColumnsWidth = guideContentWidth + guideAsideWidth
      const guideContentLeft = centeredChildLeft(
        guideContainerLeft,
        guideContainerWidth,
        guideColumnsWidth,
      )
      const guideContentInnerWidth = paddingBoxWidth(guideContentWidth, guideContent)
      const guideContentContainerWidth = usedBlockWidth(
        guideContentInnerWidth,
        guideContentContainer,
      )
      const guideMainLeft = guideContentLeft
        + px(guideContent.paddingLeft)
        + inlineStartOffset(
          guideContentInnerWidth,
          guideContentContainerWidth,
          guideContentContainer,
        )
      const guideOutlineLeft = guideContentLeft
        + guideContentWidth
        + px(guideAside.paddingLeft)
      const guideH1Top = navHeight + px(guideDoc.paddingTop)
      const guideOutlineTop = px(guideAsideContainer.paddingTop)

      const caseVpContent = getComputedStyle(fixture.querySelector('.wbx-cases-layout .VPContent')!)
      const caseDoc = getComputedStyle(fixture.querySelector('.wbx-cases-layout .VPDoc')!)
      const caseContainer = getComputedStyle(fixture.querySelector('.wbx-cases-layout .container')!)
      const caseContent = getComputedStyle(fixture.querySelector('.wbx-cases-layout .content')!)
      const caseContentContainer = getComputedStyle(fixture.querySelector('.wbx-cases-layout .content-container')!)
      const caseShell = getComputedStyle(fixture.querySelector('.wbx-cases-shell')!)
      const caseMain = getComputedStyle(fixture.querySelector('.wbx-cases-main')!)
      const caseHeader = getComputedStyle(fixture.querySelector('.wbx-cases-header')!)
      const caseEyebrow = getComputedStyle(fixture.querySelector('.wbx-cases-eyebrow')!)
      const caseOutline = getComputedStyle(fixture.querySelector('.wbx-cases-outline')!)

      const caseVpContentWidth = paddingBoxWidth(viewportWidth, caseVpContent)
      const caseDocWidth = usedBlockWidth(caseVpContentWidth, caseDoc)
      const caseDocInnerWidth = paddingBoxWidth(caseDocWidth, caseDoc)
      const caseContainerWidth = usedBlockWidth(caseDocInnerWidth, caseContainer)
      const caseContainerLeft = px(caseVpContent.paddingLeft)
        + px(caseDoc.paddingLeft)
        + inlineStartOffset(caseDocInnerWidth, caseContainerWidth, caseContainer)
      const caseContentWidth = usedBlockWidth(caseContainerWidth, caseContent)
      const caseContentLeft = caseContainerLeft
        + inlineStartOffset(caseContainerWidth, caseContentWidth, caseContent)
      const caseContentInnerWidth = paddingBoxWidth(caseContentWidth, caseContent)
      const caseContentContainerWidth = usedBlockWidth(caseContentInnerWidth, caseContentContainer)
      const caseShellWidth = usedBlockWidth(caseContentContainerWidth, caseShell)
      const caseShellLeft = caseContentLeft
        + px(caseContent.paddingLeft)
        + inlineStartOffset(
          caseContentInnerWidth,
          caseContentContainerWidth,
          caseContentContainer,
        )
        + inlineStartOffset(caseContentContainerWidth, caseShellWidth, caseShell)
      const caseOutlineTrack = finalGridTrackWidth(caseShell.gridTemplateColumns, caseShellWidth)
      const caseGap = px(caseShell.columnGap || caseShell.gap)
      const caseMainTrack = caseShellWidth - caseGap - caseOutlineTrack
      const caseMainLeft = caseShellLeft + px(caseMain.paddingLeft)
      const caseOutlineLeft = caseShellLeft
        + caseMainTrack
        + caseGap
        + px(caseOutline.marginLeft)
      const caseShellTop = navHeight + px(caseDoc.paddingTop) + px(caseShell.paddingTop)
      const caseH1Top = caseShellTop
        + px(caseHeader.paddingTop)
        + (caseEyebrow.position === 'absolute'
          ? 0
          : usedLineHeight(caseEyebrow) + px(caseEyebrow.marginBottom))
      const caseOutlineTop = px(caseOutline.top)

      expect(caseMainTrack + caseGap + caseOutlineTrack).toBeCloseTo(
        caseShellWidth,
        5,
      )
      expect(Math.abs(caseMainLeft - guideMainLeft)).toBeLessThanOrEqual(1)
      expect(Math.abs(caseH1Top - guideH1Top)).toBeLessThanOrEqual(1)
      expect(Math.abs(caseOutlineLeft - guideOutlineLeft)).toBeLessThanOrEqual(1)
      expect(Math.abs(caseOutlineTop - guideOutlineTop)).toBeLessThanOrEqual(1)

      const mutation = document.createElement('style')
      mutation.textContent = `
        .wbx-cases-layout .wbx-cases-shell { margin-top: 8px; }
        .wbx-cases-layout .wbx-cases-main { padding-left: 56px; }
      `
      document.head.append(mutation)
      const mutatedShell = getComputedStyle(fixture.querySelector('.wbx-cases-shell')!)
      const mutatedMain = getComputedStyle(fixture.querySelector('.wbx-cases-main')!)
      const mutatedMainLeft = caseShellLeft + px(mutatedMain.paddingLeft)
      const mutatedH1Top = caseH1Top + px(mutatedShell.marginTop)

      expect(Math.abs(mutatedMainLeft - guideMainLeft)).toBeGreaterThan(1)
      expect(Math.abs(mutatedH1Top - guideH1Top)).toBeGreaterThan(1)
      mutation.remove()
    } finally {
      fixture.remove()
      appliedStyles.remove()
    }
  })

  it.each([
    { viewportWidth: 900, expectedPaddingTop: '4px' },
    { viewportWidth: 390, expectedPaddingTop: '4px' },
  ])(
    'keeps the guide content baseline at $viewportWidth px',
    ({ viewportWidth, expectedPaddingTop }) => {
      const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
      const appliedStyles = document.createElement('style')
      appliedStyles.textContent = [
        componentStyles(vpDocSource),
        casesStyles,
      ].map((styles) => flattenStylesAtViewport(styles, viewportWidth)).join('\n')
      document.head.append(appliedStyles)

      const fixture = document.createElement('div')
      fixture.className = 'wbx-cases-layout'
      fixture.innerHTML = `
        <div class="VPDoc has-sidebar"><div class="container"><div class="content">
          <div class="content-container"><section class="wbx-cases wbx-cases-shell">
            <div class="wbx-cases-main"><header class="wbx-cases-header"><h1>案例集</h1></header></div>
          </section></div>
        </div></div></div>
      `
      document.body.append(fixture)

      try {
        const contentContainer = getComputedStyle(fixture.querySelector('.content-container')!)
        const cases = getComputedStyle(fixture.querySelector('.wbx-cases')!)

        expect(contentContainer.maxWidth).toBe('688px')
        expect(contentContainer.marginLeft).toBe('auto')
        expect(contentContainer.marginRight).toBe('auto')
        expect(cases.paddingTop).toBe(expectedPaddingTop)
      } finally {
        fixture.remove()
        appliedStyles.remove()
      }
    },
  )

  it('releases the VitePress sidebar slot and keeps cards readable at 974px', () => {
    const viewportWidth = 974
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const appliedStyles = document.createElement('style')
    appliedStyles.textContent = [
      componentStyles(vpContentSource).replaceAll('var(--vp-sidebar-width)', '272px'),
      componentStyles(vpDocSource),
      casesStyles,
    ].map((styles) => flattenStylesAtViewport(styles, viewportWidth)).join('\n')
    document.head.append(appliedStyles)

    const fixture = document.createElement('div')
    fixture.className = 'wbx-cases-layout'
    fixture.innerHTML = `
      <div class="VPContent has-sidebar">
        <div class="VPDoc has-sidebar">
          <div class="container">
            <div class="content">
              <div class="content-container">
                <section class="wbx-cases wbx-cases-shell">
                  <div class="wbx-cases-main">
                    <ul class="wbx-cases-grid"><li class="wbx-case-card"></li></ul>
                  </div>
                  <aside class="wbx-cases-outline"></aside>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
    document.body.append(fixture)

    const vpContent = fixture.querySelector<HTMLElement>('.VPContent')!
    const doc = fixture.querySelector<HTMLElement>('.VPDoc')!
    const container = fixture.querySelector<HTMLElement>('.container')!
    const content = fixture.querySelector<HTMLElement>('.content')!
    const contentContainer = fixture.querySelector<HTMLElement>('.content-container')!
    const shell = fixture.querySelector<HTMLElement>('.wbx-cases-shell')!
    const grid = fixture.querySelector<HTMLElement>('.wbx-cases-grid')!
    const outline = fixture.querySelector<HTMLElement>('.wbx-cases-outline')!
    const vpContentStyle = getComputedStyle(vpContent)
    const docStyle = getComputedStyle(doc)
    const containerStyle = getComputedStyle(container)
    const contentStyle = getComputedStyle(content)
    const contentContainerStyle = getComputedStyle(contentContainer)
    const shellStyle = getComputedStyle(shell)
    const gridStyle = getComputedStyle(grid)
    const outlineStyle = getComputedStyle(outline)

    try {
      expect(vpContentStyle.paddingLeft).toBe('0px')
      expect(vpContentStyle.paddingRight).toBe('0px')
      expect(contentStyle.paddingLeft).toBe('32px')
      expect(contentStyle.paddingRight).toBe('32px')
      expect(outlineStyle.display).toBe('none')
      expect(shellStyle.gridTemplateColumns).toBe('minmax(0, 1fr)')
      expect(gridStyle.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))')

      const vpContentWidth = usedBlockWidth(viewportWidth, vpContentStyle)
      const vpContentLeft = inlineStartOffset(viewportWidth, vpContentWidth, vpContentStyle)
      const vpContentInnerWidth = vpContentWidth
        - px(vpContentStyle.paddingLeft)
        - px(vpContentStyle.paddingRight)
      const docWidth = usedBlockWidth(vpContentInnerWidth, docStyle)
      const docLeft = inlineStartOffset(vpContentInnerWidth, docWidth, docStyle)
      const docInnerWidth = docWidth
        - px(docStyle.paddingLeft)
        - px(docStyle.paddingRight)
      const containerWidth = usedBlockWidth(docInnerWidth, containerStyle)
      const containerLeft = inlineStartOffset(docInnerWidth, containerWidth, containerStyle)
      const contentWidth = usedBlockWidth(containerWidth, contentStyle)
      const contentLeft = inlineStartOffset(containerWidth, contentWidth, contentStyle)
      const contentInnerWidth = contentWidth
        - px(contentStyle.paddingLeft)
        - px(contentStyle.paddingRight)
      const contentContainerWidth = usedBlockWidth(contentInnerWidth, contentContainerStyle)
      const contentContainerLeft = inlineStartOffset(
        contentInnerWidth,
        contentContainerWidth,
        contentContainerStyle,
      )
      const shellWidth = usedBlockWidth(contentContainerWidth, shellStyle)
      const shellOffset = inlineStartOffset(contentContainerWidth, shellWidth, shellStyle)
      const shellLeft = vpContentLeft
        + px(vpContentStyle.paddingLeft)
        + docLeft
        + px(docStyle.paddingLeft)
        + containerLeft
        + contentLeft
        + px(contentStyle.paddingLeft)
        + contentContainerLeft
        + shellOffset
      const cardWidth = (shellWidth - px(gridStyle.gap)) / 2
      const expectedShellWidth = viewportWidth
        - px(vpContentStyle.paddingLeft)
        - px(vpContentStyle.paddingRight)
        - px(docStyle.paddingLeft)
        - px(docStyle.paddingRight)
        - px(contentStyle.paddingLeft)
        - px(contentStyle.paddingRight)

      expect(contentWidth).toBe(containerWidth)
      expect(contentContainerWidth).toBe(688)
      expect(shellWidth).toBe(contentContainerWidth)
      expect(shellWidth).toBeLessThan(expectedShellWidth)
      expect(shellLeft).toBeGreaterThan(
        px(docStyle.paddingLeft) + px(contentStyle.paddingLeft),
      )
      expect(cardWidth).toBeGreaterThanOrEqual(300)
    } finally {
      fixture.remove()
      appliedStyles.remove()
    }
  })

  it('contains the case submission actions within the shared page width', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*flex:\s*0 1 412px/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*width:\s*100%/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*max-width:\s*412px/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*min-width:\s*0/s)
  })
})
