# Homepage Full-Surface Turn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the entire homepage green hero surface from its left edge to reveal a full-size white recommendations panel, and display `WB-X` as the hero monogram.

**Architecture:** Keep `HeroStickerPage.vue` as the state and accessibility controller, but move it from the right art column to become the complete `.wbx-hero__stage` shell. Its cover holds both the copy and art columns and rotates as one surface; its inside layer remains fixed beneath it and uses the existing partner data.

**Tech Stack:** Vue 3, VitePress 1.6, TypeScript, CSS 3D transforms, Vitest, jsdom.

## Global Constraints

- The complete green hero surface, including copy, buttons, icons, monogram, and metrics, turns as one page.
- The turn axis is the hero’s left edge; no center hinge or half-page turn remains.
- Desktop uses an interruptible 280ms `rotateY` transition with `cubic-bezier(0.77, 0, 0.175, 1)`.
- `max-width: 960px` uses opacity switching instead of 3D rotation.
- `prefers-reduced-motion: reduce` uses a 1ms state change.
- Existing focus migration, `inert`, `aria-hidden`, pointer, touch, outside-click, and Escape behavior must remain unchanged.
- The inside layer covers the full hero and continues to render partners from `heroPartners`.
- The hero monogram must display `WB-X`.

---

### Task 1: Hero monogram copy

**Status:** Completed in commit `64c52a5`.

**Files:**
- Modified: `docs/.vitepress/brand.ts`
- Tested: `tests/brand.test.ts`

**Produced interface:** `brand.shortMark === 'WB-X'`.

### Task 2: Whole-surface interaction shell and turn

**Files:**
- Modify: `docs/.vitepress/theme/HomePage.vue:99-150`
- Modify: `docs/.vitepress/theme/home.css:35-220`
- Modify: `docs/.vitepress/theme/home.css:358-378`
- Modify: `docs/.vitepress/theme/home.css:750-900`
- Test: `tests/home-hero-icons.test.ts`
- Test: `tests/hero-sticker-page.test.ts`

**Interfaces:**
- Consumes: `HeroStickerPage({ partners: HeroStickerPartner[] })`, its default slot, and `data-open="true"`.
- Produces: `HeroStickerPage` as the `.wbx-hero__stage` root; `.wbx-sticker-page__cover` containing `.wbx-hero__copy` and `.wbx-hero__art`; a full-size inside recommendation layer.

- [ ] **Step 1: Write failing structure and style tests**

In `tests/home-hero-icons.test.ts`, mount the homepage and require:

```ts
const stage = document.querySelector('.wbx-hero__stage')
const cover = stage?.querySelector(':scope > .wbx-sticker-page__cover')

expect(stage).toHaveClass('wbx-sticker-page')
expect(cover?.querySelector('.wbx-hero__copy')).not.toBeNull()
expect(cover?.querySelector('.wbx-hero__art')).not.toBeNull()
expect(
  document.querySelector('.wbx-hero__art > .wbx-sticker-page'),
).toBeNull()
```

If the available Vitest DOM matchers do not provide `toHaveClass`, use:

```ts
expect(stage?.classList.contains('wbx-sticker-page')).toBe(true)
```

In `tests/hero-sticker-page.test.ts`, replace the half-page contract with assertions requiring:

```ts
expect(css).toMatch(
  /\.wbx-sticker-page\s*\{[^}]*perspective:\s*1400px;/s,
)
expect(css).toMatch(
  /\.wbx-sticker-page__cover\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*1\.08fr 0\.92fr;[^}]*transform-origin:\s*left center;[^}]*backface-visibility:\s*hidden;[^}]*transform:\s*rotateY\(0deg\);[^}]*transform 280ms cubic-bezier\(0\.77,\s*0,\s*0\.175,\s*1\)/s,
)
expect(css).toMatch(
  /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__cover\s*\{[^}]*transform:\s*rotateY\(-180deg\);/s,
)
expect(css).not.toMatch(/\.wbx-sticker-page__cover\s*\{[^}]*clip-path:/s)
```

