# Homepage Reveal Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the homepage partner reveal feature and restore a static green hero while preserving the five hero links and first reading-path book icon.

**Architecture:** Replace the `HeroStickerPage` wrapper in `HomePage.vue` with a plain `.wbx-hero__stage` container. Delete the now-unused interaction component and its behavior tests, remove all sticker-page-specific CSS, and retain partner data/assets as dormant future resources.

**Tech Stack:** Vue 3, VitePress 1.6, TypeScript, CSS, Vitest, jsdom.

## Global Constraints

- The homepage hero is a single static green surface.
- No partner panel, fold, mask, clip-path reveal, turn, trigger, hover-open, click-open, outside-close, Escape-close, or touch-toggle behavior remains.
- `WB-X` remains ordinary non-interactive hero text.
- All five current hero pixel-icon links and destinations remain unchanged.
- The people icon continues to link to `/wb-x/第四篇 岗位与行业落地/`.
- The first reading-path card continues to use `hn-book`.
- Partner data and Logo assets remain in the repository but are not imported or rendered by the homepage.
- Desktop and compact layouts remain complete, responsive, and free of horizontal overflow.

---

### Task 1: Restore the static homepage hero

**Files:**
- Modify: `docs/.vitepress/theme/HomePage.vue`
- Modify: `docs/.vitepress/theme/home.css`
- Delete: `docs/.vitepress/theme/HeroStickerPage.vue`
- Modify: `tests/home-hero-icons.test.ts`
- Delete: `tests/hero-sticker-page.test.ts`
- Keep unchanged: `docs/.vitepress/theme/heroPartners.ts`
- Keep unchanged: `docs/public/brand/partners/*`

**Interfaces:**
- Produces: `.wbx-hero__stage` with direct `.wbx-hero__copy` and `.wbx-hero__art` children.
- Preserves: five `.wbx-icon-card` anchors, `brand.shortMark === 'WB-X'`, and `readingPaths[0].icon === 'hn-book'`.

- [ ] **Step 1: Write failing static-structure tests**

Update `tests/home-hero-icons.test.ts` to require:

```ts
const stage = document.querySelector('.wbx-hero__stage')
expect(stage?.querySelector(':scope > .wbx-hero__copy')).not.toBeNull()
expect(stage?.querySelector(':scope > .wbx-hero__art')).not.toBeNull()
expect(stage?.classList.contains('wbx-sticker-page')).toBe(false)
expect(document.querySelector('.wbx-sticker-page__inside')).toBeNull()
expect(document.querySelector('.wbx-sticker-page__trigger')).toBeNull()
```

Retain the exact five-link aria-label/href assertions and the first-card `hn-book` assertion.

Add source-contract assertions:

```ts
expect(homeSource).not.toContain('HeroStickerPage')
expect(homeSource).not.toContain('heroPartners')
expect(homeCss).not.toContain('.wbx-sticker-page')
expect(homeCss).not.toContain('.wbx-partner-sticker')
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: FAIL because the stage is still rendered by `HeroStickerPage` and sticker-page CSS remains.

- [ ] **Step 3: Replace the wrapper with a plain stage**

In `HomePage.vue`:

- Remove imports of `HeroStickerPage` and `heroPartners`.
- Replace:

```vue
<HeroStickerPage class="wbx-hero__stage" :partners="heroPartners">
  <!-- current copy and art -->
</HeroStickerPage>
```

with:

```vue
<div class="wbx-hero__stage">
  <!-- current copy and art unchanged -->
</div>
```

Do not change the title, summary, buttons, monogram, five icon links, metrics, reading-path content, or downstream sections.

- [ ] **Step 4: Remove reveal-only CSS and restore the stage grid**

Delete all selectors for:

```text
.wbx-sticker-page
.wbx-sticker-page__cover
.wbx-sticker-page__inside
.wbx-sticker-page__trigger
.wbx-partner-sticker
.wbx-partner-sticker__*
```

Restore the stage as the layout grid:

```css
.wbx-hero__stage {
  display: grid;
  min-height: 568px;
  grid-template-columns: 1.08fr 0.92fr;
  overflow: hidden;
  border: 2px solid #0d100d;
  border-radius: 8px 8px 0 0;
  background: var(--wbx-accent);
}
```

Move the existing responsive grid changes from `.wbx-sticker-page__cover` back to `.wbx-hero__stage`:

```css
@media (max-width: 1200px) {
  .wbx-hero__stage {
    grid-template-columns: 1.02fr 0.98fr;
  }
}

@media (max-width: 960px) {
  .wbx-hero__stage {
    grid-template-columns: 1fr;
  }
}
```

Remove reveal-only reduced-motion rules. Preserve icon float/reduced-motion rules unrelated to the reveal.

- [ ] **Step 5: Delete the unused component and behavior tests**

After confirming no imports remain:

```bash
rg -n "HeroStickerPage|wbx-sticker-page" docs tests
```

Delete:

```text
docs/.vitepress/theme/HeroStickerPage.vue
tests/hero-sticker-page.test.ts
```

Do not delete `heroPartners.ts` or partner assets.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts tests/hero-partners.test.ts
```

Expected: both files PASS.

- [ ] **Step 7: Run full verification**

Run:

```bash
pnpm test
pnpm run check:links
pnpm run check:assets
pnpm run build
```

Expected: all tests pass, no broken internal links, retained assets pass, and VitePress build exits 0. The existing Rollup chunk-size warning is non-blocking.

- [ ] **Step 8: Commit**

```bash
git add docs/.vitepress/theme/HomePage.vue docs/.vitepress/theme/home.css tests/home-hero-icons.test.ts
git add -u docs/.vitepress/theme/HeroStickerPage.vue tests/hero-sticker-page.test.ts
git commit -m "refactor: remove homepage partner reveal"
```

### Task 2: Browser acceptance

**Files:**
- Verify: `docs/.vitepress/theme/HomePage.vue`
- Verify: `docs/.vitepress/theme/home.css`
- Update: `.superpowers/sdd/2026-07-31-homepage-full-page-turn/progress.md`

**Interfaces:**
- Consumes: freshly built homepage at `/`.
- Produces: desktop/mobile evidence that the hero is static and complete.

- [ ] **Step 1: Start a fresh local preview**

Run:

```bash
pnpm exec vitepress preview docs --host 127.0.0.1 --port 4174
```

- [ ] **Step 2: Verify desktop at 1087×738**

- Only the green hero is visible.
- No white fold, mask, recommendation panel, or reveal trigger exists.
- `WB-X`, five icons, metrics, buttons, and value strip render without overlap.
- Five icon destinations remain clickable.

- [ ] **Step 3: Verify mobile at 390×844**

- The hero grows to contain both copy and art.
- No content is clipped and `scrollWidth === innerWidth`.
- Five icon cards remain inside the art region.

- [ ] **Step 4: Record evidence**

Append automated and browser results to:

```text
.superpowers/sdd/2026-07-31-homepage-full-page-turn/progress.md
```
