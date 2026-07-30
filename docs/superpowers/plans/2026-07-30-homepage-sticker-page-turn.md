# Homepage Sticker Page Turn Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an accessible lower-right page-turn interaction to the homepage hero that reveals three linked partner-logo stickers.

**Architecture:** A focused Vue component owns the reveal state, pointer/keyboard behavior, and partner link rendering. `HomePage.vue` supplies the existing hero artwork through a slot and partner data through typed props; `home.css` supplies the interruptible page-turn presentation and responsive/reduced-motion fallbacks.

**Tech Stack:** Vue 3.5, TypeScript, VitePress 1.6, CSS transitions, Vitest 2.1, jsdom.

## Global Constraints

- Preserve the current green hero, four internal pixel-icon links, monogram, metrics, and value strip in the default state.
- Use a `72 × 72px` lower-right trigger area on desktop.
- Use `cubic-bezier(0.23, 1, 0.32, 1)` and an approximately `260ms` reveal transition.
- Desktop opens from the lower-right trigger and stays open while the pointer remains inside the right hero region.
- Touch opens and closes by click; keyboard supports Enter, Space, and Escape.
- Partner links open in a new tab with `target="_blank"` and `rel="noopener noreferrer"`.
- `prefers-reduced-motion: reduce` removes the spatial page-turn animation.
- Do not add a runtime dependency.
- Source design: `docs/superpowers/specs/2026-07-30-homepage-sticker-page-turn-design.md`.

---

## File Map

- Create `docs/.vitepress/theme/HeroStickerPage.vue`: isolated interaction state, accessible trigger, partner sticker rendering, and fallback labels.
- Create `docs/.vitepress/theme/heroPartners.ts`: typed partner names, local logo paths, and external destinations.
- Modify `docs/.vitepress/theme/HomePage.vue`: partner data and integration of the existing hero artwork into `HeroStickerPage`.
- Modify `docs/.vitepress/theme/home.css`: cover, fold, inner page, sticker layout, breakpoints, and reduced-motion styles.
- Create `tests/hero-sticker-page.test.ts`: component behavior and external-link contract.
- Create `tests/hero-partners.test.ts`: partner configuration and asset presence.
- Modify `tests/home-hero-icons.test.ts`: homepage integration and preservation of the four current links.
- Create `docs/public/brand/partners/sparkx.svg`: copied StarX/星火集 logo.
- Create `docs/public/brand/partners/workbuddy.svg`: copied WorkBuddy logo.
- Create `docs/public/brand/partners/z-ai.svg`: copied Z.ai logo.

---

### Task 1: Partner Asset Contract and Homepage Data

**Files:**
- Create: `docs/public/brand/partners/sparkx.svg`
- Create: `docs/public/brand/partners/workbuddy.svg`
- Create: `docs/public/brand/partners/z-ai.svg`
- Create: `docs/.vitepress/theme/heroPartners.ts`
- Create: `tests/hero-partners.test.ts`

**Interfaces:**
- Produces:

```ts
export interface HeroStickerPartner {
  name: string
  logo: string
  href: string
}

export const heroPartners: HeroStickerPartner[]
```

- [ ] **Step 1: Write the failing partner-data and asset test**

Create `tests/hero-partners.test.ts`:

```ts
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { heroPartners } from '../docs/.vitepress/theme/heroPartners'

describe('hero partner stickers', () => {
  it('contains the approved partners and local assets', () => {
    expect(heroPartners).toEqual([
      {
        name: '星火集',
        logo: '/brand/partners/sparkx.svg',
        href: 'https://www.sparkx.zone/',
      },
      {
        name: 'WorkBuddy',
        logo: '/brand/partners/workbuddy.svg',
        href: 'https://www.workbuddy.ai/',
      },
      {
        name: 'Z.ai',
        logo: '/brand/partners/z-ai.svg',
        href: 'https://z.ai/subscribe',
      },
    ])

    for (const partner of heroPartners) {
      expect(existsSync(`docs/public${partner.logo}`)).toBe(true)
    }
  })
})
```

The rendered-link assertions remain in Task 2 after the component exists:

