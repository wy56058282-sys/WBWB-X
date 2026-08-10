# Homepage Update Ticker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible, responsive homepage ticker that continuously presents the newest curated site updates in the selected hero area.

**Architecture:** Keep update metadata in a typed, side-effect-free module and render it from `HomePage.vue` after descending date sorting. Use duplicated presentation groups and a CSS transform animation for seamless motion; the visible group owns the real links, while the duplicate is hidden from accessibility APIs and cannot receive focus.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, VitePress `withBase`, CSS keyframes, Vitest, jsdom.

## Global Constraints

- Keep the existing homepage title, CTA buttons, icon composition, value strip, and all destinations unchanged.
- Store updates in a dedicated `homeUpdates.ts`; do not infer updates from Git history or call a runtime API.
- Render dates as `YYYY-MM-DD` and sort records by date descending before display.
- Use a fixed-height single-line ticker with no page-level horizontal overflow at 390px.
- Pause motion on hover and `:focus-within`.
- Under `prefers-reduced-motion: reduce`, stop animation, hide the duplicate group, and show the newest update without motion.
- Use `withBase()` for every update URL.
- Do not add a live region, backend, RSS feed, navigation copy, or inner-page ticker.
- Do not modify or stage `.gitignore`, `package-lock.json`, `.pnpm-store/`, `.vercel-tmp/`, audit artifacts, or unrelated screenshots.

---

### Task 1: Update data and accessible markup

**Files:**
- Create: `docs/.vitepress/theme/homeUpdates.ts`
- Modify: `docs/.vitepress/theme/HomePage.vue:1-102`
- Modify: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Produces: `HomeUpdate` with `{ date: string; title: string; href: string }` and `homeUpdates: readonly HomeUpdate[]`.
- Produces: `.wbx-update-ticker`, `.wbx-update-ticker__viewport`, `.wbx-update-ticker__track`, and two `.wbx-update-ticker__group` elements.
- Consumes: VitePress `withBase(path: string): string`.

- [ ] **Step 1: Write failing DOM and data tests**

Add tests that mount `HomePage`, import `homeUpdates`, and assert:

```ts
expect(homeUpdates.length).toBeGreaterThanOrEqual(3)
expect(homeUpdates.map(({ date }) => date)).toEqual(
  [...homeUpdates].map(({ date }) => date).sort().reverse(),
)

const ticker = document.querySelector('.wbx-update-ticker')
const groups = ticker?.querySelectorAll('.wbx-update-ticker__group')
expect(ticker?.getAttribute('aria-label')).toBe('内容更新')
expect(groups).toHaveLength(2)
expect(groups?.[1].getAttribute('aria-hidden')).toBe('true')
expect(groups?.[1].querySelectorAll('a')).toHaveLength(0)

const links = groups?.[0].querySelectorAll<HTMLAnchorElement>('a') ?? []
expect(Array.from(links, (link) => link.getAttribute('href'))).toEqual(
  homeUpdates.map(({ href }) => href),
)
```

The test mock for `withBase` remains identity-based so paths are exact and auditable.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts`

Expected: FAIL because `homeUpdates.ts` and `.wbx-update-ticker` do not exist.

- [ ] **Step 3: Add typed update data**

Create `homeUpdates.ts`:

```ts
export interface HomeUpdate {
  date: string
  title: string
  href: string
}

export const homeUpdates = [
  {
    date: '2026-08-10',
    title: '第二篇案例目录已校正，11—21 章阅读路线更清晰',
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/',
  },
  {
    date: '2026-08-10',
    title: '旧版小白书链接已恢复，可自动前往新版对应页面',
    href: '/wb-x/',
  },
  {
    date: '2026-08-10',
    title: '站内内容完成清理，搜索结果与公开页面更加准确',
    href: '/wb-x/',
  },
] as const satisfies readonly HomeUpdate[]
```

Keep entries already in descending date order. For equal dates, preserve editorial array order.

- [ ] **Step 4: Render the semantic ticker**

In `HomePage.vue`, import the data and derive a copied, stable sort:

```ts
import { homeUpdates } from './homeUpdates'

const sortedHomeUpdates = [...homeUpdates].sort((a, b) =>
  b.date.localeCompare(a.date),
)
```

Insert this as the first child of `.wbx-hero__copy`:

```vue
<aside class="wbx-update-ticker" aria-label="内容更新">
  <span class="wbx-update-ticker__label">
    <i class="hn hn-megaphone" aria-hidden="true" />
    内容更新
  </span>
  <span class="wbx-update-ticker__viewport">
    <span class="wbx-update-ticker__track">
      <span class="wbx-update-ticker__group">
        <a v-for="update in sortedHomeUpdates" :key="`${update.date}-${update.title}`" :href="withBase(update.href)">
          <time :datetime="update.date">{{ update.date }}</time>
          <span>{{ update.title }}</span>
          <i aria-hidden="true">/</i>
        </a>
      </span>
      <span class="wbx-update-ticker__group" aria-hidden="true">
        <span v-for="update in sortedHomeUpdates" :key="`duplicate-${update.date}-${update.title}`">
          <time :datetime="update.date">{{ update.date }}</time>
          <span>{{ update.title }}</span>
          <i aria-hidden="true">/</i>
        </span>
      </span>
    </span>
  </span>
