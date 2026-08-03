# Align Reading Sidebar With Cases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the WB-X reading sidebar use the same menu density, radius, hover surface, and active state as the cases sidebar while preserving reading-only grouping and scrolling.

**Architecture:** Keep the shared sidebar component and global rules in `custom.css` as the single visual source of truth. Remove only the conflicting link-size overrides from the route-scoped `reading.css`; retain reading-route structure, separators, and scrolling. Lock the cascade behavior with focused CSS regression tests.

**Tech Stack:** VitePress 1.6, CSS, TypeScript, Vitest 2.1.

## Global Constraints

- Do not change sidebar copy, links, grouping order, or expansion behavior.
- Desktop menu links must resolve to `padding: 2px 6px` and `border-radius: 6px` through the shared cases-sidebar rules.
- Reading sidebar links must not retain `min-height: 44px` or `padding: 4px 12px` overrides.
- Hover and focus use `--wbx-sidebar-hover-surface`; active links use `--wbx-accent`.
- Preserve reading sidebar borders, background, independent scrolling, scrollbars, and chapter separators.
- Mobile navigation keeps the shared `7px 10px` touch spacing.

---

### Task 1: Lock shared sidebar visual inheritance

**Files:**
- Modify: `tests/wb-x-reading-scope.test.ts`
- Modify: `tests/sidebar-density.test.ts`
- Modify: `docs/.vitepress/theme/reading.css`

**Interfaces:**
- Consumes: global `.VPSidebarItem .link` rules from `docs/.vitepress/theme/custom.css`.
- Produces: a route-scoped reading sidebar that inherits shared link dimensions and colors without overriding menu content or structure.

- [ ] **Step 1: Write the failing regression tests**

Update `tests/wb-x-reading-scope.test.ts` to assert that `reading.css`:

```ts
expect(readingCss).not.toMatch(
  /\.wbx-reading-layout \.VPSidebarItem \.link\s*{[^}]*min-height:/,
)
expect(readingCss).not.toMatch(
  /\.wbx-reading-layout \.VPSidebarItem \.link\s*{[^}]*padding:/,
)
expect(readingCss).not.toMatch(
  /\.wbx-reading-layout \.VPSidebarItem \.link\s*{[^}]*border-radius:/,
)
expect(readingCss).toMatch(
  /\.wbx-reading-layout \.VPSidebarItem \.link:hover\s*{[^}]*background:\s*var\(--wbx-sidebar-hover-surface\)/,
)
```

Extend `tests/sidebar-density.test.ts` to assert the shared rule remains the source for desktop radius and spacing:

```ts
expect(css).toMatch(
  /\.VPSidebarItem \.link\s*{[^}]*border-radius:\s*6px/,
)
expect(css).toMatch(desktopCompactRule)
expect(css).toMatch(mobileBaseRule)
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
node_modules/.bin/vitest run --dir tests wb-x-reading-scope.test.ts sidebar-density.test.ts --reporter=verbose
```

Expected: FAIL because `reading.css` still declares `min-height: 44px`, `padding: 4px 12px`, and the reading-specific radius.

- [ ] **Step 3: Remove only the conflicting reading link dimensions**

Change the link block in `docs/.vitepress/theme/reading.css` to retain only route-specific properties that do not duplicate the shared cases-sidebar visuals:

```css
.wbx-reading-layout .VPSidebarItem .link {
  border: 0;
  background: transparent;
}
```

Keep the existing reading-specific hover, focus, and active selectors, using the same shared tokens:

```css
.wbx-reading-layout .VPSidebarItem .link:hover {
  color: var(--wbx-ink);
  background: var(--wbx-sidebar-hover-surface);
}

.wbx-reading-layout .VPSidebarItem.is-active > .item .link {
  color: var(--wbx-ink);
  background: var(--wbx-accent);
}
```

Do not edit menu data, Vue layout structure, sidebar discovery logic, or global cases-sidebar selectors.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
node_modules/.bin/vitest run --dir tests wb-x-reading-scope.test.ts sidebar-density.test.ts sidebar-scroll.test.ts --reporter=verbose
```

Expected: PASS with all focused sidebar tests green.

- [ ] **Step 5: Verify the local preview at desktop and mobile widths**

At `http://127.0.0.1:5173/wb-x/`, confirm:

- desktop links visually match `/cases/` for height, padding, radius, hover, and active state;
- chapter groups and independent sidebar scrolling remain intact;
- mobile menu retains comfortable touch spacing and no horizontal overflow.

- [ ] **Step 6: Run the full suite and production build**

Run:

```bash
node_modules/.bin/vitest run --dir tests
node_modules/.bin/vitepress build docs
```

Expected: all test files pass and VitePress exits with status 0.

- [ ] **Step 7: Commit the implementation**

```bash
git add tests/wb-x-reading-scope.test.ts tests/sidebar-density.test.ts docs/.vitepress/theme/reading.css
git commit -m "style: align reading sidebar with cases"
```
