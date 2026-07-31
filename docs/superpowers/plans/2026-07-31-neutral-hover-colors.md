# Neutral Hover Colors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace green hover backgrounds with neutral gray backgrounds while preserving green active and focus states.

**Architecture:** Add one light/dark theme token dedicated to hover surfaces, then route existing hover background rules through that token. Keep the existing accent token for selected navigation, focus outlines, links, icons, and brand decoration.

**Tech Stack:** VitePress 1.6, CSS custom properties, Vitest.

## Global Constraints

- Light mode hover backgrounds are neutral light gray.
- Dark mode hover backgrounds are neutral dark gray.
- Active states and `focus-visible` outlines remain `#32E6B9`.
- Do not change copy, links, layout, radii, or motion.

---

### Task 1: Define and test the neutral hover token

**Files:**
- Modify: `docs/.vitepress/theme/custom.css`
- Create: `tests/neutral-hover-colors.test.ts`

**Interfaces:**
- Produces: CSS custom property `--wbx-hover-surface` in `:root` and `.dark`.

- [x] **Step 1: Write a failing CSS contract test**

Assert that `custom.css` declares `--wbx-hover-surface: #eceee9` for light mode and `--wbx-hover-surface: #252922` for dark mode, and that scoped hover rules use the neutral token rather than `--wbx-accent-soft` or `--wbx-accent` as their background.

- [x] **Step 2: Run the focused test and verify failure**

Run: `pnpm exec vitest run tests/neutral-hover-colors.test.ts`

Expected: FAIL because `--wbx-hover-surface` is not defined.

- [x] **Step 3: Add the theme token and update scoped hover rules**

Add the two exact token values, then change the book index, sidebar link, community QR close button, and homepage task-grid hover backgrounds to `var(--wbx-hover-surface)`. Preserve `--wbx-accent-soft` for informational tip blocks and selected search results because they are not hover states.

- [x] **Step 4: Run the focused test and verify pass**

Run: `pnpm exec vitest run tests/neutral-hover-colors.test.ts`

Expected: PASS.

### Task 2: Verify interaction states and production output

**Files:**
- Verify: `docs/.vitepress/theme/custom.css`
- Verify: `docs/.vitepress/theme/home.css`
- Verify: `tests/neutral-hover-colors.test.ts`

**Interfaces:**
- Consumes: `--wbx-hover-surface` from Task 1.

- [x] **Step 1: Run relevant regression tests**

Run: `pnpm exec vitest run tests/neutral-hover-colors.test.ts tests/wb-x-index.test.ts tests/sidebar-scroll.test.ts`

Expected: all tests pass.

- [x] **Step 2: Run production build and whitespace validation**

Run: `pnpm run build` and `git diff --check`.

Expected: build succeeds and diff check emits no output.

- [x] **Step 3: Verify browser-computed styles**

In light and dark mode, verify `.wbx-book-index__entry > a:hover` and `.VPSidebarItem .link:hover` resolve to the new gray backgrounds, active sidebar links remain green, and focused links retain green outlines.

- [ ] **Step 4: Commit the implementation**

Commit only the hover CSS, test, plan, and approved design files with a scoped commit message.