```ts
expect(links).toEqual([
    {
      label: '访问星火集',
      href: 'https://www.sparkx.zone/',
      target: '_blank',
      rel: 'noopener noreferrer',
      image: '/brand/partners/sparkx.svg',
    },
    {
      label: '访问 WorkBuddy',
      href: 'https://www.workbuddy.ai/',
      target: '_blank',
      rel: 'noopener noreferrer',
      image: '/brand/partners/workbuddy.svg',
    },
    {
      label: '访问 Z.ai',
      href: 'https://z.ai/subscribe',
      target: '_blank',
      rel: 'noopener noreferrer',
      image: '/brand/partners/z-ai.svg',
    },
])
```

- [ ] **Step 2: Run the focused test and verify failure**

Run:

```bash
pnpm vitest run tests/hero-partners.test.ts
```

Expected: FAIL because `heroPartners.ts` and the copied assets do not exist.

- [ ] **Step 3: Copy the approved SVG assets**

Run:

```bash
mkdir -p docs/public/brand/partners
cp '/Users/nick/Desktop/星火集/品牌/星火集.svg' docs/public/brand/partners/sparkx.svg
cp '/Users/nick/Desktop/星火集/品牌/workbuddy.svg' docs/public/brand/partners/workbuddy.svg
cp '/Users/nick/Desktop/星火集/品牌/z.ai.svg' docs/public/brand/partners/z-ai.svg
```

Inspect each SVG for embedded scripts, external references, raster data URLs, or unexpected metadata before committing:

```bash
rg -n '<script|javascript:|https?://|data:image' docs/public/brand/partners
```

Expected: no executable or remote content. If a legitimate namespace URL appears, retain it; remove only non-rendering editor metadata.

- [ ] **Step 4: Add the typed partner configuration**

Create `docs/.vitepress/theme/heroPartners.ts`:

```ts
export interface HeroStickerPartner {
  name: string
  logo: string
  href: string
}

export const heroPartners: HeroStickerPartner[] = [
  {
    name: '星火集',
    logo: '/brand/partners/sparkx.svg',
    href: 'https://www.sparkx.zone/',
  },
  {
    name: 'WorkBuddy',
    logo: '/brand/partners/workbuddy.svg',
    href: 'https://www.workbuddy.ai/',
  },
  {
    name: 'Z.ai',
    logo: '/brand/partners/z-ai.svg',
    href: 'https://z.ai/subscribe',
  },
]
```

- [ ] **Step 5: Run the focused test**

```bash
pnpm vitest run tests/hero-partners.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit the asset/data slice**

```bash
git add docs/public/brand/partners docs/.vitepress/theme/heroPartners.ts tests/hero-partners.test.ts
git commit -m "Add homepage partner sticker assets"
```

---

### Task 2: Accessible Reveal-State Component

**Files:**
- Create: `docs/.vitepress/theme/HeroStickerPage.vue`
- Create: `tests/hero-sticker-page.test.ts`
- Modify: `docs/.vitepress/theme/HomePage.vue`

**Interfaces:**
- Produces:

```ts
import type { HeroStickerPartner } from './heroPartners'
```

- Props: `{ partners: HeroStickerPartner[] }`.
- Slot: default slot is the existing green hero cover content.
- DOM state: `.wbx-sticker-page[data-open="true" | "false"]`.

- [ ] **Step 1: Write failing component behavior tests**

Create `tests/hero-sticker-page.test.ts`:

```ts
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, h, type App } from 'vue'
import HeroStickerPage from '../docs/.vitepress/theme/HeroStickerPage.vue'

const apps: App[] = []
const partners = [
  { name: '星火集', logo: '/sparkx.svg', href: 'https://www.sparkx.zone/' },
]

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
})

function mountComponent() {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp({
    render: () =>
      h(HeroStickerPage, { partners }, {
        default: () => h('span', { class: 'cover-proof' }, 'cover'),
      }),
  })
  app.mount(host)
  apps.push(app)
}

