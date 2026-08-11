# Homepage Update Synced Carousel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's continuous update list with a synchronized single-update carousel whose date flips vertically and whose matching title scrolls horizontally only when it overflows, while also removing the `【示例】` marker from the daily AI news case title.

**Architecture:** `HomePage.vue` owns one current update index and one pause state, schedules six-second changes with a cleanup-safe timeout, and measures the current title after each render. Vue `Transition` animates the keyed date; the keyed title link contains a duplicated visual text track only when overflow requires a seamless marquee.

**Tech Stack:** Vue 3.5 `<script setup>`, TypeScript, VitePress `withBase`, CSS transitions/keyframes, Vitest 2, jsdom.

## Global Constraints

- Keep the ticker transparent, 28px high, and positioned with `translateY(-60px)`.
- Show exactly one update object at a time; its date, title, and href must always come from the same object.
- Advance every 6000ms and animate the date for 400ms.
- Pause switching and marquee motion on hover and `focus-within`.
- Under `prefers-reduced-motion: reduce`, show the newest update without automatic switching or motion.
- Preserve `homeUpdates`, its descending-date sort, all destinations, and every other homepage element.
- Do not modify or stage `.gitignore`, `package-lock.json`, `.pnpm-store/`, `.vercel-tmp/`, audit artifacts, or unrelated screenshots.

---

### Task 1: Remove the case example marker

**Files:**
- Modify: `docs/cases/submissions/daily-ai-news/index.md:1-20`
- Test: `tests/case-sidebar.test.ts`

**Interfaces:**
- Produces: frontmatter and H1 title `用 WorkBuddy 自动整理每日 AI 资讯`.
- Preserves: route `/cases/submissions/daily-ai-news/` and all body content.

- [ ] **Step 1: Add the failing content assertion**

Read the case file in `tests/case-sidebar.test.ts` and assert both title surfaces are clean:

```ts
const dailyAiNews = readFileSync(
  'docs/cases/submissions/daily-ai-news/index.md',
  'utf8',
)
expect(dailyAiNews).toContain('title: 用 WorkBuddy 自动整理每日 AI 资讯')
expect(dailyAiNews).toContain('# 用 WorkBuddy 自动整理每日 AI 资讯')
expect(dailyAiNews).not.toContain('【示例】')
```

- [ ] **Step 2: Verify RED**

Run: `./node_modules/.bin/vitest run --dir tests tests/case-sidebar.test.ts`

Expected: FAIL because the frontmatter title and H1 still contain `【示例】`.

- [ ] **Step 3: Make the minimal content edit**

Change only these two lines:

```md
title: 用 WorkBuddy 自动整理每日 AI 资讯
```

```md
# 用 WorkBuddy 自动整理每日 AI 资讯
```

- [ ] **Step 4: Verify GREEN and commit**

Run: `./node_modules/.bin/vitest run --dir tests tests/case-sidebar.test.ts`

Expected: PASS.

Commit only the case markdown and its test with message `移除案例示例标记`.

---

### Task 2: Add synchronized carousel state and markup

**Files:**
- Modify: `docs/.vitepress/theme/HomePage.vue:1-130`
- Modify: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: sorted `homeUpdates` entries shaped as `{ date: string; title: string; href: string }`.
- Produces: `currentHomeUpdate`, `isUpdatePaused`, `isUpdateTitleOverflowing`, and one `.wbx-update-ticker__link` containing the current update.
- Produces DOM hooks: `.wbx-update-ticker__date-viewport`, `.wbx-update-ticker__date`, `.wbx-update-ticker__content`, `.wbx-update-ticker__title-track`, and `.wbx-update-ticker__title`.

- [ ] **Step 1: Add failing timer and correspondence tests**

Use fake timers and mount the real component. Stub `matchMedia` to report `matches: false`, then assert:

```ts
vi.useFakeTimers()
mountHomePage()

const ticker = document.querySelector('.wbx-update-ticker')
expect(ticker?.querySelectorAll('.wbx-update-ticker__link')).toHaveLength(1)
expect(ticker?.querySelector('time')?.textContent).toBe(homeUpdates[0].date)
expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
  homeUpdates[0].title,
)

await vi.advanceTimersByTimeAsync(6000)
expect(ticker?.querySelector('time')?.textContent).toBe(homeUpdates[1].date)
expect(ticker?.querySelector('.wbx-update-ticker__title')?.textContent).toBe(
  homeUpdates[1].title,
)
expect(ticker?.querySelector<HTMLAnchorElement>('a')?.getAttribute('href')).toBe(
  homeUpdates[1].href,
)
```

