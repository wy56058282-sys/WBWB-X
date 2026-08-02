# Homepage Community Download CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage GitHub callout with a full-width Quark download and contribution CTA, add a restrained animated book illustration, and rename the system-section heading.

**Architecture:** Keep the feature inside the existing `HomePage.vue` and `home.css` homepage units. The Quark destination is a static external anchor with explicit security attributes; the contribution action continues to use VitePress `withBase`. Existing DOM/CSS tests in `home-hero-icons.test.ts` provide regression coverage without adding a new component or dependency.

**Tech Stack:** Vue 3, VitePress 1.6, CSS, Vitest 2, jsdom.

## Global Constraints

- Quark URL: `https://pan.quark.cn/s/ca7b76d97d59?pwd=WPc9`.
- Extraction code displayed in selectable text: `WPc9`.
- Contribution destination: `/community/contributing`, resolved with `withBase`.
- Remove the `前往 GitHub` action from this section.
- System heading: `AI 时代，一起象限跃迁`.
- Reuse the project-owned HackerNoon pixel book icon; do not copy WorkBuddy website artwork.
- Preserve the current full-width community container edges.
- No new runtime dependencies, download analytics, or public PDF asset.

---

### Task 1: Homepage copy and download actions

**Files:**
- Modify: `docs/.vitepress/theme/HomePage.vue:215-240`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: VitePress `withBase(path: string): string` already imported by `HomePage.vue`.
- Produces: `.wbx-community__copy`, `.wbx-community__description`, `.wbx-community__download`, and `.wbx-community__code` DOM hooks for Task 2 styling.

- [ ] **Step 1: Write failing content and link tests**

Append the following tests inside the existing `describe('home hero icon navigation', ...)` block:

```ts
  it('uses the approved system heading and community download copy', () => {
    mountHomePage()

    expect(document.querySelector('#wbx-system-title')?.textContent).toBe(
      'AI 时代，一起象限跃迁',
    )
    expect(document.body.textContent).not.toContain('一次成功，不该只发生一次。')
    expect(document.querySelector('#wbx-community-title')?.textContent).toBe(
      '获取 WorkBuddy 小白书与配套资料',
    )
    expect(document.querySelector('.wbx-community__description')?.textContent).toBe(
      '下载完整读本、案例资料与后续更新内容。',
    )
    expect(document.querySelector('.wbx-community__code')?.textContent).toBe(
      '提取码：WPc9',
    )
  })

  it('links to Quark and contribution without a GitHub action', () => {
    mountHomePage()

    const download = document.querySelector<HTMLAnchorElement>(
      '.wbx-community__download',
    )
    const contribution = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('.wbx-community__actions a'),
    ).find((link) => link.textContent === '参与共创')

    expect(download?.textContent).toBe('夸克网盘链接')
    expect(download?.getAttribute('href')).toBe(
      'https://pan.quark.cn/s/ca7b76d97d59?pwd=WPc9',
    )
    expect(download?.getAttribute('target')).toBe('_blank')
    expect(download?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(contribution?.getAttribute('href')).toBe('/community/contributing')
    expect(document.body.textContent).not.toContain('前往 GitHub')
  })
```

- [ ] **Step 2: Run the focused tests and verify they fail**

Run:

```bash
pnpm vitest run tests/home-hero-icons.test.ts
```

Expected: FAIL because the old system/community copy and GitHub action are still rendered, and the new DOM hooks do not exist.

- [ ] **Step 3: Implement the approved copy and actions**

Replace the system heading and community section in `HomePage.vue` with:

```vue
<h2 id="wbx-system-title">AI 时代，一起象限跃迁</h2>
```

```vue
<section class="wbx-community" aria-labelledby="wbx-community-title">
  <div class="wbx-community__copy">
    <p class="wbx-pixel-label">BUILD IN PUBLIC · LEARN IN PUBLIC</p>
    <h2 id="wbx-community-title">获取 WorkBuddy 小白书与配套资料</h2>
    <p class="wbx-community__description">下载完整读本、案例资料与后续更新内容。</p>
    <div class="wbx-community__actions">
      <a
        class="wbx-button wbx-button--primary wbx-community__download"
        href="https://pan.quark.cn/s/ca7b76d97d59?pwd=WPc9"
        target="_blank"
        rel="noopener noreferrer"
      >夸克网盘链接</a>
      <a
        class="wbx-button wbx-button--outline"
        :href="withBase('/community/contributing')"
      >参与共创</a>
    </div>
    <p class="wbx-community__code">提取码：WPc9</p>
  </div>
  <div class="wbx-community__art" aria-hidden="true">
    <i class="hn hn-book wbx-community__icon" />
  </div>
</section>
```

