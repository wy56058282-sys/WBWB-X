# Tutorial Image Lightbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible, mobile-safe full-screen lightbox to ordinary VitePress tutorial images without changing linked images or non-document visuals.

**Architecture:** Mount one `DocImageLightbox.vue` from the shared theme layout. The component enhances eligible `.vp-doc img` nodes, uses delegated click/keyboard handlers, watches SPA DOM replacement with `MutationObserver`, and owns all dialog, focus, and scroll-lock state. Styling stays in `custom.css`, while jsdom component tests verify behavior and source-level assertions protect integration and responsive rules.

**Tech Stack:** Vue 3.5, VitePress 1.6.4, TypeScript, CSS, Vitest 2.1.8, jsdom.

## Global Constraints

- Do not add a third-party image-zoom dependency.
- Only enhance `.vp-doc img` elements that are not inside an `a` element and have a non-empty `src`.
- Do not change Markdown image syntax or the behavior of linked images, QR codes, logos, homepage art, or IP images.
- Support mouse/touch click, Enter, Space, Escape, backdrop click, a named close button, focus restoration, and body scroll restoration.
- Do not add previous/next navigation, downloads, rotation, pinch zoom, or multi-level zoom.
- Preview images must fit within `96vw × 90vh` without stretching or cropping.
- Render a caption only when the source image has non-empty `alt` text.
- Respect `prefers-reduced-motion: reduce`.

---

## File Map

- Create `docs/.vitepress/theme/DocImageLightbox.vue`: image eligibility, DOM enhancement, delegated interaction, dialog state, focus restoration, scroll locking, and SPA mutation handling.
- Modify `docs/.vitepress/theme/Layout.vue`: mount the lightbox once in the existing `layout-bottom` slot.
- Modify `docs/.vitepress/theme/custom.css`: zoom cursor, overlay, dialog, preview, caption, focus, mobile, and reduced-motion styles.
- Create `tests/doc-image-lightbox.test.ts`: jsdom interaction and exclusion tests plus layout integration.
- Create `tests/doc-image-lightbox-style.test.ts`: source-level responsive and accessibility style guards.

---

### Task 1: Eligible image enhancement and opening behavior

**Files:**
- Create: `docs/.vitepress/theme/DocImageLightbox.vue`
- Create: `tests/doc-image-lightbox.test.ts`

**Interfaces:**
- Produces: default Vue component `DocImageLightbox`.
- Produces: exported function `isZoomableDocImage(target: EventTarget | null): target is HTMLImageElement`.
- Produces DOM contract: eligible images receive `.wbx-doc-image--zoomable`, `tabindex="0"`, `role="button"`, and an `aria-label`.

- [ ] **Step 1: Write failing eligibility and enhancement tests**

Create `tests/doc-image-lightbox.test.ts` with jsdom mounting helpers and these assertions:

```ts
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import DocImageLightbox, {
  isZoomableDocImage,
} from '../docs/.vitepress/theme/DocImageLightbox.vue'

const apps: App[] = []

function mountLightbox(markup: string) {
  document.body.innerHTML = `<main class="vp-doc">${markup}</main><div id="host"></div>`
  const app = createApp(DocImageLightbox)
  app.mount('#host')
  apps.push(app)
}

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

describe('document image eligibility', () => {
  it('enhances ordinary document images with keyboard semantics', async () => {
    mountLightbox('<img src="/diagram.png" alt="能力架构图">')
    await nextTick()

    const image = document.querySelector<HTMLImageElement>('.vp-doc img')!
    expect(isZoomableDocImage(image)).toBe(true)
    expect(image.classList.contains('wbx-doc-image--zoomable')).toBe(true)
    expect(image.tabIndex).toBe(0)
    expect(image.getAttribute('role')).toBe('button')
    expect(image.getAttribute('aria-label')).toBe('放大查看：能力架构图')
  })

  it('does not enhance linked, empty-src, or non-document images', async () => {
    mountLightbox('<a href="/full.png"><img src="/linked.png" alt="链接图"></a><img src="" alt="空图">')
    document.body.insertAdjacentHTML('afterbegin', '<img src="/logo.png" alt="Logo">')
    await nextTick()

    expect(document.querySelectorAll('.wbx-doc-image--zoomable')).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run the focused tests and confirm the expected failure**

Run: `npm test -- tests/doc-image-lightbox.test.ts`

Expected: FAIL because `DocImageLightbox.vue` does not exist.

- [ ] **Step 3: Implement minimal image recognition and DOM enhancement**

Create `DocImageLightbox.vue` with:

```ts
export function isZoomableDocImage(
  target: EventTarget | null,
): target is HTMLImageElement {
  return (
    target instanceof HTMLImageElement &&
    target.matches('.vp-doc img') &&
    !target.closest('a') &&
    target.getAttribute('src')?.trim() !== ''
  )
}

