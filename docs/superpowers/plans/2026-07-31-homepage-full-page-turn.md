# Homepage Diagonal Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage hero’s 3D turn with a bottom-right white diagonal reveal, change the first reading-path icon to a book, and add a fifth hero icon linking to Part 4.

**Architecture:** Keep `HeroStickerPage.vue` as the state and accessibility controller around the complete hero. Preserve the green cover in place and reveal the white recommendation panel above it by animating the panel’s `clip-path` from a bottom-right triangle to a full rectangle. Keep content and destinations data-driven in `HomePage.vue`.

**Tech Stack:** Vue 3, VitePress 1.6, TypeScript, CSS `clip-path`, Vitest, jsdom.

## Global Constraints

- Closed state shows the complete green hero plus a small white triangle anchored at the lower-right corner.
- Open state expands the white recommendation surface from lower-right to upper-left until it covers the complete hero.
- No `perspective`, `rotateY`, center hinge, page thickness, or 3D turn remains.
- Transition duration is 280ms with `cubic-bezier(0.77, 0, 0.175, 1)`.
- Click is the reliable desktop/mobile control; desktop hover remains a preview shortcut.
- Existing focus migration, `inert`, `aria-hidden`, outside-click, pointer-leave, Escape, and touch behavior remains intact.
- The trigger hit area stays at least 72×72px and above the reveal surface.
- Reduced-motion mode switches state without animation.
- The first reading-path card uses a book icon.
- A fifth people icon links to `/wb-x/第四篇 岗位与行业落地/`.
- Existing four hero icon destinations and the `WB-X` monogram remain unchanged.

---

### Task 1: Reading-path book icon and Part 4 hero entry

**Files:**
- Modify: `docs/.vitepress/theme/HomePage.vue`
- Modify: `docs/.vitepress/theme/home.css`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: HackerNoon icon classes already loaded by `docs/.vitepress/theme/index.ts`.
- Produces: `readingPaths[0].icon === 'hn-book'`; `.wbx-icon-card--people` linking to the Part 4 directory.

- [ ] **Step 1: Write failing template tests**

In `tests/home-hero-icons.test.ts`, require the first reading card and five hero links:

```ts
const readingCards = document.querySelectorAll('.wbx-reading-card')
expect(readingCards[0]?.querySelector('.hn-book')).not.toBeNull()
expect(readingCards[0]?.querySelector('.hn-user')).toBeNull()

const heroLinks = [
  ...document.querySelectorAll<HTMLAnchorElement>('.wbx-hero__art .wbx-icon-card'),
]
expect(heroLinks).toHaveLength(5)

const part4 = document.querySelector<HTMLAnchorElement>('.wbx-icon-card--people')
expect(decodeURI(part4?.getAttribute('href') ?? '')).toContain(
  '/wb-x/第四篇 岗位与行业落地/',
)
expect(part4?.getAttribute('aria-label')).toBe('查看 Part 4 岗位与行业篇')
```

Add a style assertion requiring a dedicated `.wbx-icon-card--people` position rule.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: FAIL because the first card still uses `hn-user` and only four hero links exist.

- [ ] **Step 3: Implement the minimal template changes**

Change the first path:

```ts
{
  icon: 'hn-book',
  meta: 'PART 01 · CH. 01—10',
  // keep the remaining fields unchanged
}
```

Add this link inside `.wbx-hero__art` without changing the existing four:

```vue
<a
  class="wbx-icon-card wbx-icon-card--people"
  :href="withBase('/wb-x/第四篇 岗位与行业落地/')"
  aria-label="查看 Part 4 岗位与行业篇"
>
  <i class="hn hn-users" aria-hidden="true" />
</a>
```

- [ ] **Step 4: Position the people icon**

Add a `.wbx-icon-card--people` rule using the existing absolute-position pattern. Place it in the available center-lower whitespace and verify it does not overlap the monogram, metrics, four existing cards, or the 72×72px lower-right trigger.

Add responsive positions in the existing `max-width: 960px` and `max-width: 420px` sections so the fifth card stays inside the art area without horizontal overflow.

- [ ] **Step 5: Run the focused test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress/theme/HomePage.vue docs/.vitepress/theme/home.css tests/home-hero-icons.test.ts
git commit -m "feat: add Part 4 homepage entry"
```

### Task 2: Replace 3D turn with diagonal reveal

**Files:**
- Modify: `docs/.vitepress/theme/home.css`
- Test: `tests/hero-sticker-page.test.ts`

**Interfaces:**
- Consumes: `.wbx-sticker-page[data-open="true" | "false"]`, `.wbx-sticker-page__inside`, `.wbx-sticker-page__cover`, and `.wbx-sticker-page__trigger`.
- Produces: a white inside layer above the green cover whose `clip-path` expands from a lower-right triangle to a full rectangle.

- [ ] **Step 1: Replace the old style-contract assertions**

In `tests/hero-sticker-page.test.ts`, require the new contract:

```ts
expect(css).not.toMatch(/perspective:\s*1400px/)
expect(css).not.toMatch(/rotateY\(/)
expect(css).not.toMatch(/transform-origin:\s*left center/)

expect(css).toMatch(
  /\.wbx-sticker-page__inside\s*\{[^}]*z-index:\s*3;[^}]*clip-path:\s*polygon\(100% 88%,\s*100% 100%,\s*88% 100%\);[^}]*transition:\s*clip-path 280ms cubic-bezier\(0\.77,\s*0,\s*0\.175,\s*1\)/s,
)
expect(css).toMatch(
  /\.wbx-sticker-page\[data-open="true"\]\s+\.wbx-sticker-page__inside\s*\{[^}]*clip-path:\s*polygon\(0 0,\s*100% 0,\s*100% 100%,\s*0 100%\);/s,
)
expect(css).toMatch(
  /\.wbx-sticker-page__trigger\s*\{[^}]*z-index:\s*4;[^}]*width:\s*72px;[^}]*height:\s*72px;/s,
)
```

Require reduced motion to remove the transition:

```ts
expect(css).toMatch(
  /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-sticker-page__inside\s*\{[^}]*transition:\s*none !important;/s,
)
```

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm exec vitest run tests/hero-sticker-page.test.ts tests/home-hero-icons.test.ts
```