Also require the inside layer to span the whole stage without `border-left`.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts tests/hero-sticker-page.test.ts
```

Expected: FAIL because `HeroStickerPage` still lives inside `.wbx-hero__art` and the current contract turns only the right half.

- [ ] **Step 3: Move `HeroStickerPage` to the stage boundary**

Change the hero structure to:

```vue
<section class="wbx-hero" aria-labelledby="wbx-hero-title">
  <HeroStickerPage class="wbx-hero__stage" :partners="heroPartners">
    <div class="wbx-hero__copy">
      <!-- retain the current label, title, summary, and actions verbatim -->
    </div>
    <div class="wbx-hero__art" aria-label="WorkBuddy 像素图标组合">
      <!-- retain monogram, four icon links, and metrics verbatim -->
    </div>
  </HeroStickerPage>
</section>
```

Do not change hrefs, aria-labels, copy, or icon positions.

- [ ] **Step 4: Implement whole-surface desktop geometry**

Use:

```css
.wbx-sticker-page {
  position: relative;
  min-height: 568px;
  overflow: hidden;
  isolation: isolate;
  perspective: 1400px;
  perspective-origin: left center;
}

.wbx-sticker-page__cover {
  z-index: 2;
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
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
  filter: drop-shadow(18px 0 0 rgb(13 16 13 / 16%));
  transform: rotateY(-180deg);
  pointer-events: none;
}
```

Make `.wbx-sticker-page__inside` cover `inset: 0`, remove its left divider, and retain the existing white surface plus partner sticker grid.

- [ ] **Step 5: Mirror existing responsive stage grids on the cover**

Where the current `.wbx-hero__stage` grid changes, apply the equivalent column definition to `.wbx-sticker-page__cover`:

```css
@media (max-width: 1200px) {
  .wbx-sticker-page__cover {
    grid-template-columns: 1.02fr 0.98fr;
  }
}

@media (max-width: 960px) {
  .wbx-sticker-page__cover {
    grid-template-columns: 1fr;
  }
}
```

The stage root no longer needs to be a grid because its absolute cover owns layout.

- [ ] **Step 6: Implement compact and reduced-motion fallbacks**

Inside `@media (max-width: 960px)`:

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

Inside `@media (prefers-reduced-motion: reduce)`:

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

- [ ] **Step 7: Run focused tests and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts tests/hero-sticker-page.test.ts
```

Expected: both test files PASS.

- [ ] **Step 8: Run full verification**

Run:

```bash
pnpm test
pnpm run check:links
pnpm run check:assets
pnpm run build
```

Expected: zero test failures, zero broken internal links, approved assets valid, and VitePress build exits 0. The existing Rollup chunk-size warning is non-blocking.

- [ ] **Step 9: Commit**

```bash
git add docs/.vitepress/theme/HomePage.vue docs/.vitepress/theme/home.css tests/home-hero-icons.test.ts tests/hero-sticker-page.test.ts
git commit -m "feat: turn the whole homepage hero surface"
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

- [ ] **Step 2: Verify desktop**

At 1087×738:

- The entire green hero turns from its left edge, including copy, buttons, icons, monogram, and metrics.
- The white panel fills the complete hero and exposes all three partner stickers.
- The monogram reads `WB-X`.
- Leaving the region, clicking outside, and Escape close the panel.

- [ ] **Step 3: Verify mobile fallback**

At 390×844:

- No horizontal scrollbar appears.
- The cover switches by opacity without 3D distortion.
- The trigger remains inside the viewport.
- Partner stickers remain tappable.

- [ ] **Step 4: Verify keyboard and reduced motion**

- Closed state exposes only cover links; open state exposes only partner links.
- Focus returns to the trigger when closing a focused sticker.
- Reduced motion switches state without spatial rotation.

- [ ] **Step 5: Record the result**

Append tested viewports and results to:

```text
.superpowers/sdd/2026-07-31-homepage-full-page-turn/progress.md
```

If browser access is blocked, record the exact blocker and keep automated tests as evidence; do not claim browser acceptance.
