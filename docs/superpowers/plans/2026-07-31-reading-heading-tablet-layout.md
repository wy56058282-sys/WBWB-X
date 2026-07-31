# Reading Heading Tablet Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage reading-path title and description each occupy one full line at tablet widths.

**Architecture:** Add a focused `@media (max-width: 900px) and (min-width: 761px)` override for the existing `.wbx-section__heading`. Preserve the desktop flex row and the existing mobile wrapping rule below `760px`.

**Tech Stack:** VitePress 1.6, responsive CSS, Vitest.

## Global Constraints

- Desktop widths above `900px` remain unchanged.
- Tablet widths from `761px` through `900px` use a vertical heading stack.
- At tablet widths, the title and description each remain on one line.
- Mobile widths at or below `760px` may wrap naturally.
- No copy, card, link, or typography-size changes.

---

### Task 1: Add the tablet heading layout

**Files:**
- Modify: `docs/.vitepress/theme/home.css`
- Create: `tests/home-reading-heading.test.ts`

- [x] **Step 1: Write a failing CSS contract test**

Assert that `home.css` contains a `761px–900px` media query where `.wbx-section__heading` uses `flex-direction: column`, `align-items: stretch`, and a reduced vertical gap; assert its `h2` and direct paragraph use `white-space: nowrap` and the paragraph has `max-width: none`.

- [x] **Step 2: Run the test and confirm failure**

Run: `pnpm exec vitest run tests/home-reading-heading.test.ts`.

- [x] **Step 3: Add the minimal responsive CSS**

Place the tablet-only media query before the existing `@media (max-width: 760px)` block. Do not alter the desktop or mobile declarations.

- [x] **Step 4: Run focused and regression tests**

Run: `pnpm exec vitest run tests/home-reading-heading.test.ts tests/home-hero-icons.test.ts tests/neutral-hover-colors.test.ts`.

### Task 2: Verify visual output and production build

**Files:**
- Verify: `docs/.vitepress/theme/home.css`
- Verify: `tests/home-reading-heading.test.ts`

- [x] **Step 1: Build the production site and run diff validation**

Run: `pnpm run build` and `git diff --check`.

- [x] **Step 2: Verify at 817px in the local browser**

Confirm the pixel label, title, and description form three rows; title and description each report a single rendered line and no horizontal overflow.

- [x] **Step 3: Commit the implementation**

Commit only the responsive CSS, test, plan, and approved design document.
