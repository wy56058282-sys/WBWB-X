# Cases And Service Guide Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align `/cases/` and `/help/` with the reading guide's width and vertical rhythm, add a guide-style right-hand contents rail to the case gallery, and remove duplicated service-page list markers and dividers.

**Architecture:** Keep the case gallery as a Vue application and render its two-item contents rail inside `CasesPage.vue`, because headings rendered by the component are not available to VitePress's Markdown outline generator. Use page-owned CSS to reproduce the guide outline geometry and responsive behavior; keep the service page structure intact and only adjust spacing, typography, list reset, and section dividers.

**Tech Stack:** Vue 3, VitePress 1.6, CSS custom properties, Humanicons pixel icon font, Vitest, jsdom.

## Global Constraints

- Preserve all case search, filtering, empty state, submission, service pricing, payment readiness, links, and business copy.
- `/cases/`, `/help/`, and `/reading-guide` share the same visual outer-width and gutter baseline.
- The case contents rail contains exactly `浏览案例` and `提交案例`, pointing to the existing fragment IDs.
- The case header must not retain a duplicate horizontal navigation.
- The right contents rail is visible on desktop, sticky without covering content, and hidden when the layout becomes compact.
- Case cards remain `3 / 2 / 1` columns according to available main-column width.
- Service headings at the same hierarchy use the reading guide's weight and spacing.
- The suitable-problems list shows the registered pixel icon only, with no native marker or duplicate indentation.
- Remove repeated full-width service section dividers while retaining necessary internal row separators.
- No dependencies, content deletion, or changes to homepage structure.

---

### Task 1: Lock Guide Layout And Rhythm Contracts

**Files:**
- Modify: `tests/case-page-style.test.ts`
- Modify: `tests/cases-page.test.ts`
- Modify: `tests/service-page-style.test.ts`
- Modify: `tests/service-page.test.ts`

**Interfaces:**
- Consumes: current selectors and component markup in `CasesPage.vue`, `ServicePage.vue`, `cases.css`, and `service.css`.
- Produces: failing contracts for the case contents rail, shared geometry, service list reset, title weights, spacing, and divider removal.

- [ ] **Step 1: Add case rail behavior and markup assertions**

Assert that `CasesPage.vue` renders a dedicated navigation with both existing fragment links and no `.wbx-cases-header__links` duplicate:

```ts
expect(document.querySelector('.wbx-cases-outline')?.getAttribute('aria-label')).toBe('案例集页内目录')
expect(Array.from(document.querySelectorAll('.wbx-cases-outline a')).map((item) => item.getAttribute('href')))
  .toEqual(['#case-gallery', '#submit-case'])
expect(document.querySelector('.wbx-cases-header__links')).toBeNull()
```

- [ ] **Step 2: Add case geometry and responsive assertions**

Require a two-column shell, a sticky right rail, a compact breakpoint that hides it, and explicit `3 / 2 / 1` card breakpoints scoped to the available main column. Also require the case outer container to match the guide baseline instead of clearing VitePress sidebar gutters ad hoc.

- [ ] **Step 3: Add service rhythm and list-reset assertions**

Require `.wbx-service-checklist` to use `list-style: none`, require list items to suppress markers, and bind the valid `hn-check-box-solid` icon to each row. Require same-level H2 weight, guide-like section padding, no `border-bottom` on `.wbx-service-section`, and no top/bottom border around `.wbx-service-exclusions`.

- [ ] **Step 4: Run focused tests to confirm a meaningful red state**

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/cases-page.test.ts tests/service-page-style.test.ts tests/service-page.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'
```

Expected: FAIL only on the new guide-layout and service-rhythm contracts.

- [ ] **Step 5: Commit the failing contracts**

```bash
git add tests/case-page-style.test.ts tests/cases-page.test.ts tests/service-page-style.test.ts tests/service-page.test.ts
git commit -m "锁定指南式页面布局合同"
```

---

### Task 2: Implement Case Contents Rail And Service Rhythm

**Files:**
- Modify: `docs/.vitepress/theme/CasesPage.vue`
- Modify: `docs/.vitepress/theme/cases.css`
- Modify: `docs/.vitepress/theme/service.css`
- Test: `tests/case-page-style.test.ts`
- Test: `tests/cases-page.test.ts`
- Test: `tests/service-page-style.test.ts`
- Test: `tests/service-page.test.ts`

**Interfaces:**
- Consumes: existing case anchors `#case-gallery` and `#submit-case`, existing Humanicons registration, and existing site tokens.
- Produces: `.wbx-cases-shell`, `.wbx-cases-main`, and `.wbx-cases-outline` layout surfaces plus guide-aligned service spacing.

- [ ] **Step 1: Restructure the case page without changing its content**