function enhanceImage(image: HTMLImageElement) {
  if (!isZoomableDocImage(image)) return
  image.classList.add('wbx-doc-image--zoomable')
  image.tabIndex = 0
  image.setAttribute('role', 'button')
  const alt = image.alt.trim()
  image.setAttribute('aria-label', alt ? `放大查看：${alt}` : '放大查看图片')
}

function enhanceImages(root: ParentNode = document) {
  if (root instanceof HTMLImageElement) enhanceImage(root)
  root.querySelectorAll<HTMLImageElement>('.vp-doc img').forEach(enhanceImage)
}
```

Call `enhanceImages()` on mount. Add a `MutationObserver` on `document.body` that calls `enhanceImages()` for each added element subtree. Disconnect it on unmount. Render `<span class="wbx-doc-lightbox-root" aria-hidden="true"></span>` outside the Teleport so layout integration has a stable, non-visual mount marker while the dialog is closed.

- [ ] **Step 4: Run the focused tests and confirm they pass**

Run: `npm test -- tests/doc-image-lightbox.test.ts`

Expected: PASS for both eligibility tests.

- [ ] **Step 5: Add failing click and keyboard opening tests**

Append tests that click an eligible image and press Enter/Space on it, then assert:

```ts
expect(document.querySelector('[role="dialog"]')).not.toBeNull()
expect(document.querySelector('.wbx-doc-lightbox__image')?.getAttribute('src')).toBe('/diagram.png')
expect(document.querySelector('.wbx-doc-lightbox__caption')?.textContent).toBe('能力架构图')
expect(document.body.style.overflow).toBe('hidden')
```

Add a separate no-alt case asserting `.wbx-doc-lightbox__caption` is absent.

- [ ] **Step 6: Run the focused tests and confirm the opening tests fail**

Run: `npm test -- tests/doc-image-lightbox.test.ts`

Expected: FAIL because no dialog is rendered.

- [ ] **Step 7: Implement delegated opening and dialog rendering**

In `DocImageLightbox.vue`, add refs for `source`, `src`, and `caption`; register document-level `click` and `keydown` handlers; open only for `isZoomableDocImage(event.target)`. Prevent default for Enter and Space. Render:

```vue
<Teleport to="body">
  <Transition name="wbx-doc-lightbox">
    <div v-if="src" class="wbx-doc-lightbox" @click.self="close">
      <section
        class="wbx-doc-lightbox__dialog"
        role="dialog"
        aria-modal="true"
        aria-label="图片预览"
      >
        <button class="wbx-doc-lightbox__close" type="button" aria-label="关闭图片预览" @click="close">×</button>
        <img class="wbx-doc-lightbox__image" :src="src" :alt="caption" @error="close">
        <p v-if="caption" class="wbx-doc-lightbox__caption">{{ caption }}</p>
      </section>
    </div>
  </Transition>