describe('HeroStickerPage', () => {
  it('opens with the trigger and closes with Escape', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLButtonElement>('.wbx-sticker-page__trigger')!

    expect(root.dataset.open).toBe('false')
    trigger.click()
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    root.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')
  })

  it('opens on lower-right pointer entry and closes when leaving the region', async () => {
    mountComponent()
    const root = document.querySelector<HTMLElement>('.wbx-sticker-page')!
    const trigger = document.querySelector<HTMLElement>('.wbx-sticker-page__trigger')!

    trigger.dispatchEvent(new MouseEvent('mouseenter'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('true')

    root.dispatchEvent(new MouseEvent('mouseleave'))
    await Promise.resolve()
    expect(root.dataset.open).toBe('false')
  })

  it('renders safe external links and a text fallback', () => {
    mountComponent()
    const link = document.querySelector<HTMLAnchorElement>('.wbx-partner-sticker')!

    expect(link.target).toBe('_blank')
    expect(link.rel).toBe('noopener noreferrer')
    expect(link.getAttribute('aria-label')).toBe('访问星火集')
    expect(link.querySelector('.wbx-partner-sticker__fallback')?.textContent).toBe('星火集')
  })
})
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```bash
pnpm vitest run tests/hero-sticker-page.test.ts
```

Expected: FAIL because `HeroStickerPage.vue` does not exist.

- [ ] **Step 3: Implement the minimal component**

Create `docs/.vitepress/theme/HeroStickerPage.vue` with:

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { HeroStickerPartner } from './heroPartners'

defineProps<{ partners: HeroStickerPartner[] }>()

const isOpen = ref(false)
const open = () => { isOpen.value = true }
const close = () => { isOpen.value = false }
const toggle = () => { isOpen.value = !isOpen.value }
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') close()
}
</script>

<template>
  <div
    class="wbx-sticker-page"
    :data-open="String(isOpen)"
    @mouseleave="close"
    @keydown="onKeydown"
  >
    <div class="wbx-sticker-page__inside" aria-label="合作伙伴">
      <a
        v-for="partner in partners"
        :key="partner.name"
        class="wbx-partner-sticker"
        :href="partner.href"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`访问${partner.name === '星火集' ? '' : ' '}${partner.name}`"
      >
        <img :src="partner.logo" :alt="partner.name" />
        <span class="wbx-partner-sticker__fallback">{{ partner.name }}</span>
      </a>
    </div>
    <div class="wbx-sticker-page__cover">
      <slot />
    </div>
    <button
      class="wbx-sticker-page__trigger"
      type="button"
      :aria-expanded="isOpen"
      aria-label="翻开合作伙伴贴纸页"
      @mouseenter="open"
      @click="toggle"
    >
      <span aria-hidden="true">翻开看看</span>
    </button>
  </div>
</template>
```

Keep the fallback span available to CSS and use an image error handler to reveal it:

```vue
@error="($event.currentTarget as HTMLImageElement).hidden = true"
```

- [ ] **Step 4: Integrate the existing hero art through the component slot**

In `HomePage.vue`, keep `.wbx-hero__art` as the outer layout container and place the component inside it:

```vue
<script setup lang="ts">
import HeroStickerPage from './HeroStickerPage.vue'
import { heroPartners } from './heroPartners'
</script>

<div class="wbx-hero__art" aria-label="WorkBuddy 像素图标组合">
  <HeroStickerPage :partners="heroPartners">
    <!-- existing monogram, four icon links, and metrics unchanged -->
  </HeroStickerPage>
</div>
```

- [ ] **Step 5: Add the homepage integration assertion**

Add to `tests/home-hero-icons.test.ts`:

```ts
it('renders the approved partner stickers as safe external links', () => {
  mountHomePage()

  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.wbx-partner-sticker'),
    (link) => ({
      label: link.getAttribute('aria-label'),
      href: link.href,
      target: link.target,
      rel: link.rel,
      image: link.querySelector('img')?.getAttribute('src'),
    }),
  )

  expect(links).toEqual([
    {
      label: '访问星火集',
      href: 'https://www.sparkx.zone/',
      target: '_blank',
      rel: 'noopener noreferrer',
      image: '/brand/partners/sparkx.svg',
    },
    {
      label: '访问 WorkBuddy',
      href: 'https://www.workbuddy.ai/',
      target: '_blank',
      rel: 'noopener noreferrer',
      image: '/brand/partners/workbuddy.svg',
    },
    {
      label: '访问 Z.ai',
      href: 'https://z.ai/subscribe',
      target: '_blank',
      rel: 'noopener noreferrer',
      image: '/brand/partners/z-ai.svg',
    },
  ])
})
```

- [ ] **Step 6: Run focused tests**

```bash
pnpm vitest run tests/hero-sticker-page.test.ts tests/home-hero-icons.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit the interaction component**