- [ ] **Step 4: Run the focused tests and verify they pass**

Run:

```bash
pnpm vitest run tests/home-hero-icons.test.ts
```

Expected: PASS for all tests in `home-hero-icons.test.ts`.

- [ ] **Step 5: Commit the semantic change**

```bash
git add docs/.vitepress/theme/HomePage.vue tests/home-hero-icons.test.ts
git commit -m "feat: add homepage Quark download CTA"
```

---

### Task 2: Full-width layout, book motion, and responsive behavior

**Files:**
- Modify: `docs/.vitepress/theme/home.css:642-686, 759-766, 931-945`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: Task 1 DOM hooks `.wbx-community__copy`, `.wbx-community__description`, `.wbx-community__actions`, `.wbx-community__code`, `.wbx-community__art`, and `.wbx-community__icon`.
- Produces: Desktop two-column community banner, mobile stacked layout, and `wbx-community-book-float` animation with reduced-motion fallback.

- [ ] **Step 1: Write failing style tests**

Append the following test inside the existing describe block:

```ts
  it('lays out the download callout with safe responsive book motion', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
    const community = baseRule(css, '.wbx-community')
    const copy = baseRule(css, '.wbx-community__copy')
    const actions = baseRule(css, '.wbx-community__actions')
    const art = baseRule(css, '.wbx-community__art')
    const icon = baseRule(css, '.wbx-community__icon')
    const tablet = css.slice(
      css.indexOf('@media (max-width: 960px)'),
      css.indexOf('@media (min-width: 761px)'),
    )
    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(community).toMatch(/grid-template-columns:\s*minmax\(0, 1fr\) minmax\(240px, 0\.72fr\);/)
    expect(community).toMatch(/margin:\s*28px 0 0;/)
    expect(copy).toMatch(/max-width:\s*680px;/)
    expect(actions).toMatch(/flex-direction:\s*row;/)
    expect(art).toMatch(/overflow:\s*hidden;/)
    expect(icon).toMatch(/animation:\s*wbx-community-book-float 4\.8s ease-in-out infinite;/)
    expect(css).toMatch(/@keyframes wbx-community-book-float\s*\{/)
    expect(tablet).not.toContain('.wbx-community')
    expect(mobile).toMatch(/\.wbx-community\s*\{[^}]*grid-template-columns:\s*1fr;/s)
    expect(mobile).toMatch(/\.wbx-community__actions\s*\{[^}]*flex-direction:\s*column;/s)
    expect(css).toMatch(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-community__icon\s*\{[^}]*animation:\s*none;/,
    )
  })
```

- [ ] **Step 2: Run the focused test and verify it fails**

Run:

```bash
pnpm vitest run tests/home-hero-icons.test.ts
```

Expected: FAIL because the community banner still uses the old flex layout and static absolute icon.

- [ ] **Step 3: Implement the desktop banner styles**

Replace the existing community rules with CSS matching this structure:

```css
.wbx-community {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 0.72fr);
  align-items: stretch;
  gap: 28px;
  min-height: 300px;
  margin: 28px 0 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--wbx-line);
  background: #f3f4f2;
}

.wbx-community__copy {
  align-self: center;
  max-width: 680px;
  padding: 46px 0 46px 52px;
}

.wbx-community .wbx-pixel-label {
  margin-bottom: 13px;
  color: color-mix(in srgb, var(--wbx-accent) 50%, #0d100d);
}

.wbx-community h2 {
  color: #0d100d;
}

.wbx-community__description {
  max-width: 620px;
  margin: 16px 0 0;
  color: #4f5752;
  line-height: 1.75;
}

.wbx-community__actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
}

.wbx-community .wbx-button {
  min-width: 180px;
  min-height: 50px;
  font-size: 15px;
}

.wbx-community__code {
  margin: 12px 0 0;
  color: #4f5752;
  font-size: 13px;
  user-select: text;
}

.wbx-community__art {
  position: relative;
  display: grid;
  min-height: 300px;
  place-items: center;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgb(50 230 185 / 18%), transparent 58%),
    #e7ece9;
}

.wbx-community__icon {
  color: color-mix(in srgb, var(--wbx-accent) 64%, #0d100d);
  font-size: clamp(150px, 17vw, 230px);
  filter: drop-shadow(0 20px 24px rgb(13 16 13 / 16%));
  animation: wbx-community-book-float 4.8s ease-in-out infinite;
}

@keyframes wbx-community-book-float {
  0%,
  100% {
    transform: translateY(8px) rotate(-7deg);
  }

  50% {
    transform: translateY(-10px) rotate(-2deg);
  }
}
```

- [ ] **Step 4: Implement mobile and reduced-motion rules**

