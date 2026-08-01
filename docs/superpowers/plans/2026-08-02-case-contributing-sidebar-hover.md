# Case Contributing Sidebar and Green Hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the cases sidebar on the existing case-contribution page and give all sidebar links a dedicated green-tinted hover surface without changing other interactive components.

**Architecture:** Reuse the already generated `casesSidebar` array for an additional exact route key in VitePress configuration, preserving the current page URL and sidebar data source. Introduce one light/dark sidebar-only CSS token and switch only the shared VitePress sidebar hover/focus rule to that token, with focused configuration and source-level CSS tests.

**Tech Stack:** VitePress 1.6.4, TypeScript, CSS custom properties, Vitest 2.1.8, in-app browser responsive inspection.

## Global Constraints

- `/community/case-contributing` and `/cases/` must use the same existing `casesSidebar` array.
- Keep the `/community/case-contributing` URL, Markdown content, and canonical address unchanged.
- Do not add a redirect or a separate community sidebar.
- Light sidebar hover surface is exactly `#e4ece5`.
- Dark sidebar hover surface is exactly `#202a24`.
- Sidebar hover and focus-visible backgrounds use `--wbx-sidebar-hover-surface`.
- Existing `--wbx-hover-surface` consumers outside the sidebar remain unchanged.
- Active sidebar items continue to use `--wbx-accent`; focus-visible retains its `2px` accent outline.
- Do not change sidebar width, font size, line height, spacing, grouping, collapse behavior, or the compact desktop spacing rule.

---

## File Structure

- Modify `tests/navigation.test.ts`: lock the contribution-route mapping to the same generated cases sidebar instance.
- Modify `docs/.vitepress/config.mts`: register the exact contribution route with `casesSidebar`.
- Modify `tests/neutral-hover-colors.test.ts`: verify exact sidebar-only theme colors, bounded sidebar rule usage, and unchanged non-sidebar consumers.
- Modify `docs/.vitepress/theme/custom.css`: define the light/dark sidebar hover variables and use them only for sidebar hover/focus backgrounds.

### Task 1: Restore the Cases Sidebar on the Contribution Route

**Files:**
- Modify: `tests/navigation.test.ts:40-46`
- Modify: `docs/.vitepress/config.mts:59-63`

**Interfaces:**
- Consumes: the existing `casesSidebar` array returned by `discoverCaseSidebar(...)`.
- Produces: `themeConfig.sidebar['/community/case-contributing']` referencing the same array instance as `themeConfig.sidebar['/cases/']`.

- [ ] **Step 1: Write the failing route-mapping test**

Replace the existing `enables dedicated sidebars for the small book and cases` test in `tests/navigation.test.ts` with:

```ts
  it('enables dedicated sidebars for the small book, cases, and case contribution page', () => {
    const configuredSidebars = config.themeConfig?.sidebar as Record<string, unknown>

    expect(configuredSidebars['/wb-x/']).toBe(sidebar)
    expect(configuredSidebars['/cases/']).toEqual(expect.any(Array))
    expect(configuredSidebars['/community/case-contributing']).toBe(configuredSidebars['/cases/'])
  })
```

- [ ] **Step 2: Run the focused test and confirm it fails for the missing route**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/navigation.test.ts
```

Expected: the new test fails because `configuredSidebars['/community/case-contributing']` is `undefined`.

- [ ] **Step 3: Add the exact contribution-route sidebar mapping**

Change the sidebar object in `docs/.vitepress/config.mts` to:

```ts
    sidebar: {
      '/wb-x/': [...sidebar],
      '/cases/': casesSidebar,
      '/community/case-contributing': casesSidebar,
    },
```

Do not move the contribution Markdown file or change its links.

- [ ] **Step 4: Run the navigation and cases-sidebar tests**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/navigation.test.ts tests/case-sidebar.test.ts
```

Expected: both test files pass, including the existing assertion that “如何提交 Case” links to `/community/case-contributing`.

- [ ] **Step 5: Commit the route fix**

```bash
git add tests/navigation.test.ts docs/.vitepress/config.mts
git commit -m "fix: restore sidebar on case contribution page"
```