</Teleport>
```

- [ ] **Step 8: Run the focused tests and confirm opening behavior passes**

Run: `npm test -- tests/doc-image-lightbox.test.ts`

Expected: PASS.

- [ ] **Step 9: Commit Task 1**

```bash
git add tests/doc-image-lightbox.test.ts docs/.vitepress/theme/DocImageLightbox.vue
git commit -m "feat: add accessible document image lightbox"
```

---

### Task 2: Closing, cleanup, focus, and route-safe behavior

**Files:**
- Modify: `docs/.vitepress/theme/DocImageLightbox.vue`
- Modify: `tests/doc-image-lightbox.test.ts`

**Interfaces:**
- Consumes: `isZoomableDocImage()` and the lightbox DOM contract from Task 1.
- Produces: `close()` behavior that restores body overflow and source-image focus.

- [ ] **Step 1: Write failing close and focus-restoration tests**

Add tests for each close path:

```ts
it.each([
  ['Escape', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))],
  ['button', () => document.querySelector<HTMLButtonElement>('[aria-label="关闭图片预览"]')!.click()],
  ['backdrop', () => document.querySelector<HTMLElement>('.wbx-doc-lightbox')!.click()],
])('closes with %s and restores focus and scroll', async (_, closeAction) => {
  mountLightbox('<img src="/diagram.png" alt="能力架构图">')
  await nextTick()
  const image = document.querySelector<HTMLImageElement>('.vp-doc img')!
  image.click()
  await nextTick()
  closeAction()
  await nextTick()

  expect(document.querySelector('[role="dialog"]')).toBeNull()
  expect(document.body.style.overflow).toBe('')
  expect(document.activeElement).toBe(image)
})
```

Add a test that appends a new `.vp-doc img` after mount and awaits a mutation tick; assert it receives the enhancement class and opens. Add an unmount test asserting scroll lock is cleared and subsequent document clicks do not reopen the dialog.

- [ ] **Step 2: Run the focused tests and verify cleanup failures**

Run: `npm test -- tests/doc-image-lightbox.test.ts`

Expected: FAIL for missing Escape handling, focus restoration, mutation enhancement, or unmount cleanup.

- [ ] **Step 3: Implement complete close and lifecycle cleanup**

Implement `close()` to clear the reactive source, restore the body overflow value saved when opening, and focus the original image on the next tick only when `document.contains(source.value)`. Handle Escape only while open. On unmount, disconnect the observer, remove delegated listeners, close without refocusing, and restore overflow.

Ensure image-error handling calls the same cleanup path. Do not modify linked images during mutation scans.

- [ ] **Step 4: Run the focused tests and confirm lifecycle behavior passes**

Run: `npm test -- tests/doc-image-lightbox.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

```bash
git add tests/doc-image-lightbox.test.ts docs/.vitepress/theme/DocImageLightbox.vue
git commit -m "fix: complete lightbox focus and lifecycle handling"
```

---

### Task 3: Layout integration and responsive visual rules

**Files:**
- Modify: `docs/.vitepress/theme/Layout.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `tests/doc-image-lightbox.test.ts`
- Create: `tests/doc-image-lightbox-style.test.ts`

**Interfaces:**
- Consumes: default `DocImageLightbox` component from Task 1.
- Produces: a single global lightbox mount through `Layout.vue`.
- Produces CSS contract rooted at `.wbx-doc-image--zoomable` and `.wbx-doc-lightbox`.

- [ ] **Step 1: Write failing layout integration test**

Mock the VitePress layout as in `tests/community-qr.test.ts`, mount `Layout.vue`, and assert:

```ts
expect(document.querySelector('.wbx-doc-lightbox-root')).not.toBeNull()
```

The `DocImageLightbox` template must keep a stable root marker even when the dialog is closed.

- [ ] **Step 2: Write failing CSS contract tests**

Create `tests/doc-image-lightbox-style.test.ts` using `readFileSync` and assert that `custom.css` contains:

```ts
expect(css).toMatch(/\.wbx-doc-image--zoomable\s*\{[^}]*cursor:\s*zoom-in;/s)
expect(css).toMatch(/\.wbx-doc-lightbox\s*\{[^}]*position:\s*fixed;[^}]*inset:\s*0;[^}]*z-index:\s*\d+;/s)
expect(css).toMatch(/\.wbx-doc-lightbox__image\s*\{[^}]*max-width:\s*96vw;[^}]*max-height:\s*90vh;[^}]*object-fit:\s*contain;/s)
expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*\.wbx-doc-lightbox__close/s)
expect(css).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.wbx-doc-lightbox/s)
```

- [ ] **Step 3: Run integration and style tests and verify failure**

Run: `npm test -- tests/doc-image-lightbox.test.ts tests/doc-image-lightbox-style.test.ts`

Expected: FAIL because Layout and CSS do not yet contain the lightbox contract.

- [ ] **Step 4: Mount the component in the shared layout**

Modify `Layout.vue`:

```ts
import DocImageLightbox from './DocImageLightbox.vue'
```

and include it once in `#layout-bottom`:

```vue
<template #layout-bottom>
  <CommunityQr />
  <DocImageLightbox />
</template>
```

- [ ] **Step 5: Add the responsive lightbox CSS**

Append focused rules to `custom.css`:

```css
.wbx-doc-image--zoomable { cursor: zoom-in; }
.wbx-doc-image--zoomable:focus-visible { outline: 3px solid var(--vp-c-brand-1); outline-offset: 4px; }
.wbx-doc-lightbox { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 24px; background: rgba(5, 8, 7, 0.92); }
.wbx-doc-lightbox__dialog { position: relative; display: grid; justify-items: center; max-width: 96vw; max-height: 96vh; }
.wbx-doc-lightbox__image { display: block; max-width: 96vw; max-height: 90vh; object-fit: contain; }
.wbx-doc-lightbox__caption { max-width: min(80ch, 90vw); margin: 12px 0 0; color: #fff; text-align: center; }
.wbx-doc-lightbox__close { position: absolute; top: 8px; right: 8px; width: 44px; height: 44px; border: 2px solid #fff; color: #fff; background: rgba(13, 16, 13, 0.82); }
.wbx-doc-lightbox-enter-active, .wbx-doc-lightbox-leave-active { transition: opacity 160ms ease; }
.wbx-doc-lightbox-enter-from, .wbx-doc-lightbox-leave-to { opacity: 0; }
@media (max-width: 640px) { .wbx-doc-lightbox { padding: 12px; } .wbx-doc-lightbox__close { top: 4px; right: 4px; } }
@media (prefers-reduced-motion: reduce) { .wbx-doc-lightbox-enter-active, .wbx-doc-lightbox-leave-active { transition: none; } }
```

Keep selector names exact so the component and tests remain aligned.

- [ ] **Step 6: Run integration and style tests and confirm pass**

Run: `npm test -- tests/doc-image-lightbox.test.ts tests/doc-image-lightbox-style.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit Task 3**

```bash
git add docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/custom.css tests/doc-image-lightbox.test.ts tests/doc-image-lightbox-style.test.ts
git commit -m "style: integrate responsive document image preview"
```

---

### Task 4: Full regression and browser verification

**Files:**
- Modify only if verification exposes a lightbox-specific defect.

**Interfaces:**
- Consumes: completed component, layout integration, and CSS from Tasks 1–3.
- Produces: verified production behavior; no new public interface.

- [ ] **Step 1: Run the complete automated check**

Run: `npm run check`

Expected: all Vitest tests, content-link checks, replacement-asset checks, and the VitePress production build pass.

- [ ] **Step 2: Start the local preview**

Run: `npm run dev -- --host 127.0.0.1`

Expected: VitePress serves the site locally without compile errors.

- [ ] **Step 3: Verify desktop behavior in the first chapter**

Open the first chapter at desktop width and verify:

- The capability diagram and ordinary screenshots show the zoom cursor.
- Clicking opens the correct full image and optional alt caption.
- Close button, backdrop, and Escape close the preview.
- Focus returns to the source image.
- A linked image retains its link behavior.

- [ ] **Step 4: Verify mobile behavior at 390px**

At 390px viewport width verify:

- The preview stays within the viewport with no horizontal overflow.
- The image is complete and uncropped.
- The close button remains visible and has a usable touch target.
- Opening and closing do not move the underlying reading position.

- [ ] **Step 5: Verify SPA navigation**

Navigate from chapter 1 to another image-heavy chapter without reloading, then open a newly rendered image. Confirm the mutation observer enhanced it and no duplicate dialog or listener behavior appears.

- [ ] **Step 6: Run final targeted and full checks after any verification fix**

Run:

```bash
npm test -- tests/doc-image-lightbox.test.ts tests/doc-image-lightbox-style.test.ts
npm run check
```

Expected: PASS.

- [ ] **Step 7: Commit any verification-only fix**

If Step 3–5 required code changes:

```bash
git add docs/.vitepress/theme/DocImageLightbox.vue docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/custom.css tests/doc-image-lightbox.test.ts tests/doc-image-lightbox-style.test.ts
git commit -m "fix: polish document image preview behavior"
```

If no changes were required, do not create an empty commit.
