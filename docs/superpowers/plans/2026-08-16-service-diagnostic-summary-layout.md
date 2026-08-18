# Service Diagnostic Summary Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the diagnostic price, duration, fixed deliverable, and business WeChat summary into the left main content of the custom service hero while leaving the right column exclusively for the page outline.

**Architecture:** Keep `ServicePage.vue` as the single source of truth and wrap the existing facts and WeChat channel in a semantic summary container inside the offer copy. Use CSS Grid for the desktop two-part summary, a narrower two-column middle layout, and a one-column mobile stack. Preserve all channel-state rendering and service content.

**Tech Stack:** Vue 3 SFC, VitePress, CSS Grid, Vitest, jsdom.

## Global Constraints

- Preserve all service copy, prices, channel states, links, and section order.
- Do not modify FDE content, the service ladder, application flow, cases, or the home page.
- Do not overwrite unrelated dirty-worktree changes.
- Use test-driven development: RED before production edits, then GREEN.
- Verify at 1440px, 900px, and 390px with no overlap or horizontal overflow.

---

## Task 1: Lock The Summary Ownership And Responsive Contract

**Files:**
- Modify: `tests/service-page.test.ts`
- Modify: `tests/service-page-style.test.ts`

- [x] Add a component test that mounts the page and verifies `.wbx-service-diagnostic-summary` is inside `.wbx-service-offer__copy`, contains the existing facts and business WeChat nodes, and leaves the offer without right-side summary siblings.
- [x] Replace the obsolete `translateY(50px)` style assertion with contracts for the new summary grid, zero transform, and desktop/middle/mobile layouts.
- [x] Run `./node_modules/.bin/vitest run tests/service-page.test.ts tests/service-page-style.test.ts` and confirm the new assertions fail for the expected missing structure/styles.

## Task 2: Move The Existing Summary Into The Left Content

**Files:**
- Modify: `docs/.vitepress/theme/ServicePage.vue`

- [x] After the primary CTA, add `.wbx-service-diagnostic-summary` and move the unchanged facts `<dl>` plus business WeChat block inside it.
- [x] Keep the business WeChat `v-if`, path, alt text, dimensions, placeholder copy, and accessibility labels unchanged.
- [x] Confirm no duplicate facts or channel block remains as a direct child of the offer header.

## Task 3: Implement The Three-Range Layout

**Files:**
- Modify: `docs/.vitepress/theme/service.css`

- [x] Make `.wbx-service-offer` a one-column main-content surface instead of a three-column hero.
- [x] Add a desktop summary grid with the facts taking the flexible width and the 180px WeChat block as the auxiliary column.
- [x] Remove the old facts `translateY(50px)` positioning.
- [x] At `max-width: 900px`, retain two columns with a narrower auxiliary track where space allows.
- [x] At `max-width: 640px`, stack facts and WeChat, keep both within the viewport, and center or stretch the channel without overflow.
- [x] Run the focused tests and make them pass.

## Task 4: Verify Behavior And Visual Geometry

**Files:**
- Verify only: `docs/.vitepress/theme/ServicePage.vue`
- Verify only: `docs/.vitepress/theme/service.css`
- Verify only: `tests/service-page.test.ts`
- Verify only: `tests/service-page-style.test.ts`

- [x] Run `./node_modules/.bin/vitest run tests/service-page.test.ts tests/service-page-style.test.ts tests/product-page-computed-style.test.ts`.
- [x] Run the full local suite with `./node_modules/.bin/vitest run`.
- [x] Run `npm run build` and `git diff --check`.
- [x] In a fresh production preview, inspect `/help/` at 1440x900, 900x900, and 390x844; verify summary placement, right-outline exclusivity, channel state, focus behavior, and zero horizontal overflow.
- [x] Review the diff for placeholder text, accidental content changes, duplicated nodes, and unrelated file edits.