Add a full-cycle assertion after another `homeUpdates.length * 6000` interval, and restore real timers in `afterEach`.

Provide a controllable `ResizeObserver` test stub and override the current title element's `offsetWidth` plus the content viewport's `clientWidth` before invoking its callback. Use `offsetWidth: 420, clientWidth: 240` to assert the duplicate `aria-hidden` title appears, then `offsetWidth: 180, clientWidth: 240` to assert it disappears.

- [ ] **Step 2: Add failing pause, cleanup, and reduced-motion tests**

Assert `mouseenter` prevents advancement, `mouseleave` schedules a fresh 6000ms interval, focus prevents replacement, and unmount clears pending timers. In a separate mount with `matchMedia(...).matches === true`, advance 18000ms and assert the first update remains visible.

- [ ] **Step 3: Verify RED**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts`

Expected: FAIL because the current markup renders duplicated groups and has no state-driven timer.

- [ ] **Step 4: Implement lifecycle-safe state**

Import Vue APIs:

```ts
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
```

Implement these exact state rules:

```ts
const UPDATE_INTERVAL_MS = 6000
const currentUpdateIndex = ref(0)
const isUpdatePaused = ref(false)
const prefersReducedMotion = ref(false)
const isUpdateTitleOverflowing = ref(false)
const updateTickerRef = ref<HTMLElement | null>(null)
const updateTitleViewportRef = ref<HTMLElement | null>(null)
const updateTitleTextRef = ref<HTMLElement | null>(null)
const currentHomeUpdate = computed(
  () => sortedHomeUpdates[currentUpdateIndex.value],
)
let updateTimer: ReturnType<typeof window.setTimeout> | undefined
let updateMotionQuery: MediaQueryList | undefined
let updateResizeObserver: ResizeObserver | undefined
```

`scheduleUpdate()` must clear the existing timeout, stop when paused/reduced or fewer than two entries exist, then schedule one 6000ms timeout that increments modulo array length and schedules the next timeout. `measureUpdateTitle()` must set overflow when `updateTitleTextRef.offsetWidth > updateTitleViewportRef.clientWidth`. Watch the current index and call the measure after `nextTick()`.

On mount, read `matchMedia('(prefers-reduced-motion: reduce)')`, listen for changes, create a `ResizeObserver` for the title viewport, measure, and schedule. On unmount, clear the timeout, remove the media listener, and disconnect the observer.

- [ ] **Step 5: Replace the ticker markup**

Render a two-column aside with pause events. Keep the date and link keyed from the same `currentHomeUpdate`:

```vue
<aside
  ref="updateTickerRef"
  class="wbx-update-ticker"
  :class="{ 'is-paused': isUpdatePaused }"
  aria-label="内容更新"
  @mouseenter="pauseUpdates"
  @mouseleave="resumeUpdates"
  @focusin="pauseUpdates"
  @focusout="handleUpdateFocusOut"
>
  <span class="wbx-update-ticker__date-viewport">
    <Transition name="wbx-update-date">
      <time
        :key="`${currentHomeUpdate.date}-${currentHomeUpdate.title}`"
        class="wbx-update-ticker__date"
        :datetime="currentHomeUpdate.date"
      >{{ currentHomeUpdate.date }}</time>
    </Transition>
  </span>
  <span ref="updateTitleViewportRef" class="wbx-update-ticker__content">
    <a
      :key="`${currentHomeUpdate.date}-${currentHomeUpdate.title}`"
      class="wbx-update-ticker__link"
      :class="{ 'is-overflowing': isUpdateTitleOverflowing }"
      :href="withBase(currentHomeUpdate.href)"
    >
      <span class="wbx-update-ticker__title-track">
        <span ref="updateTitleTextRef" class="wbx-update-ticker__title">{{ currentHomeUpdate.title }}</span>
        <span v-if="isUpdateTitleOverflowing" class="wbx-update-ticker__title" aria-hidden="true">{{ currentHomeUpdate.title }}</span>
      </span>
    </a>
  </span>
</aside>
```

`handleUpdateFocusOut` resumes only when `event.relatedTarget` is not contained by `updateTickerRef`.

- [ ] **Step 6: Verify GREEN and commit**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts`

Expected: all component state, correspondence, pause, reduced-motion, and cleanup tests PASS.

Commit `HomePage.vue` and the test with message `实现首页更新同步轮播`.

---