Delete the obsolete `.wbx-community` override from the existing `@media (max-width: 960px)` block. Its flex-direction and `padding-right: 170px` declarations belong to the retired layout and would override the new grid.

Inside the existing `@media (max-width: 760px)` block, replace the current community overrides with:

```css
.wbx-community {
  grid-template-columns: 1fr;
  gap: 0;
  min-height: 0;
  margin: 18px 0 0;
}

.wbx-community__copy {
  padding: 32px 24px;
}

.wbx-community__actions {
  flex-direction: column;
  width: 100%;
}

.wbx-community .wbx-button {
  width: 100%;
}

.wbx-community__art {
  min-height: 180px;
}

.wbx-community__icon {
  font-size: 150px;
}
```

Add a top-level motion preference after the responsive blocks:

```css
@media (prefers-reduced-motion: reduce) {
  .wbx-community__icon {
    animation: none;
    transform: rotate(-4deg);
  }
}
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
pnpm vitest run tests/home-hero-icons.test.ts
```

Expected: PASS.

- [ ] **Step 6: Run full verification**

Run:

```bash
pnpm test
pnpm build
git diff --check
```

Expected: all Vitest tests pass, the VitePress production build completes, and `git diff --check` prints no errors.

- [ ] **Step 7: Commit the visual change**

```bash
git add docs/.vitepress/theme/home.css tests/home-hero-icons.test.ts
git commit -m "style: redesign homepage download callout"
```

---

### Task 3: Browser verification and publication handoff

**Files:**
- Verify only: `docs/.vitepress/theme/HomePage.vue`
- Verify only: `docs/.vitepress/theme/home.css`

**Interfaces:**
- Consumes: completed Tasks 1 and 2 plus the existing GitHub Pages deployment workflow.
- Produces: verified desktop/mobile visual behavior and a branch ready for review and merge.

- [ ] **Step 1: Start the local development server**

Run:

```bash
pnpm dev
```

Expected: VitePress reports a local URL and serves the homepage without errors.

- [ ] **Step 2: Verify desktop behavior at 1144px**

Check the homepage in the in-app browser:

- system title reads `AI 时代，一起象限跃迁`;
- callout edges align with the existing full-width homepage content area;
- text, actions, and extraction code remain left of the illustration;
- Quark opens in a new tab and contribution resolves to `/community/contributing`;
- animated book never covers text or actions.

- [ ] **Step 3: Verify mobile behavior at 390px**

Check that the callout stacks into one column, both buttons span the content width, extraction code remains readable, and no horizontal scroll appears.

- [ ] **Step 4: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` and confirm the book remains visible with no animation.

- [ ] **Step 5: Confirm branch cleanliness**

Run:

```bash
git status --short
git log --oneline --decorate -5
```

Expected: only the intended plan/spec history and implementation commits are present, with no uncommitted changes.

---

### Task 4: Restore the borderless homepage product footer

**Files:**
- Modify: `docs/.vitepress/theme/HomePage.vue`
- Modify: `docs/.vitepress/theme/home.css`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: the homepage root and existing global color/link tokens.
- Produces: `.wbx-home-footer`, `.wbx-home-footer__inner`, `.wbx-home-footer__product`, and `.wbx-home-footer__copyright` hooks.

- [ ] **Step 1: Replace the retired-footer test with failing product-footer tests**

Replace `omits the retired homepage footer container and its styling` with assertions that mount the real homepage and verify the exact product copy, copyright, attribution URL, and borderless responsive rules.

- [ ] **Step 2: Run the focused test and verify it fails**

Run `pnpm vitest run tests/home-hero-icons.test.ts` and expect failure because `.wbx-home-footer` is absent.

- [ ] **Step 3: Add the semantic footer**

Append a `footer.wbx-home-footer` after `main.wbx-home`. Use a product paragraph containing `以真实场景为主线的 WB-X 实战读本` and a HackerNoon link to `https://hackernoon.com/pixel-icon-library`, plus a copyright paragraph containing `Copyright © 2026 WB-X.SparkX`.

- [ ] **Step 4: Add borderless responsive styling**

Use the page background with `background: transparent`, `border: 0`, and a desktop flex row. At `max-width: 760px`, change the inner wrapper to a centered column so each information group appears on its own line.

- [ ] **Step 5: Run focused and full verification**

Run `pnpm vitest run tests/home-hero-icons.test.ts`, `pnpm test`, `pnpm build`, and `git diff --check`. All must pass.

- [ ] **Step 6: Commit and refresh the preview**

Commit `HomePage.vue`, `home.css`, and the test as `feat: restore homepage product footer`, push the existing branch, and refresh the retained local preview tab.