Expected: FAIL because current styles use `perspective`, `rotateY`, and opacity fallback.

- [ ] **Step 3: Remove 3D geometry from the shell and cover**

Remove `perspective`, `perspective-origin`, `backface-visibility`, `transform-style`, `transform-origin`, `rotateY`, 3D drop-shadow, and the compact opacity-switch rules.

Keep the shell’s `position`, sizing, overflow, and isolation. Keep the cover’s responsive grid and green background:

```css
.wbx-sticker-page {
  position: relative;
  min-height: 568px;
  overflow: hidden;
  isolation: isolate;
}

.wbx-sticker-page__cover {
  z-index: 2;
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  background: var(--wbx-accent);
}
```

- [ ] **Step 4: Implement the bottom-right white reveal**

Place the inside layer above the cover and animate only `clip-path`:

```css
.wbx-sticker-page__inside {
  z-index: 3;
  inset: 0;
  background: #fff;
  clip-path: polygon(100% 88%, 100% 100%, 88% 100%);
  transition: clip-path 280ms cubic-bezier(0.77, 0, 0.175, 1);
  will-change: clip-path;
}

.wbx-sticker-page[data-open="true"] .wbx-sticker-page__inside {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
}

.wbx-sticker-page__trigger {
  z-index: 4;
  width: 72px;
  height: 72px;
}
```

Do not hide or fade the green cover; the white layer visually covers it as the clip expands.

- [ ] **Step 5: Preserve pointer and focus isolation**

Retain the component’s existing `inert` and `aria-hidden` state updates. Keep CSS pointer rules so:

```css
.wbx-sticker-page[data-open="false"] .wbx-sticker-page__inside {
  pointer-events: none;
}

.wbx-sticker-page[data-open="true"] .wbx-sticker-page__cover {
  pointer-events: none;
}
```

The trigger remains interactive in both states.

- [ ] **Step 6: Simplify responsive and reduced-motion rules**

At `max-width: 960px`, retain the one-column cover grid but use the same diagonal reveal. Remove perspective and opacity overrides.

For reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  .wbx-sticker-page__inside {
    transition: none !important;
  }
}
```

- [ ] **Step 7: Run focused tests and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/hero-sticker-page.test.ts tests/home-hero-icons.test.ts
```

Expected: both test files PASS.

- [ ] **Step 8: Commit**

```bash
git add docs/.vitepress/theme/home.css tests/hero-sticker-page.test.ts
git commit -m "feat: reveal homepage partners diagonally"
```

### Task 3: Full verification and browser acceptance

**Files:**
- Verify: `docs/.vitepress/theme/HomePage.vue`
- Verify: `docs/.vitepress/theme/HeroStickerPage.vue`
- Verify: `docs/.vitepress/theme/home.css`
- Update: `.superpowers/sdd/2026-07-31-homepage-full-page-turn/progress.md`

**Interfaces:**
- Consumes: the built homepage at `/`.
- Produces: automated and browser evidence for desktop, mobile, dark, and reduced-motion behavior.

- [ ] **Step 1: Run repository verification**

Run:

```bash
pnpm test
pnpm run check:links
pnpm run check:assets
pnpm run build
```

Expected: all tests pass, no broken internal links, asset checks pass, and VitePress build exits 0. The existing Rollup chunk-size warning is non-blocking.

- [ ] **Step 2: Start a fresh preview**

Run:

```bash
pnpm exec vitepress preview docs --host 127.0.0.1 --port 4174
```

Expected: `http://127.0.0.1:4174/` loads the newly built assets.

- [ ] **Step 3: Verify desktop at 1087×738**

- Closed: full green hero is visible; only a small white lower-right triangle shows.
- Open: the white triangle expands diagonally until the white partner panel fills the hero.
- No hinge, center line, 3D perspective, or rotated surface appears.
- Three partner stickers are clickable after opening.
- `WB-X`, all five hero icons, and metrics do not overlap.
- The fifth people icon enters Part 4.
- The first reading card uses a book icon.
- Pointer leave, outside click, and Escape close the panel.

- [ ] **Step 4: Verify mobile at 390×844**

- No horizontal scrollbar appears.
- The 72×72px trigger stays inside the hero.
- Clicking opens and closes the reveal.
- Partner stickers are tappable when open.
- Five hero icons remain inside the art region when closed.

- [ ] **Step 5: Verify dark and reduced-motion modes**

- Dark mode keeps the recommendation surface white with readable text and stickers.
- Reduced motion switches immediately between the small triangle and full white surface.
- Closed/open interactive elements respect `inert`, `aria-hidden`, and focus return.

- [ ] **Step 6: Record evidence**

Append the tested viewports, automated command results, and browser observations to:

```text
.superpowers/sdd/2026-07-31-homepage-full-page-turn/progress.md
```

- [ ] **Step 7: Final commit if verification changed tracked files**

```bash
git add .superpowers/sdd/2026-07-31-homepage-full-page-turn/progress.md
git commit -m "docs: record diagonal reveal acceptance"
```