Wrap the existing header, gallery, and submit sections in `.wbx-cases-main`. Add a sibling navigation:

```vue
<aside class="wbx-cases-outline" aria-label="案例集页内目录">
  <p>本页目录</p>
  <nav>
    <a href="#case-gallery">浏览案例</a>
    <a href="#submit-case">提交案例</a>
  </nav>
</aside>
```

Remove `.wbx-cases-header__links` from the header. Do not duplicate content or add focusable hidden copies.

- [ ] **Step 2: Match the reading guide's desktop geometry**

Create a two-column shell with a flexible main column and a stable outline rail. Make the rail sticky below the site header, use the same muted label, left rule, link size, hover/focus, and active-like accent treatment as the guide outline. Keep the entire shell centered on the same outer baseline as the reading guide.

- [ ] **Step 3: Preserve case card ergonomics across available widths**

Keep three columns only where the narrowed main column gives each card sufficient width, switch to two columns before text is squeezed, and one column at mobile. Hide the outline rail at the compact layout breakpoint and let `.wbx-cases-main` occupy the full content width. Ensure no page-level horizontal overflow.

- [ ] **Step 4: Align service hierarchy and spacing with the reading guide**

Use the guide's equivalent H2 weight and chapter spacing for `.wbx-service-section`. Remove the repeated section `border-bottom` and the exclusion area's outer top/bottom dividers. Preserve internal facts, checklist rows, output rows, process steps, rules, and card separators.

- [ ] **Step 5: Remove the duplicate native list marker**

Reset `.wbx-service-checklist` and its `li::marker`, retain only `hn-check-box-solid`, remove obsolete pseudo-marker rules, and align the icon and row text using a stable grid or flex layout.

- [ ] **Step 6: Run focused tests and build**

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/cases-page.test.ts tests/service-page-style.test.ts tests/service-page.test.ts tests/product-page-computed-style.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'
./node_modules/.bin/vitepress build docs
git diff --check
```

Expected: PASS; only the existing non-blocking chunk warning may remain.

- [ ] **Step 7: Commit the implementation**

```bash
git add docs/.vitepress/theme/CasesPage.vue docs/.vitepress/theme/cases.css docs/.vitepress/theme/service.css tests/case-page-style.test.ts tests/cases-page.test.ts tests/service-page-style.test.ts tests/service-page.test.ts
git commit -m "统一案例与服务指南式布局"
```

---

### Task 3: Production And Browser Acceptance

**Files:**
- Modify only when a reproduced acceptance defect requires a focused fix: `docs/.vitepress/theme/CasesPage.vue`, `docs/.vitepress/theme/cases.css`, `docs/.vitepress/theme/service.css`, and directly corresponding tests.

**Interfaces:**
- Consumes: completed guide-layout implementation.
- Produces: production-equivalent evidence for layout, behavior, accessibility, and theme safety.

- [ ] **Step 1: Run full verification**

```bash
./node_modules/.bin/vitest run --dir tests --exclude '.worktrees/**' --exclude '.pnpm-store/**'
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
./node_modules/.bin/vitepress build docs
node scripts/generate-legacy-redirects.mjs
node scripts/verify-publish-boundary.mjs
git diff --check
```

- [ ] **Step 2: Start a fresh production preview on port 4181**

```bash
./node_modules/.bin/vitepress preview docs --host 127.0.0.1 --port 4181
```

- [ ] **Step 3: Verify desktop and compact layouts**

At `1440x900` confirm the case main column and right rail match the reading guide baseline, the rail is sticky and non-overlapping, the header has no duplicate navigation, cards have usable widths, and the service page uses guide-like spacing without repeated section lines. At `974x746`, confirm the rail hides at the designed breakpoint and content expands cleanly.

- [ ] **Step 4: Verify mobile, theme, and interaction behavior**

At `390x844`, verify one-column case cards, hidden outline rail, no duplicate service bullets, no overflow, and visible focus. In light and dark themes, verify links, outline rule, pixel icons, headings, and remaining internal separators retain contrast.

- [ ] **Step 5: Exercise unchanged product behavior**

Verify case search, category filters, empty reset, submission navigation, service payment anchor, closed payment state, and related case links. Confirm every route returns `200`.

- [ ] **Step 6: Fix only reproduced defects and commit separately**

For each defect, add a failing regression test, implement the smallest correction, rerun focused and full verification, then commit the directly related files:

```bash
git add docs/.vitepress/theme/CasesPage.vue docs/.vitepress/theme/cases.css docs/.vitepress/theme/service.css tests/case-page-style.test.ts tests/cases-page.test.ts tests/service-page-style.test.ts tests/service-page.test.ts
git commit -m "修复指南式布局验收问题"
```

