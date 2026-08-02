# Homepage IP Download Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage download banner's animated pixel book with the supplied static WorkBuddy IP, animate only its heart, rename the Quark action to `教学资料`, and remove the visible extraction-code copy.

**Architecture:** Keep `HomePage.vue` responsible for semantic banner markup and `home.css` responsible for layout. Store and render the supplied transparent PNG unchanged as one static image with its original heart included. The Quark URL remains unchanged so its `pwd=WPc9` parameter continues to unlock the share.

**Tech Stack:** Vue 3, VitePress 1.6, CSS keyframes, Vitest/jsdom, transparent WebP assets.

## Global Constraints

- The IP character must remain completely static; no translate, float, or rotation animation.
- On desktop, position the whole static IP stage `24px` below its contained position and allow bottom overflow; add `24px` footer top clearance. Reset the stage translation and contain overflow on mobile.
- Do not animate, clip, or duplicate any part of the IP image.
- Preserve the full-bleed `100vw` banner, removed border, desktop `48px` top gap, and mobile `38px` top gap.
- Reduce desktop banner and artwork minimum height from `300px` to `270px`, desktop copy vertical padding from `46px` to `31px`, and desktop IP maximum width from `460px` to `424px`; retain the mobile height rules.
- Set the final desktop banner height to `299px`, absolutely position the unchanged `424px` IP stage with `24px` bottom overflow, and keep both columns on `#f3f4f2`.
- Align download copy with the system-panel text column: use a centered-`1480px` dynamic desktop inset, `132px` at `max-width: 1200px`, and retain `24px` on mobile.
- Render `教学资料` with `var(--wbx-accent)` background and border plus `#0d100d` text, including hover and focus-visible states.
- Keep `https://pan.quark.cn/s/ca7b76d97d59?pwd=WPc9`, `target="_blank"`, and `rel="noopener noreferrer"`.
- Do not render `提取码：WPc9` anywhere on the page.
- Keep the `参与共创` link and the restored product footer unchanged.

---

### Task 1: Prepare static IP and heart assets

**Files:**
- Source: `/Users/wangyi/Desktop/image 12.png`
- Create: `docs/public/brand/workbuddy-ip.png`

**Interfaces:**
- Consumes: the supplied 660×544 transparent PNG containing the IP and heart.
- Produces: an unchanged project-local copy of the transparent source image.

- [ ] **Step 1: Inspect the source asset**

Verify that the source has transparency, that the heart is spatially separated from the character, and that the character is not cropped at its visible right, top, or bottom edges.

- [ ] **Step 2: Copy the source without raster editing**

Copy `/Users/wangyi/Desktop/image 12.png` byte-for-byte to `docs/public/brand/workbuddy-ip.png`. Do not regenerate, crop, resize, or recompress it.

- [ ] **Step 4: Validate the assets**

Confirm the copied output has alpha, transparent corners, dimensions `660×544`, and the same checksum as the supplied source.

- [ ] **Step 5: Commit**

```bash
git add docs/public/brand/workbuddy-ip.png
git commit -m "assets: add homepage WorkBuddy IP layers"
```

### Task 2: Update banner markup and regression tests

**Files:**
- Modify: `tests/home-hero-icons.test.ts`
- Modify: `docs/.vitepress/theme/HomePage.vue`

**Interfaces:**
- Consumes: `/brand/workbuddy-ip.png` from Task 1.
- Produces: `.wbx-community__ip` and `.wbx-community__heart` decorative image hooks used by Task 3.

- [ ] **Step 1: Write failing component assertions**

Update the community tests to require the following behavior:

```ts
expect(download?.textContent).toBe('教学资料')
expect(download?.getAttribute('href')).toBe(
  'https://pan.quark.cn/s/ca7b76d97d59?pwd=WPc9',
)
expect(document.querySelector('.wbx-community__code')).toBeNull()
expect(document.body.textContent).not.toContain('提取码：WPc9')
expect(document.querySelector<HTMLImageElement>('.wbx-community__ip')?.getAttribute('src'))
  .toBe('/brand/workbuddy-ip.png')
expect(document.querySelector('.wbx-community__heart')).not.toBeNull()
expect(document.querySelector('.wbx-community__icon')).toBeNull()
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm vitest run tests/home-hero-icons.test.ts`

Expected: FAIL because the current DOM still contains `夸克网盘链接`, the extraction-code paragraph, and the HackerNoon book icon.

- [ ] **Step 3: Implement the semantic markup**

In `HomePage.vue`, change the link label to `教学资料`, delete `.wbx-community__code`, and replace the book icon with:

```vue
<div class="wbx-community__art" aria-hidden="true">
  <div class="wbx-community__ip-stage">
    <img class="wbx-community__ip" src="/brand/workbuddy-ip.png" alt="">
    <img class="wbx-community__heart" :src="withBase('/brand/workbuddy-ip.png')" alt="">
  </div>
</div>
```

- [ ] **Step 4: Run the focused test**

Run: `pnpm vitest run tests/home-hero-icons.test.ts`

Expected: component-copy and asset assertions PASS; animation assertions remain pending until Task 3.

- [ ] **Step 5: Commit**

```bash
git add docs/.vitepress/theme/HomePage.vue tests/home-hero-icons.test.ts
git commit -m "feat: replace download book with WorkBuddy IP"
```

### Task 3: Implement static-IP layout and heart-only motion

**Files:**
- Modify: `tests/home-hero-icons.test.ts`
- Modify: `docs/.vitepress/theme/home.css`

**Interfaces:**
- Consumes: `.wbx-community__ip-stage`, `.wbx-community__ip`, and `.wbx-community__heart` from Task 2.
- Produces: responsive static-character presentation and `wbx-community-heart-pulse` animation.

- [ ] **Step 1: Write failing CSS assertions**

Replace the retired book-motion expectations with assertions that require:

```ts
expect(ip).toMatch(/width:\s*min\(100%, 460px\);/)
expect(ip).not.toMatch(/animation:/)
expect(heart).toMatch(
  /animation:\s*wbx-community-heart-pulse 2\.4s ease-in-out infinite;/,
)
expect(css).toMatch(/@keyframes wbx-community-heart-pulse\s*\{/)
expect(css).not.toContain('wbx-community-book-float')
expect(mobile).toMatch(/\.wbx-community__ip-stage\s*\{[^}]*max-width:\s*300px;/s)
expect(css).toMatch(
  /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-community__heart\s*\{[^}]*animation:\s*none;/,
)
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `pnpm vitest run tests/home-hero-icons.test.ts`

Expected: FAIL because the stylesheet still contains the book float animation and no heart keyframes.

- [ ] **Step 3: Implement the desktop presentation**

Keep `.wbx-community__art` as the right-hand grid cell. Add a bounded relative stage, static IP image, and absolutely positioned heart:

```css
.wbx-community__ip-stage {
  position: relative;
  width: min(92%, 520px);
}

.wbx-community__ip {
  display: block;
  width: min(100%, 460px);
  height: auto;
  margin: 0 auto;
  filter: drop-shadow(0 22px 28px rgb(13 16 13 / 14%));
}

.wbx-community__heart {
  position: absolute;
  top: 8%;
  left: 1%;
  width: 14%;
  height: auto;
  inset: 0;
  width: 100%;
  height: auto;
  clip-path: polygon(0 0, 18.5% 0, 18.5% 29%, 0 29%);
  transform-origin: 50% 70%;
  animation: wbx-community-heart-pulse 2.4s ease-in-out infinite;
}

@keyframes wbx-community-heart-pulse {
  0%, 18%, 100% { opacity: 0; transform: scale(.72); }
  32%, 68% { opacity: 1; transform: scale(1); }
  82% { opacity: 0; transform: scale(1.08); }
}
```

Delete `.wbx-community__icon` and `@keyframes wbx-community-book-float`.

- [ ] **Step 4: Implement mobile and reduced-motion behavior**

Within `@media (max-width: 760px)`, keep the existing stacked banner and add:

```css
.wbx-community__ip-stage {
  max-width: 300px;
  margin: 0 auto;
}
```

Within `@media (prefers-reduced-motion: reduce)`, use:

```css
.wbx-community__heart {
  opacity: 1;
  transform: scale(1);
  animation: none;
}
```

- [ ] **Step 5: Run automated verification**

Run: `pnpm vitest run tests/home-hero-icons.test.ts`

Expected: focused tests PASS.

Run: `pnpm test && pnpm build`

Expected: all Vitest tests PASS and VitePress production build succeeds.

- [ ] **Step 6: Verify in the local browser preview**

At desktop width, confirm the character remains stationary while the heart appears and disappears without shifting layout. At 390px width, confirm the IP is below the actions, no content is covered, the full-bleed banner has no horizontal overflow, and the product footer remains visible.

- [ ] **Step 7: Commit**

```bash
git add docs/.vitepress/theme/home.css tests/home-hero-icons.test.ts
git commit -m "style: animate homepage IP heart"
```
