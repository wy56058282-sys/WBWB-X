# Online Baseline Reading-Guide Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the approved navigation, reading-guide redirects, and 170px contact cards on top of the latest online `origin/main` without regressing its small-book index and responsive reading styles.

**Architecture:** Treat `origin/main` commit `9d2c0edafff189e30dd3407204f2e7dc6544f5f1` as immutable content baseline and implement only the approved deltas. Keep page discovery in the existing navigation/sidebar modules, keep dev and static legacy routing in their existing dedicated modules, and change only the contact-card selectors in the shared theme stylesheet. Every behavior change follows a focused RED/GREEN cycle before the full integration build and browser comparison.

**Tech Stack:** VitePress 1.6.4, Vue 3.5, TypeScript, Vitest 2.1, jsdom, Markdown, CSS.

## Global Constraints

- Preserve the online small-book release copy, compact appendix grouping, and mobile reading-card alignment already present at baseline commit `9d2c0edafff189e30dd3407204f2e7dc6544f5f1`.
- Top navigation copy is exactly `资料`, linking to `/resources/`.
- `阅读指南` is exactly the second `/wb-x/` sidebar entry, immediately below `小白书总览`, linking to `/wb-x/reading-guide/`.
- The resource placeholder body is exactly `资料整理中。`.
- `/reading-guide`, `/reading-guide/`, `/guide/reading-guide`, and `/guide/reading-guide/` redirect to `/wb-x/reading-guide/` and honor `SITE_BASE`.
- `.wb-contact-card` and its direct image are exactly `170px` wide; image height remains `auto`, grid gap remains `24px`, and wrapping remains enabled.
- Do not carry over old-branch custom-service, community-popover, build-boundary, or unrelated test/configuration changes.
- Do not publish, merge to `main`, or deploy as part of this plan.

---

### Task 1: Navigation and Reading Content

**Files:**
- Modify: `tests/navigation.test.ts`
- Modify: `tests/content-links.test.ts`
- Modify: `tests/home-hero-icons.test.ts`
- Modify: `docs/.vitepress/navigation.ts`
- Modify: `docs/.vitepress/sidebar.ts`
- Modify: `docs/.vitepress/theme/HomePage.vue`
- Create: `docs/resources/index.md`
- Create: `docs/wb-x/reading-guide/index.md`
- Delete: `docs/reading-guide.md`
- Modify: `CONTENT_INVENTORY.md`

**Interfaces:**
- Consumes: existing exported `nav` and `sidebar` arrays and VitePress `withBase(path: string)`.
- Produces: canonical page routes `/resources/` and `/wb-x/reading-guide/`; the redirect task consumes the canonical reading-guide route.

- [ ] **Step 1: Write failing navigation and content tests**

Update the top-level navigation expectation and add exact link/order assertions:

```ts
expect(nav.map((item) => item.text)).toEqual([
  '首页',
  '开始阅读',
  '案例集',
  '定制服务',
  '资料',
  '交流群',
])
expect(nav.find((item) => item.text === '资料')?.link).toBe('/resources/')
expect(sidebar.slice(0, 2)).toEqual([
  { text: '小白书总览', link: '/wb-x/' },
  { text: '阅读指南', link: '/wb-x/reading-guide/' },
])
```

In `tests/content-links.test.ts`, replace the old guide source in `required` with both canonical sources and keep reading-guide assertions pointed at the canonical file:

```ts
const required = [
  'docs/index.md',
  'docs/wb-x/reading-guide/index.md',
  'docs/resources/index.md',
  'docs/cases/index.md',
  'docs/help/index.md',
  'docs/community/contributing.md',
]
```

Add a mounted-home assertion in `tests/home-hero-icons.test.ts`:

```ts
it('opens the canonical reading guide from the secondary hero action', () => {
  mountHomePage()

  const route = [...document.querySelectorAll<HTMLAnchorElement>('a')].find(
    (link) => link.textContent?.trim() === '查看阅读路线',
  )

  expect(route?.getAttribute('href')).toBe('/wb-x/reading-guide/')
})
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
npm test -- tests/navigation.test.ts tests/content-links.test.ts tests/home-hero-icons.test.ts
```

Expected: FAIL because the baseline still exposes `指南`, lacks the second sidebar entry and canonical page files, and the home action still links to `/reading-guide`.

- [ ] **Step 3: Implement the minimal information-architecture changes**

Change the navigation item to:

```ts
{ text: '资料', link: '/resources/' },
```

Insert immediately after the sidebar overview:

