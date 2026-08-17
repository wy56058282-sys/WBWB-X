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

    expect(source).toMatch(/\.wbx-cases-gallery-results \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/)
    expect(source).toMatch(/@media \(max-width:\s*1279px\)[\s\S]*?\.wbx-cases-gallery-results \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)/)
    expect(source).toMatch(/@media \(max-width:\s*640px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-gallery-results \.wbx-cases-grid\s*\{[^}]*grid-template-columns:\s*1fr/)
    expect(source).toMatch(/\.wbx-case-card__cover\s*\{[^}]*aspect-ratio:/)
    expect(source).toMatch(/\.wbx-cases-grid\s*>\s*\.wbx-case-card\s*\{[^}]*margin:\s*0/)
    expect(source).toMatch(/\.wbx-cases\s+\.wbx-cases-grid\s*\{[^}]*margin:\s*0;[^}]*padding:\s*0;[^}]*list-style:\s*none/)
    expect(source).toMatch(/\.wbx-case-card__title\s*\{[^}]*min-height:[^}]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-case-card__outcome\s*\{[^}]*-webkit-line-clamp:/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPSidebar\s*\{[^}]*display:\s*none/)
    expect(source).toMatch(/\.wbx-cases-layout\s+\.VPLocalNav\s*\{[^}]*display:\s*none/)
    expect(source).toMatch(/\.wbx-cases-layout \.VPContent\.has-sidebar\s*\{[^}]*padding-right:\s*0;[^}]*padding-left:\s*0;/s)
    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.content\s*\{[^}]*max-width:\s*none;/s)
    expect(source).toMatch(/@media \(min-width:\s*1025px\)[\s\S]*?\.wbx-cases-gallery-results\s*\{[^}]*min-height:\s*996px/)
  })

  it('places cases and tools in a responsive 3:1 layout with a sticky desktop sidebar', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')

    expect(pageSource).toContain('class="wbx-cases-layout-grid"')
    expect(pageSource).toContain('class="wbx-cases-main-column"')
    expect(pageSource).toContain('class="wbx-cases-tools-column"')
    expect(pageSource).toContain("'wbx-cases-tools-stack'")
    expect(pageSource).not.toContain('class="wbx-cases-outline"')
    expect(source).toMatch(/\.wbx-cases-layout-grid\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0, 3fr\) minmax\(240px, 1fr\)/s)
    expect(source).toMatch(/\.wbx-cases-tools-stack\.is-sticky\s*\{[^}]*position:\s*sticky[^}]*top:\s*var\(--wbx-cases-sticky-top\)/s)
    expect(source).toMatch(/\.wbx-cases-tools-column\s*\{[^}]*align-self:\s*stretch/s)
    expect(source).toMatch(/\.wbx-cases-tools-column\s*\{[^}]*margin-top:\s*26px/s)
    expect(source).toMatch(/\.wbx-cases-layout \.VPDocFooter\s*\{[^}]*display:\s*none/s)
    expect(source).not.toMatch(/\.wbx-cases-hero\s*\{[^}]*border-bottom:/s)
    expect(source).toMatch(/\.wbx-cases-main-column\s*\{[^}]*display:\s*flex[^}]*flex-direction:\s*column/s)
    expect(source).not.toMatch(/\.wbx-cases-main-column\s*\{[^}]*display:\s*contents/s)
    expect(source).not.toContain('.wbx-cases-header__eyebrow')
    expect(source).toMatch(/\.wbx-cases-main-column > \.wbx-cases-categories\s*\{[^}]*margin:\s*-8px 0 24px/s)
    expect(source).toMatch(/\.wbx-cases-tools-stack > \.wbx-cases-search\s*\{[^}]*width:\s*100%[^}]*max-width:\s*none/s)
    expect(source).not.toMatch(/\.wbx-cases-filter-toolbar\s*\{[^}]*grid-column:\s*1\s*\/\s*-1/s)
    expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-layout-grid,\s*\.wbx-cases-main-column,\s*\.wbx-cases-tools-column,\s*\.wbx-cases-tools-stack\s*\{[^}]*display:\s*contents/s)
    expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-search\s*\{[^}]*order:\s*2[^}]*width:\s*100%/s)
    expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-tools-column\s*\{[^}]*margin-top:\s*0/s)
    expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-main-column > \.wbx-cases-categories\s*\{[^}]*order:\s*3/s)
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
      '<span class="wbx-cases-brand">WorkBuddy-X</span><span class="wbx-cases-title-line">案例集</span>',
    )
    expect(pageSource).not.toContain('wbx-cases-header__eyebrow')
    expect(pageSource).not.toContain('CONTRIBUTE A CASE')
    expect(styles).toMatch(
      /\.wbx-cases-brand\s*\{[^}]*font-weight:\s*850;/s,
    )
    expect(styles).toMatch(/\.wbx-cases-title-line\s*\{[^}]*display:\s*block/s)
  })

  it('removes the page eyebrow and excludes remaining labels from body copy', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')

    expect(source).toMatch(/\.wbx-cases-submit p:not\(\.wbx-cases-eyebrow\)/)
    expect(pageSource).not.toContain('wbx-cases-header__eyebrow')
  })

  it('keeps the shared content width and square category controls', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')

    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.container\s*\{[^}]*max-width:\s*1104px/s)
    expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.content-container\s*\{[^}]*max-width:\s*688px/s)
    expect(source).toMatch(/@media \(min-width:\s*1025px\)\s*\{(?:[^{}]|\{[^{}]*\})*?\.wbx-cases-layout \.VPDoc \.content-container\s*\{[^}]*max-width:\s*none/s)
    expect(source).not.toMatch(/\.wbx-cases-layout \.VPDoc[^{]*\{[^}]*padding(?:-inline|-left|-right):/s)
    expect(source).toMatch(/\.wbx-cases h1\s*\{[^}]*font-weight:\s*850[^}]*line-height:\s*58\.88px[^}]*letter-spacing:\s*0/s)
    expect(source).toMatch(/\.wbx-cases-categories button,\s*\.wbx-cases-empty button\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(source).toMatch(/\.wbx-cases-categories button:hover,\s*\.wbx-cases-categories button\[aria-pressed="true"\],\s*\.wbx-cases-empty button:hover\s*\{[^}]*color:\s*#0d100d[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action:hover,\s*\.wbx-cases \.wbx-cases-action:focus-visible\s*\{[^}]*color:\s*#0d100d[^}]*background:\s*var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases-categories button:focus-visible,\s*\.wbx-case-card__link:focus-visible,\s*\.wbx-cases-action:focus-visible,\s*\.wbx-cases-empty button:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--wbx-accent\)/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action,\s*\.wbx-case-service-cta \.wbx-cases-action\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
    expect(source).toMatch(/\.wbx-cases \.wbx-cases-action--primary,\s*\.wbx-case-service-cta \.wbx-cases-action--primary\s*\{[^}]*background:\s*var\(--wbx-accent\)/)
    expect(pageSource).toMatch(/const categoryIcons:[\s\S]*'全部':\s*'hn-grid-solid'[\s\S]*'内容创作':\s*'hn-pen-nib-solid'[\s\S]*'数据分析':\s*'hn-analytics-solid'[\s\S]*'知识管理':\s*'hn-book-bookmark-solid'[\s\S]*'自动化':\s*'hn-robot-solid'/)
    expect(pageSource).toMatch(/:class="\[\s*'hn',\s*category === item \? 'hn-check-circle-solid' : categoryIcons\[item\],\s*'wbx-cases-category__indicator',\s*\]"/s)

    const iconFont = readFileSync('node_modules/@hackernoon/pixel-icon-library/fonts/iconfont.css', 'utf8')
    for (const icon of [
      'hn-grid-solid',
      'hn-pen-nib-solid',
      'hn-analytics-solid',
      'hn-book-bookmark-solid',
      'hn-robot-solid',
      'hn-check-circle-solid',
    ]) {
      expect(iconFont).toMatch(new RegExp(`\\.${icon}:before\\s*\\{[^}]*content:`, 's'))
    }
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
    expect(serviceStyles).not.toMatch(/\.custom-service-page \.VP(?:Content|Doc)[^{]*\{[^}]*padding(?:-inline|-left|-right):/s)
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
          <div class="content-container"><section class="wbx-cases">
            <header class="wbx-cases-hero"><div class="wbx-cases-hero__copy"><h1>案例集</h1></div></header>
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
                <section class="wbx-cases">
                  <div class="wbx-cases-layout-grid"><main class="wbx-cases-main-column"><header class="wbx-cases-hero"><div class="wbx-cases-hero__copy"></div></header>
                  <section class="wbx-cases-gallery-results"><ul class="wbx-cases-grid"><li class="wbx-case-card"></li></ul></section></main><aside class="wbx-cases-tools-column"><section class="wbx-cases-filter-panel"></section></aside></div>
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
    const hero = fixture.querySelector<HTMLElement>('.wbx-cases-hero')!
    const grid = fixture.querySelector<HTMLElement>('.wbx-cases-grid')!
    const vpContentStyle = getComputedStyle(vpContent)
    const docStyle = getComputedStyle(doc)
    const containerStyle = getComputedStyle(container)
    const contentStyle = getComputedStyle(content)
    const contentContainerStyle = getComputedStyle(contentContainer)
    const heroStyle = getComputedStyle(hero)
    const gridStyle = getComputedStyle(grid)

    try {
      expect(vpContentStyle.paddingLeft).toBe('0px')
      expect(vpContentStyle.paddingRight).toBe('0px')
      expect(contentStyle.paddingLeft).toBe('32px')
      expect(contentStyle.paddingRight).toBe('32px')
      expect(heroStyle.display).not.toBe('grid')
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
      const heroWidth = usedBlockWidth(contentContainerWidth, heroStyle)
      const heroOffset = inlineStartOffset(contentContainerWidth, heroWidth, heroStyle)
      const heroLeft = vpContentLeft
        + px(vpContentStyle.paddingLeft)
        + docLeft
        + px(docStyle.paddingLeft)
        + containerLeft
        + contentLeft
        + px(contentStyle.paddingLeft)
        + contentContainerLeft
        + heroOffset
      const cardWidth = (heroWidth - px(gridStyle.gap)) / 2
      const expectedShellWidth = viewportWidth
        - px(vpContentStyle.paddingLeft)
        - px(vpContentStyle.paddingRight)
        - px(docStyle.paddingLeft)
        - px(docStyle.paddingRight)
        - px(contentStyle.paddingLeft)
        - px(contentStyle.paddingRight)

      expect(contentWidth).toBe(containerWidth)
      expect(contentContainerWidth).toBe(688)
      expect(heroWidth).toBe(contentContainerWidth)
      expect(heroWidth).toBeLessThan(expectedShellWidth)
      expect(heroLeft).toBeGreaterThan(
        px(docStyle.paddingLeft) + px(contentStyle.paddingLeft),
      )
      expect(cardWidth).toBeGreaterThanOrEqual(300)
    } finally {
      fixture.remove()
      appliedStyles.remove()
    }
  })

  it.each([
    { viewportWidth: 1025, columns: 'repeat(2, minmax(0, 1fr))' },
    { viewportWidth: 1100, columns: 'repeat(2, minmax(0, 1fr))' },
    { viewportWidth: 1201, columns: 'repeat(2, minmax(0, 1fr))' },
    { viewportWidth: 1279, columns: 'repeat(2, minmax(0, 1fr))' },
    { viewportWidth: 1280, columns: 'repeat(3, minmax(0, 1fr))' },
  ])('uses $columns case cards at $viewportWidth px', ({ viewportWidth, columns }) => {
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const appliedStyles = document.createElement('style')
    appliedStyles.textContent = flattenStylesAtViewport(casesStyles, viewportWidth)
    document.head.append(appliedStyles)

    const fixture = document.createElement('section')
    fixture.className = 'wbx-cases'
    fixture.innerHTML = '<section class="wbx-cases-gallery-results"><ul class="wbx-cases-grid"><li class="wbx-case-card"></li></ul></section>'
    document.body.append(fixture)

    try {
      expect(getComputedStyle(fixture.querySelector('.wbx-cases-grid')!).gridTemplateColumns)
        .toBe(columns)
    } finally {
      fixture.remove()
      appliedStyles.remove()
    }
  })

  it.each([1201, 1279])('keeps two-column case cards readable at %ipx', (viewportWidth) => {
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const appliedStyles = document.createElement('style')
    appliedStyles.textContent = flattenStylesAtViewport(casesStyles, viewportWidth)
    document.head.append(appliedStyles)

    const fixture = document.createElement('section')
    fixture.className = 'wbx-cases'
    fixture.innerHTML = '<section class="wbx-cases-gallery-results"><ul class="wbx-cases-grid"><li class="wbx-case-card"></li></ul></section>'
    document.body.append(fixture)

    try {
      const grid = fixture.querySelector<HTMLElement>('.wbx-cases-grid')!
      const gridStyle = getComputedStyle(grid)
      const cardWidth = (688 - px(gridStyle.gap)) / 2

      expect(gridStyle.gridTemplateColumns).toBe('repeat(2, minmax(0, 1fr))')
      expect(cardWidth).toBeGreaterThanOrEqual(300)
    } finally {
      fixture.remove()
      appliedStyles.remove()
    }
  })

  it.each([900, 1024])('expands the single-column search to its filter panel at %ipx', (viewportWidth) => {
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const appliedStyles = document.createElement('style')
    appliedStyles.textContent = flattenStylesAtViewport(casesStyles, viewportWidth)
    document.head.append(appliedStyles)

    const fixture = document.createElement('section')
    fixture.className = 'wbx-cases'
    fixture.innerHTML = '<header class="wbx-cases-hero"><section class="wbx-cases-filter-panel"><div class="wbx-cases-filter-panel__heading"><h2>浏览案例</h2></div><div class="wbx-cases-filter-panel__controls"><label class="wbx-cases-search"><input type="search"></label><div class="wbx-cases-categories"></div></div></section></header>'
    document.body.append(fixture)

    try {
      expect(getComputedStyle(fixture.querySelector('.wbx-cases-search')!).width).toBe('100%')
    } finally {
      fixture.remove()
      appliedStyles.remove()
    }
  })

  it('keeps the mobile search visually separated from the category filters', () => {
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const appliedStyles = document.createElement('style')
    appliedStyles.textContent = flattenStylesAtViewport(casesStyles, 390)
    document.head.append(appliedStyles)

    const fixture = document.createElement('section')
    fixture.className = 'wbx-cases'
    fixture.innerHTML = '<label class="wbx-cases-search"><input type="search"></label><div class="wbx-cases-categories"><button type="button">全部</button></div>'
    document.body.append(fixture)

    try {
      const searchStyles = getComputedStyle(fixture.querySelector('.wbx-cases-search')!)
      expect(px(searchStyles.marginBottom)).toBeGreaterThanOrEqual(16)
    } finally {
      fixture.remove()
      appliedStyles.remove()
    }
  })

  it('does not restore a positioned page eyebrow above the title', () => {
    const casesStyles = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')
    const pageSource = readFileSync('docs/.vitepress/theme/CasesPage.vue', 'utf8')
    expect(casesStyles).toMatch(/\.wbx-cases-hero__copy\s*\{[^}]*position:\s*relative/s)
    expect(casesStyles).not.toContain('.wbx-cases-header__eyebrow')
    expect(pageSource).not.toContain('wbx-cases-header__eyebrow')
  })

  it('contains the case submission actions within the sticky tool column', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).toMatch(/\.wbx-cases-submit\s*\{[^}]*align-items:\s*flex-start/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*align-items:\s*flex-start/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*width:\s*100%/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*max-width:\s*100%/s)
    expect(source).toMatch(/\.wbx-cases-submit__actions\s*\{[^}]*min-width:\s*0/s)
  })

  it('does not carry a case-only navigation geometry patch', () => {
    const source = readFileSync('docs/.vitepress/theme/cases.css', 'utf8')

    expect(source).not.toContain('.wbx-cases-layout .VPNavBar.has-sidebar')
  })
})