### Task 2: Add Sidebar-Only Green Hover Surfaces

**Files:**
- Modify: `tests/neutral-hover-colors.test.ts:1-38`
- Modify: `docs/.vitepress/theme/custom.css:1-90`
- Modify: `docs/.vitepress/theme/custom.css:341-345`

**Interfaces:**
- Consumes: the existing `:root`, `.dark`, `.VPSidebarItem .link:hover`, and `.VPSidebarItem .link:focus-visible` CSS rules.
- Produces: `--wbx-sidebar-hover-surface` with exact light/dark values and a sidebar-only background consumer.

- [ ] **Step 1: Write failing tests for the dedicated variables and bounded sidebar rule**

In `tests/neutral-hover-colors.test.ts`, add this test after the existing neutral-token test:

```ts
  it('defines dedicated light and dark green-tinted sidebar hover surfaces', () => {
    expect(customCss).toMatch(/:root\s*\{[^{}]*--wbx-sidebar-hover-surface:\s*#e4ece5;/)
    expect(customCss).toMatch(/\.dark\s*\{[^{}]*--wbx-sidebar-hover-surface:\s*#202a24;/)
  })
```

In `uses the neutral surface for interactive hover backgrounds`, replace the sidebar expectation with this bounded expectation:

```ts
    expect(customCss).toMatch(
      /\.VPSidebarItem \.link:hover,\s*\.VPSidebarItem \.link:focus-visible\s*\{[^{}]*background:\s*var\(--wbx-sidebar-hover-surface\);[^{}]*\}/,
    )
```

Keep the assertions for `.wbx-book-index__entry`, `.wbx-community-qr__close`, and `.wbx-task-grid` unchanged so they continue proving that non-sidebar components use `--wbx-hover-surface`.

- [ ] **Step 2: Run the focused test and confirm both new requirements fail**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/neutral-hover-colors.test.ts
```

Expected: failures report missing `--wbx-sidebar-hover-surface` declarations and continued sidebar use of `--wbx-hover-surface`.

- [ ] **Step 3: Define exact light and dark sidebar variables**

In the `:root` block of `docs/.vitepress/theme/custom.css`, immediately after `--wbx-hover-surface`, add:

```css
  --wbx-sidebar-hover-surface: #e4ece5;
```

In the `.dark` block, immediately after `--wbx-hover-surface`, add:

```css
  --wbx-sidebar-hover-surface: #202a24;
```

- [ ] **Step 4: Switch only the sidebar hover/focus background**

Change the existing shared sidebar state rule to:

```css
.VPSidebarItem .link:hover,
.VPSidebarItem .link:focus-visible {
  color: var(--wbx-ink);
  background: var(--wbx-sidebar-hover-surface);
}
```

Do not modify the following focus outline or active-item background declarations.

- [ ] **Step 5: Run the focused CSS and sidebar regression tests**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/neutral-hover-colors.test.ts tests/sidebar-density.test.ts tests/sidebar-scroll.test.ts
```

Expected: all selected files pass; the dedicated token, compact spacing, focus outline, and active state remain covered.

- [ ] **Step 6: Run the complete automated verification**

Run each project check with the available package manager:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run check:links
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run check:assets
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run build
git diff --check
```

Expected: all Vitest tests pass, content links report zero broken links, replacement assets contain no source hotlinks, the production build completes, and `git diff --check` prints no errors.

- [ ] **Step 7: Verify the contribution page and sidebar states in the browser**

Start the local development server:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm exec vitepress dev docs --host 127.0.0.1
```

At desktop width, open `/community/case-contributing` and confirm the complete cases sidebar appears and “如何提交 Case” has the active `--wbx-accent` background. Hover “案例集首页” and verify its computed background is `rgb(228, 236, 229)` in light mode; switch to dark mode and verify `rgb(32, 42, 36)`. Confirm the active item remains green while hovered. At 390px, open the sidebar and confirm the same hover token applies without changing the existing item spacing or introducing horizontal overflow.

- [ ] **Step 8: Commit the visual change**

```bash
git add tests/neutral-hover-colors.test.ts docs/.vitepress/theme/custom.css
git commit -m "style: tint sidebar hover surfaces green"
```
