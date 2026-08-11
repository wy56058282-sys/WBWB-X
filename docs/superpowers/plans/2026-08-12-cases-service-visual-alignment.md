# Cases And Service Visual Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the case gallery and custom service pages with the homepage visual language without changing their content, business behavior, or information architecture.

**Architecture:** Keep `CasesPage.vue` and `ServicePage.vue` as independent page components and converge their CSS contracts on the existing homepage tokens. `cases.css` and `service.css` remain page-owned, while tests enforce the shared container, typography, control, icon, and responsive rules.

**Tech Stack:** Vue 3, VitePress 1.6, CSS custom properties, Humanicons pixel icon font, Vitest, jsdom.

## Global Constraints

- Both pages use a `1280px` maximum content container with matching responsive gutters.
- Preserve all existing copy, links, filtering, payment readiness logic, and information order.
- Main titles use strong weight, compact line height, and zero letter spacing.
- Command controls use square corners, `2px` black borders, fluorescent green emphasis, and visible keyboard focus.
- UI icons come from the existing pixel icon library and decorative icons use `aria-hidden="true"`.
- Cards remain three columns on desktop, two on tablet, and one on mobile.
- Validate desktop, compact desktop, `390x844`, light theme, dark theme, and zero page-level horizontal overflow.
- Do not add dependencies or alter the homepage structure.

---

### Task 1: Lock The Shared Visual Contract

**Files:**
- Modify: `tests/case-page-style.test.ts`
- Create: `tests/service-page-style.test.ts`

**Interfaces:**
- Consumes: existing selectors in `cases.css` and `service.css`.
- Produces: static CSS contracts for container width, title weight, square controls, borders, icon usage, and responsive layout.

- [ ] **Step 1: Extend the case style test with the shared container and homepage control contract**

Add assertions equivalent to:

```ts
expect(source).toMatch(/\.wbx-cases-layout \.VPDoc \.container\s*\{[^}]*max-width:\s*1280px/s)
expect(source).not.toMatch(/\.wbx-cases-layout \.VPDoc \.content-container\s*\{[^}]*max-width:\s*none/s)
expect(source).toMatch(/\.wbx-cases h1\s*\{[^}]*font-weight:\s*850/s)
expect(source).toMatch(/\.wbx-cases-categories button,[\s\S]*border:\s*2px solid var\(--wbx-ink\)[\s\S]*border-radius:\s*0/s)
```

Assert `CasesPage.vue` retains `hn-check-circle-solid` and `aria-hidden="true"`.

- [ ] **Step 2: Add a service style contract test**

Create `tests/service-page-style.test.ts` that reads `service.css` and `ServicePage.vue` and asserts:

```ts
expect(styles).toMatch(/\.custom-service-page \.VPDoc:not\(\.has-sidebar\) \.container\s*\{[^}]*max-width:\s*1280px/s)
expect(styles).toMatch(/\.wbx-service h1\s*\{[^}]*font-weight:\s*850/s)
expect(styles).toMatch(/\.wbx-service-action\s*\{[^}]*border:\s*2px solid var\(--wbx-ink\)[^}]*border-radius:\s*0/s)
expect(source).toContain('class="hn hn-check-square-solid wbx-service-checklist__icon"')
expect(source).toContain('aria-hidden="true"')
```

- [ ] **Step 3: Run the tests and confirm they fail for the intended missing contracts**

Run:

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/service-page-style.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'
```

Expected: FAIL because the current case inner container is unconstrained and the controls, title weights, and service icons have not yet been aligned.

- [ ] **Step 4: Commit the failing visual contracts**

```bash
git add tests/case-page-style.test.ts tests/service-page-style.test.ts
git commit -m "锁定案例与服务视觉统一合同"
```

---

### Task 2: Align Case Gallery And Custom Service Styles

**Files:**
- Modify: `docs/.vitepress/theme/cases.css`
- Modify: `docs/.vitepress/theme/service.css`
- Modify: `docs/.vitepress/theme/ServicePage.vue`
- Test: `tests/case-page-style.test.ts`
- Test: `tests/service-page-style.test.ts`
- Test: `tests/cases-page.test.ts`
- Test: `tests/service-page.test.ts`

**Interfaces:**
- Consumes: `--wbx-ink`, `--wbx-accent`, `--wbx-line`, `--wbx-surface`, `--wbx-muted`, `--wbx-pixel`, and Humanicons classes already registered by the theme.
- Produces: visually aligned `/cases/` and `/help/` pages with unchanged component behavior.

- [ ] **Step 1: Restore the case page to the same container contract as the service page**

In `cases.css`, keep the outer container at `1280px`, remove the case-only rule that sets `.content-container` to `max-width: none`, and retain safe responsive gutters from VitePress.

```css
.wbx-cases-layout .VPDoc .container {
  max-width: 1280px;
}
```

- [ ] **Step 2: Align case titles, filters, actions, and separators with the homepage**

Set the case page H1 to `font-weight: 850`, keep `letter-spacing: 0`, and change command controls to:

```css
border: 2px solid var(--wbx-ink);
border-radius: 0;
```

Use the existing accent for selected filters and primary actions. Add the homepage-style offset shadow/translation hover treatment without resizing controls. Use a `2px` strong divider for the page header and submission boundary while keeping fine internal lines at `1px`.

- [ ] **Step 3: Replace custom service checklist markers with pixel icons**

Change each suitable-problem row in `ServicePage.vue` to:

```vue
<li v-for="problem in suitableProblems" :key="problem">
  <i class="hn hn-check-square-solid wbx-service-checklist__icon" aria-hidden="true" />
  <span>{{ problem }}</span>
