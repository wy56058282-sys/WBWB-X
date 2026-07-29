# WorkBuddy WB-X Clone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a faithful, responsive VitePress clone of WorkBuddy Guide under the WorkBuddy WB-X brand, preserving all written content and interactions while making every brand value and replaceable image locally maintainable.

**Architecture:** Use VitePress 1.6.4 with Markdown as the content source and a focused custom theme for the source-matched homepage, community modal, brand tokens, and responsive polish. Store brand values in a typed module, store source/replacement image metadata in a generated manifest, and validate routes, assets, metadata, interactions, and visual parity with automated tests plus browser QA.

**Tech Stack:** Node.js 20+, npm, VitePress 1.6.4, Vue 3, TypeScript, Vitest, jsdom, Playwright-compatible browser verification.

## Global Constraints

- Preserve the source website's page hierarchy, written content, third-party references, core interactions, black-and-white pixel style, and responsive behavior.
- Use `WorkBuddy WB-X`, `WorkBuddy 实战小白书`, `WorkBuddy小白书`, and `WBWB-X` exactly as defined in the approved design.
- Use `#32E6B9` for every site-wide accent that replaces the source yellow-green accent.
- Use `https://www.wbwb-x.sparkx.zone` as the canonical production origin.
- Use `https://github.com/wy56058282-sys/WBWB-X` for repository, contribution, and edit-page links.
- Use `WorkBuddy WB-X Contributors` as author and copyright owner.
- Use `WB-X LOGO.svg` for both the header icon and favicon.
- Use `/community/wechat-group.png` as the stable group QR path.
- Do not retain the old Baidu verification code.
- Keep third-party article links and HackerNoon pixel-icon attribution.
- Copy source assets locally for layout calibration; do not hotlink source assets.
- Treat all 234 source article images as temporary calibration assets that must be replaced before final delivery.
- Do not deploy without explicit user approval.

---

## Planned File Structure

```text
.
├── .gitignore
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── docs/
│   ├── .vitepress/
│   │   ├── config.mts
│   │   ├── brand.ts
│   │   ├── navigation.ts
│   │   ├── sidebar.ts
│   │   ├── theme/
│   │   │   ├── index.ts
│   │   │   ├── Layout.vue
│   │   │   ├── CommunityQr.vue
│   │   │   ├── HomePage.vue
│   │   │   ├── custom.css
│   │   │   └── home.css
│   │   └── image-manifest.generated.json
│   ├── index.md
│   ├── reading-guide.md
│   ├── cases/index.md
│   ├── help/index.md
│   ├── community/contributing.md
│   ├── bluebook/**/*.md
│   └── public/
│       ├── brand/wb-x-logo.svg
│       ├── community/wechat-group.png
│       ├── og/workbuddy-wb-x-guide.png
│       └── article-assets/**
├── scripts/
│   ├── build-image-manifest.mjs
│   ├── check-content-links.mjs
│   ├── check-replacement-assets.mjs
│   └── copy-approved-assets.mjs
├── tests/
│   ├── brand.test.ts
│   ├── navigation.test.ts
│   ├── image-manifest.test.ts
│   └── content-links.test.ts
├── article-image-replacement-manifest.csv
├── README.md
└── design-qa.md
```

### Responsibility Boundaries

- `brand.ts` is the single source of truth for identity, URLs, SEO, and asset paths.
- `navigation.ts` and `sidebar.ts` own route structure only.
- `HomePage.vue` owns source-matched homepage markup; its CSS lives in `home.css`.
- `CommunityQr.vue` owns modal state, focus behavior, QR content, and replacement guidance.
- `Layout.vue` composes VitePress's default layout with custom home and modal behavior.
- `image-manifest.generated.json` and the CSV describe every source image and replacement status.
- `scripts/` validate mechanically checkable requirements and never mutate article prose.

---

### Task 1: Bootstrap the Tested VitePress Foundation

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `docs/.vitepress/brand.ts`
- Create: `tests/brand.test.ts`

