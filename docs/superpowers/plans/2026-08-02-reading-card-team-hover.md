# Reading Card Team Hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the WorkBuddy Team pricing card hover behavior to the four homepage reading-path cards while retaining the site's straight-corner visual system.

**Architecture:** Keep the change inside the existing `.wbx-reading-card` CSS rules. Add a source-level Vitest regression test so later visual changes cannot silently restore horizontal movement, dark borders, short timing, or the old shadow.

**Tech Stack:** VitePress, CSS, Vitest

## Global Constraints

- Change only `.wbx-reading-card` hover and focus-visible behavior.
- Preserve all content, grid layout, card dimensions, and straight corners.
- Use `translateY(-4px)`, `0 12px 32px rgba(0, 0, 0, 0.08)`, and `0.3s ease`.

---

### Task 1: Reading-path card hover

**Files:**
- Modify: `tests/home-hero-icons.test.ts`
- Modify: `docs/.vitepress/theme/home.css`

**Interfaces:**
- Consumes: Existing `.wbx-reading-card` base and hover/focus-visible selectors.
- Produces: The approved Team-style hover and an exact CSS regression contract.

- [ ] **Step 1: Write the failing regression test**

Assert that the base card transitions `border-color`, `box-shadow`, and `transform` over `0.3s ease`, and that hover/focus-visible keeps `border-color: var(--wbx-line)`, uses the approved shadow, and applies `translateY(-4px)`.

- [ ] **Step 2: Verify the test fails for the old interaction**

Run `pnpm vitest run tests/home-hero-icons.test.ts` and confirm the failure identifies the old `0.16s`, dark border, or diagonal translation.

- [ ] **Step 3: Implement the minimal CSS change**

Replace only the transition and hover/focus-visible declarations in `home.css`.

- [ ] **Step 4: Verify the regression and full project**

Run `pnpm vitest run tests/home-hero-icons.test.ts`, `pnpm test`, and `pnpm build`.

- [ ] **Step 5: Review the diff**

Confirm that no unrelated selectors, copy, spacing, or assets changed.
