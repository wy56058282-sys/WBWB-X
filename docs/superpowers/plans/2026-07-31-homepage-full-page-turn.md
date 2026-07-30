# Homepage Full-Page Turn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero’s corner peel with a full right-page turn hinged exactly on the 50% center line, and change the hero monogram to `WB-X`.

**Architecture:** Keep `HeroStickerPage.vue` as the state and accessibility controller. Change only the visual contract in `home.css`: the right-half cover becomes a 3D page with `transform-origin: left center`, while the inside sticker layer remains fixed beneath it. Use opacity-only fallbacks for compact and reduced-motion layouts.

**Tech Stack:** Vue 3, VitePress 1.6, TypeScript, CSS transforms, Vitest, jsdom.

## Global Constraints

- The page hinge must coincide with the hero stage’s exact 50% center line.
- Desktop uses an interruptible 280ms `rotateY` transition with `cubic-bezier(0.77, 0, 0.175, 1)`.
- `max-width: 760px` uses opacity switching instead of 3D rotation.
- `prefers-reduced-motion: reduce` uses a 1ms state change.
- Existing focus migration, `inert`, `aria-hidden`, pointer, touch, outside-click, and Escape behavior must remain unchanged.
- The hero monogram must display `WB-X`.

---

### Task 1: Hero monogram copy

**Files:**
- Modify: `docs/.vitepress/brand.ts:25-36`
- Test: `tests/brand.test.ts:24-39`

**Interfaces:**
- Consumes: `brand.shortMark: string` rendered by `HomePage.vue`.
- Produces: `brand.shortMark === 'WB-X'`.

- [ ] **Step 1: Write the failing test**

Change the approved identity assertion:

```ts
expect(brand.shortMark).toBe('WB-X')
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/brand.test.ts
```

Expected: FAIL because the current value is `WBWB-X`.

- [ ] **Step 3: Implement the minimal copy change**

In `docs/.vitepress/brand.ts`:

```ts
shortMark: 'WB-X',
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/brand.test.ts
```

Expected: all `brand.test.ts` tests PASS.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/brand.ts tests/brand.test.ts
git commit -m "fix: shorten homepage hero mark"
```

### Task 2: Right-half full-page turn

**Files:**
- Modify: `docs/.vitepress/theme/home.css:125-210`
- Modify: `docs/.vitepress/theme/home.css:358-378`
- Modify: `docs/.vitepress/theme/home.css:850-895`
- Test: `tests/hero-sticker-page.test.ts:260-325`

**Interfaces:**
- Consumes: `data-open="true"` emitted by `HeroStickerPage.vue`; `.wbx-sticker-page__cover` and `.wbx-sticker-page__inside` layers.
- Produces: a desktop cover hinged on `left center`, a `rotateY(-180deg)` open state, and opacity-only compact/reduced-motion fallbacks.

- [ ] **Step 1: Replace the old peel-contract test with a failing full-page contract**

Add assertions that require:

```ts
expect(css).toMatch(
  /\.wbx-sticker-page\s*\{[^}]*perspective:\s*1400px;/s,
)
expect(css).toMatch(
  /\.wbx-sticker-page__cover\s*\{[^}]*transform-origin:\s*left center;[^}]*backface-visibility:\s*hidden;[^}]*transform:\s*rotateY\(0deg\);[^}]*transform 280ms cubic-bezier\(0\.77,\s*0,\s*0\.175,\s*1\)/s,
)
expect(css).toMatch(
  /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__cover\s*\{[^}]*transform:\s*rotateY\(-180deg\);/s,
)
expect(css).not.toMatch(
  /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__cover\s*\{[^}]*clip-path:/s,
)
```

Update the reduced-motion assertion to require `transform: none` and `opacity: 0`. Add a compact-media assertion requiring the same opacity-only open state within `@media (max-width: 760px)`.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/hero-sticker-page.test.ts
```

Expected: FAIL because the cover still uses a corner `clip-path` transition.

- [ ] **Step 3: Implement the desktop page geometry**

