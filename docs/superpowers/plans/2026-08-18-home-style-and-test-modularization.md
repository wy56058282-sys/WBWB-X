# Homepage Style and Test Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 1,491-line homepage stylesheet and 1,018-line homepage integration test into focused files without changing CSS bytes, rendered behavior, URLs, or assertions.

**Architecture:** `home.css` remains the only theme entry and imports four contiguous byte-preserving partials. Tests use one local-import-aware style reader and shared homepage harnesses, while the existing test cases are redistributed by responsibility without changing their bodies.

**Tech Stack:** VitePress 1.6.4, Vue 3.5, CSS, TypeScript, Vitest 2, jsdom.

**Spec:** `docs/superpowers/specs/2026-08-18-repository-maintenance-and-organization-design.md`

**Execution order:** Plan 2 of 4. Run after repository hygiene and before the final documentation/CI plan. It can run before or after the image-manifest plan.

## Global Constraints

- Keep `docs/.vitepress/theme/home.css` as the import used by `index.ts`.
- Do not change a selector, declaration, value, source order, media query, keyframe, URL, DOM structure, or visible copy.
- Concatenating the four partial files must reproduce the pre-split `home.css` byte-for-byte.
- Preserve every current homepage test title and assertion exactly once.
- Keep `HomePage.vue`, `custom.css`, and `service.css` structurally unchanged.
- Use TDD for the new entry and helper contracts; run focused and full checks before completion.

---

## File Structure

- Create `docs/.vitepress/theme/home/home-foundation.css`: original lines 1-170.
- Create `docs/.vitepress/theme/home/home-hero.css`: original lines 171-669, including feature-local reduced-motion rules.
- Create `docs/.vitepress/theme/home/home-sections.css`: original lines 670-1079.
- Create `docs/.vitepress/theme/home/home-responsive.css`: original lines 1080-1491.
- Modify `docs/.vitepress/theme/home.css`: four imports only, in the order above.
- Create `tests/helpers/read-theme-style.ts`: resolve local CSS imports for source-contract tests.
- Create `tests/helpers/home-page-harness.ts`: Vue mount, matchMedia, ResizeObserver, and cleanup lifecycle.
- Create `tests/helpers/css-rules.ts`: selector declaration and numeric geometry helpers.
- Create `tests/theme-style-reader.test.ts`: style reader unit coverage.
- Create `tests/home-style-entry.test.ts`: homepage entry order and boundary coverage.
- Create `tests/home-update-ticker.test.ts`: ticker timing, pause, reduced-motion, and ticker CSS cases.
- Create `tests/home-hero-layout.test.ts`: hero navigation, art, CTAs, icon geometry, and official-site cases.
- Create `tests/home-content-sections.test.ts`: values, reading, task grid, and system panel cases.
- Create `tests/home-community-footer.test.ts`: community download/IP and product footer cases.
- Remove `tests/home-hero-icons.test.ts` after all tests are moved.
- Modify `tests/home-analytics-style.test.ts`, `tests/home-reading-heading.test.ts`, `tests/neutral-hover-colors.test.ts`, and `tests/brand.test.ts` to use the shared style reader.

### Task 1: Add a Local-Import-Aware Theme Style Reader

**Files:**
- Create: `tests/helpers/read-theme-style.ts`
- Create: `tests/theme-style-reader.test.ts`

**Interfaces:**
- Produces: `readThemeStyle(entryPath: string): string`.
- Produces: `readHomeStyle(): string` for all homepage CSS source-contract tests.
- The reader accepts a plain CSS file or an entry consisting only of local `@import 'relative.css';` statements.

- [ ] **Step 1: Write the failing reader tests**

Create `tests/theme-style-reader.test.ts`:

```ts
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { readThemeStyle } from './helpers/read-theme-style'

const fixtures: string[] = []

afterEach(() => {
  while (fixtures.length > 0) rmSync(fixtures.pop()!, { recursive: true })
})

describe('theme style reader', () => {
  it('returns a plain stylesheet unchanged', () => {
    const root = mkdtempSync(join(tmpdir(), 'workbuddy-style-'))
    fixtures.push(root)
    const entry = join(root, 'plain.css')
    writeFileSync(entry, '.plain { color: black; }\n')
    expect(readThemeStyle(entry)).toBe('.plain { color: black; }\n')
  })

  it('concatenates local imports in entry order', () => {
    const root = mkdtempSync(join(tmpdir(), 'workbuddy-style-'))
    fixtures.push(root)
    const entry = join(root, 'entry.css')
    const first = join(root, 'parts', 'first.css')
    const second = join(root, 'parts', 'second.css')
    mkdirSync(dirname(first), { recursive: true })
    writeFileSync(first, '.first { order: 1; }\n')
    writeFileSync(second, '.second { order: 2; }\n')
    writeFileSync(
      entry,
      "@import './parts/first.css';\n@import './parts/second.css';\n",
    )
    expect(readThemeStyle(entry)).toBe(
      '.first { order: 1; }\n.second { order: 2; }\n',
    )
  })
})
```

