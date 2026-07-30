# Community QR Navigation Popover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the centered QR modal with a `270px` popover anchored to the “交流群” navigation item that opens on click and closes on outside click or Escape.

**Architecture:** Extract viewport-safe anchor positioning into a pure TypeScript function, then let `CommunityQr.vue` own open state, focus, event listeners, and inline `top`/`left` coordinates. Keep the Teleport to `body` so VitePress navigation overflow and stacking contexts cannot clip the popover.

**Tech Stack:** Vue 3, VitePress 1.6, TypeScript, Vitest, CSS.

## Global Constraints

- Popover width is exactly `270px` unless the viewport is narrower.
- Desktop and mobile navigation both open on click.
- Preferred placement is below the trigger with right edges aligned.
- Keep at least `12px` between the popover and viewport edges.
- Reposition on window resize and document scroll.
- No dark backdrop and no body scroll lock.
- Outside click, repeated trigger click, close button, and Escape close the popover.
- Closing restores focus to the trigger that opened the popover.
- Preserve the current group QR asset and replacement path.

---

### Task 1: Viewport-Safe Anchor Positioning

**Files:**
- Create: `docs/.vitepress/community-popover-position.ts`
- Create: `tests/community-popover-position.test.ts`

**Interfaces:**
- Consumes: Trigger and popover rectangles plus viewport dimensions.
- Produces: `computeCommunityPopoverPosition(input: CommunityPopoverPositionInput): CommunityPopoverPosition`.

- [ ] **Step 1: Write the failing positioning tests**

```ts
import { describe, expect, it } from 'vitest'
import { computeCommunityPopoverPosition } from '../docs/.vitepress/community-popover-position'

describe('computeCommunityPopoverPosition', () => {
  it('places the popover below the trigger with right edges aligned', () => {
    expect(
      computeCommunityPopoverPosition({
        trigger: { top: 20, right: 800, bottom: 60 },
        popover: { width: 270, height: 360 },
        viewport: { width: 837, height: 736 },
      }),
    ).toEqual({ left: 530, top: 68, placement: 'below' })
  })

  it('clamps the popover inside the horizontal viewport margin', () => {
    expect(
      computeCommunityPopoverPosition({
        trigger: { top: 20, right: 180, bottom: 60 },
        popover: { width: 270, height: 360 },
        viewport: { width: 320, height: 736 },
      }),
    ).toEqual({ left: 12, top: 68, placement: 'below' })
  })

  it('places the popover above when there is not enough room below', () => {
    expect(
      computeCommunityPopoverPosition({
        trigger: { top: 600, right: 800, bottom: 640 },
        popover: { width: 270, height: 360 },
        viewport: { width: 837, height: 680 },
      }),
    ).toEqual({ left: 530, top: 232, placement: 'above' })
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm vitest run tests/community-popover-position.test.ts
```

Expected: FAIL because `community-popover-position.ts` does not exist.

- [ ] **Step 3: Implement the pure positioning function**

```ts
export interface CommunityPopoverPositionInput {
  trigger: { top: number; right: number; bottom: number }
  popover: { width: number; height: number }
  viewport: { width: number; height: number }
}

export interface CommunityPopoverPosition {
  left: number
  top: number
  placement: 'above' | 'below'
}

const VIEWPORT_MARGIN = 12
const TRIGGER_GAP = 8

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function computeCommunityPopoverPosition({
  trigger,
  popover,
  viewport,
}: CommunityPopoverPositionInput): CommunityPopoverPosition {
  const left = clamp(
    trigger.right - popover.width,
    VIEWPORT_MARGIN,
    Math.max(VIEWPORT_MARGIN, viewport.width - popover.width - VIEWPORT_MARGIN),
  )
  const belowTop = trigger.bottom + TRIGGER_GAP
  const aboveTop = trigger.top - TRIGGER_GAP - popover.height
  const fitsBelow = belowTop + popover.height <= viewport.height - VIEWPORT_MARGIN
  const placement = fitsBelow || aboveTop < VIEWPORT_MARGIN ? 'below' : 'above'
  const preferredTop = placement === 'below' ? belowTop : aboveTop
  const top = clamp(
    preferredTop,
    VIEWPORT_MARGIN,
    Math.max(VIEWPORT_MARGIN, viewport.height - popover.height - VIEWPORT_MARGIN),
  )

  return { left, top, placement }
}
```

- [ ] **Step 4: Run the positioning tests and verify GREEN**

Run:

```bash
pnpm vitest run tests/community-popover-position.test.ts
```

Expected: 3 tests pass.

- [ ] **Step 5: Commit the positioning unit**

```bash
git add docs/.vitepress/community-popover-position.ts tests/community-popover-position.test.ts
git commit -m "add community popover positioning"
```

---

### Task 2: Anchored Popover Interaction

