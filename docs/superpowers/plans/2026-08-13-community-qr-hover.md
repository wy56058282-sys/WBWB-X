# 交流群二维码悬停交互实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让桌面端顶部导航“交流群”支持稳定的悬停二维码预览，同时保留点击固定、键盘操作和触屏点击。

**Architecture:** `Layout.vue` 通过文档级事件委托识别所有 `#community` 导航链接，并根据输入方式调用预览或固定入口；`CommunityQr.vue` 维护 `closed`、`preview`、`pinned` 三态和 180ms 关闭计时器。现有定位函数、视觉 CSS、二维码资源及弹层结构保持不变。

**Tech Stack:** Vue 3、VitePress、TypeScript、Vitest、JSDOM

## Global Constraints

- 桌面悬停仅在 `(hover: hover) and (pointer: fine)` 成立时启用。
- 悬停进入立即打开，触发项和弹层都离开后延迟 180ms 关闭。
- 悬停预览不得抢焦点；点击或键盘固定打开继续使用现有焦点管理。
- 触屏与不支持 hover 的设备保持点击操作。
- 不修改二维码视觉、二维码资源、弹层定位算法或页面滚动行为。
- 不新增依赖，不修改与交流群弹层无关的页面和组件。

---

### Task 1: 实现二维码弹层三态状态机

**Files:**
- Modify: `docs/.vitepress/theme/CommunityQr.vue`
- Test: `tests/community-qr.test.ts`

**Interfaces:**
- Produces: `previewCommunityQr(trigger: HTMLElement | null): void`
- Produces: `pinCommunityQr(trigger: HTMLElement | null): void`
- Produces: `scheduleCommunityQrClose(): void`
- Produces: `cancelCommunityQrClose(): void`
- Preserves: `openCommunityQr(trigger)` as a temporary compatibility alias only if another repository reference still needs it; otherwise replace it atomically in Task 2.

- [ ] **Step 1: Write failing component tests for preview and pinned focus behavior**

Add tests that open with the new preview API and assert the dialog appears without changing `document.activeElement`, then pin the same active trigger and assert the dialog receives focus:

```ts
it('previews without stealing focus and pins without closing', async () => {
  const before = document.createElement('button')
  const trigger = document.createElement('a')
  document.body.append(before, trigger)
  mountCommunityQr()
  before.focus()

  previewCommunityQr(trigger)
  await nextTick()
  expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  expect(document.activeElement).toBe(before)

  pinCommunityQr(trigger)
  await nextTick()
  expect(document.activeElement).toBe(document.querySelector('[role="dialog"]'))
})
```

Also assert that closing a preview does not focus the trigger, while closing a pinned dialog restores focus to a still-connected trigger.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
./node_modules/.bin/vitest run tests/community-qr.test.ts
```

Expected: FAIL because the new preview/pin exports and state distinction do not exist.

- [ ] **Step 3: Implement the minimal three-state API**

In `CommunityQr.vue`, replace the toggle-oriented listener payload with an explicit action:

```ts
type CommunityQrAction = 'preview' | 'pin' | 'schedule-close' | 'cancel-close'
type CommunityQrListener = (action: CommunityQrAction, trigger?: HTMLElement | null) => void

export function previewCommunityQr(trigger: HTMLElement | null = null) {
  listeners.forEach((listener) => listener('preview', trigger))
}

export function pinCommunityQr(trigger: HTMLElement | null = null) {
  listeners.forEach((listener) => listener('pin', trigger))
}

export function scheduleCommunityQrClose() {
  listeners.forEach((listener) => listener('schedule-close'))
}

