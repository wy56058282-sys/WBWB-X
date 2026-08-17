# Navigation and Cases Sticky Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify desktop navigation geometry across product pages and keep the complete cases tool sidebar visible below the rendered navigation whenever it fits in the viewport.

**Architecture:** Shared navigation geometry belongs in the global theme stylesheet instead of page-scoped `has-sidebar` patches. `CasesPage.vue` will measure the rendered navbar and tool stack, expose the measured sticky offset as a CSS custom property, and enable sticky positioning only when the complete tool stack fits in the remaining viewport.

**Tech Stack:** Vue 3, VitePress 1.6, CSS custom properties, ResizeObserver, Vitest, JSDOM.

## Global Constraints

- Do not change navigation labels, links, routes, case content, search behavior, or submission content.
- Desktop sticky offset equals the rendered navbar bottom plus `24px`.
- Sticky mode is disabled at `1024px` and below or when the whole tool stack does not fit.
- Mobile keeps the current compact navigation and natural document flow.
- No new dependency.

---

### Task 1: Shared navigation geometry

**Files:**
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `docs/.vitepress/theme/cases.css`
- Modify: `tests/case-page-style.test.ts`
- Modify: `tests/case-detail-layout.test.ts`
- Create: `tests/navigation-consistency.test.ts`

**Interfaces:**
- Consumes: VitePress `.VPNavBar > .wrapper > .container > .title` and `.VPNavBarSearch` DOM.
- Produces: one desktop title/logo surface and stable search origin for sidebar and non-sidebar layouts.

- [ ] **Step 1: Write failing navigation consistency tests**

Create fixtures for plain, `has-sidebar`, cases, case-detail, reading, and service layouts. Assert the desktop title width/background/backdrop filter and search placement declarations resolve identically. Assert the mobile breakpoint retains the current opaque compact navbar.

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
./node_modules/.bin/vitest run tests/navigation-consistency.test.ts tests/case-page-style.test.ts tests/case-detail-layout.test.ts
```

Expected: failures show that frosting and geometry are scoped only to cases and case-detail `has-sidebar` selectors.

- [ ] **Step 3: Implement shared desktop navigation rules**

Move the common title background, `-webkit-backdrop-filter`, `backdrop-filter`, title sizing, and search positioning into desktop global selectors in `custom.css`. Remove the duplicate cases and detail selectors after the shared rule covers them. Preserve the `max-width: 760px` opaque navbar behavior.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: all tests pass.

- [ ] **Step 5: Commit Task 1**

```bash
git add docs/.vitepress/theme/custom.css docs/.vitepress/theme/cases.css tests/navigation-consistency.test.ts tests/case-page-style.test.ts tests/case-detail-layout.test.ts
git commit -m "统一全站顶部导航布局"
```

---

### Task 2: Rendered-nav-aware cases sticky sidebar

**Files:**
- Modify: `docs/.vitepress/theme/CasesPage.vue`
- Modify: `docs/.vitepress/theme/cases.css`
- Modify: `tests/cases-page.test.ts`
- Modify: `tests/case-page-style.test.ts`

**Interfaces:**
- Consumes: rendered `.VPNavBar` bounding rectangle, `window.innerHeight`, `window.innerWidth`, and tool stack `scrollHeight`/bounding height.
- Produces: `toolsSticky: Ref<boolean>` and inline `--wbx-cases-sticky-top: <px>` on `.wbx-cases-tools-stack`.

- [ ] **Step 1: Write failing sticky behavior tests**

Extend `tests/cases-page.test.ts` to mock a navbar whose bottom is larger than `--vp-nav-height`, verify the stack receives `--wbx-cases-sticky-top` equal to `navRect.bottom + 24`, and verify sticky mode uses the available height below that offset. Change filters and assert the tool stack element and offset remain stable. Add a CSS contract asserting `top: var(--wbx-cases-sticky-top)`.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
./node_modules/.bin/vitest run tests/cases-page.test.ts tests/case-page-style.test.ts
```

Expected: the current implementation still uses the static root variable and does not expose the measured offset.

- [ ] **Step 3: Implement measured offset and resilient observation**

In `CasesPage.vue`, query `.VPNavBar`, calculate `stickyTop = max(navRect.bottom, navRect.height, fallbackNavHeight) + 24`, set the CSS custom property, and compare the full stack height to `innerHeight - stickyTop - 24`. Observe both the tool stack and navbar when available, listen to resize, and disconnect cleanly. In `cases.css`, replace the static `top` calculation with the custom property and retain the `>1024px` behavior gate.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run the command from Step 2. Expected: all tests pass.

- [ ] **Step 5: Commit Task 2**

```bash
git add docs/.vitepress/theme/CasesPage.vue docs/.vitepress/theme/cases.css tests/cases-page.test.ts tests/case-page-style.test.ts
git commit -m "修复案例页右栏吸顶遮挡"
```

---

### Task 3: Regression and browser acceptance

**Files:**
- Modify only if an acceptance defect is reproduced in a failing test.

**Interfaces:**
- Consumes: production build output.
- Produces: verified navigation and sticky behavior at 1440px, 900px, and 390px.

- [ ] **Step 1: Run automated regression**

```bash
./node_modules/.bin/vitest run
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
./node_modules/.bin/vitepress build docs
node scripts/generate-legacy-redirects.mjs
node scripts/verify-publish-boundary.mjs
git diff --check
```

Expected: every command exits `0`.

- [ ] **Step 2: Start a fresh production preview**

```bash
./node_modules/.bin/vitepress preview docs --host 127.0.0.1 --port 4184
```

- [ ] **Step 3: Verify 1440px desktop**

Compare `/`, `/reading-guide`, `/cases/`, a case detail route, and `/help/`. Confirm matching navbar height, Logo origin, search origin, and frosting. On `/cases/`, scroll through the grid and confirm the right stack stays at least `24px` below the navbar with the search input fully visible. Switch all category tabs, enter/clear search, and confirm the right stack top does not move.

- [ ] **Step 4: Verify 900px and 390px responsive layouts**

Confirm sticky mode is disabled, content remains in document order, there is no horizontal overflow, and navigation remains usable in light and dark themes.

- [ ] **Step 5: Final commit if acceptance required fixes**

Stage only files changed for reproduced defects, rerun the focused and full checks, and commit with a narrowly scoped Chinese message.