**Interfaces:**
- Produces: `brand: BrandConfig`, exported from `docs/.vitepress/brand.ts`.
- `BrandConfig` contains `siteName`, `contentName`, `contentShortName`, `shortMark`, `accent`, `origin`, `repository`, `author`, `logoPath`, `qrPath`, `ogImagePath`, and `seo`.

- [ ] **Step 1: Write the failing brand configuration test**

```ts
import { describe, expect, it } from 'vitest'
import { brand } from '../docs/.vitepress/brand'

describe('brand configuration', () => {
  it('contains the approved WB-X identity', () => {
    expect(brand.siteName).toBe('WorkBuddy WB-X')
    expect(brand.contentName).toBe('WorkBuddy 实战小白书')
    expect(brand.contentShortName).toBe('WorkBuddy小白书')
    expect(brand.shortMark).toBe('WBWB-X')
    expect(brand.accent).toBe('#32E6B9')
    expect(brand.origin).toBe('https://www.wbwb-x.sparkx.zone')
    expect(brand.repository).toBe('https://github.com/wy56058282-sys/WBWB-X')
    expect(brand.author).toBe('WorkBuddy WB-X Contributors')
    expect(brand.logoPath).toBe('/brand/wb-x-logo.svg')
    expect(brand.qrPath).toBe('/community/wechat-group.png')
  })
})
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run: `npm test -- tests/brand.test.ts`

Expected: FAIL because `docs/.vitepress/brand.ts` does not exist.

- [ ] **Step 3: Add project configuration and the typed brand module**

```json
{
  "name": "workbuddy-wb-x",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs",
    "test": "vitest run",
    "check:links": "node scripts/check-content-links.mjs",
    "check:assets": "node scripts/check-replacement-assets.mjs",
    "check": "npm test && npm run check:links && npm run check:assets && npm run build"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "jsdom": "^25.0.1",
    "typescript": "^5.7.2",
    "vitepress": "1.6.4",
    "vitest": "^2.1.8",
    "vue": "^3.5.13"
  }
}
```

```ts
export interface BrandConfig {
  siteName: string
  contentName: string
  contentShortName: string
  shortMark: string
  accent: `#${string}`
  origin: `https://${string}`
  repository: `https://github.com/${string}`
  author: string
  logoPath: `/${string}`
  qrPath: `/${string}`
  ogImagePath: `/${string}`
  seo: {
    title: string
    description: string
    keywords: string
  }
}