export function cancelCommunityQrClose() {
  listeners.forEach((listener) => listener('cancel-close'))
}
```

Use a local `mode` ref with values `closed | preview | pinned`, a single `ReturnType<typeof setTimeout> | null` timer, and a `CLOSE_DELAY_MS = 180` constant. Preview opens and positions without focusing; pin cancels the timer, sets `pinned`, and focuses the dialog after `nextTick`. Closing only restores focus for `pinned` mode and only when `triggerToRestore?.isConnected`.

- [ ] **Step 4: Add failing fake-timer tests for delayed close cancellation**

Use `vi.useFakeTimers()` to assert:

```ts
scheduleCommunityQrClose()
vi.advanceTimersByTime(179)
expect(dialog()).not.toBeNull()
cancelCommunityQrClose()
vi.advanceTimersByTime(1)
expect(dialog()).not.toBeNull()
scheduleCommunityQrClose()
vi.advanceTimersByTime(180)
await nextTick()
expect(dialog()).toBeNull()
```

Add a second case proving `scheduleCommunityQrClose()` does not close `pinned` mode.

- [ ] **Step 5: Run the focused test and verify RED for timer behavior**

Run the same focused Vitest command. Expected: timer tests FAIL until schedule/cancel are connected to the component listener.

- [ ] **Step 6: Complete timer, pointer-region, and teardown behavior**

Connect the action listener to the component state. Add `@pointerenter="cancelCommunityQrClose"` and `@pointerleave="scheduleCommunityQrClose"` to the popover section. Clear the pending timer in `close()` and `onBeforeUnmount()`; retain positioning, outside click, Escape, close button and Tab loop behavior.

- [ ] **Step 7: Run the focused suite and verify GREEN**

Run:

```bash
./node_modules/.bin/vitest run tests/community-qr.test.ts
```

Expected: all component tests pass, including existing position, outside click, Escape, close button and focus restoration cases.

- [ ] **Step 8: Commit Task 1**

```bash
git add docs/.vitepress/theme/CommunityQr.vue tests/community-qr.test.ts
git commit -m "实现交流群二维码预览状态"
```

---

### Task 2: 接入导航悬停、点击固定与触屏回退

**Files:**
- Modify: `docs/.vitepress/theme/Layout.vue`
- Test: `tests/community-qr.test.ts`

**Interfaces:**
- Consumes: `previewCommunityQr(trigger)`、`pinCommunityQr(trigger)`、`scheduleCommunityQrClose()`、`cancelCommunityQrClose()` from Task 1.
- Produces: delegated click, pointerover and pointerout behavior for desktop and mobile VitePress community links.

- [ ] **Step 1: Write failing Layout tests for capable desktop hover**

Mock `window.matchMedia` with a controllable `matches` value. Mount Layout, append a nested-span community link, dispatch `pointerover`, and assert the dialog opens without moving focus. Dispatch `pointerout` with a target outside the trigger and assert it closes after fake timers advance 180ms.

Also dispatch `pointerout` whose `relatedTarget` remains inside the same anchor and assert no close is scheduled.

- [ ] **Step 2: Write failing tests for touch fallback and click pinning**

With `matchMedia().matches === false`, assert `pointerover` does not open. Click the same link and assert it opens pinned, remains open after `pointerout` plus 180ms, and toggles closed on a second unmodified primary click.

- [ ] **Step 3: Run the focused test and verify RED**

Run:

```bash
./node_modules/.bin/vitest run tests/community-qr.test.ts
```

Expected: new Layout hover tests FAIL because only click delegation exists.

- [ ] **Step 4: Implement delegated pointer handlers**

Create one helper that accepts an `EventTarget | null` and returns the valid `a[href="#community"]` whose trimmed text is `交流群`. Cache the media query in `onMounted`:

```ts
hoverMedia = window.matchMedia('(hover: hover) and (pointer: fine)')
```

On delegated `pointerover`, ignore incapable devices and pointer transitions already within the same trigger, then call `cancelCommunityQrClose()` followed by `previewCommunityQr(trigger)`. On `pointerout`, ignore internal transitions and call `scheduleCommunityQrClose()`. Keep the existing modifier/button guards for click, prevent VitePress navigation, and call `pinCommunityQr(trigger)`.

Register and remove all three capture listeners in matching lifecycle hooks.

- [ ] **Step 5: Make pin toggle semantics explicit**

Update `CommunityQr.vue` so pinning the already pinned active trigger closes it, while pinning an active preview converts it to pinned without closing. Add direct component assertions for both paths so Layout does not depend on accidental toggle behavior.

- [ ] **Step 6: Run focused tests and verify GREEN**

Run:

```bash
./node_modules/.bin/vitest run tests/community-qr.test.ts
```

Expected: all tests pass for desktop menu, mobile menu, nested span target, hover preview, delayed close, touch fallback and click pinning.

- [ ] **Step 7: Commit Task 2**

```bash
git add docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/CommunityQr.vue tests/community-qr.test.ts
git commit -m "支持导航悬停展示交流群二维码"
```

---

### Task 3: 回归验证与生产预览验收

**Files:**
- Modify only if a verified defect requires a scoped fix: `docs/.vitepress/theme/CommunityQr.vue`, `docs/.vitepress/theme/Layout.vue`, `tests/community-qr.test.ts`

**Interfaces:**
- Consumes the completed hover/pin behavior from Tasks 1–2.
- Produces verified production behavior; no new public API.

- [ ] **Step 1: Run community and navigation regression tests**

```bash
./node_modules/.bin/vitest run tests/community-qr.test.ts tests/community-popover-position.test.ts tests/nav.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 2: Run the full automated suite**

```bash
./node_modules/.bin/vitest run
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
```

Expected: tests, content links and replacement assets all pass.

- [ ] **Step 3: Build the production site**

```bash
./node_modules/.bin/vitepress build docs
node scripts/generate-legacy-redirects.mjs
node scripts/verify-publish-boundary.mjs
```

Expected: production build succeeds, redirects generate, and publish boundary verification passes.

- [ ] **Step 4: Start a fresh production preview**

```bash
./node_modules/.bin/vitepress preview docs --host 127.0.0.1 --port 4184
```

Use a free port if 4184 is occupied. Keep the process running through browser acceptance and stop it before completion.

- [ ] **Step 5: Verify desktop mouse behavior**

At 1440×900 on `/reading-guide`:

- hover “交流群” and confirm the QR opens immediately without focus moving;
- move from the nav link into the QR panel and confirm it remains open;
- leave both regions and confirm it closes after roughly 180ms without flicker;
- click to pin, move away, scroll and resize, and confirm it remains open and repositions;
- click outside, click the same trigger again, and use the named close button to verify every close path.

- [ ] **Step 6: Verify keyboard and touch-width behavior**

At desktop width, Tab to “交流群”, press Enter, verify focus enters the dialog, Tab loops, Escape closes, and focus returns. At 390×844, confirm pointer hover does not create duplicate opens and tap/click still toggles the panel; verify no horizontal overflow.

- [ ] **Step 7: Inspect browser quality signals**

Confirm no console errors, no missing QR image, no page scroll lock, and no visual changes to the QR panel, close button or anchor alignment in light and dark themes.

- [ ] **Step 8: Run diff checks and commit any verified acceptance fix**

```bash
git diff --check
git status --short
```

If browser acceptance required a scoped correction, rerun the affected focused test first, then commit only the three task files:

```bash
git add docs/.vitepress/theme/CommunityQr.vue docs/.vitepress/theme/Layout.vue tests/community-qr.test.ts
git commit -m "修正交流群悬停交互边界"
```

- [ ] **Step 9: Request final code review before integration**

Review the complete diff from the design commit through the final implementation commit for specification compliance, event-listener cleanup, focus behavior, touch fallback, regression coverage and unrelated-file exclusion. Resolve all Important findings before merging or deploying.