```ts
{ text: '阅读指南', link: '/wb-x/reading-guide/' },
```

Change the HomePage secondary action to:

```vue
<a class="wbx-button wbx-button--outline" :href="withBase('/wb-x/reading-guide/')">查看阅读路线</a>
```

Move the full existing `docs/reading-guide.md` frontmatter and body without rewriting it into `docs/wb-x/reading-guide/index.md`, then remove the old source. Create the resource page with exactly:

```md
---
title: 资料
titleTemplate: false
description: WorkBuddy 资料页面。
breadcrumbTitle: 资料
---

# 资料

资料整理中。
```

Update the inventory navigation table and sidebar description so they name `/resources/` and `/wb-x/reading-guide/` and no longer claim the guide lives outside the small-book sidebar.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run:

```bash
npm test -- tests/navigation.test.ts tests/content-links.test.ts tests/home-hero-icons.test.ts
npm run check:links
```

Expected: all selected tests pass and the content checker reports no broken internal links.

- [ ] **Step 5: Commit the navigation/content unit**

```bash
git add tests/navigation.test.ts tests/content-links.test.ts tests/home-hero-icons.test.ts docs/.vitepress/navigation.ts docs/.vitepress/sidebar.ts docs/.vitepress/theme/HomePage.vue docs/resources/index.md docs/wb-x/reading-guide/index.md docs/reading-guide.md CONTENT_INVENTORY.md
git commit -m "feat: integrate reading guide into book navigation"
```

---

### Task 2: Base-Aware Legacy Reading-Guide Redirects

**Files:**
- Modify: `tests/legacy-routes.test.ts`
- Modify: `docs/.vitepress/legacy-routes.ts`
- Modify: `scripts/generate-legacy-redirects.mjs`
- Modify: `docs/public/_redirects`

**Interfaces:**
- Consumes: canonical route `/wb-x/reading-guide/`, Vite server `config.base`, and build environment `SITE_BASE`.
- Produces: `legacyRouteTarget(path: string, base?: string): string | null`, `generateReadingGuideRedirects(distRoot: string, base?: string): string[]`, and four static redirect declarations.

- [ ] **Step 1: Write failing redirect tests**

Extend the middleware tests with root and base-prefixed aliases:

```ts
it('redirects every former reading-guide alias and preserves URL suffixes', () => {
  expect(legacyRouteTarget('/reading-guide')).toBe('/wb-x/reading-guide/')
  expect(legacyRouteTarget('/reading-guide/')).toBe('/wb-x/reading-guide/')
  expect(legacyRouteTarget('/guide/reading-guide')).toBe('/wb-x/reading-guide/')
  expect(legacyRouteTarget('/guide/reading-guide/?from=nav#team')).toBe(
    '/wb-x/reading-guide/?from=nav#team',
  )
})

it('redirects reading-guide aliases beneath a normalized site base', () => {
  expect(legacyRouteTarget('/WBWB-X/reading-guide', 'WBWB-X')).toBe(
    '/WBWB-X/wb-x/reading-guide/',
  )
  expect(
    legacyRouteTarget('/WBWB-X/guide/reading-guide/', '//WBWB-X//'),
  ).toBe('/WBWB-X/wb-x/reading-guide/')
  expect(legacyRouteTarget('/reading-guide', '/WBWB-X/')).toBeNull()
})
```

Import `generateReadingGuideRedirects` and verify all four generated HTML entry points:

```ts
const written = generateReadingGuideRedirects(dist, '/WBWB-X/')
const expected = [
  join(dist, 'reading-guide.html'),
  join(dist, 'reading-guide/index.html'),
  join(dist, 'guide/reading-guide.html'),
  join(dist, 'guide/reading-guide/index.html'),
]
expect(written).toEqual(expected)
for (const path of written) {
  const html = readFileSync(path, 'utf8')
  expect(html).toContain('/WBWB-X/wb-x/reading-guide/')
  expect(html).toContain('location.search + location.hash')
  expect(html).toContain('rel="canonical"')
}
```

- [ ] **Step 2: Run the redirect tests and verify RED**

Run:

```bash
npm test -- tests/legacy-routes.test.ts
```

Expected: FAIL because baseline middleware only handles `/bluebook/` and the build script does not export or generate reading-guide redirects.

- [ ] **Step 3: Implement normalized middleware targets**

Add these helpers to `docs/.vitepress/legacy-routes.ts` and route before the bluebook branch:

```ts
const readingGuideRoute = /^\/(?:guide\/)?reading-guide\/?([?#].*)?$/

function normalizeBase(base: string) {
  const normalized = base.replace(/^\/+|\/+$/g, '')
  return normalized ? `/${normalized}/` : '/'
}

function pathWithinBase(path: string, base: string) {
  if (base === '/') return path
  const basePrefix = base.slice(0, -1)
  return path.startsWith(`${basePrefix}/`) ? path.slice(basePrefix.length) : null
}

function withBase(base: string, path: string) {
  return base === '/' ? path : `${base.slice(0, -1)}${path}`
}
```

Update the exported function and plugin call:

```ts
export function legacyRouteTarget(path: string, base = '/') {
  const normalizedBase = normalizeBase(base)
  const basePath = pathWithinBase(path, normalizedBase)
  if (!basePath) return null

  const readingGuideMatch = basePath.match(readingGuideRoute)
  if (readingGuideMatch) {
    return withBase(
      normalizedBase,
      `/wb-x/reading-guide/${readingGuideMatch[1] ?? ''}`,
    )
  }

  if (!basePath.startsWith('/bluebook/')) return null
  return withBase(
    normalizedBase,
    `/wb-x/${basePath.slice('/bluebook/'.length)}`,
  )
}
```

Call `legacyRouteTarget(request.url ?? '', server.config.base)` from the middleware.

- [ ] **Step 4: Implement static build redirects**

In `scripts/generate-legacy-redirects.mjs`, add `normalizeBase`, `withBase`, a `READING_GUIDE_TARGET` constant, the optional `base` parameter on existing target/generator functions, and:

```js
export function generateReadingGuideRedirects(distRoot, base = '/') {
  const resolvedDistRoot = resolve(distRoot)
  const routeFiles = [
    'reading-guide.html',
    'reading-guide/index.html',
    'guide/reading-guide.html',
    'guide/reading-guide/index.html',
  ]
  const mappings = routeFiles.map((relativePath) => ({
    redirectPath: resolve(resolvedDistRoot, relativePath),
    target: withBase(base, READING_GUIDE_TARGET),
  }))

  return writeLegacyMappings(mappings, resolvedDistRoot, mappings.length)
}
```

At the executable entry point, resolve `SITE_BASE`, call both generators, and add these declarations to `docs/public/_redirects`:

```text
/reading-guide /wb-x/reading-guide/ 301
/reading-guide/ /wb-x/reading-guide/ 301
/guide/reading-guide /wb-x/reading-guide/ 301
/guide/reading-guide/ /wb-x/reading-guide/ 301
```

- [ ] **Step 5: Run redirect tests and base-aware builds**

Run:

```bash
npm test -- tests/legacy-routes.test.ts
npm run build
test -f docs/.vitepress/dist/reading-guide.html
test -f docs/.vitepress/dist/reading-guide/index.html
test -f docs/.vitepress/dist/guide/reading-guide.html
test -f docs/.vitepress/dist/guide/reading-guide/index.html
SITE_BASE=/WBWB-X/ npm run build
rg -n '/WBWB-X/wb-x/reading-guide/' docs/.vitepress/dist/reading-guide.html docs/.vitepress/dist/guide/reading-guide/index.html
```

Expected: the focused suite passes, all four redirect documents exist, and the base build contains `/WBWB-X/wb-x/reading-guide/` in both representative documents.

- [ ] **Step 6: Commit the compatibility unit**

```bash
git add tests/legacy-routes.test.ts docs/.vitepress/legacy-routes.ts scripts/generate-legacy-redirects.mjs docs/public/_redirects
git commit -m "fix: preserve legacy reading guide routes"
```

---

### Task 3: Proportional 170px Contact Cards

**Files:**
- Modify: `tests/contact-card.test.ts`
- Modify: `docs/.vitepress/theme/custom.css`

**Interfaces:**
- Consumes: existing `.wb-contact-grid`, `.wb-contact-card`, and `.wb-contact-card img` markup in `docs/community/contributing.md`.
- Produces: fixed `170px` card/image width with automatic image height; no markup or image-asset changes.

- [ ] **Step 1: Write the failing computed-style test**

Replace the 140px expectation with assertions on both card and image:

```ts
it('renders 170px contact cards with automatic proportional image height', () => {
  const style = document.createElement('style')
  style.textContent = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
  document.head.append(style)

  const card = document.createElement('a')
  card.className = 'wb-contact-card'
  const image = document.createElement('img')
  card.append(image)
  document.body.append(card)

  expect(getComputedStyle(card).width).toBe('170px')
  expect(getComputedStyle(image).width).toBe('170px')
  expect(getComputedStyle(image).height).toBe('auto')
})
```

