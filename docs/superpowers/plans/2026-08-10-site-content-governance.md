# Site Content Governance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep internal project documents out of the public site, align published chapter guidance with the real book structure, restore static-host legacy routes, and remove confirmed misleading or unused assets.

**Architecture:** VitePress owns the publishable Markdown boundary through `srcExclude`. A focused post-build script mirrors built `/wb-x/` HTML paths into lightweight `/bluebook/` redirect documents inside `dist`, while content and asset regressions are enforced by Vitest before the final production build.

**Tech Stack:** VitePress 1.6.4, Vue 3, Node.js ESM, Vitest 2.1, GitHub Pages.

## Global Constraints

- Keep all 53 files under `docs/superpowers/**` in Git.
- Do not publish or index any route under `/superpowers/`.
- Do not modify or stage `.gitignore`, `package-lock.json`, `.pnpm-store/`, `.vercel-tmp/`, or audit screenshots.
- Do not create a replacement model-selection screenshot without a trustworthy source.
- Preserve intentional image reuse between the case collection and book chapters.
- Generated legacy redirects may write only beneath `docs/.vitepress/dist/bluebook/`.

---

### Task 1: Enforce The Public Markdown Boundary

**Files:**
- Create: `tests/publish-boundary.test.ts`
- Modify: `docs/.vitepress/config.mts:20-31`

**Interfaces:**
- Consumes: VitePress `srcExclude: string[]`.
- Produces: a configuration rule excluding `superpowers/**` from page generation and local search.

- [ ] **Step 1: Write the failing publish-boundary test**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = readFileSync('docs/.vitepress/config.mts', 'utf8')