```bash
git add docs/.vitepress/theme/HeroStickerPage.vue docs/.vitepress/theme/HomePage.vue tests/hero-sticker-page.test.ts tests/home-hero-icons.test.ts
git commit -m "Add accessible hero sticker reveal"
```

---

### Task 3: Page-Turn Styling and Responsive Motion

**Files:**
- Modify: `docs/.vitepress/theme/home.css`
- Modify: `tests/hero-sticker-page.test.ts`

**Interfaces:**
- Consumes: `.wbx-sticker-page[data-open]`, `.__inside`, `.__cover`, `.__trigger`, and `.wbx-partner-sticker`.
- Produces: desktop reveal, touch layout, reduced-motion fallback, and safe stacking contexts.

- [ ] **Step 1: Add failing CSS-contract tests**

Add to `tests/hero-sticker-page.test.ts`:

```ts
import { readFileSync } from 'node:fs'

it('defines the approved reveal timing and reduced-motion fallback', () => {
  const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

  expect(css).toMatch(
    /\.wbx-sticker-page__cover\s*\{[^}]*260ms cubic-bezier\(0\.23,\s*1,\s*0\.32,\s*1\)/s,
  )
  expect(css).toMatch(
    /\.wbx-sticker-page__trigger\s*\{[^}]*width:\s*72px;[^}]*height:\s*72px;/s,
  )
  expect(css).toMatch(
    /@media \(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?\.wbx-sticker-page__cover/s,
  )
})
```

- [ ] **Step 2: Run the focused test and verify failure**

```bash
pnpm vitest run tests/hero-sticker-page.test.ts
```

Expected: FAIL because the page-turn CSS is absent.

- [ ] **Step 3: Add the desktop visual layer**

Add near the existing `.wbx-hero__art` rules in `home.css`:

```css
.wbx-sticker-page {
  position: relative;
  min-height: inherit;
  overflow: hidden;
  isolation: isolate;
}

.wbx-sticker-page__inside,
.wbx-sticker-page__cover {
  position: absolute;
  inset: 0;
}

.wbx-sticker-page__inside {
  display: grid;
  grid-template-areas:
    ". sparkx ."
    "workbuddy . zai";
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  padding: 58px 48px 70px;
  border-left: 1px solid #0d100d;
  background: #fffdf5;
}

.wbx-sticker-page__cover {
  z-index: 2;
  background: var(--wbx-accent);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
  transform-origin: 100% 100%;
  transition:
    clip-path 260ms cubic-bezier(0.23, 1, 0.32, 1),
    filter 260ms cubic-bezier(0.23, 1, 0.32, 1);
}

.wbx-sticker-page[data-open="true"] .wbx-sticker-page__cover {
  clip-path: polygon(0 0, 100% 0, 0 0, 0 100%);
  filter: drop-shadow(-14px -10px 0 rgb(13 16 13 / 18%));
  pointer-events: none;
}

.wbx-sticker-page__trigger {
  position: absolute;
  z-index: 3;
  right: 0;
  bottom: 0;
  width: 72px;
  height: 72px;
  border: 0;
  color: #0d100d;
  background: linear-gradient(135deg, transparent 49%, #fffdf5 50%);
  cursor: pointer;
}

.wbx-sticker-page__trigger span {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 54px;
  font-family: var(--wbx-pixel);
  font-size: 8px;
  line-height: 1.25;
  text-align: right;
}

.wbx-partner-sticker {
  display: grid;
  min-width: 120px;
  min-height: 96px;
  place-items: center;
  padding: 18px;
  border: 2px solid #0d100d;
  color: #0d100d;
  background: #fff;
  box-shadow: 8px 8px 0 #0d100d;
  transition: transform 160ms cubic-bezier(0.23, 1, 0.32, 1);
}

.wbx-partner-sticker:hover,
.wbx-partner-sticker:focus-visible {
  transform: translate(-3px, -3px) rotate(0deg);
}

.wbx-partner-sticker:active {
  transform: scale(0.97);
}
```