**Files:**
- Modify: `docs/.vitepress/theme/CommunityQr.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `tests/community-qr.test.ts`
- Modify: `tests/brand.test.ts`

**Interfaces:**
- Consumes: `computeCommunityPopoverPosition` from Task 1 and the existing `openCommunityQr(trigger)` entry point used by `Layout.vue`.
- Produces: A Teleported, non-modal popover with inline `left` and `top`, plus unchanged `openCommunityQr(trigger: HTMLElement | null): void`.

- [ ] **Step 1: Add failing component tests for anchored, non-modal behavior**

Add tests that mount a real `CommunityQr` component, give the trigger and popover deterministic rectangles, and assert consumer-visible behavior:

```ts
it('anchors the popover below the trigger without a modal backdrop', async () => {
  const trigger = document.createElement('button')
  trigger.getBoundingClientRect = () =>
    ({ top: 20, right: 800, bottom: 60 } as DOMRect)
  document.body.append(trigger)
  mountCommunityQr()

  await openFrom(trigger)
  const popover = document.querySelector<HTMLElement>('[role="dialog"]')
  popover!.getBoundingClientRect = () =>
    ({ width: 270, height: 360 } as DOMRect)
  window.dispatchEvent(new Event('resize'))
  await nextTick()

  expect(popover?.hasAttribute('aria-modal')).toBe(false)
  expect(popover?.style.left).toBe('530px')
  expect(popover?.style.top).toBe('68px')
  expect(document.body.style.overflow).toBe('')
})

it('closes when clicking outside but not when clicking inside', async () => {
  const trigger = document.createElement('button')
  document.body.append(trigger)
  mountCommunityQr()
  await openFrom(trigger)

  document.querySelector<HTMLElement>('.wbx-community-qr')?.click()
  await nextTick()
  expect(document.querySelector('[role="dialog"]')).not.toBeNull()

  document.querySelector<HTMLElement>('.wbx-community-qr__layer')?.click()
  await nextTick()
  expect(document.querySelector('[role="dialog"]')).toBeNull()
})
```

Update the existing repeated-open test to require a second click on the same trigger to close the popover.

- [ ] **Step 2: Run the component tests and verify RED**

Run:

```bash
pnpm vitest run tests/community-qr.test.ts tests/brand.test.ts
```

Expected failures:

- the current component still emits `aria-modal="true"`;
- the current layer is centered and has no inline anchor coordinates;
- the current component locks body scrolling;
- clicking the same trigger does not toggle closed.

- [ ] **Step 3: Convert component state from modal to anchored popover**

In `CommunityQr.vue`:

- import `computeCommunityPopoverPosition`;
- replace scroll-lock state with `position = ref({ left: 12, top: 12 })`;
- add `updatePosition()` that reads `activeTrigger.getBoundingClientRect()`, `dialog.value.getBoundingClientRect()`, `window.innerWidth`, and `window.innerHeight`;
- run `updatePosition()` after `nextTick()` when opening;
- set `:style="{ left: \`${position.left}px\`, top: \`${position.top}px\` }"` on the popover;
- change the outer class to `wbx-community-qr__layer`;
- remove `aria-modal="true"`;
- when `open()` receives the currently active trigger while open, call `close()`;
- when it receives a different trigger, update `activeTrigger` and reposition;
- add capture listeners for `resize` and `scroll` on mount and remove them on unmount;
- keep `@click.self="close"` on the full-viewport transparent layer;
- retain focus restoration and Escape handling.

- [ ] **Step 4: Replace centered modal CSS with anchored popover CSS**

Use these rules as the implementation target:

```css
.wbx-community-qr__layer {
  position: fixed;
  z-index: 1000;
  inset: 0;
  background: transparent;
}

.wbx-community-qr {
  position: fixed;
  width: min(calc(100vw - 24px), 270px);
  max-height: calc(100dvh - 24px);
  overflow-y: auto;
}
```

Remove `display: grid`, `place-items: center`, dark background, and backdrop padding from the old layer. Keep the current compact typography, QR sizing, border, surface color, and shadow.

- [ ] **Step 5: Run component tests and verify GREEN**

Run:

```bash
pnpm vitest run tests/community-qr.test.ts tests/brand.test.ts
```

Expected: all component and brand tests pass.

- [ ] **Step 6: Commit the anchored interaction**

```bash
git add docs/.vitepress/theme/CommunityQr.vue docs/.vitepress/theme/custom.css tests/community-qr.test.ts tests/brand.test.ts
git commit -m "anchor community QR to navigation"
```

---

### Task 3: Regression and Production Verification

**Files:**
- Modify only if a verification failure exposes a scoped defect.

**Interfaces:**
- Consumes: Completed positioning and component behavior from Tasks 1 and 2.
- Produces: A deployable site artifact and evidence that navigation, QR loading, routes, and custom-domain root paths still work.

- [ ] **Step 1: Run the complete test suite**

Run:

```bash
pnpm test
```

Expected: all test files pass with zero failures.

- [ ] **Step 2: Build for the custom-domain root path**

Run:

```bash
pnpm build
```

Expected: VitePress build completes successfully with base `/`.

- [ ] **Step 3: Verify the working tree scope**

Run:

```bash
git status --short
git diff --check
git diff --stat HEAD~2
```

Expected: only the positioning module, QR component/styles, their tests, and this plan/spec work are included; unrelated untracked assets remain unstaged.

- [ ] **Step 4: Push and verify GitHub Pages**

```bash
git push origin HEAD:main
gh run watch --repo wy56058282-sys/WBWB-X --exit-status
```

Expected: the Pages workflow completes successfully.

- [ ] **Step 5: Verify the production interaction**

At `https://wbwbx.sparkx.zone`:

- click the desktop “交流群” item and confirm the `270px` popover appears below it, right aligned;
- click inside the popover and confirm it stays open;
- click outside and confirm it closes;
- reopen and press Escape, confirming focus returns to “交流群”;
- resize to a narrow viewport and confirm the popover remains at least `12px` from both horizontal edges;
- scroll while open and confirm it remains anchored to the trigger.