describe('production content boundary', () => {
  it('excludes internal superpowers documents from VitePress pages and search', () => {
    expect(config).toMatch(/srcExclude:\s*\[\s*['"]superpowers\/\*\*['"]\s*\]/)
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node node_modules/vitest/vitest.mjs run tests/publish-boundary.test.ts --exclude '**/.worktrees/**' --exclude '**/.pnpm-store/**'
```

Expected: FAIL because `config.mts` has no `srcExclude` entry.

- [ ] **Step 3: Add the minimal VitePress exclusion**

Add at the top level of `defineConfig`:

```ts
srcExclude: ['superpowers/**'],
```

- [ ] **Step 4: Run the focused test and verify GREEN**

Run the Step 2 command again.

Expected: 1 test file passes.

- [ ] **Step 5: Commit the boundary change**

```bash
git add tests/publish-boundary.test.ts docs/.vitepress/config.mts
git commit -m "排除内部文档公开构建"
```

---

### Task 2: Align The Second-Part Guide And Remove Misleading Assets

**Files:**
- Create: `tests/site-content-governance.test.ts`
- Modify: `docs/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/index.md:3-18`
- Modify: `docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/使用心得：新手工具设置（必看）/index.md:50-63`
- Delete: `docs/public/article-assets/source-calibration/community/003.jpg`
- Delete: `docs/public/article-assets/source-calibration/community/004.jpg`
- Delete: `docs/public/brand/sparkx-logo.svg`
- Delete: `docs/public/images/new-user-settings/10-custom-instruction-template.png`

**Interfaces:**
- Consumes: the chapter labels exported by `docs/.vitepress/sidebar.ts`.
- Produces: one consistent chapter 11-to-21 guide and a content tree without the confirmed unused files.

- [ ] **Step 1: Write the failing content-governance tests**

```ts
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const partTwo = readFileSync(
  'docs/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/index.md',
  'utf8',
)
const settingsGuide = readFileSync(
  'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/使用心得：新手工具设置（必看）/index.md',
  'utf8',
)

describe('published content governance', () => {
  it('uses the current chapter 11-to-21 sequence in the second-part map', () => {
    const mappedChapters = [...partTwo.matchAll(/^\| L[^|]*\|\s*(\d+)\./gm)].map(
      (match) => Number(match[1]),
    )
    expect(mappedChapters).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21])
    expect(partTwo).toContain('11. 办公三件套：Word、Excel、PPT')
    expect(partTwo).toContain('21. WorkBuddy也能做GEO专家')
    expect(partTwo).not.toContain('第一份办公产物')
    expect(partTwo).not.toContain('23. 日常办公协同工作台')
  })

  it('does not present the task-mode image as model selection', () => {
    expect(settingsGuide).not.toContain('/images/new-user-settings/03-model-selection.png')
    expect(settingsGuide).toContain('/images/new-user-settings/02-task-mode.png')
  })

  it('removes only the confirmed unreferenced assets', () => {
    const unused = [
      'docs/public/article-assets/source-calibration/community/003.jpg',
      'docs/public/article-assets/source-calibration/community/004.jpg',
      'docs/public/brand/sparkx-logo.svg',
      'docs/public/images/new-user-settings/10-custom-instruction-template.png',
    ]
    for (const path of unused) expect(existsSync(path), path).toBe(false)
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node node_modules/vitest/vitest.mjs run tests/site-content-governance.test.ts --exclude '**/.worktrees/**' --exclude '**/.pnpm-store/**'
```

Expected: all three tests fail for the stale map, duplicate screenshot reference, and existing unused files.

- [ ] **Step 3: Replace the stale difficulty map**

Use exactly these rows before the existing chapter link list:

```md
| 等级 | 案例 | 核心能力 |
|-|-|-|
| L1 | 11. 办公三件套：Word、Excel、PPT | 文档、表格、演示文稿协同 |
| L1 | 12. 从整理桌面文件这些小事做起 | 文件识别、分类与批量整理 |
| L2 | 13. 远程控制你的电脑，不用发愁不在电脑前 | 小程序、IM 与远程执行 |
| L2 | 14. 生活助手的价值，是减少琐碎 | 日常决策、提醒与生活协助 |
| L2 | 15. 资讯整合：把信息流变成每日通知 | 信息采集、筛选与自动通知 |
| L2 | 16. 收藏不是知识管理，能再次用起来才是 | 知识归档、检索与复用 |
| L3 | 17. 会议结束不是终点，工作才刚刚开始 | 纪要、待办与会后协同 |
| L3 | 18. 把投资分析变成你的日常 | 数据分析、证据与风险边界 |
| L4 | 19. 一句话召唤 AI 视频团队 | 专家团、多 Agent 与视频生产 |
| L3 | 20. 自媒体不只是靠努力，而是一条增长闭环 | 选题、生产、发布与复盘 |
| L3 | 21. WorkBuddy也能做GEO专家 | 品牌诊断、评分与专业报告 |
```

- [ ] **Step 4: Remove the misleading model-selection image reference**

Delete only this Markdown line and its adjacent empty line:

```md
![WorkBuddy 模型选择菜单](/images/new-user-settings/03-model-selection.png)
```

- [ ] **Step 5: Delete the four confirmed unreferenced assets**

Delete exactly the four files listed in this task's Files section. Do not modify the image manifest because none of these four files is an active manifest record.

- [ ] **Step 6: Run the focused test and verify GREEN**

Run the Step 2 command again.

Expected: 3 tests pass.

- [ ] **Step 7: Commit the content cleanup**

```bash
git add tests/site-content-governance.test.ts docs/wb-x docs/public
git commit -m "校正篇章导读并清理闲置资源"
```

---

### Task 3: Generate GitHub Pages-Compatible Legacy Redirects

**Files:**
- Create: `scripts/generate-legacy-redirects.mjs`
- Modify: `tests/legacy-routes.test.ts`
- Modify: `package.json:9`

**Interfaces:**
- Produces: `legacyTargetForBuiltFile(relativePath: string): string | null`.
- Produces: `generateLegacyRedirects(distRoot: string): string[]`, returning written redirect paths.
- Consumes: built HTML files beneath `<distRoot>/wb-x/`.

- [ ] **Step 1: Add failing redirect-generator tests**

Extend `tests/legacy-routes.test.ts` with temporary-directory integration coverage:

```ts
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import {
  generateLegacyRedirects,
  legacyTargetForBuiltFile,
} from '../scripts/generate-legacy-redirects.mjs'

it('maps only built wb-x HTML files to clean public targets', () => {
  expect(legacyTargetForBuiltFile('wb-x/index.html')).toBe('/wb-x/')
  expect(legacyTargetForBuiltFile('wb-x/第一篇/第 1 章/index.html')).toBe(
    '/wb-x/第一篇/第 1 章/',
  )
  expect(legacyTargetForBuiltFile('cases/index.html')).toBeNull()
})

it('writes static bluebook redirects without touching other output', () => {
  const dist = mkdtempSync(join(tmpdir(), 'wbx-legacy-'))
  const built = join(dist, 'wb-x/第一篇/第 1 章/index.html')
  mkdirSync(dirname(built), { recursive: true })
  writeFileSync(built, '<!doctype html><title>chapter</title>')

  const written = generateLegacyRedirects(dist)
  const redirect = join(dist, 'bluebook/第一篇/第 1 章/index.html')

  expect(written).toContain(redirect)
  expect(readFileSync(redirect, 'utf8')).toContain('/wb-x/第一篇/第 1 章/')
  expect(readFileSync(redirect, 'utf8')).toContain('location.search + location.hash')
  expect(readFileSync(built, 'utf8')).toContain('<title>chapter</title>')
})
```

- [ ] **Step 2: Run redirect tests and verify RED**

Run:

```bash
node node_modules/vitest/vitest.mjs run tests/legacy-routes.test.ts --exclude '**/.worktrees/**' --exclude '**/.pnpm-store/**'
```

Expected: FAIL because `generate-legacy-redirects.mjs` does not exist.

- [ ] **Step 3: Implement the redirect generator**

Implement a Node ESM module that:

1. Recursively enumerates `.html` files under `<distRoot>/wb-x`.
2. Maps `wb-x/index.html` to `/wb-x/` and nested `index.html` files to their clean directory routes.
3. Writes matching files below `<distRoot>/bluebook`.
4. HTML-escapes visible and attribute targets.
5. Uses `location.replace(TARGET + location.search + location.hash)`.
6. Exports both functions and runs `generateLegacyRedirects(process.argv[2] ?? 'docs/.vitepress/dist')` when invoked directly.

The generated document shape is:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="robots" content="noindex">
    <meta http-equiv="refresh" content="0; url=/wb-x/">
    <link rel="canonical" href="https://wbx.sparkx.zone/wb-x/">
    <title>正在跳转 | WorkBuddy WB-X</title>
    <script>location.replace("/wb-x/" + location.search + location.hash)</script>
  </head>
  <body><a href="/wb-x/">前往新版 WorkBuddy 小白书</a></body>
</html>
```

The concrete target replaces `/wb-x/` in each file.

- [ ] **Step 4: Add the generator to the production build command**

Change only the `build` script:

```json
"build": "vitepress build docs && node scripts/generate-legacy-redirects.mjs"
```

- [ ] **Step 5: Run redirect tests and verify GREEN**

Run the Step 2 command again.

Expected: existing middleware tests and new generator tests pass.

- [ ] **Step 6: Commit the redirect generator**

```bash
git add scripts/generate-legacy-redirects.mjs tests/legacy-routes.test.ts package.json
git commit -m "为旧版小白书生成静态跳转"
```

---

### Task 4: Verify Production Output And User-Facing Routes

**Files:**
- Modify only if verification reveals a regression in files changed by Tasks 1-3.

**Interfaces:**
- Consumes: the production `docs/.vitepress/dist` output.
- Produces: fresh evidence that internal routes are absent and legacy redirects exist.

- [ ] **Step 1: Run all root tests with local caches excluded**

```bash
node node_modules/vitest/vitest.mjs run --exclude '**/.worktrees/**' --exclude '**/.pnpm-store/**'
```

Expected: all root test files pass.

- [ ] **Step 2: Run content and asset checks**

```bash
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
```

Expected: zero broken links and no disallowed source hotlinks.

- [ ] **Step 3: Build the production site**

```bash
node node_modules/vitepress/bin/vitepress.js build docs
node scripts/generate-legacy-redirects.mjs docs/.vitepress/dist
```

Expected: VitePress build succeeds and the redirect script reports generated `/bluebook/` files.

- [ ] **Step 4: Assert publish-boundary and redirect output**

```bash
test ! -d docs/.vitepress/dist/superpowers
! rg -q 'Primary CTA Motion Implementation Plan' docs/.vitepress/dist
test -f docs/.vitepress/dist/bluebook/index.html
test -f 'docs/.vitepress/dist/bluebook/第二篇 案例篇：从一项任务到一支 AI 团队/index.html'
rg -n '/wb-x/' docs/.vitepress/dist/bluebook/index.html
```

Expected: all shell assertions exit 0.

- [ ] **Step 5: Preview desktop and mobile flows**

Start the existing VitePress server and inspect:

- `/`
- `/wb-x/`
- `/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/`
- `/bluebook/`
- `/superpowers/plans/2026-08-02-primary-cta-motion`

Expected: formal routes render without overlap at desktop and 390px widths; `/bluebook/` reaches `/wb-x/`; `/superpowers/...` is 404.

- [ ] **Step 6: Inspect final scope**

```bash
git status --short
git diff --stat HEAD~3..HEAD
```

Expected: implementation commits contain only planned source, test, script, content, and four asset deletions. Pre-existing unrelated changes remain unstaged.

