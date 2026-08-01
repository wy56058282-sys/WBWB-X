# Compact Desktop Sidebar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce the vertical space used by desktop sidebar items in both the small-book and cases sections while preserving mobile touch targets and all existing interaction states.

**Architecture:** Add one desktop-only CSS override for the existing shared `.VPSidebarItem .link` rule, so both configured VitePress sidebars inherit the same density without changing navigation data or markup. Protect the responsive boundary with a focused source-level Vitest test, then verify computed layout in desktop and mobile browser viewports.

**Tech Stack:** VitePress 1.6.4, CSS, Vitest 2.1.8, jsdom, in-app browser responsive inspection.

## Global Constraints

- Desktop scope begins at a viewport width of `960px`.
- Sidebar text remains `14px` with a `24px` line height.
- Desktop link margin is `0` and padding is `2px 6px`.
- Target desktop heights are approximately `36px` for one-line items and `60px` for two-line items.
- Mobile spacing and touch targets must remain unchanged.
- The same rule applies to `/wb-x/` and `/cases/`.
- Existing active, hover, focus-visible, keyboard navigation, sidebar width, grouping, copy, and collapse behavior remain unchanged.

---

## File Structure

- Create `tests/sidebar-density.test.ts`: verifies the approved desktop-only CSS values and ensures the base/mobile link spacing is retained.
- Modify `docs/.vitepress/theme/custom.css`: adds the desktop media-query override beside the existing shared sidebar link styles.

### Task 1: Add the responsive sidebar-density contract

**Files:**
- Create: `tests/sidebar-density.test.ts`
- Modify: `docs/.vitepress/theme/custom.css:323-333`

**Interfaces:**
- Consumes: the existing shared selector `.VPSidebarItem .link` and VitePress breakpoint `960px`.
- Produces: a desktop-only `@media (min-width: 960px)` rule with `margin: 0` and `padding: 2px 6px`; no JavaScript API is introduced.

- [ ] **Step 1: Write the failing responsive CSS test**

Create `tests/sidebar-density.test.ts` with:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

describe('responsive sidebar density', () => {
  it('uses compact spacing only at the desktop breakpoint', () => {
    expect(css).toMatch(
      /@media\s*\(min-width:\s*960px\)\s*{[\s\S]*?\.VPSidebarItem \.link\s*{[\s\S]*?margin:\s*0;[\s\S]*?padding:\s*2px 6px;[\s\S]*?}\s*}/,
    )
  })

  it('retains the larger base spacing used by mobile navigation', () => {
    expect(css).toMatch(
      /\.VPSidebarItem \.link\s*{[\s\S]*?margin:\s*2px 0;[\s\S]*?padding:\s*7px 10px;/,
    )
  })
})
```

- [ ] **Step 2: Run the focused test and confirm the new contract fails**

Run:

```bash
npm test -- tests/sidebar-density.test.ts
```

Expected: one test passes for the retained base spacing, and `uses compact spacing only at the desktop breakpoint` fails because the desktop override does not exist.

- [ ] **Step 3: Add the minimal desktop-only CSS override**

Immediately after the existing `.VPSidebarItem .link` block in `docs/.vitepress/theme/custom.css`, add:

```css
@media (min-width: 960px) {
  .VPSidebarItem .link {
    margin: 0;
    padding: 2px 6px;
  }
}
```

Do not alter the existing base rule or the subsequent hover, focus-visible, and active rules.

- [ ] **Step 4: Run the focused test and existing sidebar interaction tests**

Run:

```bash
npm test -- tests/sidebar-density.test.ts tests/sidebar-scroll.test.ts tests/neutral-hover-colors.test.ts tests/navigation.test.ts tests/case-sidebar.test.ts
```

Expected: all selected test files pass.

- [ ] **Step 5: Run the complete project verification**

Run:

```bash
npm run check
```

Expected: all Vitest tests, content-link checks, replacement-asset checks, and the VitePress production build pass.

- [ ] **Step 6: Verify the rendered layout at desktop and mobile widths**

Start the local preview with:

```bash
npm run dev -- --host 127.0.0.1
```

In the browser, inspect both `/wb-x/` and `/cases/` at a viewport width of at least 960px. Confirm a one-line sidebar link is approximately `36px` high and a two-line link is approximately `60px` high; confirm active, hover, and focus-visible states remain visible. Then inspect the navigation at `390px` and confirm the base `margin: 2px 0` and `padding: 7px 10px` still apply and no horizontal overflow is introduced.

- [ ] **Step 7: Commit the tested implementation**

```bash
git add tests/sidebar-density.test.ts docs/.vitepress/theme/custom.css
git commit -m "style: tighten desktop sidebar spacing"
```