Assign the three stickers to the named grid areas with slight rotations. Ensure images use `max-width: 100%`, `max-height: 72px`, and `object-fit: contain`. Hide `.wbx-partner-sticker__fallback` while the sibling image is visible.

- [ ] **Step 4: Add responsive and reduced-motion rules**

At `max-width: 760px`, keep the trigger large enough to tap and reduce inside padding. At the existing `max-width: 420px` fixed-width hero layout, size the component to the same `560px` art height so it does not introduce horizontal movement.

Add:

```css
@media (prefers-reduced-motion: reduce) {
  .wbx-sticker-page__cover {
    transition: opacity 1ms linear;
  }

  .wbx-sticker-page[data-open="true"] .wbx-sticker-page__cover {
    clip-path: none;
    opacity: 0;
  }
}
```

- [ ] **Step 5: Run focused and full automated checks**

```bash
pnpm vitest run tests/hero-sticker-page.test.ts tests/home-hero-icons.test.ts
pnpm test
pnpm build
git diff --check
```

Expected: all tests pass, build completes, and `git diff --check` has no output.

- [ ] **Step 6: Commit styling**

```bash
git add docs/.vitepress/theme/home.css tests/hero-sticker-page.test.ts
git commit -m "Style homepage sticker page turn"
```

---

### Task 4: Browser Interaction and Visual Verification

**Files:**
- Modify only if verification finds a scoped issue:
  - `docs/.vitepress/theme/HeroStickerPage.vue`
  - `docs/.vitepress/theme/HomePage.vue`
  - `docs/.vitepress/theme/home.css`
  - `tests/hero-sticker-page.test.ts`

**Interfaces:**
- Consumes: built homepage at `http://127.0.0.1:4173/`.
- Produces: verified desktop, keyboard, touch-width, dark-mode, and reduced-motion behavior.

- [ ] **Step 1: Build and start the preview**

```bash
pnpm build
pnpm preview --host 0.0.0.0 --port 4173
```

- [ ] **Step 2: Verify desktop pointer behavior**

At a `1087 × 738` viewport:

1. Confirm the default screenshot matches the current green hero.
2. Hover the lower-right fold and confirm the white page appears within about `260ms`.
3. Move into all three stickers and confirm the page remains open.
4. Move outside the right hero region and confirm the cover returns.
5. Click each sticker and confirm its exact external URL.
6. Confirm the four original pixel icons still navigate to their internal destinations when closed.

- [ ] **Step 3: Verify keyboard behavior**

1. Tab to the reveal trigger.
2. Press Enter and confirm `aria-expanded="true"`.
3. Tab through 星火集, WorkBuddy, and Z.ai.
4. Press Escape and confirm the cover returns.
5. Confirm focus outlines are visible against green, black, and white backgrounds.

- [ ] **Step 4: Verify narrow and reduced-motion modes**

1. At `390 × 844`, confirm click toggles the page and stickers remain tappable.
2. Confirm there is no new horizontal overflow beyond the existing intentional mobile hero width.
3. Emulate `prefers-reduced-motion: reduce` and confirm the inside page changes without spatial movement.
4. Toggle dark mode and confirm the warm-white inside page and original-color logos remain legible.

- [ ] **Step 5: Fix only observed issues with a regression test**

For each observed defect, add a failing assertion to `tests/hero-sticker-page.test.ts` or `tests/home-hero-icons.test.ts`, run it to verify failure, apply the smallest CSS or component fix, and rerun the focused test.

- [ ] **Step 6: Run final verification**

```bash
pnpm test
pnpm build
git diff --check
git status --short
```

Expected: all tests pass, build succeeds, no whitespace errors, and only the known user-owned untracked files remain.

- [ ] **Step 7: Commit verification fixes if any**

```bash
git add docs/.vitepress/theme/HeroStickerPage.vue docs/.vitepress/theme/HomePage.vue docs/.vitepress/theme/home.css tests/hero-sticker-page.test.ts tests/home-hero-icons.test.ts
git commit -m "Polish homepage sticker page turn"
```