Change the core rules to:

```css
.wbx-sticker-page {
  position: relative;
  min-height: inherit;
  overflow: hidden;
  isolation: isolate;
  perspective: 1400px;
  perspective-origin: left center;
}

.wbx-sticker-page__cover {
  z-index: 2;
  background: var(--wbx-accent);
  backface-visibility: hidden;
  transform: rotateY(0deg);
  transform-origin: left center;
  transform-style: preserve-3d;
  transition:
    transform 280ms cubic-bezier(0.77, 0, 0.175, 1),
    filter 280ms cubic-bezier(0.77, 0, 0.175, 1);
  will-change: transform;
}

.wbx-sticker-page[data-open="true"] .wbx-sticker-page__cover {
  filter: drop-shadow(-16px 0 0 rgb(13 16 13 / 16%));
  transform: rotateY(-180deg);
  pointer-events: none;
}
```

Do not add a second center border: the existing `.wbx-sticker-page__inside { border-left: 1px solid #0d100d; }` remains the only spine line.

- [ ] **Step 4: Implement compact and reduced-motion fallbacks**

Inside `@media (max-width: 760px)`, disable perspective and use:

```css
.wbx-sticker-page {
  perspective: none;
}

.wbx-sticker-page__cover {
  transform: none;
  transition: opacity 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.wbx-sticker-page[data-open="true"] .wbx-sticker-page__cover {
  filter: none;
  opacity: 0;
  transform: none;
}
```

Inside `@media (prefers-reduced-motion: reduce)`, require:

```css
.wbx-sticker-page__cover {
  transition: opacity 1ms linear !important;
}

.wbx-sticker-page[data-open="true"] .wbx-sticker-page__cover {
  filter: none;
  opacity: 0;
  transform: none;
}
```

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/hero-sticker-page.test.ts
```

Expected: all HeroStickerPage tests PASS.

- [ ] **Step 6: Run full verification**

Run:

```bash
pnpm test
pnpm run check:links
pnpm run check:assets
pnpm run build
```

Expected: zero test failures, zero broken internal links, approved assets valid, and VitePress build exits 0. The existing Rollup chunk-size warning is non-blocking.

- [ ] **Step 7: Commit**

```bash
git add docs/.vitepress/theme/home.css tests/hero-sticker-page.test.ts
git commit -m "feat: turn the full homepage right page"
```

### Task 3: Browser acceptance check

**Files:**
- Verify only: `docs/.vitepress/theme/home.css`
- Verify only: `docs/.vitepress/theme/HomePage.vue`

**Interfaces:**
- Consumes: the built homepage at `/`.
- Produces: recorded acceptance evidence for desktop and mobile layouts.

- [ ] **Step 1: Start the local preview**

Run:

```bash
pnpm run preview -- --host 127.0.0.1 --port 4173
```

Expected: preview responds at `http://127.0.0.1:4173/`.

- [ ] **Step 2: Verify desktop geometry and interaction**

At 1087×738:

- The spine is exactly at 50% of the green hero stage.
- Hovering or clicking the lower-right trigger turns the entire right page from that spine.
- The white page exposes all three partner stickers.
- The monogram reads `WB-X`.
- Leaving the region, clicking outside, and Escape close the page.

- [ ] **Step 3: Verify mobile fallback**

At 390×844:

- No horizontal scrollbar appears.
- The cover switches by opacity without 3D distortion.
- The trigger remains inside the viewport.
- Partner stickers remain tappable.

- [ ] **Step 4: Verify keyboard and reduced-motion behavior**

- Tab order exposes cover links while closed and partner links while open.
- Focus returns to the trigger when closing a focused sticker.
- With reduced motion enabled, the state change occurs without spatial rotation.

- [ ] **Step 5: Record the result**

If all checks pass, append the tested viewport sizes and result to:

```text
.superpowers/sdd/2026-07-31-homepage-full-page-turn/progress.md
```

If browser access is blocked, record the exact blocker and keep the automated CSS/behavior tests as evidence; do not claim browser acceptance.