</aside>
```

- [ ] **Step 5: Run focused tests and commit**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts`

Expected: PASS.

Commit only the three Task 1 files with message `新增首页内容更新数据与通知结构`.

---

### Task 2: Continuous motion, interaction states, and responsive layout

**Files:**
- Modify: `docs/.vitepress/theme/home.css`
- Modify: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: Task 1 ticker class names exactly as specified.
- Produces: `@keyframes wbx-update-ticker-scroll` and responsive/reduced-motion contracts.

- [ ] **Step 1: Add failing CSS contract tests**

Read `home.css` and assert the following rules exist:

```ts
expect(css).toMatch(/\.wbx-update-ticker\s*\{[^}]*height:\s*48px;[^}]*display:\s*grid;/s)
expect(css).toMatch(/\.wbx-update-ticker__viewport\s*\{[^}]*overflow:\s*hidden;/s)
expect(css).toMatch(/\.wbx-update-ticker__track\s*\{[^}]*animation:\s*wbx-update-ticker-scroll[^;]*infinite;/s)
expect(css).toMatch(/\.wbx-update-ticker:is\(:hover, :focus-within\)\s+\.wbx-update-ticker__track\s*\{[^}]*animation-play-state:\s*paused;/s)
expect(css).toMatch(/@keyframes\s+wbx-update-ticker-scroll[\s\S]*transform:\s*translateX\(-50%\);/)
expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.wbx-update-ticker__track\s*\{[^}]*animation:\s*none;/s)
```

Also assert the reduced-motion block hides the second group.

- [ ] **Step 2: Run the focused test and confirm RED**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts`

Expected: FAIL because ticker styles and keyframes do not exist.

- [ ] **Step 3: Implement the desktop ticker styles**

Add a 48px, two-column ticker before the existing hero label. Use `grid-template-columns: auto minmax(0, 1fr)`, `min-width: 0`, `overflow: hidden`, a 2px `#0d100d` border, white background, and a black fixed label. The track and groups are `inline-flex; width: max-content; flex: none`; give each group equal right padding so `translateX(-50%)` lands on the duplicate boundary.

Use a linear animation near 32 seconds. Link hover/focus uses `background: var(--wbx-accent)` and a visible 2px outline. Pause `.wbx-update-ticker__track` from both `.wbx-update-ticker:hover` and `.wbx-update-ticker:focus-within`.

- [ ] **Step 4: Add reduced-motion and responsive rules**

Within the existing reduced-motion section:

```css
.wbx-update-ticker__track {
  transform: none;
  animation: none;
}

.wbx-update-ticker__group:first-child > :not(:first-child),
.wbx-update-ticker__group[aria-hidden='true'] {
  display: none;
}
```

At `max-width: 760px`, keep the 48px height, reduce the label padding and text size, and constrain it to a stable compact width. Do not use viewport-scaled font sizes. Ensure every ancestor has `min-width: 0` and the viewport owns the overflow clipping.

- [ ] **Step 5: Run focused tests and commit**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts tests/wb-x-reading-responsive.test.ts`

Expected: PASS.

Commit Task 2 files with message `完善首页更新通知滚动与响应式样式`.

---

### Task 3: Full verification and visual acceptance

**Files:**
- Verify only; modify Task 1 or Task 2 files only if a regression is found.

**Interfaces:**
- Consumes: the completed update ticker and the repository verification scripts.
- Produces: evidence that the feature is ready for review and deployment.

- [ ] **Step 1: Run repository checks**

Run each command separately:

```bash
./node_modules/.bin/vitest run --dir tests
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
./node_modules/.bin/vitepress build docs
node scripts/generate-legacy-redirects.mjs
node scripts/verify-publish-boundary.mjs
```

Expected: 0 failures and exit code 0 for every command.

- [ ] **Step 2: Start a production preview on an unused port**

Run `./node_modules/.bin/vitepress serve docs --host 127.0.0.1 --port 5175` and keep the session running during browser verification.

- [ ] **Step 3: Verify desktop behavior at 1440x900**

Check `/` and record:

- ticker appears in the selected hero region above the pixel label;
- label remains fixed while the track moves horizontally;
- hover and keyboard focus pause the track;
- each visible update link opens its expected internal route;
- `document.documentElement.scrollWidth === document.documentElement.clientWidth`;
- title, summary, CTAs, artwork, and value strip do not overlap.

- [ ] **Step 4: Verify mobile behavior at 390x844**

Check `/` and record:

- ticker remains 48px tall and single-line;
- fixed label and moving text remain legible;
- no page-level horizontal overflow;
- title, summary, buttons, and artwork remain fully visible.

- [ ] **Step 5: Verify reduced motion**

Emulate `prefers-reduced-motion: reduce` or inspect the matching computed state. Confirm the track has no animation, only the newest visible item remains, and the duplicate group is hidden.

- [ ] **Step 6: Review and final commit if needed**

Run `git diff --check` and inspect `git status --short`. Do not stage protected or unrelated files. If verification required a fix, commit only the ticker files with a precise Chinese commit message; otherwise create no additional commit.