- [ ] **Step 2: Run the reader tests and verify RED**

```bash
pnpm exec vitest run tests/theme-style-reader.test.ts
```

Expected: FAIL because `tests/helpers/read-theme-style.ts` is missing.

- [ ] **Step 3: Implement the reader**

Create `tests/helpers/read-theme-style.ts`:

```ts
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const localImport = /^\s*@import\s+['"]([^'"]+)['"]\s*;\s*$/gm

export function readThemeStyle(entryPath: string) {
  const absoluteEntry = resolve(entryPath)
  const entry = readFileSync(absoluteEntry, 'utf8')
  const imports = [...entry.matchAll(localImport)].map((match) => match[1])
  if (imports.length === 0) return entry

  const nonImportSource = entry.replace(localImport, '').trim()
  if (nonImportSource !== '') {
    throw new Error(`Theme style entry mixes imports and declarations: ${entryPath}`)
  }

  return imports
    .map((reference) => readFileSync(resolve(dirname(absoluteEntry), reference), 'utf8'))
    .join('')
}

export function readHomeStyle() {
  return readThemeStyle('docs/.vitepress/theme/home.css')
}
```

- [ ] **Step 4: Verify GREEN and commit the helper**

```bash
pnpm exec vitest run tests/theme-style-reader.test.ts
git add tests/helpers/read-theme-style.ts tests/theme-style-reader.test.ts
git diff --cached --check
git commit -m "test: read modular theme styles"
```

### Task 2: Split `home.css` Without Changing Its Bytes

**Files:**
- Create: `docs/.vitepress/theme/home/home-foundation.css`
- Create: `docs/.vitepress/theme/home/home-hero.css`
- Create: `docs/.vitepress/theme/home/home-sections.css`
- Create: `docs/.vitepress/theme/home/home-responsive.css`
- Modify: `docs/.vitepress/theme/home.css`
- Create: `tests/home-style-entry.test.ts`
- Modify: `tests/home-analytics-style.test.ts`
- Modify: `tests/home-reading-heading.test.ts`
- Modify: `tests/neutral-hover-colors.test.ts`
- Modify: `tests/brand.test.ts`
- Modify: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: `readHomeStyle()` from Task 1.
- Produces: the same aggregate homepage CSS string as the pre-split file.
- Produces: a stable four-import `home.css` entry.

- [ ] **Step 1: Write the failing entry contract**

Create `tests/home-style-entry.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { readHomeStyle } from './helpers/read-theme-style'

describe('homepage style entry', () => {
  it('imports four responsibility-based partials in source order', () => {
    expect(readFileSync('docs/.vitepress/theme/home.css', 'utf8')).toBe(
      "@import './home/home-foundation.css';\n"
      + "@import './home/home-hero.css';\n"
      + "@import './home/home-sections.css';\n"
      + "@import './home/home-responsive.css';\n",
    )
  })

  it('retains all four boundary selectors in aggregate order', () => {
    const css = readHomeStyle()
    const boundaries = [
      '.wbx-home-layout',
      '.wbx-hero {',
      '.wbx-value-strip',
      '@media (max-width: 1200px)',
    ]
    const offsets = boundaries.map((value) => css.indexOf(value))
    expect(offsets.every((offset) => offset >= 0)).toBe(true)
    expect(offsets).toEqual([...offsets].sort((left, right) => left - right))
  })
})
```

- [ ] **Step 2: Run the entry contract and verify RED**

```bash
pnpm exec vitest run tests/home-style-entry.test.ts
```

Expected: FAIL because `home.css` still contains all declarations.

- [ ] **Step 3: Move four exact contiguous ranges into partials**

Use `apply_patch` or an equivalently reviewable mechanical move. Preserve every byte from the original ranges, including blank lines:

```text
original lines 1-170    -> home/home-foundation.css
original lines 171-669  -> home/home-hero.css
original lines 670-1079 -> home/home-sections.css
original lines 1080-1491 -> home/home-responsive.css
```

Replace `home.css` with exactly:

```css
@import './home/home-foundation.css';
@import './home/home-hero.css';
@import './home/home-sections.css';
@import './home/home-responsive.css';
```

Do not move the reduced-motion blocks at original lines 569-593 and 652-656 out of `home-hero.css`. The block beginning at original line 1451 remains in `home-responsive.css`.

- [ ] **Step 4: Prove byte preservation against the pre-task commit**

Run this from the repository root before committing Task 2:

```bash
node --input-type=module -e "import {readFileSync} from 'node:fs'; import {execFileSync} from 'node:child_process'; const before=execFileSync('git',['show','HEAD:docs/.vitepress/theme/home.css']); const paths=['home-foundation.css','home-hero.css','home-sections.css','home-responsive.css']; const after=Buffer.concat(paths.map((name)=>readFileSync('docs/.vitepress/theme/home/'+name))); if (!before.equals(after)) { console.error('homepage CSS bytes changed'); process.exit(1) } console.log('homepage CSS bytes preserved')"
```

Expected: `homepage CSS bytes preserved`.

- [ ] **Step 5: Route all homepage CSS source tests through `readHomeStyle()`**

In the five existing test files, replace only homepage reads:

```ts
import { readHomeStyle } from './helpers/read-theme-style'

const homeCss = readHomeStyle()
```

For reads inside individual tests, use `const css = readHomeStyle()`. Keep `readFileSync` imports where the file still reads Vue, `custom.css`, JSON, or other sources. In `tests/brand.test.ts`, assemble the branded CSS as:

```ts
const css = [
  readFileSync('docs/.vitepress/theme/custom.css', 'utf8'),
  readHomeStyle(),
].join('\n')
```

- [ ] **Step 6: Run all directly affected style contracts**

```bash
pnpm exec vitest run tests/theme-style-reader.test.ts tests/home-style-entry.test.ts tests/home-hero-icons.test.ts tests/home-analytics-style.test.ts tests/home-reading-heading.test.ts tests/neutral-hover-colors.test.ts tests/brand.test.ts
pnpm run build
```

Expected: all tests PASS and the production build completes.

- [ ] **Step 7: Commit the byte-preserving split**

```bash
git add docs/.vitepress/theme/home.css docs/.vitepress/theme/home tests/home-style-entry.test.ts tests/home-hero-icons.test.ts tests/home-analytics-style.test.ts tests/home-reading-heading.test.ts tests/neutral-hover-colors.test.ts tests/brand.test.ts
git diff --cached --check
git commit -m "refactor: split homepage styles by responsibility"
```

### Task 3: Split the Homepage Integration Test by Responsibility

**Files:**
- Create: `tests/helpers/home-page-harness.ts`
- Create: `tests/helpers/css-rules.ts`
- Create: `tests/home-update-ticker.test.ts`
- Create: `tests/home-hero-layout.test.ts`
- Create: `tests/home-content-sections.test.ts`
- Create: `tests/home-community-footer.test.ts`
- Remove: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Produces: `useHomePageHarness()` returning `mountHomePage()`, `stubMatchMedia(matches)`, and `mediaQueryRemoveEventListener()`.
- Produces: `baseRule()`, `numericDeclaration()`, `optionalNumericDeclaration()`, `rotatedCardBounds()`, and `cardClearance()`.
- Consumes: `readHomeStyle()` from Task 1.

- [ ] **Step 1: Record the exact original test-title set**

Run and keep the output in the task report:

```bash
rg "^  it\\(" tests/home-hero-icons.test.ts
```

Expected: 34 test titles. Do not edit the original file until the title list is recorded.

- [ ] **Step 2: Extract shared CSS helpers**

Move the existing `baseRule`, `numericDeclaration`, `optionalNumericDeclaration`, `rotatedCardBounds`, and `cardClearance` function bodies verbatim from the original file into `tests/helpers/css-rules.ts`, exporting each function. Preserve these signatures:

```ts
export function baseRule(css: string, selector: string): string
export function numericDeclaration(
  declarations: string,
  property: string,
  unit: 'deg' | 'px' | '%',
): number
export function optionalNumericDeclaration(
  declarations: string,
  property: string,
  unit: 'deg' | 'px' | '%',
): number | undefined
export function rotatedCardBounds(
  declarations: string,
  artWidth: number,
  cardSize: number,
  artHeight?: number,
): { left: number; right: number; top: number; bottom: number }
export function cardClearance(
  first: ReturnType<typeof rotatedCardBounds>,
  second: ReturnType<typeof rotatedCardBounds>,
): number
```

- [ ] **Step 3: Extract the shared Vue harness**

Create `tests/helpers/home-page-harness.ts` from the original file's imports, mock, app list, `beforeEach`, `afterEach`, `stubMatchMedia`, and `mountHomePage`. Wrap hook registration per importing test file. Start the file with:

```ts
import { afterEach, beforeEach, vi } from 'vitest'
import { createApp, type App } from 'vue'
import HomePage from '../../docs/.vitepress/theme/HomePage.vue'

vi.mock('vitepress', () => ({
  withBase: (path: string) => path,
}))

export function useHomePageHarness() {
  const apps: App[] = []
  let removeMediaListener: ReturnType<typeof vi.fn>

  function stubMatchMedia(matches: boolean) {
    removeMediaListener = vi.fn()
    vi.stubGlobal('matchMedia', vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: removeMediaListener,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })))
  }

  beforeEach(() => {
    stubMatchMedia(false)
    vi.stubGlobal('ResizeObserver', class ResizeObserverStub {
      constructor(_callback: ResizeObserverCallback) {}

      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
    })
  })

  afterEach(() => {
    apps.splice(0).forEach((app) => app.unmount())
    document.body.replaceChildren()
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  function mountHomePage() {
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(HomePage)
    app.mount(host)
    apps.push(app)
    return app
  }

  return {
    mountHomePage,
    stubMatchMedia,
    mediaQueryRemoveEventListener: () => removeMediaListener,
  }
}
```