### Task 3: Style vertical dates and overflow-only title marquee

**Files:**
- Modify: `docs/.vitepress/theme/home.css:63-170`
- Modify: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: Task 2 DOM classes and `is-overflowing` / `is-paused` states.
- Produces: 400ms vertical date transition and a seamless current-title marquee.

- [ ] **Step 1: Replace old CSS contract tests with new failing contracts**

Assert the base ticker uses `grid-template-columns: 92px minmax(0, 1fr)`, stays 28px high, transparent, and translated `-60px`. Assert the date viewport clips vertically, date enter/leave transforms use `translateY(100%)` and `translateY(-100%)`, and transition duration is 400ms. Assert only `.is-overflowing .wbx-update-ticker__title-track` owns the horizontal animation.

- [ ] **Step 2: Verify RED**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts`

Expected: FAIL because the stylesheet still contains the duplicated-group ticker rules.

- [ ] **Step 3: Implement the new CSS surface**

Keep the existing ticker box dimensions and use:

```css
.wbx-update-ticker {
  height: 28px;
  display: grid;
  min-width: 0;
  grid-template-columns: 92px minmax(0, 1fr);
  overflow: hidden;
  border: 0;
  transform: translateY(-60px);
  color: #0d100d;
  background: transparent;
}

.wbx-update-ticker__date-viewport,
.wbx-update-ticker__content {
  position: relative;
  min-width: 0;
  height: 28px;
  overflow: hidden;
}

.wbx-update-ticker__date {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  font-family: var(--wbx-pixel);
  font-size: 11px;
  color: #4f5752;
}

.wbx-update-date-enter-active,
.wbx-update-date-leave-active {
  transition: transform 400ms ease, opacity 400ms ease;
}

.wbx-update-date-enter-from { transform: translateY(100%); opacity: 0; }
.wbx-update-date-leave-to { transform: translateY(-100%); opacity: 0; }
```

The title link fills the content viewport. Its track is `inline-flex`, `width: max-content`, and uses a 32px gap between duplicated titles. Apply `animation: wbx-update-title-marquee 12s linear 400ms infinite` only under `.is-overflowing`; the keyframe translates to `calc(-50% - 16px)`. Pause it under `.wbx-update-ticker:hover`, `.wbx-update-ticker:focus-within`, and `.is-paused`.

At `max-width: 760px`, use an 82px date column and retain the 320px ticker width. Under reduced motion, remove date transitions and title animation; do not hide the current link.

- [ ] **Step 4: Verify GREEN and commit**

Run: `./node_modules/.bin/vitest run --dir tests tests/home-hero-icons.test.ts tests/wb-x-reading-responsive.test.ts`

Expected: 30 or more tests PASS with no ticker CSS contract failures.

Commit the stylesheet and test with message `完善首页更新轮播动效`.

---

### Task 4: Full verification and browser acceptance

**Files:**
- No source changes unless verification exposes a defect.

**Interfaces:**
- Verifies all outputs from Tasks 1-3 as one user-facing workflow.

- [ ] **Step 1: Run repository checks**

Run:

```bash
./node_modules/.bin/vitest run --dir tests
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
./node_modules/.bin/vitepress build docs
node scripts/generate-legacy-redirects.mjs
node scripts/verify-publish-boundary.mjs
git diff --check
```

Expected: all tests and checks exit 0; the build completes; no whitespace errors.

- [ ] **Step 2: Verify desktop behavior in the production preview**

At 1440x900, record that the date and title initially match `homeUpdates[0]`, switch together after 6000ms, and loop after the final entry. Confirm long titles move horizontally, hover and keyboard focus freeze both mechanisms, the ticker remains inside Hero, and `scrollWidth === clientWidth`.

- [ ] **Step 3: Verify mobile and reduced motion**

At 390x844, confirm the date and title remain in separate columns, ticker height is 28px, no page horizontal overflow exists, and the current link remains keyboard accessible. With reduced motion enabled, wait longer than 6000ms and confirm the newest entry remains static with no date or title animation.

- [ ] **Step 4: Verify the case title**

Open `/cases/submissions/daily-ai-news/` and confirm both the H1 and sidebar entry read `用 WorkBuddy 自动整理每日 AI 资讯` without `【示例】`.

- [ ] **Step 5: Final scope audit**

Run `git status --short` and `git diff --stat HEAD~3..HEAD`. Confirm only the case title/test, homepage carousel component/test, and carousel stylesheet/test were committed. Leave all pre-existing unrelated worktree changes untouched.
