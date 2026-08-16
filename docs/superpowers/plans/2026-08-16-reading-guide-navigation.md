# 阅读指南导航调整 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将阅读指南归入「开始阅读」侧边栏，把顶部「指南」改为「资料」，提供资料占位页，并让旧指南地址安全跳转到新地址。

**Architecture:** 继续使用 VitePress 现有的静态导航、侧边栏和 Markdown 页面结构，不新增运行时组件。阅读指南迁入 `/wb-x/` 路由以自然获得阅读区布局；开发服务器、中立静态 HTML 和托管平台 `_redirects` 三处共同覆盖旧地址兼容。

**Tech Stack:** VitePress 1.6.4、Vue 3.5、TypeScript、Vitest 2.1、Node.js 20+

## Global Constraints

- 顶部导航顺序保持为：首页、开始阅读、案例集、定制服务、资料、交流群。
- 「资料」必须链接到 `/resources/`，首版正文必须精确显示「资料整理中。」。
- 「阅读指南」必须位于「小白书总览」正下方，链接到 `/wb-x/reading-guide/`。
- 阅读指南正文、各篇章顺序、章节地址和其他导航行为不得改变。
- `/reading-guide` 与 `/reading-guide/` 必须跳转到 `/wb-x/reading-guide/`，并保留查询参数与片段。
- 不增加第三方依赖，不新增页面专属 Vue 组件或视觉系统。
- `docs/.vitepress/theme/HomePage.vue` 已有用户未提交改动；实现和提交时只处理「查看阅读路线」链接的单独 hunk，不得暂存或覆盖其他 hunk。

---

## File Structure

- Create `docs/wb-x/reading-guide/index.md`: 承载现有阅读指南完整正文，并通过路径归入阅读区。
- Create `docs/resources/index.md`: 承载「资料整理中。」占位页。
- Delete `docs/reading-guide.md`: 移除旧地址的重复正文源。
- Modify `docs/.vitepress/navigation.ts`: 将顶部「指南」替换为「资料」。
- Modify `docs/.vitepress/sidebar.ts`: 在小白书总览后插入阅读指南。
- Modify `docs/.vitepress/theme/HomePage.vue`: 将首页「查看阅读路线」改为新地址。
- Modify `docs/.vitepress/legacy-routes.ts`: 为开发服务器识别旧阅读指南地址。
- Modify `scripts/generate-legacy-redirects.mjs`: 为静态构建生成旧阅读指南 HTML 跳转页。
- Modify `docs/public/_redirects`: 为支持该格式的托管平台声明 301 跳转。
- Modify `tests/navigation.test.ts`: 锁定顶部导航、侧边栏顺序和首页入口。
- Modify `tests/content-links.test.ts`: 锁定新 Markdown 路径、资料占位文案和原阅读指南内容。
- Modify `tests/legacy-routes.test.ts`: 锁定开发与静态构建的旧地址兼容行为。

---

### Task 1: 迁移阅读指南并重组导航

**Files:**
- Create: `docs/wb-x/reading-guide/index.md`
- Create: `docs/resources/index.md`
- Delete: `docs/reading-guide.md`
- Modify: `docs/.vitepress/navigation.ts`
- Modify: `docs/.vitepress/sidebar.ts`
- Modify: `docs/.vitepress/theme/HomePage.vue`
- Test: `tests/navigation.test.ts`
- Test: `tests/content-links.test.ts`

**Interfaces:**
- Consumes: `nav` from `docs/.vitepress/navigation.ts`, `sidebar` from `docs/.vitepress/sidebar.ts`, and VitePress file-to-route mapping.
- Produces: the public routes `/resources/` and `/wb-x/reading-guide/`, plus navigation links that later redirect tests use as the canonical target.

- [ ] **Step 1: Write failing navigation tests**

Update `tests/navigation.test.ts` so the information-architecture test asserts the exact new labels and link:

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
```

Replace the overview-only sidebar assertion with the required first two entries:

```ts
expect(sidebar.slice(0, 2)).toEqual([
  { text: '小白书总览', link: '/wb-x/' },
  { text: '阅读指南', link: '/wb-x/reading-guide/' },
])
```

Read `docs/.vitepress/theme/HomePage.vue` at module scope and add:

```ts
const homePage = readFileSync('docs/.vitepress/theme/HomePage.vue', 'utf8')

