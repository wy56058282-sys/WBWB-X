# Primary CTA Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the approved WorkBuddy-inspired sheen, arrow handoff, and green fill interaction to the homepage “开始阅读” CTA.

**Architecture:** Add semantic presentation wrappers to the existing anchor and implement the interaction with scoped CSS pseudo-elements and transforms. Keep navigation and accessible text unchanged, and provide a reduced-motion override without JavaScript or new dependencies.

**Tech Stack:** Vue 3, VitePress, CSS, Vitest, JSDOM

## Global Constraints

- Only the homepage hero “开始阅读” link changes.
- Keep `/wb-x/`, “开始阅读”, all straight corners, and the secondary button unchanged.
- Use `#32e6b9`, `0.3s ease`, a `0.5s` sheen, and green active shadow `0 4px 12px rgba(50, 230, 185, 0.28)`.
- Support hover, `:focus-visible`, active, and `prefers-reduced-motion: reduce`.

---

### Task 1: Homepage primary CTA motion

**Files:**
- Modify: `tests/home-hero-icons.test.ts`
- Modify: `docs/.vitepress/theme/HomePage.vue`
- Modify: `docs/.vitepress/theme/home.css`

**Interfaces:**
- Consumes: Existing `.wbx-button`, `.wbx-button--primary`, and `withBase('/wb-x/')` contracts.
- Produces: `.wbx-hero-cta`, `.wbx-hero-cta__label`, `.wbx-hero-cta__arrow`, `.wbx-hero-cta__arrow--out`, and `.wbx-hero-cta__arrow--in` presentation hooks.

- [ ] **Step 1: Write the failing regression test**

Mount `HomePage`, assert one scoped CTA with `/wb-x/` and “开始阅读”, assert two decorative arrow icons, and assert the exact sheen, arrow handoff, green fill, active shadow, and reduced-motion CSS declarations.

- [ ] **Step 2: Run the focused test and confirm RED**

Run `pnpm vitest run tests/home-hero-icons.test.ts`. The new test must fail because `.wbx-hero-cta` and its animation rules do not exist.

- [ ] **Step 3: Implement the minimal Vue and CSS change**

Add the label and arrow-stage markup to the existing link. Add scoped CSS rules using a button `::before` sheen, arrow-stage `::before` fill, two translated arrows, green active shadow, and the reduced-motion override.

- [ ] **Step 4: Verify GREEN and the project**

Run `pnpm vitest run tests/home-hero-icons.test.ts`, `pnpm test`, and `pnpm build`; require zero failures and a successful production build.

- [ ] **Step 5: Review and publish**

Run `git diff --check`, inspect the scoped diff, commit the three production/test files plus this spec and plan, push `codex/primary-cta-motion`, and open a pull request against `main`.