</li>
```

Remove the CSS-generated square marker and style `.wbx-service-checklist__icon` with a stable icon box and brand color. Keep the exclusion list semantically distinct and do not add decorative focus targets.

- [ ] **Step 4: Align custom service titles, actions, and section rhythm**

In `service.css`, apply `font-weight: 850` to H1, use the same square `2px` command controls and hover feedback as the case page, and tighten offer/section spacing without changing grid order. Keep price facts, process, rules, payment readiness, and related cases unchanged.

- [ ] **Step 5: Preserve responsive behavior explicitly**

At existing breakpoints, verify the case grid remains `3/2/1`; service sections collapse cleanly; controls wrap instead of overflowing; H1 sizes reduce without viewport-width font scaling; and both pages retain the same effective gutters.

- [ ] **Step 6: Run focused component and style tests**

Run:

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/service-page-style.test.ts tests/cases-page.test.ts tests/service-page.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'
```

Expected: PASS.

- [ ] **Step 7: Check formatting and commit the implementation**

```bash
git diff --check
git add docs/.vitepress/theme/cases.css docs/.vitepress/theme/service.css docs/.vitepress/theme/ServicePage.vue tests/case-page-style.test.ts tests/service-page-style.test.ts
git commit -m "统一案例集与定制服务视觉样式"
```

---

### Task 3: Production And Browser Acceptance

**Files:**
- Modify only if a verified regression requires a focused fix: `docs/.vitepress/theme/cases.css`, `docs/.vitepress/theme/service.css`, `docs/.vitepress/theme/ServicePage.vue`, and their directly corresponding tests.

**Interfaces:**
- Consumes: completed visual contracts from Tasks 1 and 2.
- Produces: production-equivalent evidence that the redesign is responsive, accessible, theme-safe, and behaviorally unchanged.

- [ ] **Step 1: Run the complete automated suite**

```bash
./node_modules/.bin/vitest run --dir tests --exclude '.worktrees/**' --exclude '.pnpm-store/**'
node scripts/check-content-links.mjs
node scripts/check-assets.mjs
./node_modules/.bin/vitepress build docs
node scripts/generate-legacy-redirects.mjs
node scripts/verify-publish-boundary.mjs
git diff --check
```

Expected: all commands exit `0`; the existing chunk-size warning is non-blocking.

- [ ] **Step 2: Start a fresh production preview**

```bash
./node_modules/.bin/vitepress preview docs --host 127.0.0.1 --port 4181
```

Open `/`, `/cases/`, and `/help/` from the fresh server.

- [ ] **Step 3: Verify desktop and compact desktop**

At `1440x900` and `974x746`, record that both product pages share the same content width and gutters; H1, actions, filters, service facts, and cards do not overlap; case cards remain three columns where space permits; and `scrollWidth === clientWidth`.

- [ ] **Step 4: Verify mobile and themes**

At `390x844`, record one-column behavior, naturally wrapped titles, visible focus, no clipped controls, and `scrollWidth === clientWidth`. Repeat representative checks in dark theme and confirm text, borders, accent, and cards retain sufficient contrast.

- [ ] **Step 5: Verify behavior and content preservation**

Exercise case search, category filtering, empty-state reset, case links, service anchor navigation, closed payment state, and related-case links. Confirm no content or business rule changed.

- [ ] **Step 6: Commit only evidence-driven fixes, if any**

For each defect, first add a reproducing test, run it red, implement the smallest fix, rerun focused and full verification, then commit:

```bash
git add docs/.vitepress/theme/cases.css docs/.vitepress/theme/service.css docs/.vitepress/theme/ServicePage.vue tests/case-page-style.test.ts tests/service-page-style.test.ts tests/cases-page.test.ts tests/service-page.test.ts
git commit -m "修复视觉统一验收问题"
```