- [ ] **Step 4: Redistribute every test exactly once**

Each new file imports the exact Vitest names its moved tests use, calls `const harness = useHomePageHarness()`, and keeps the original enclosing description `home hero icon navigation`. Replace `mountHomePage()` and `stubMatchMedia()` calls with their `harness` equivalents; replace the one listener assertion with `harness.mediaQueryRemoveEventListener()`. Apart from those ownership changes and `readHomeStyle()`, move test bodies verbatim according to this map:

```text
home-update-ticker.test.ts
  rotates one synchronized update link every six seconds and loops a full cycle
  always duplicates the current update title for the marquee
  pauses on hover and starts a fresh interval after the pointer leaves
  stays paused until both overlapping hover and focus states end
  clears timers and media listeners when unmounted
  keeps the first update visible when reduced motion is preferred
  styles the synchronized update ticker as a vertically changing date with a persistent title marquee
  keeps the mobile ticker inside the hero without moving subsequent copy content

home-hero-layout.test.ts
  opens the canonical reading guide from the secondary hero action
  renders the hero copy and art directly inside a static stage
  keeps the desktop hero copy boundary on the card centerline
  does not import or style the retired partner reveal
  uses black icon cards with green pixel icons
  uses only the outer hero border
  gives only the homepage primary CTA the approved arrow handoff motion
  offers five labelled links to distinct site sections
  adds a labelled WorkBuddy official-site IP link to the hero
  adds a workbuddy.cn label above the official-site IP link
  positions the official-site IP link without duplicate hero metrics
  uses the approved mobile hero card placement
  positions the Part 4 people icon safely at every hero breakpoint

home-content-sections.test.ts
  uses the approved homepage value labels
  keeps the value strip green with black icons and text in both themes
  uses a book icon for the first reading path
  uses the WorkBuddy Team lift and shadow on reading-path cards
  aligns mobile reading icons with titles and arrows with tags
  aligns the system panel with the reading cards and rounds it by 20px
  uses the approved light-gray system panel palette
  uses the approved system heading and community download copy
  removes the task heading divider while keeping the task-grid border

home-community-footer.test.ts
  renders the approved borderless homepage product footer
  runs the community callout viewport-wide without an outer border
  links to Quark and contribution without a GitHub action
  renders the complete IP as one static image
```

Delete `tests/home-hero-icons.test.ts` only after all four files compile.

- [ ] **Step 5: Prove title preservation and run focused suites**

Compare the new title set to the previous commit and reject missing or duplicate titles:

```bash
node --input-type=module -e "import {execFileSync} from 'node:child_process'; import {readFileSync} from 'node:fs'; const title=/^\s*it\('([^']+)'/gm; const old=[...execFileSync('git',['show','HEAD:tests/home-hero-icons.test.ts'],{encoding:'utf8'}).matchAll(title)].map((m)=>m[1]).sort(); const files=['tests/home-update-ticker.test.ts','tests/home-hero-layout.test.ts','tests/home-content-sections.test.ts','tests/home-community-footer.test.ts']; const next=files.flatMap((file)=>[...readFileSync(file,'utf8').matchAll(title)].map((m)=>m[1])).sort(); if (JSON.stringify(old)!==JSON.stringify(next)) { console.error({old,next}); process.exit(1) } console.log('all homepage test titles preserved')"
pnpm exec vitest run tests/home-update-ticker.test.ts tests/home-hero-layout.test.ts tests/home-content-sections.test.ts tests/home-community-footer.test.ts tests/home-analytics-style.test.ts tests/home-reading-heading.test.ts tests/neutral-hover-colors.test.ts tests/brand.test.ts
```

Expected: title comparison passes and all focused tests PASS.

- [ ] **Step 6: Run the full regression and commit**

```bash
pnpm test
pnpm run build
git diff --check
git add tests/helpers/home-page-harness.ts tests/helpers/css-rules.ts tests/home-update-ticker.test.ts tests/home-hero-layout.test.ts tests/home-content-sections.test.ts tests/home-community-footer.test.ts tests/home-hero-icons.test.ts
git diff --cached --check
git commit -m "test: split homepage contracts by responsibility"
```

Expected: full Vitest suite and production build PASS. The removed monolith is staged as a deletion and all four replacements are staged as additions.
