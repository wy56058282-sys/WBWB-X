# Help Survey Poster Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the `/help/` survey poster fill its card width at its natural `1560 × 1936` aspect ratio without cropping or stretching.

**Approved asset replacement:** Replace `docs/public/article-assets/source-calibration/help/001.png` with the user-provided `/Users/wangyi/Desktop/场景收集二维码.png`. Both files are `1560 × 1936` PNG images, so the existing layout and click-to-open behavior remain unchanged. Add a SHA-256 regression assertion for `80816579e797eb39697857397d68a71972f178324408f54f8a7e00f9e716a15b` to prevent the previous poster from being restored accidentally.

**Architecture:** Keep the existing help-page markup and card geometry. Change only the poster image sizing contract by removing the fixed maximum height while preserving full-width rendering and `object-fit: contain`.

**Tech Stack:** VitePress 1.6, scoped page CSS, Vitest.

## Global Constraints

- Keep `.help-survey-card` at `width: min(100%, 560px)`.
- Keep the existing poster asset, link, alt text, borders, radius, and shadow.
- The image must use `width: 100%`, natural height, and no fixed `max-height`.
- Do not crop, stretch, or modify other help-page sections.

---

### Task 1: Adapt the survey poster container

**Files:**
- Modify: `docs/help/index.md:219-225`
- Create: `tests/help-survey-poster.test.ts`

**Interfaces:**
- Consumes: the existing `.help-survey-card img` scoped CSS rule.
- Produces: a responsive poster image that fills the card's content width at its intrinsic aspect ratio.

- [x] **Step 1: Write the failing CSS contract test**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const helpPage = readFileSync('docs/help/index.md', 'utf8')

describe('help survey poster layout', () => {
  it('renders the survey poster full width without a fixed height cap', () => {
    const rule = helpPage.match(/\.help-survey-card img\s*{([\s\S]*?)}/)?.[1] ?? ''
    expect(rule).toMatch(/width:\s*100%/)
    expect(rule).toMatch(/height:\s*auto/)
    expect(rule).toMatch(/object-fit:\s*contain/)
    expect(rule).not.toMatch(/max-height:/)
  })

  it('preserves the 560px responsive card width', () => {
    expect(helpPage).toMatch(/\.help-survey-card\s*{[\s\S]*?width:\s*min\(100%,\s*560px\)/)
  })
})
```

- [x] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/help-survey-poster.test.ts`

Expected: FAIL because the image still declares `max-height: 560px` and does not explicitly declare `height: auto`.

- [x] **Step 3: Implement the minimal sizing change**

Update the image rule to:

```css
.help-survey-card img {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  object-fit: contain;
}
```

- [x] **Step 4: Run focused tests**

Run: `pnpm exec vitest run tests/help-survey-poster.test.ts tests/content-links.test.ts tests/image-manifest.test.ts`

Expected: all tests pass.

- [x] **Step 5: Verify the production build and diff**

Run: `pnpm run build` and `git diff --check`.

Expected: VitePress build succeeds and the diff has no whitespace errors.

- [x] **Step 6: Verify the local page**

Open `http://127.0.0.1:4174/help/#scenario-survey` and confirm the poster fills the card width, keeps its aspect ratio, and causes no horizontal overflow on desktop or mobile.

- [x] **Step 7: Commit**

```bash
git add docs/help/index.md tests/help-survey-poster.test.ts docs/superpowers/plans/2026-08-01-help-survey-poster-layout.md
git commit -m "adapt help survey poster layout"
```
