# Restore Book Index List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore `/wb-x/` to the approved borderless, background-free chapter index while preserving its current content, links, appendix, compact sidebar spacing, and green-tinted sidebar hover state.

**Architecture:** Keep the existing semantic Markdown index and shared base styles intact. Change only the WB-X reading-layout overrides in `reading.css`, and lock the intended behavior with focused source-level Vitest assertions so later visual-system changes cannot silently reintroduce white cards.

**Tech Stack:** VitePress 1.6.4, CSS, Vitest 2.1.8, JSDOM.

## Global Constraints

- Do not change chapter titles, descriptions, destination URLs, or appendix content.
- Keep the current compact sidebar padding of `4px 12px`.
- Keep the sidebar hover surface token at `#e4ece5`.
- Preserve the black `50px × 50px` index badges.
- Preserve mobile wrapping and prevent horizontal overflow.
- Do not revert unrelated commits or touch unrelated dirty files.

---

### Task 1: Lock the approved chapter-index visual contract

**Files:**
- Modify: `tests/wb-x-index.test.ts`
- Reference: `docs/.vitepress/theme/custom.css`
- Reference: `docs/.vitepress/theme/reading.css`

**Interfaces:**
- Consumes: `.wbx-reading-layout .wbx-book-index__entry > a` and `.wbx-reading-layout .wbx-book-index__entry > a:hover` CSS selectors.
- Produces: Regression assertions requiring transparent entry backgrounds, zero borders, zero corner radius, and no hover translation.

- [ ] **Step 1: Replace the white-surface assertion with failing naked-list assertions**

```ts
it('renders each reading entry as a naked list row instead of a white card', () => {
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry > a\s*{[^}]*background:\s*transparent/,
  )
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry > a\s*{[^}]*border:\s*0/,
  )
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry > a\s*{[^}]*border-radius:\s*0/,
  )
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry > a:hover\s*{[^}]*transform:\s*none/,
  )
})
```

- [ ] **Step 2: Add a sidebar hover-token assertion**

Read `docs/.vitepress/theme/custom.css` in the test and assert:

```ts
expect(customCss).toMatch(/--wbx-sidebar-hover-surface:\s*#e4ece5/)
```

- [ ] **Step 3: Run the focused test and verify it fails for the white background**

Run:

```bash
PATH="/Users/wangyi/.codex/dependencies/node/bin:/usr/bin:/bin" node_modules/.bin/vitest run --dir tests wb-x-index.test.ts
```

Expected: FAIL because `reading.css` still declares `background: var(--wbx-surface)`, retains a reading radius, and has no explicit `transform: none` hover override.

---

### Task 2: Restore the approved naked-list styling

**Files:**
- Modify: `docs/.vitepress/theme/reading.css:57-91`
- Test: `tests/wb-x-index.test.ts`

**Interfaces:**
- Consumes: Existing `.vp-doc .wbx-book-index*` layout, typography, badge, focus, and responsive definitions in `custom.css`.
- Produces: WB-X-specific visual overrides that remove card surfaces without altering semantic markup or destinations.

- [ ] **Step 1: Implement the minimal entry override**

Update the WB-X override to the following properties while retaining its current minimum height and spacing:

```css
.wbx-reading-layout .wbx-book-index__entry > a {
  min-height: 74px;
  padding: 12px 16px;
  border: 0;
  border-radius: 0;
  background: transparent;
}
```

- [ ] **Step 2: Remove the card-motion hover behavior**

```css
.wbx-reading-layout .wbx-book-index__entry > a:hover {
  background: var(--wbx-hover-surface);
  transform: none;
}
```

Keep the existing focus-visible outline, black badge styling, appendix separator, and mobile grid declarations unchanged.

- [ ] **Step 3: Run the focused tests**

Run:

```bash
PATH="/Users/wangyi/.codex/dependencies/node/bin:/usr/bin:/bin" node_modules/.bin/vitest run --dir tests wb-x-index.test.ts sidebar-scroll.test.ts
```

Expected: both test files PASS.

- [ ] **Step 4: Review the scoped diff**

Run:

```bash
git diff -- docs/.vitepress/theme/reading.css tests/wb-x-index.test.ts tests/sidebar-scroll.test.ts
```

Expected: only the already-approved compact sidebar padding plus the chapter-index restoration and matching assertions appear; no content or URL changes.

---

### Task 3: Verify production behavior

**Files:**
- Verify: `docs/.vitepress/theme/reading.css`
- Verify: `tests/wb-x-index.test.ts`
- Verify: `tests/sidebar-scroll.test.ts`

**Interfaces:**
- Consumes: The completed CSS restoration and tests.
- Produces: Evidence that the full test suite and production build remain healthy.

- [ ] **Step 1: Run all tests**

```bash
PATH="/Users/wangyi/.codex/dependencies/node/bin:/usr/bin:/bin" node_modules/.bin/vitest run --dir tests
```

Expected: all tests PASS.

- [ ] **Step 2: Run the production build**

```bash
PATH="/Users/wangyi/.codex/dependencies/node/bin:/usr/bin:/bin" node_modules/.bin/vitepress build docs
```

Expected: build completes successfully; existing non-blocking chunk-size or gitignore warnings may remain.

- [ ] **Step 3: Inspect `/wb-x/` in the existing local preview**

Check desktop and narrow viewport behavior:

- Four chapter entries have no persistent white card background.
- Black index badges, titles, descriptions, and appendix remain aligned.
- Hover state is a subtle green-tinted row highlight with no horizontal jump.
- Sidebar hover is green-tinted and active state remains brand green.
- Mobile titles wrap without horizontal overflow.

- [ ] **Step 4: Commit only the scoped implementation files**

```bash
git add docs/.vitepress/theme/reading.css tests/wb-x-index.test.ts tests/sidebar-scroll.test.ts
git commit -m "style: restore WB-X chapter index list"
```

Do not stage or commit unrelated pre-existing changes.