it('links the homepage reading-route action to the guide inside /wb-x/', () => {
  expect(homePage).toContain("withBase('/wb-x/reading-guide/')")
  expect(homePage).not.toContain("withBase('/reading-guide')")
})
```

- [ ] **Step 2: Write failing content-location tests**

In `tests/content-links.test.ts`, replace the old required path with the two new pages:

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

Update both guide reads to:

```ts
const readingGuide = readFileSync(
  'docs/wb-x/reading-guide/index.md',
  'utf8',
)
```

Add the exact placeholder assertion:

```ts
it('publishes the approved resources placeholder without extra promises', () => {
  const resources = readFileSync('docs/resources/index.md', 'utf8')

  expect(resources).toContain('# 资料')
  expect(resources).toContain('\n资料整理中。\n')
  expect(resources).not.toMatch(/下载|模板|发布时间/)
})
```

- [ ] **Step 3: Run the focused tests and confirm they fail**

Run:

```bash
npx vitest run tests/navigation.test.ts tests/content-links.test.ts
```

Expected: FAIL because the navigation still contains「指南」, the sidebar lacks「阅读指南」, and both new Markdown paths are absent.

- [ ] **Step 4: Implement the navigation and page changes**

Change `docs/.vitepress/navigation.ts` to:

```ts
export const nav = [
  { text: '首页', link: '/' },
  { text: '开始阅读', link: '/wb-x/' },
  { text: '案例集', link: '/cases/' },
  { text: '定制服务', link: '/help/' },
  { text: '资料', link: '/resources/' },
  { text: '交流群', link: '#community', custom: true },
] as const
```

Insert the second entry immediately after the overview in `docs/.vitepress/sidebar.ts`:

```ts
{ text: '小白书总览', link: '/wb-x/' },
{ text: '阅读指南', link: '/wb-x/reading-guide/' },
```

Move the complete contents of `docs/reading-guide.md` to `docs/wb-x/reading-guide/index.md` without changing frontmatter or body copy. Delete the old source file after the new file is present.

Create `docs/resources/index.md` with exactly:

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

In `docs/.vitepress/theme/HomePage.vue`, change only the existing route string:

```vue
<a class="wbx-button wbx-button--outline" :href="withBase('/wb-x/reading-guide/')">查看阅读路线</a>
```

- [ ] **Step 5: Run focused tests and content-link validation**

Run:

```bash
npx vitest run tests/navigation.test.ts tests/content-links.test.ts
npm run check:links
```

Expected: both Vitest files PASS and the link checker exits 0 with no broken internal link.

- [ ] **Step 6: Commit only Task 1 changes**

Stage the clean files normally:

```bash
git add docs/.vitepress/navigation.ts docs/.vitepress/sidebar.ts docs/wb-x/reading-guide/index.md docs/resources/index.md docs/reading-guide.md tests/navigation.test.ts tests/content-links.test.ts
```

For `docs/.vitepress/theme/HomePage.vue`, stage only the one-line `/reading-guide` → `/wb-x/reading-guide/` hunk against the index. Verify before committing:

```bash
git diff --cached --name-only
git diff --cached -- docs/.vitepress/theme/HomePage.vue
```

The cached HomePage diff must contain only the reading-route link. Then commit:

```bash
git commit -m "feat: move reading guide into book navigation"
```

Expected: the commit contains only Task 1 files and the user's other HomePage changes remain unstaged in the working tree.

---

### Task 2: Preserve old reading-guide routes and verify the result

**Files:**
- Modify: `docs/.vitepress/legacy-routes.ts`
- Modify: `scripts/generate-legacy-redirects.mjs`
- Modify: `docs/public/_redirects`
- Test: `tests/legacy-routes.test.ts`

**Interfaces:**
- Consumes: canonical route `/wb-x/reading-guide/` from Task 1 and the existing `legacyRouteTarget`, `redirectDocument`, and `writeLegacyMappings` behavior.
- Produces: `generateReadingGuideRedirects(distRoot: string): string[]`, development-server redirects, two static HTML redirects, and two host-level 301 rules.

- [ ] **Step 1: Write failing development-route tests**

Add to `tests/legacy-routes.test.ts`:

```ts
it('redirects both old reading-guide forms and preserves URL suffixes', () => {
  expect(legacyRouteTarget('/reading-guide')).toBe('/wb-x/reading-guide/')
  expect(legacyRouteTarget('/reading-guide/')).toBe('/wb-x/reading-guide/')
  expect(legacyRouteTarget('/reading-guide?from=nav#team')).toBe(
    '/wb-x/reading-guide/?from=nav#team',
  )
})
```

Keep the existing unrelated-route test and add `/resources/` to prove that only the old guide route is intercepted.

- [ ] **Step 2: Write failing static redirect tests**

Import the new function:

```ts
import {
  generateLegacyRedirects,
  generateReadingGuideRedirects,
  legacyTargetForBuiltFile,
  writeLegacyMappings,
} from '../scripts/generate-legacy-redirects.mjs'
```

Add:

```ts
it('writes file and directory redirects for the former reading guide', () => {
  const dist = mkdtempSync(join(tmpdir(), 'reading-guide-legacy-'))
  const written = generateReadingGuideRedirects(dist)
  const fileRoute = join(dist, 'reading-guide.html')
  const directoryRoute = join(dist, 'reading-guide/index.html')

  expect(written).toEqual([fileRoute, directoryRoute])
  for (const path of written) {
    const html = readFileSync(path, 'utf8')
    expect(html).toContain('/wb-x/reading-guide/')
    expect(html).toContain('location.search + location.hash')
    expect(html).toContain('rel="canonical"')
  }
})