- [ ] **Step 2: Run the contact-card test and verify RED**

Run:

```bash
npm test -- tests/contact-card.test.ts
```

Expected: FAIL with actual width `140px` for the card and image.

- [ ] **Step 3: Implement the minimal CSS change**

Change only the two width declarations:

```css
.wb-contact-card {
  display: grid;
  gap: 8px;
  width: 170px;
  color: var(--wbx-ink);
  text-align: center;
  text-decoration: none;
}

.wb-contact-card img {
  display: block;
  width: 170px;
  height: auto;
  margin: 0;
}
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run:

```bash
npm test -- tests/contact-card.test.ts
```

Expected: PASS with both widths at `170px` and image height `auto`.

- [ ] **Step 5: Commit the card-size unit**

```bash
git add tests/contact-card.test.ts docs/.vitepress/theme/custom.css
git commit -m "style: enlarge community contact cards"
```

---

### Task 4: Regression, Build, and Browser Acceptance

**Files:**
- Modify: `design-qa.md`
- Create: `audit/2026-08-17-online-baseline-sync/wb-x-desktop.png`
- Create: `audit/2026-08-17-online-baseline-sync/contact-cards-desktop.png`
- Create: `audit/2026-08-17-online-baseline-sync/contact-cards-mobile.png`

**Interfaces:**
- Consumes: the three completed implementation units and existing baseline regression tests in `tests/wb-x-index.test.ts`.
- Produces: a locally previewable production build and durable visual QA evidence; no deployment.

- [ ] **Step 1: Verify the online-baseline invariants**

Run:

```bash
npm test -- tests/wb-x-index.test.ts tests/navigation.test.ts tests/content-links.test.ts tests/home-hero-icons.test.ts tests/legacy-routes.test.ts tests/contact-card.test.ts
```

Expected: PASS, including `v5.3.12`, one outer appendix divider, compact subsequent appendix spacing, new navigation, redirects, and 170px cards.

- [ ] **Step 2: Run the complete automated verification**

Run:

```bash
npm test
npm run check:links
npm run check:assets
npm run build
```

Expected: every suite and checker passes; VitePress production build and publish-boundary verification complete without errors.

- [ ] **Step 3: Start the production preview**

Run:

```bash
npm run preview -- --host 127.0.0.1 --port 5174
```

Expected: preview listens on port 5174 and serves the just-built integration branch.

- [ ] **Step 4: Inspect the desktop states in the current in-app browser**

Open `/wb-x/`, `/wb-x/reading-guide/`, `/resources/`, and `/community/contributing` at a 1440px desktop viewport. Verify exactly:

- top navigation reads `资料` and the link opens the placeholder page;
- sidebar starts with `小白书总览`, then `阅读指南`;
- small-book index still shows `v5.3.12`, one divider before Appendix A, and compact B/C rows;
- both contact cards remain on one row, are 170px wide, labels are centered, and image links still open their original assets;
- no page has horizontal overflow.

Capture `wb-x-desktop.png` and `contact-cards-desktop.png` from these accepted states.

- [ ] **Step 5: Inspect the 390×844 mobile state in the current in-app browser**

Open `/community/contributing` at a true CSS viewport of `390×844`. Confirm `window.innerWidth === 390`, both 170px cards are visible or wrap naturally, image height is proportional, the 24px gap remains, and `document.documentElement.scrollWidth === document.documentElement.clientWidth`. Capture `contact-cards-mobile.png` with both cards visible.

- [ ] **Step 6: Record the QA evidence**

Append a dated `线上基线同步` section to `design-qa.md` containing:

- baseline commit `9d2c0edafff189e30dd3407204f2e7dc6544f5f1`;
- preview paths checked;
- actual desktop and mobile viewport measurements;
- appendix grouping, navigation/sidebar, redirects, card widths/heights, wrapping, link preservation, and overflow results;
- the three exact audit image paths created in this task.

- [ ] **Step 7: Inspect scope and commit verification evidence**

Run:

```bash
git diff --check
git diff --name-status origin/main...HEAD
git status --short
```

Expected: only the design/plan, approved navigation/content, redirect, contact-card, tests, QA report, and audit evidence appear; no service-page or community-popover files are changed.

Then commit:

```bash
git add design-qa.md audit/2026-08-17-online-baseline-sync
git commit -m "test: verify online baseline synchronization"
```
