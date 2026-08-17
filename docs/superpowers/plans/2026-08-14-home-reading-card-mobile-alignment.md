# Home Reading Card Mobile Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align each mobile reading-card icon with its Chinese title and align its arrow with the tag row.

**Architecture:** Keep the existing three-column grid and DOM structure. Add breakpoint-scoped alignment declarations in `home.css`, protected by source-contract tests and verified in a production mobile preview.

**Tech Stack:** Vue 3, VitePress, CSS Grid, Vitest.

## Global Constraints

- Apply only at `max-width: 768px`.
- Preserve desktop layout and all content.
- Apply the same alignment to all four cards.
- Keep the page free of horizontal overflow.

---

### Task 1: Lock and implement mobile card alignment

**Files:**
- Modify: `tests/home-hero-icons.test.ts`
- Modify: `docs/.vitepress/theme/home.css`

**Interfaces:**
- Consumes: existing `.wbx-reading-card`, `.wbx-reading-card__icon`, and `.wbx-reading-card__arrow` selectors.
- Produces: breakpoint-scoped icon/title and arrow/tag alignment rules.

- [ ] **Step 1: Write the failing test**

Add assertions that the mobile breakpoint makes the card top-aligned, offsets the icon to the title row, and offsets the arrow to the tag row while the desktop base rules remain unchanged.

- [ ] **Step 2: Run the focused test to verify RED**

Run: `./node_modules/.bin/vitest run tests/home-hero-icons.test.ts`

Expected: FAIL because the mobile alignment declarations are absent.

- [ ] **Step 3: Implement the minimal CSS**

Add only the necessary declarations inside the existing mobile media query. Retain the `max-width: 420px` sizing overrides.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
./node_modules/.bin/vitest run tests/home-hero-icons.test.ts
./node_modules/.bin/vitest run
./node_modules/.bin/vitepress build docs
```

Expected: all commands exit 0.

- [ ] **Step 5: Verify the production preview**

At 482px width, compare icon/title and arrow/tag bounding boxes for all four cards, confirm no overlap, and assert `scrollWidth === clientWidth`.

- [ ] **Step 6: Commit**

```bash
git add tests/home-hero-icons.test.ts docs/.vitepress/theme/home.css
git commit -m "优化移动端阅读卡片对齐"
```

