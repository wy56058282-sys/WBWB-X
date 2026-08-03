# Reference Title, Cases Sidebar, and Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the approved reference-site documentation title and cases-sidebar presentation, remove the global edit-page footer link, and preserve Git-derived last-updated timestamps.

**Architecture:** Keep typography in the existing theme stylesheet, keep case discovery in the focused `case-sidebar.ts` generator, and change footer behavior only at the VitePress configuration source. Each behavior receives a focused regression test before its implementation, followed by full build and browser verification.

**Tech Stack:** VitePress 1.6, Vue 3, TypeScript, CSS, Vitest 2, GitHub Pages

## Global Constraints

- Apply the documentation H1 system only to small-book pages, the reading guide, the cases index, and case detail pages.
- Preserve independent homepage and `/help/` hero-title styles.
- Desktop H1 values are `51.2px` font size, `850` weight, `58.88px` line height, `-2.816px` letter spacing, and `34px` bottom margin using `--wbx-body`.
- Preserve existing body, H2/H3, navigation, and sidebar typography and spacing.
- Preserve generated case entries and date-descending ordering.
- Remove `themeConfig.editLink` while keeping `lastUpdated: true`.
- Do not include unrelated changes from other local branches.

---

### Task 1: Documentation H1 Typography

**Files:**
- Modify: `docs/.vitepress/theme/custom.css`
- Create: `tests/document-title-style.test.ts`

**Interfaces:**
- Consumes: Existing `--wbx-body` theme token and VitePress `.VPDoc .vp-doc` document structure.
- Produces: A scoped `.VPDoc .vp-doc > div > h1` title contract with desktop, tablet, and mobile values.

- [ ] **Step 1: Write the failing title-style test**

Create `tests/document-title-style.test.ts`:

```ts
// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { beforeEach, describe, expect, it } from 'vitest'

const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

beforeEach(() => {
  document.head.innerHTML = `<style>${css}</style>`
  document.body.innerHTML = ''
})

describe('documentation title typography', () => {
  it('applies the approved reference values to document H1 headings', () => {
    document.body.innerHTML = '<main class="VPDoc"><div class="vp-doc"><div><h1>第 1 章 初识 WorkBuddy</h1></div></div></main>'
    const title = document.querySelector('h1') as HTMLElement
    const style = getComputedStyle(title)

    expect(style.fontSize).toBe('51.2px')
    expect(style.fontWeight).toBe('850')
    expect(style.lineHeight).toBe('58.88px')
    expect(style.letterSpacing).toBe('-2.816px')
    expect(style.marginBottom).toBe('34px')
  })

  it('does not apply document title values to homepage or help heroes', () => {
    document.body.innerHTML = '<section class="wbx-hero__copy"><h1>首页</h1></section><section class="help-hero"><h1>提需求</h1></section>'
    const titles = Array.from(document.querySelectorAll('h1')) as HTMLElement[]

    for (const title of titles) {
      expect(getComputedStyle(title).fontSize).not.toBe('51.2px')
      expect(getComputedStyle(title).fontWeight).not.toBe('850')
    }
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/document-title-style.test.ts
```

Expected: FAIL because `custom.css` does not contain the scoped documentation H1 rules.

- [ ] **Step 3: Add the minimal scoped CSS**

Add to `docs/.vitepress/theme/custom.css` after the base `body` rule:

```css
.VPDoc .vp-doc > div > h1 {
  margin: 0 0 34px;
  font-family: var(--wbx-body);
  font-size: 51.2px;
  font-weight: 850;
  line-height: 58.88px;
  letter-spacing: -2.816px;
}

@media (max-width: 959px) {
  .VPDoc .vp-doc > div > h1 {
    font-size: 44px;
    line-height: 52.8px;
    letter-spacing: -2.2px;
  }
}

@media (max-width: 640px) {
  .VPDoc .vp-doc > div > h1 {
    margin-bottom: 26px;
    font-size: 36px;
    line-height: 43.2px;
    letter-spacing: -1.44px;
  }
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/document-title-style.test.ts
```

Expected: 1 test file passes with 2 passing tests. Tablet and mobile declarations are verified through their rendered computed values in Task 4 rather than by grepping CSS source.

- [ ] **Step 5: Commit the title task**

```bash
git add docs/.vitepress/theme/custom.css tests/document-title-style.test.ts
git commit -m "style: align documentation title typography"
```

---

### Task 2: Reference-Structured Generated Cases Sidebar

**Files:**
- Modify: `docs/.vitepress/case-sidebar.ts`
- Modify: `tests/case-sidebar.test.ts`

**Interfaces:**
- Consumes: `discoverCaseSidebar(casesRoot: string): DefaultTheme.SidebarItem[]` and case frontmatter fields `title` and `date`.
- Produces: Two fixed sidebar links followed by a generated `社区 Case` group, with generated items sorted newest-first.

- [ ] **Step 1: Change the fixture expectation to the approved structure**

Update the exact expected array in `tests/case-sidebar.test.ts`:

```ts
expect(discoverCaseSidebar(root)).toEqual([
  { text: '案例集首页', link: '/cases/' },
  { text: '如何提交 Case', link: '/community/case-contributing' },
  {
    text: '社区 Case',
    items: [
      { text: '较新案例', link: '/cases/submissions/newer/' },
      { text: '较早案例', link: '/cases/submissions/older/' },
    ],
  },
])
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/case-sidebar.test.ts
```

Expected: FAIL showing the old `案例集总览` and `社区案例` structure and the missing submission-guide link.

- [ ] **Step 3: Update the sidebar generator's returned structure**

Replace only the return array in `discoverCaseSidebar`:

```ts
return [
  { text: '案例集首页', link: '/cases/' },
  { text: '如何提交 Case', link: '/community/case-contributing' },
  {
    text: '社区 Case',
    items: cases.map(({ route, title }) => ({ text: title, link: route })),
  },
]
```

Do not change discovery, validation, or sorting.

- [ ] **Step 4: Run sidebar and navigation tests and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/case-sidebar.test.ts tests/navigation.test.ts
```

Expected: 2 test files pass; the newest case remains first.

- [ ] **Step 5: Commit the sidebar task**

```bash
git add docs/.vitepress/case-sidebar.ts tests/case-sidebar.test.ts
git commit -m "refactor: align cases sidebar structure"
```

---

### Task 3: Remove Edit Link and Preserve Last Updated

**Files:**
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/navigation.test.ts`

**Interfaces:**
- Consumes: VitePress root option `lastUpdated` and `themeConfig.editLink`.
- Produces: No document edit-link action; Git-derived last-updated metadata remains enabled.

- [ ] **Step 1: Add a failing configuration contract test**

Append to the existing `site navigation` suite in `tests/navigation.test.ts`:

```ts
it('keeps Git-derived update times without exposing page edit links', () => {
  expect(config.lastUpdated).toBe(true)
  expect(config.themeConfig?.editLink).toBeUndefined()
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/navigation.test.ts
```

Expected: FAIL because `themeConfig.editLink` is still configured.

- [ ] **Step 3: Remove only the global edit-link configuration**

Delete this block from `docs/.vitepress/config.mts`:

```ts
editLink: {
  pattern: `${brand.repository}/edit/main/docs/:path`,
  text: '在 GitHub 上改进此页',
},
```

Keep the top-level `lastUpdated: true` line unchanged.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/navigation.test.ts
```

Expected: the navigation suite passes.

- [ ] **Step 5: Commit the footer task**

```bash
git add docs/.vitepress/config.mts tests/navigation.test.ts
git commit -m "fix: remove document edit links"
```

---

### Task 4: Full Regression and Production Verification

**Files:**
- Verify: `docs/.vitepress/dist/cases/index.html`
- Verify: built chapter HTML under `docs/.vitepress/dist/wb-x/`

**Interfaces:**
- Consumes: Outputs from Tasks 1–3.
- Produces: Verified production artifact and browser evidence ready for publication.

- [ ] **Step 1: Run the full unit and DOM test suite**

Run:

```bash
pnpm exec vitest run
```

Expected: all test files and tests pass with zero failures.

- [ ] **Step 2: Run content integrity checks**

Run:

```bash
pnpm run check:links
pnpm run check:assets
```

Expected: zero broken internal Markdown links and no missing or source-hotlinked replacement assets.

- [ ] **Step 3: Build the production site**

Run:

```bash
pnpm run build
```

Expected: VitePress completes client/server bundling and page rendering successfully.

- [ ] **Step 4: Inspect the built artifact contracts**

Run:

```bash
rg -n '案例集首页|如何提交 Case|社区 Case' docs/.vitepress/dist/cases/index.html
if rg -n 'edit-link-button' docs/.vitepress/dist; then exit 1; fi
```

Expected: the cases page contains all three sidebar labels and no built HTML contains the removed edit-link element. Searching for the visible copy is intentionally avoided because the design and plan documents discuss that copy as prose.

- [ ] **Step 5: Verify desktop and mobile behavior in a browser**

Start `pnpm preview`, then inspect:

- A small-book chapter at desktop width: computed H1 values equal `51.2px`, `850`, `58.88px`, and `-2.816px`.
- `/cases/` at desktop width: the fixed links and all generated cases are visible in the left sidebar.
- The same chapter at `390×844`: `scrollWidth === clientWidth`, the H1 is not clipped, and the computed font size is `36px`.
- `/help/` and `/`: their existing hero selectors and computed title styles remain unchanged.

- [ ] **Step 6: Review the final change scope**

Run:

```bash
git status --short
git diff --stat 251857e..HEAD
git diff --check 251857e..HEAD
```

Expected: only the design/plan documents, two theme/config files, one generator, and focused tests are changed; no whitespace errors.

- [ ] **Step 7: Publish and verify production**

After explicit publication approval, update GitHub `main`, wait for the Pages workflow to succeed, and verify `https://wbwbx.sparkx.zone/cases/` plus one `/wb-x/` chapter against the same DOM and computed-style contracts.