export const brand: BrandConfig = {
  siteName: 'WorkBuddy WB-X',
  contentName: 'WorkBuddy 实战小白书',
  contentShortName: 'WorkBuddy小白书',
  shortMark: 'WBWB-X',
  accent: '#32E6B9',
  origin: 'https://www.wbwb-x.sparkx.zone',
  repository: 'https://github.com/wy56058282-sys/WBWB-X',
  author: 'WorkBuddy WB-X Contributors',
  logoPath: '/brand/wb-x-logo.svg',
  qrPath: '/community/wechat-group.png',
  ogImagePath: '/og/workbuddy-wb-x-guide.png',
  seo: {
    title: 'WorkBuddy 教程与使用指南｜WorkBuddy WB-X 实战小白书',
    description:
      '系统的 WorkBuddy 中文教程与使用指南，涵盖安装入门、真实案例、Skills、连接器、自动化和多智能体实践。',
    keywords:
      'WorkBuddy, WorkBuddy WB-X, WorkBuddy 教程, AI Agent, AI 工作系统, Skills, MCP, 自动化, 多智能体, 职场 AI',
  },
}
```

- [ ] **Step 4: Install dependencies and run the test**

Run: `npm install && npm test -- tests/brand.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts .gitignore docs/.vitepress/brand.ts tests/brand.test.ts
git commit -m "chore: bootstrap VitePress and brand configuration"
```

---

### Task 2: Copy Approved Brand Assets and Validate Them

**Files:**
- Create: `docs/public/brand/wb-x-logo.svg`
- Create: `docs/public/community/wechat-group.png`
- Create: `scripts/copy-approved-assets.mjs`
- Create: `scripts/check-replacement-assets.mjs`
- Create: `tests/image-manifest.test.ts`

**Interfaces:**
- Consumes: `brand.logoPath` and `brand.qrPath`.
- Produces: stable public assets at the exact paths declared by `brand`.
- Produces: CLI exit code `0` only when required files exist and contain no hotlinks.

- [ ] **Step 1: Write a failing required-assets test**

```ts
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('required brand assets', () => {
  it('has a valid SVG logo and an 800x800 PNG QR source', () => {
    expect(existsSync('docs/public/brand/wb-x-logo.svg')).toBe(true)
    expect(readFileSync('docs/public/brand/wb-x-logo.svg', 'utf8')).toContain(
      'viewBox="0 0 512 512"',
    )
    expect(existsSync('docs/public/community/wechat-group.png')).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test and verify missing-asset failures**

Run: `npm test -- tests/image-manifest.test.ts`

Expected: FAIL for both missing public assets.

- [ ] **Step 3: Implement deterministic asset copying**

```js
import { copyFile, mkdir } from 'node:fs/promises'

await mkdir('docs/public/brand', { recursive: true })
await mkdir('docs/public/community', { recursive: true })
await copyFile('WB-X LOGO.svg', 'docs/public/brand/wb-x-logo.svg')
await copyFile('二维码.png', 'docs/public/community/wechat-group.png')
```

Run: `node scripts/copy-approved-assets.mjs`

- [ ] **Step 4: Implement asset validation**

The script must:

1. Assert the logo and QR files exist.
2. Assert the QR PNG signature is present.
3. Recursively scan Markdown, Vue, CSS, TS, and JSON under `docs/`.
4. Fail when `https://workbuddy.homes/` appears in an asset reference.
5. Allow the source URL only in prose explicitly marked as source attribution.

Run: `npm run check:assets`

Expected: PASS.

- [ ] **Step 5: Run tests**

Run: `npm test -- tests/image-manifest.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add docs/public scripts/copy-approved-assets.mjs scripts/check-replacement-assets.mjs tests/image-manifest.test.ts
git commit -m "feat: add approved WB-X brand assets"
```

---

### Task 3: Configure Navigation, SEO, Search, and Edit Links

**Files:**
- Create: `docs/.vitepress/navigation.ts`
- Create: `docs/.vitepress/sidebar.ts`
- Create: `docs/.vitepress/config.mts`
- Create: `tests/navigation.test.ts`

**Interfaces:**
- Consumes: `brand`.
- Produces: `nav`, `sidebar`, and a VitePress default export.
- Route labels and hrefs must match the source hierarchy.

- [ ] **Step 1: Write failing navigation tests**

```ts
import { describe, expect, it } from 'vitest'
import { nav } from '../docs/.vitepress/navigation'
import { sidebar } from '../docs/.vitepress/sidebar'

describe('site navigation', () => {
  it('keeps the source top-level information architecture', () => {
    expect(nav.map((item) => item.text)).toEqual([
      '首页',
      '开始阅读',
      '案例集',
      '帮你解决',
      '阅读指南',
      '交流群',
    ])
  })

  it('contains all 27 numbered chapters and both appendices', () => {
    const serialized = JSON.stringify(sidebar)
    for (let chapter = 1; chapter <= 27; chapter += 1) {
      expect(serialized).toContain(`第 ${chapter} 章`)
    }
    expect(serialized).toContain('附录 A')
    expect(serialized).toContain('附录 B')
  })
})
```

- [ ] **Step 2: Run tests and verify missing-module failures**

Run: `npm test -- tests/navigation.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement navigation and sidebar data**

Populate every route from the captured `/bluebook/` navigation. Do not shorten Chinese path segments or invent aliases. Give the `交流群` item a custom marker:

```ts
export const nav = [
  { text: '首页', link: '/' },
  { text: '开始阅读', link: '/bluebook/' },
  { text: '案例集', link: '/cases/' },
  { text: '帮你解决', link: '/help/' },
  { text: '阅读指南', link: '/reading-guide' },
  { text: '交流群', link: '#community', custom: true },
] as const
```

- [ ] **Step 4: Implement VitePress configuration**

Configure:

- `lang: 'zh-CN'`
- clean URLs
- local search
- logo and title
- canonical URL generation
- author, description, keywords, Open Graph, and Twitter metadata
- source-matched nav and sidebar
- edit link pattern targeting `wy56058282-sys/WBWB-X`
- footer copyright
- `lastUpdated: true`
- no old Baidu verification meta

- [ ] **Step 5: Run tests and build**

Run: `npm test -- tests/navigation.test.ts && npm run build`

Expected: PASS and a successful VitePress build.

- [ ] **Step 6: Commit**

```bash
git add docs/.vitepress tests/navigation.test.ts
git commit -m "feat: configure WB-X documentation navigation"
```

---

### Task 4: Capture and Import the Full Markdown Content

**Files:**
- Create: `docs/index.md`
- Create: `docs/reading-guide.md`
- Create: `docs/cases/index.md`
- Create: `docs/help/index.md`
- Create: `docs/community/contributing.md`
- Create: `docs/bluebook/**/*.md`
- Create: `scripts/check-content-links.mjs`
- Create: `tests/content-links.test.ts`

**Interfaces:**
- Consumes: captured source DOM, routes from `sidebar.ts`, and approved unchanged article prose.
- Produces: one Markdown file for every configured route.
- Produces: a link-check command that exits nonzero for missing internal targets.

- [ ] **Step 1: Write the failing content inventory test**

```ts
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const required = [
  'docs/index.md',
  'docs/reading-guide.md',
  'docs/cases/index.md',
  'docs/help/index.md',
  'docs/community/contributing.md',
]

describe('content inventory', () => {
  it('contains every top-level source page', () => {
    for (const path of required) expect(existsSync(path)).toBe(true)
  })
})
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/content-links.test.ts`

Expected: FAIL because content files do not exist.

- [ ] **Step 3: Capture source pages with the approved in-app browser**

For each top-level page, four part introductions, 27 chapters, the extra reading page, and appendices A/B:

1. Open the source URL.
2. Capture the full visible structure and lazy-loaded content.
3. Record headings, paragraphs, lists, tables, code, callouts, links, and image order.
4. Record desktop and mobile behaviors once per distinct page template.
5. Save the prose in the matching Markdown path.

Do not copy navigation/footer text into article Markdown.

- [ ] **Step 4: Normalize only site-owned identity**

Apply exact replacements:

```text
WorkBuddy Guide                 → WorkBuddy WB-X
WorkBuddy 实战蓝皮书             → WorkBuddy 实战小白书
WorkBuddy蓝皮书                  → WorkBuddy小白书
https://workbuddy.homes         → https://www.wbwb-x.sparkx.zone
AlephAITech/WorkBuddyGuide      → wy56058282-sys/WBWB-X
WorkBuddy Guide Contributors    → WorkBuddy WB-X Contributors
```

Do not replace the WorkBuddy product name inside instructional prose.

- [ ] **Step 5: Implement the internal-link checker**

The checker must parse Markdown links beginning with `/`, decode URL paths, resolve directory indexes, ignore `#fragment` when checking files, and report errors in this concrete form:

```text
BROKEN_INTERNAL_LINK docs/bluebook/index.md -> /bluebook/missing-page/
```

- [ ] **Step 6: Run content tests and link checks**

Run: `npm test -- tests/content-links.test.ts && npm run check:links`

Expected: PASS with zero broken internal links.

- [ ] **Step 7: Commit**

```bash
git add docs scripts/check-content-links.mjs tests/content-links.test.ts
git commit -m "feat: import WorkBuddy guide content"
```

---

### Task 5: Build the Source-Matched Theme and Homepage

**Files:**
- Create: `docs/.vitepress/theme/index.ts`
- Create: `docs/.vitepress/theme/Layout.vue`
- Create: `docs/.vitepress/theme/HomePage.vue`
- Create: `docs/.vitepress/theme/custom.css`
- Create: `docs/.vitepress/theme/home.css`

**Interfaces:**
- Consumes: `brand`, VitePress `DefaultTheme`, and the `/` route.
- Produces: a custom layout that renders `HomePage` only on `/` and otherwise delegates to the default VitePress layout.

- [ ] **Step 1: Add a failing rendered-brand assertion**

Extend `tests/brand.test.ts`:

```ts
import { readFileSync } from 'node:fs'

it('renders homepage identity from the shared brand module', () => {
  const source = readFileSync('docs/.vitepress/theme/HomePage.vue', 'utf8')
  expect(source).toContain("import { brand } from '../brand'")
  expect(source).not.toContain('WorkBuddy Guide')
  expect(source).not.toContain('#d8f238')
})
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/brand.test.ts`

Expected: FAIL because `HomePage.vue` does not exist.

- [ ] **Step 3: Implement the custom layout**

`Layout.vue` must:

- use VitePress route state;
- render `HomePage` for `/`;
- render `DefaultTheme.Layout` for documentation routes;
- mount `CommunityQr` globally;
- preserve VitePress search, appearance switch, mobile nav, and doc navigation.

- [ ] **Step 4: Implement the homepage sections**

Recreate, in source order:

1. Hero and scale metadata.
2. Four value propositions.
3. Four-part reading path.
4. Six real-task categories.
5. Task-to-team workflow.
6. Public contribution callout.
7. Footer attribution.

Use semantic links and headings. Use the real pixel icon assets captured from the source or the closest matching licensed icon package; do not hand-draw SVG replacements.

- [ ] **Step 5: Implement responsive and theme CSS**

Define:

```css
:root {
  --wbx-accent: #32e6b9;
  --wbx-ink: #0d100d;
  --wbx-paper: #f7f8f2;
}
```

Match captured desktop spacing and typography. Add explicit breakpoints for source-observed desktop/tablet/mobile transitions and verify at 390×844.

- [ ] **Step 6: Run tests and build**

Run: `npm test -- tests/brand.test.ts && npm run build`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add docs/.vitepress/theme tests/brand.test.ts
git commit -m "feat: recreate WorkBuddy WB-X visual theme"
```

---

### Task 6: Implement the Accessible Community QR Modal

**Files:**
- Create: `docs/.vitepress/theme/CommunityQr.vue`
- Modify: `docs/.vitepress/theme/Layout.vue`
- Modify: `docs/.vitepress/theme/custom.css`

**Interfaces:**
- Consumes: `brand.qrPath`.
- Produces: `openCommunityQr()` via a small module-local event contract and a dialog labelled `加入交流群`.

- [ ] **Step 1: Write a failing source contract test**

Add to `tests/brand.test.ts`:

```ts
it('keeps the QR modal on the stable replacement path', () => {
  const source = readFileSync('docs/.vitepress/theme/CommunityQr.vue', 'utf8')
  expect(source).toContain('brand.qrPath')
  expect(source).toContain('aria-modal="true"')
  expect(source).toContain('按 Escape 关闭')
})
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/brand.test.ts`

Expected: FAIL.

- [ ] **Step 3: Implement modal behavior**

The component must:

- open from desktop and mobile `交流群` controls;
- show `/community/wechat-group.png`;
- use `role="dialog"` and `aria-modal="true"`;
- close via close button, backdrop click, and Escape;
- restore focus to the trigger;
- lock background scrolling while open;
- show maintenance text: `二维码过期后，在 GitHub 中覆盖同名文件即可更新。`

- [ ] **Step 4: Verify interaction in the browser**

At desktop and 390×844:

1. Open the modal.
2. Confirm the QR is fully visible and square.
3. Close with Escape.
4. Reopen and close with the button.
5. Confirm keyboard focus returns to the trigger.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- tests/brand.test.ts && npm run build`

```bash
git add docs/.vitepress/theme tests/brand.test.ts
git commit -m "feat: add maintainable community QR dialog"
```

---

### Task 7: Build the Article Image Replacement Manifest

**Files:**
- Create: `scripts/build-image-manifest.mjs`
- Create: `docs/.vitepress/image-manifest.generated.json`
- Create: `article-image-replacement-manifest.csv`
- Modify: `tests/image-manifest.test.ts`
- Create: `docs/public/article-assets/source-calibration/**`
- Create: `docs/public/article-assets/replacements/**`

**Interfaces:**
- Produces JSON records:

```ts
interface ImageManifestRecord {
  id: string
  page: string
  order: number
  purpose: string
  sourceUrl: string
  calibrationPath: string
  replacementPath: string
  sourceWidth: number | null
  sourceHeight: number | null
  format: 'png' | 'jpg' | 'gif'
  status: 'awaiting-replacement' | 'replaced' | 'approved'
}
```

- Produces CSV columns in the same order, with one row per unique source image.

- [ ] **Step 1: Write the failing manifest test**

```ts
import manifest from '../docs/.vitepress/image-manifest.generated.json'

it('tracks the captured article image inventory', () => {
  expect(manifest.length).toBeGreaterThanOrEqual(234)
  expect(new Set(manifest.map((item) => item.id)).size).toBe(manifest.length)
  expect(
    manifest.every((item) => item.replacementPath.startsWith('/article-assets/replacements/')),
  ).toBe(true)
})
```

- [ ] **Step 2: Run the test and verify missing-manifest failure**

Run: `npm test -- tests/image-manifest.test.ts`

Expected: FAIL.

- [ ] **Step 3: Capture and copy source calibration assets**

Use the page asset capability after each captured chapter to bundle the exact loaded PNG/JPG/GIF resources. Store them under:

```text
docs/public/article-assets/source-calibration/ch01/001-introduction-screen.png
```

Do not use hotlinks in Markdown.

- [ ] **Step 4: Generate JSON and CSV**

Generate stable IDs:

```text
ch01-001
ch01-002
ch02-001
appendix-b-001
```

Every record starts as `awaiting-replacement`. The CSV includes a final `notes` column for the user's replacement instructions.

- [ ] **Step 5: Wire calibration image paths into Markdown**

Replace each source URL with its `calibrationPath`. Preserve order and captions.

- [ ] **Step 6: Run manifest and asset checks**

Run: `npm test -- tests/image-manifest.test.ts && npm run check:assets`

Expected: PASS and zero source hotlinks.

- [ ] **Step 7: Commit**

```bash
git add scripts/build-image-manifest.mjs docs/.vitepress/image-manifest.generated.json article-image-replacement-manifest.csv docs/public/article-assets docs/bluebook
git commit -m "feat: add article image replacement inventory"
```

---

### Task 8: Create the Branded Social Share Image and Metadata

**Files:**
- Create: `docs/public/og/workbuddy-wb-x-guide.png`
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/brand.test.ts`

**Interfaces:**
- Consumes: approved source share-image composition, `brand`, and the WB-X logo.
- Produces: a 1280×720 PNG at `brand.ogImagePath`.

- [ ] **Step 1: Add a failing dimensions check**

Add a test or validation helper that reads the PNG IHDR and asserts:

```ts
expect(readPngDimensions('docs/public/og/workbuddy-wb-x-guide.png')).toEqual({
  width: 1280,
  height: 720,
})
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/brand.test.ts`

Expected: FAIL because the image is missing.

- [ ] **Step 3: Produce the share image**

Use ImageGen with the captured source share image as visual reference. Preserve its composition and pixel aesthetic while replacing:

- header logo and site name;
- content brand;
- short mark with `WBWB-X`;
- accent color with `#32E6B9`.

Do not add new decorative concepts.

- [ ] **Step 4: Verify visual safety**

Inspect the 1280×720 output and confirm:

- no text is clipped;
- the logo is not distorted;
- Chinese text is correct;
- all critical content sits inside a 60 px safe area;
- contrast works against `#32E6B9`.

- [ ] **Step 5: Run metadata tests and build**

Run: `npm test -- tests/brand.test.ts && npm run build`

Expected: PASS and generated HTML references the new absolute OG URL.

- [ ] **Step 6: Commit**

```bash
git add docs/public/og docs/.vitepress/config.mts tests/brand.test.ts
git commit -m "feat: add WB-X social sharing artwork"
```

---

### Task 9: Replace All Article Images in User-Supplied Batches

**Files:**
- Modify: `docs/public/article-assets/replacements/**`
- Modify: `docs/.vitepress/image-manifest.generated.json`
- Modify: `article-image-replacement-manifest.csv`
- Modify: `docs/bluebook/**/*.md`

**Interfaces:**
- Consumes: user images named with manifest IDs or a supplied ID-to-file mapping.
- Produces: every manifest record with `status: 'approved'` and every Markdown image referencing `/article-assets/replacements/`.

- [ ] **Step 1: Process one batch**

For each supplied file:

1. Resolve the manifest ID.
2. Verify format and dimensions.
3. Copy to the exact `replacementPath`.
4. Update Markdown without changing captions or order.
5. Set status to `replaced`.

- [ ] **Step 2: Visually inspect the batch**

Open every affected page at desktop and 390×844. Check crop, legibility, aspect ratio, sensitive information, and contextual correctness.

- [ ] **Step 3: Mark approved records**

Only after visual inspection, change `replaced` to `approved`.

- [ ] **Step 4: Run asset checks**

Run: `npm run check:assets`

Expected during preparation: a precise list of remaining `awaiting-replacement` IDs.

Expected before final delivery: PASS with zero pending IDs and zero references to `source-calibration`.

- [ ] **Step 5: Commit each independently reviewable batch**

```bash
git add docs/public/article-assets/replacements docs/.vitepress/image-manifest.generated.json article-image-replacement-manifest.csv docs/bluebook
git commit -m "content: replace article image batch ch01-001-to-ch03-004"
```

For later batches, replace `ch01-001-to-ch03-004` with the exact first and last manifest IDs included in that batch.

---

### Task 10: Verify Functionality, Visual Fidelity, and Handoff

**Files:**
- Create: `design-qa.md`
- Modify: files implicated by QA findings
- Modify: `README.md`

**Interfaces:**
- Consumes: completed site, source screenshots, replacement manifest, and all automated checks.
- Produces: `design-qa.md` with exactly `final result: passed` or `final result: blocked`.

- [ ] **Step 1: Add maintenance documentation**

README must document:

- local install, dev, build, and preview commands;
- brand configuration location;
- QR replacement by overwriting `docs/public/community/wechat-group.png`;
- image manifest workflow;
- GitHub repository and expected deployment integration;
- deferred Baidu verification configuration.

- [ ] **Step 2: Run the full automated gate**

Run: `npm run check`

Expected: all tests, link checks, asset checks, and production build pass.

- [ ] **Step 3: Start the local preview**

Run:

```bash
npm run dev -- --host 0.0.0.0 --port 4173 --strictPort
```

Keep the process running for browser verification.

- [ ] **Step 4: Verify primary interactions**

Test:

- desktop and 390×844 navigation;
- search open, query, result selection, and close;
- light/dark theme;
- community QR dialog;
- home cards and CTAs;
- sidebar and page-outline navigation;
- previous/next links;
- GitHub, contribution, and edit-page URLs.

Check browser console errors after each representative flow.

- [ ] **Step 5: Run source-versus-clone visual comparison**

Capture the source and local implementation at identical viewports and states. Compare:

- desktop homepage;
- mobile homepage;
- desktop article page;
- mobile article page;
- dark theme;
- community modal.

Fix all P0/P1/P2 differences. Record remaining P3 polish notes without blocking.

- [ ] **Step 6: Write the QA report**

`design-qa.md` must include:

```text
source capture: passed|blocked
prototype capture: passed|blocked
desktop comparison: passed|blocked
mobile comparison: passed|blocked
interactions: passed|blocked
automated checks: passed|blocked
replacement images pending: 0
final result: passed|blocked
```

Do not write `final result: passed` while any replacement image is pending.

- [ ] **Step 7: Run verification-before-completion**

Invoke `superpowers:verification-before-completion`, rerun the exact commands it requires, and retain the terminal evidence.

- [ ] **Step 8: Commit the verified result**

```bash
git add README.md design-qa.md .
git commit -m "feat: complete WorkBuddy WB-X site clone"
```

- [ ] **Step 9: Handoff without deploying**

Keep the verified local preview running and provide the clickable local preview URL in Codex Desktop. State that production deployment requires a separate explicit approval.