it('declares permanent host redirects for both former guide paths', () => {
  const redirects = readFileSync('docs/public/_redirects', 'utf8')

  expect(redirects).toContain('/reading-guide /wb-x/reading-guide/ 301')
  expect(redirects).toContain('/reading-guide/ /wb-x/reading-guide/ 301')
})
```

- [ ] **Step 3: Run redirect tests and confirm they fail**

Run:

```bash
npx vitest run tests/legacy-routes.test.ts
```

Expected: FAIL because `legacyRouteTarget` returns `null`, `generateReadingGuideRedirects` is not exported, and `_redirects` lacks the two mappings.

- [ ] **Step 4: Implement the development redirect**

Update `legacyRouteTarget` in `docs/.vitepress/legacy-routes.ts`:

```ts
const readingGuideRoute = /^\/reading-guide\/?([?#].*)?$/

export function legacyRouteTarget(path: string) {
  const readingGuideMatch = path.match(readingGuideRoute)
  if (readingGuideMatch) {
    return `/wb-x/reading-guide/${readingGuideMatch[1] ?? ''}`
  }

  if (!path.startsWith('/bluebook/')) return null
  return `/wb-x/${path.slice('/bluebook/'.length)}`
}
```

The existing Vite middleware continues to issue its local-development 302 response; query strings and fragments are already embedded in the returned target.

- [ ] **Step 5: Implement static and host redirects**

In `scripts/generate-legacy-redirects.mjs`, add:

```js
const READING_GUIDE_TARGET = '/wb-x/reading-guide/'

export function generateReadingGuideRedirects(distRoot) {
  const resolvedDistRoot = resolve(distRoot)
  const mappings = [
    {
      redirectPath: resolve(resolvedDistRoot, 'reading-guide.html'),
      target: READING_GUIDE_TARGET,
    },
    {
      redirectPath: resolve(resolvedDistRoot, 'reading-guide/index.html'),
      target: READING_GUIDE_TARGET,
    },
  ]

  return writeLegacyMappings(mappings, resolvedDistRoot, mappings.length)
}
```

Update the CLI block so both generators run against the same resolved output directory:

```js
if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const distRoot = process.argv[2] ?? 'docs/.vitepress/dist'
  generateLegacyRedirects(distRoot)
  generateReadingGuideRedirects(distRoot)
}
```

Append to `docs/public/_redirects`:

```text
/reading-guide /wb-x/reading-guide/ 301
/reading-guide/ /wb-x/reading-guide/ 301
```

- [ ] **Step 6: Run focused and full automated verification**

Run:

```bash
npx vitest run tests/legacy-routes.test.ts
npm test
npm run check:links
npm run check:assets
npm run build
```

Expected: all Vitest tests PASS; link and asset checks exit 0; VitePress production build completes; `docs/.vitepress/dist/reading-guide.html` and `docs/.vitepress/dist/reading-guide/index.html` both contain `/wb-x/reading-guide/`.

- [ ] **Step 7: Verify desktop and mobile behavior in the browser**

Reload the local app and check `/wb-x/reading-guide/` at the default desktop viewport:

- Top navigation shows「资料」and no top-level「指南」.
- Sidebar shows「小白书总览」then「阅读指南」, with「阅读指南」selected.
- Reading-guide title and existing body copy remain unchanged.
- Homepage「查看阅读路线」opens `/wb-x/reading-guide/`.
- `/resources/` shows「资料」and「资料整理中。」.
- Direct navigation to `/reading-guide` lands on `/wb-x/reading-guide/`.

Set a temporary `390 × 844` viewport and repeat the navigation, title, active-state, and horizontal-overflow checks. Reset the viewport afterward. Capture accepted before/after screenshots in `audit/2026-08-16-reading-guide/` and inspect each saved image before handoff.

- [ ] **Step 8: Commit Task 2 changes**

```bash
git add docs/.vitepress/legacy-routes.ts scripts/generate-legacy-redirects.mjs docs/public/_redirects tests/legacy-routes.test.ts
git diff --cached --check
git commit -m "fix: redirect legacy reading guide routes"
```

Expected: the commit includes only redirect implementation and tests; unrelated working-tree changes remain untouched.
