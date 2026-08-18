# Maintenance Documentation and CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the reorganized repository self-explanatory and enforce the same maintenance, test, asset, link, and build contract locally and in GitHub Actions.

**Architecture:** Root documentation routes maintainers into focused internal guides, while the repository hygiene checker asserts their existence and required source inputs. CI collapses separate partial checks into the same `pnpm check` command used locally, followed by browser acceptance of unchanged published behavior.

**Tech Stack:** Markdown, Node.js ESM, pnpm 11.9.0, GitHub Actions, VitePress 1.6.4, Vitest 2, in-app browser.

**Spec:** `docs/superpowers/specs/2026-08-18-repository-maintenance-and-organization-design.md`

**Execution order:** Plan 4 of 4. Run only after repository hygiene, homepage modularization, and image-manifest modularization are complete.

## Global Constraints

- Do not change public URLs, route ownership, redirects, visible copy, styles, static asset URLs, or deployment destination.
- Keep Node.js >=20 in `package.json`; keep CI on Node.js 24 and pnpm 11.9.0.
- `pnpm check` must remain the single complete local/CI acceptance command.
- Internal maintenance documentation must not appear in published output or local search.
- Update `CONTENT_INVENTORY.md` from current repository facts; do not retain the obsolete `wbwbx.sparkx.zone` domain or stale commit hash.
- Use the in-app browser for final visual verification; do not substitute another browser when the required browser is unavailable.

---

## File Structure

- Create `README.md`: project purpose, prerequisites, standard commands, repository map, maintenance links, and safety rules.
- Create `docs/maintenance/README.md`: internal maintenance index with VitePress publication disabled through config/frontmatter policy.
- Create `docs/maintenance/repository-layout.md`: directory ownership and source/generated boundaries.
- Create `docs/maintenance/assets-and-audits.md`: source asset, generated asset, public path, evidence, and retention rules.
- Create `docs/maintenance/future-optimizations.md`: explicitly deferred media, history, dead-code, performance, accessibility, and SEO work.
- Modify `CONTENT_INVENTORY.md`: current date/domain/baseline wording, modular paths, pnpm checks, and repository facts.
- Modify `docs/.vitepress/config.mts`: exclude `maintenance/**` beside `superpowers/**`.
- Modify `scripts/verify-publish-boundary.mjs`: verify both internal documentation roots and route directories.
- Modify `tests/publish-boundary.test.ts`: cover the maintenance directory and title boundary.
- Modify `scripts/check-repository-hygiene.mjs`: required maintenance files and source-input checks.
- Modify `tests/repository-hygiene.test.ts`: required-path unit and current-repository coverage.
- Create `tests/maintenance-contract.test.ts`: command, CI, domain, and internal-publication contracts.
- Modify `.github/workflows/deploy-pages.yml`: one `pnpm run check` verification step before upload.
- Modify `design-qa.md`: append final repository-maintenance browser acceptance evidence.

### Task 1: Add the Maintainer Entry Points and Current Inventory

**Files:**
- Create: `README.md`
- Create: `docs/maintenance/README.md`
- Create: `docs/maintenance/repository-layout.md`
- Create: `docs/maintenance/assets-and-audits.md`
- Create: `docs/maintenance/future-optimizations.md`
- Modify: `CONTENT_INVENTORY.md`
- Modify: `docs/.vitepress/config.mts`
- Modify: `scripts/verify-publish-boundary.mjs`
- Modify: `tests/publish-boundary.test.ts`
- Create: `tests/maintenance-contract.test.ts`

**Interfaces:**
- Produces: stable maintainer-facing file paths consumed by the repository checker in Task 2.
- Produces: a source contract that prevents the retired production domain and npm-owned commands from returning.

- [ ] **Step 1: Write failing documentation and inventory contracts**

Create `tests/maintenance-contract.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const requiredMaintenanceFiles = [
  'README.md',
  'docs/maintenance/README.md',
  'docs/maintenance/repository-layout.md',
  'docs/maintenance/assets-and-audits.md',
  'docs/maintenance/future-optimizations.md',
]

describe('maintenance documentation contract', () => {
  it('provides every maintainer entry point', () => {
    for (const path of requiredMaintenanceFiles) {
      expect(existsSync(path), path).toBe(true)
      if (path.startsWith('docs/maintenance/')) {
        expect(readFileSync(path, 'utf8')).toContain('内部维护')
      }
    }
  })

  it('uses the current production domain and pnpm-only commands', () => {
    const sources = [
      readFileSync('README.md', 'utf8'),
      readFileSync('CONTENT_INVENTORY.md', 'utf8'),
      ...requiredMaintenanceFiles.slice(1).map((path) =>
        readFileSync(path, 'utf8'),
      ),
    ].join('\n')
    expect(sources).toContain('https://wbx.sparkx.zone/')
    expect(sources).not.toContain('wbwbx.sparkx.zone')
    expect(sources).not.toMatch(/\bnpm (?:run|test|install)\b/)
  })

  it('documents non-destructive local and published asset boundaries', () => {
    const guide = readFileSync(
      'docs/maintenance/assets-and-audits.md',
      'utf8',
    )
    expect(guide).toContain('article-image-replacement-manifest.csv')
    expect(guide).toContain('docs/public/article-assets/')
    expect(guide).toContain('audit/YYYY-MM-DD-topic/')
    expect(guide).toContain('不改公开 URL')
    expect(guide).toContain('不直接删除')
  })

  it('excludes internal maintenance documents from VitePress sources', () => {
    const config = readFileSync('docs/.vitepress/config.mts', 'utf8')
    expect(config).toContain(
      "srcExclude: ['superpowers/**', 'maintenance/**']",
    )
  })
})
```

- [ ] **Step 2: Run the contract and verify RED**

```bash
pnpm exec vitest run tests/maintenance-contract.test.ts
```

Expected: FAIL because the root README and maintenance guides do not exist.

- [ ] **Step 3: Create the root README with exact operational sections**

Create `README.md` with this complete content:

````markdown
# WorkBuddy WB-X

WorkBuddy WB-X 是面向真实任务的 WorkBuddy 中文社区实战读本。

- 线上站点：<https://wbx.sparkx.zone/>
- 内容与更新手册：[CONTENT_INVENTORY.md](./CONTENT_INVENTORY.md)
- 维护指南：[docs/maintenance/README.md](./docs/maintenance/README.md)

## 环境

- Node.js 20 或更高版本；CI 使用 Node.js 24。
- pnpm 11.9.0。

## 常用命令

```text
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm run check
pnpm run build
pnpm preview
```

## 仓库结构

- `docs/`：VitePress 内容、主题和公开静态资源。
- `scripts/`：构建、链接、资源和仓库检查脚本。
- `tests/`：单元、源契约和回归测试。
- `audit/`：按日期及主题归档的视觉和维护证据。
- `docs/superpowers/`：内部设计、计划、报告和证据。
- `docs/maintenance/`：内部仓库与内容维护指南。

详细职责见 [仓库目录与职责](./docs/maintenance/repository-layout.md)。

## 维护原则

- 公开 URL 和公开资源路径是稳定契约，调整前必须有明确设计与回归验证。
- pnpm 与 `pnpm-lock.yaml` 是唯一依赖来源。
- 缓存、依赖目录、本地部署状态和工具输出不进入 Git。
- 有复核价值的证据先归档，临时文件不直接删除。
````

- [ ] **Step 4: Create the four focused maintenance guides**

Create `docs/maintenance/README.md` with:

```markdown
# 网站维护指南

> 本目录是内部维护资料，不生成公开页面，也不进入站内搜索。

## 开始维护

1. 阅读根目录 `README.md` 和 `CONTENT_INVENTORY.md`。
2. 运行 `git status --short --branch`，确认现有改动和未跟踪资料。
3. 使用 pnpm 11.9.0 安装依赖，修改前先运行相关聚焦测试。

## 标准验证

- 聚焦验证：`pnpm exec vitest run <test-file>`。
- 完整验证：`pnpm run check`。
- 本地预览：`pnpm dev`；生产预览：先构建，再运行 `pnpm preview`。

## 指南索引

- [仓库目录与职责](./repository-layout.md)
- [素材与审计资料规则](./assets-and-audits.md)
- [后续优化清单](./future-optimizations.md)

## 内部文档边界

`docs/.vitepress/config.mts` 的 `srcExclude` 同时排除 `superpowers/**` 和 `maintenance/**`；`scripts/verify-publish-boundary.mjs` 在构建后复核目录与标题均未进入产物。
```

Create `docs/maintenance/repository-layout.md` with:

```markdown
# 仓库目录与职责

> 本文件是内部维护资料，不生成公开页面。

## 产品与发布文件

- `docs/`：VitePress 内容、主题和公开资源。
- `scripts/`：构建、链接、资源、重定向和仓库检查。
- `tests/`：行为、源码契约和构建边界测试。
- `.github/`：GitHub Pages 验证与部署。

## 维护和审计文件

- `docs/superpowers/`：设计、实施计划、报告与证据。
- `docs/maintenance/`：长期维护规则。
- `audit/`：按日期和主题保存的复核证据。

## 本地与生成文件

`.pnpm-store/`、`node_modules*/`、`.vercel*/`、`.tools/`、`.qoder/`、`.superpowers/`、VitePress cache/dist 和 coverage 均为本地或生成内容，不进入 Git。

## 首页模块边界

`home.css` 是唯一入口；`home-foundation.css`、`home-hero.css`、`home-sections.css`、`home-responsive.css` 按原级联顺序组合。`HomePage.vue` 仍负责页面结构。

## 图片清单模块边界

`scripts/build-image-manifest.mjs` 负责总体编排；`scripts/lib/image-manifest/` 分别负责 CSV、媒体、路径、工作流状态和原子替换。
```

Create `docs/maintenance/assets-and-audits.md` with:

```markdown
# 素材与审计资料规则

> 本文件是内部维护资料。素材整理不改公开 URL，不直接删除未确认资料。

## 源输入

- `WB-X LOGO.svg`：品牌源 Logo。
- `二维码.png`：交流群二维码源图。
- `article-image-replacement-manifest.csv`：文章图片工作流的人工可维护清单。

## 公开资源

`docs/public/` 下的路径会成为站点 URL；`docs/public/article-assets/` 的校准和替换路径是发布契约，变更前必须更新清单、链接测试和浏览器回归。

## 生成清单

`docs/.vitepress/image-manifest.generated.json` 与 CSV 必须保持记录、顺序、状态和路径一致。只通过 `scripts/build-image-manifest.mjs` 的临时目录和原子替换流程更新。

## 截图与审计证据

可复核证据放在 `audit/YYYY-MM-DD-topic/`；历史工具报告和退役源输入放在 `audit/archive/topic/`。不得将文件直接散放在 `audit/` 根目录。

## 替换和归档流程

1. 记录来源、页面、视口和用途。
2. 保持公开路径，替换前运行聚焦测试。
3. 运行 `pnpm run check` 并做真实浏览器验证。
4. 有复核价值的旧文件先归档；临时文件列入忽略或清理清单，不直接删除。
```

Create `docs/maintenance/future-optimizations.md` with:

```markdown
# 后续优化清单

> 本文件是内部维护资料；以下事项不属于 2026-08-18 仓库整理范围。

## Git 历史体积

单独评估历史重写、协作者迁移、远端备份和强制推送风险。

## 媒体压缩和缓存

为大图片、GIF、MP4 建立质量基线，再评估压缩、格式转换和缓存头。

## 死代码与未使用资源

结合运行时引用、构建产物和人工复核确认后，再删除合作伙伴数据等候选项。

## 进一步模块化

仅在真实维护成本出现时评估 `custom.css`、`service.css` 和 Vue 页面组件拆分。

## 性能、可访问性与 SEO 基线

后续独立记录核心页面性能、键盘操作、对比度、结构化数据和搜索表现。
```

In `docs/.vitepress/config.mts`, change the existing line to exactly:

```ts
srcExclude: ['superpowers/**', 'maintenance/**'],
```

This exclusion, not frontmatter, owns route generation and local-search removal.

- [ ] **Step 5: Extend the publish-boundary verifier to both internal roots**

Change `verifyPublishBoundary` to accept a string or string array while defaulting to both internal directories:

```js
export function verifyPublishBoundary(
  distRoot,
  internalDocsRoots = ['docs/superpowers', 'docs/maintenance'],
) {
  if (!distRoot || !existsSync(distRoot)) {
    throw new Error(`build output is missing: ${distRoot}`)
  }
  const roots = Array.isArray(internalDocsRoots)
    ? internalDocsRoots
    : [internalDocsRoots]
  for (const root of roots) {
    if (!existsSync(root)) {
      throw new Error(`internal documents are missing: ${root}`)
    }
    const directory = basename(root)
    if (existsSync(join(distRoot, directory))) {
      throw new Error(`published output contains a ${directory} directory`)
    }
  }

  const files = walkFiles(distRoot)
  const titles = roots.flatMap(readInternalTitles)
  const htmlLeak = findLeakedTitle(
    files.filter((file) => file.endsWith('.html')),
    titles,
  )
  if (htmlLeak) {
    throw new Error(
      `HTML contains internal title "${htmlLeak.title}": ${htmlLeak.file}`,
    )
  }

  const searchLeak = findLeakedTitle(findSearchIndexes(files, distRoot), titles)
  if (searchLeak) {
    throw new Error(
      `local search index contains internal title "${searchLeak.title}": ${searchLeak.file}`,
    )
  }
}
```

Keep the existing helper functions and search-index discovery unchanged. Update the direct CLI call to:

```js
if (
  process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const internalRoots = process.argv.slice(3)
  verifyPublishBoundary(
    process.argv[2] ?? 'docs/.vitepress/dist',
    internalRoots.length > 0 ? internalRoots : undefined,
  )
}
```

In `tests/publish-boundary.test.ts`, have `createFixture()` create `docs/superpowers/plan.md` containing `# Internal Build Plan` and `docs/maintenance/guide.md` containing `# Internal Maintenance Guide`. Return their parent directories as `internalDocs` and `maintenanceDocs`, and update every verifier call to pass `[fixture.internalDocs, fixture.maintenanceDocs]`. Add:

```ts
it('rejects a published maintenance directory', () => {
  const fixture = createFixture()
  mkdirSync(join(fixture.dist, 'maintenance'))
  expect(() => verifyPublishBoundary(
    fixture.dist,
    [fixture.internalDocs, fixture.maintenanceDocs],
  )).toThrow(/maintenance directory/i)
})

it('rejects maintenance titles in generated HTML', () => {
  const fixture = createFixture()
  writeFileSync(
    join(fixture.dist, 'leaked.html'),
    '<title>Internal Maintenance Guide</title>',
  )
  expect(() => verifyPublishBoundary(
    fixture.dist,
    [fixture.internalDocs, fixture.maintenanceDocs],
  )).toThrow(/HTML.*Internal Maintenance Guide/i)
})
```

- [ ] **Step 6: Update `CONTENT_INVENTORY.md` from current facts**

Make these deterministic corrections:

```text
盘点日期: 2026-08-18
线上地址: https://wbx.sparkx.zone/
公网域名: https://wbx.sparkx.zone
本次盘点基线: 与本文件所在提交一致
```

Also update:

- homepage style paths to include the four `docs/.vitepress/theme/home/*.css` files;
- image manifest implementation paths to include `scripts/lib/image-manifest/*.mjs`;
- maintenance and audit directories to reference the new guides and `audit/README.md`;
- the command sequence to use `pnpm run check` as the complete acceptance command;
- tracked-file guidance to state that `.pnpm-store`, `.tools`, `.qoder`, `.vercel`, and dependency backups are local-only;
- any content counts whose current repository-derived value differs from the 2026-07-31 value.

Use these read-only recounts before changing a number:

```bash
find docs -type f -name '*.md' ! -path 'docs/superpowers/*' ! -path 'docs/maintenance/*' | wc -l
find docs/cases/submissions -mindepth 1 -maxdepth 1 -type d | wc -l
find docs/public/article-assets/source-calibration -type f | wc -l
find docs/public/article-assets/replacements -type f ! -name '.gitkeep' | wc -l
node --input-type=module -e "import {readFileSync} from 'node:fs'; const manifest=JSON.parse(readFileSync('docs/.vitepress/image-manifest.generated.json','utf8')); const statuses={}; for (const item of manifest) statuses[item.status]=(statuses[item.status]??0)+1; console.log({records:manifest.length,statuses})"
```

Do not change chapter names, route descriptions, image status counts, or case counts unless these recounts prove the existing number is stale. Record the command and result in the task report for every number changed.

- [ ] **Step 7: Verify documentation contracts and internal publication boundaries**

```bash
pnpm exec vitest run tests/maintenance-contract.test.ts tests/publish-boundary.test.ts tests/image-manifest.test.ts tests/content-links.test.ts
pnpm run build
```

Expected: all focused tests PASS; build output contains no `maintenance` route or maintenance titles in the local search index.

- [ ] **Step 8: Commit the maintainer documentation**

```bash
git add README.md docs/maintenance CONTENT_INVENTORY.md docs/.vitepress/config.mts scripts/verify-publish-boundary.mjs tests/publish-boundary.test.ts tests/maintenance-contract.test.ts
git diff --cached --check
git commit -m "docs: add repository maintenance handbook"
```

### Task 2: Enforce Required Maintenance and Source Files

**Files:**
- Modify: `scripts/check-repository-hygiene.mjs`
- Modify: `tests/repository-hygiene.test.ts`

**Interfaces:**
- Extends: `findRepositoryHygieneViolations(trackedPaths, existingPaths?)` while preserving callers that pass only tracked paths.
- Produces: missing-file violations for maintainer docs and stable source inputs.

- [ ] **Step 1: Add failing required-file tests**

Add to `tests/repository-hygiene.test.ts`:

```ts
it('reports every required maintenance or source file that is absent', () => {
  expect(findRepositoryHygieneViolations(['pnpm-lock.yaml'], new Set([
    'pnpm-lock.yaml',
  ]))).toEqual([
    'required repository file is missing: README.md',
    'required repository file is missing: docs/maintenance/README.md',
    'required repository file is missing: docs/maintenance/repository-layout.md',
    'required repository file is missing: docs/maintenance/assets-and-audits.md',
    'required repository file is missing: docs/maintenance/future-optimizations.md',
    'required repository file is missing: WB-X LOGO.svg',
    'required repository file is missing: 二维码.png',
    'required repository file is missing: article-image-replacement-manifest.csv',
  ])
})
```

- [ ] **Step 2: Run the test and verify RED**

```bash
pnpm exec vitest run tests/repository-hygiene.test.ts
```

Expected: FAIL because the function does not accept or check `existingPaths`.

- [ ] **Step 3: Implement deterministic required-file checks**

Add this constant in the exact desired error order:

```js
const requiredRepositoryPaths = [
  'pnpm-lock.yaml',
  'README.md',
  'docs/maintenance/README.md',
  'docs/maintenance/repository-layout.md',
  'docs/maintenance/assets-and-audits.md',
  'docs/maintenance/future-optimizations.md',
  'WB-X LOGO.svg',
  '二维码.png',
  'article-image-replacement-manifest.csv',
]
```

Change the collector signature to accept an optional set without changing existing one-argument unit callers:

```js
export function findRepositoryHygieneViolations(
  trackedPaths,
  existingPaths,
)
```

Immediately before the existing `return violations`, insert:

```js
if (existingPaths) {
  for (const path of requiredRepositoryPaths) {
    if (!existingPaths.has(path)) {
      violations.push(`required repository file is missing: ${path}`)
    }
  }
}
```

Update `checkRepositoryHygiene()` to pass the explicit set so the CLI and current-repository integration enforce required files:

```js
export function checkRepositoryHygiene(repositoryRoot = process.cwd()) {
  const paths = trackedPaths(repositoryRoot)
  return findRepositoryHygieneViolations(paths, new Set(paths))
}
```

Required project inputs must therefore be both present and tracked, while Task 1's one-argument rule fixtures continue to test only the paths they supply.

- [ ] **Step 4: Run focused and direct checks**

```bash
pnpm exec vitest run tests/repository-hygiene.test.ts tests/maintenance-contract.test.ts
pnpm run check:repo
```

Expected: all PASS and `Repository hygiene checks passed.`

- [ ] **Step 5: Commit the expanded hygiene contract**

```bash
git add scripts/check-repository-hygiene.mjs tests/repository-hygiene.test.ts
git diff --cached --check
git commit -m "test: require repository maintenance inputs"
```

### Task 3: Make GitHub Actions Run the Complete Local Contract

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`
- Modify: `tests/maintenance-contract.test.ts`

**Interfaces:**
- Consumes: `pnpm run check` created by the repository hygiene plan.
- Produces: one CI verification step that generates `docs/.vitepress/dist` before upload.

- [ ] **Step 1: Add a failing workflow contract**

Append to `tests/maintenance-contract.test.ts`:

```ts
describe('maintenance CI contract', () => {
  it('runs the same complete check locally and before Pages upload', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8'))
    const workflow = readFileSync(
      '.github/workflows/deploy-pages.yml',
      'utf8',
    )
    expect(packageJson.packageManager).toBe('pnpm@11.9.0')
    expect(packageJson.engines.node).toBe('>=20')
    expect(packageJson.scripts.check).toBe(
      'pnpm test && pnpm run check:repo && pnpm run check:links && pnpm run check:assets && pnpm run build',
    )
    expect(workflow).toContain('version: 11.9.0')
    expect(workflow).toContain('node-version: 24')
    expect(workflow).toMatch(
      /- name: Verify\s+run: pnpm run check[\s\S]*- name: Upload Pages artifact/,
    )
    expect(workflow).not.toContain('- name: Test\n')
    expect(workflow).not.toContain('- name: Build\n')
  })
})
```

- [ ] **Step 2: Run the contract and verify RED**

```bash
pnpm exec vitest run tests/maintenance-contract.test.ts
```

Expected: FAIL because the workflow still has separate Test and Build steps and omits repository/link/asset checks.

- [ ] **Step 3: Replace only the partial CI steps**

In `.github/workflows/deploy-pages.yml`, replace:

```yaml
      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm run build
```

with:

```yaml
      - name: Verify
        run: pnpm run check
```

Keep checkout depth, environment variables, setup versions, Pages configuration, artifact path, permissions, concurrency, and deploy job unchanged.

- [ ] **Step 4: Verify CI contract and production artifact**

```bash
pnpm exec vitest run tests/maintenance-contract.test.ts tests/publish-boundary.test.ts
pnpm run check
test -f docs/.vitepress/dist/index.html
git diff --check
```

Expected: all checks PASS and the Pages artifact entry exists.

- [ ] **Step 5: Commit the CI alignment**

```bash
git add .github/workflows/deploy-pages.yml tests/maintenance-contract.test.ts
git diff --cached --check
git commit -m "ci: run the complete maintenance contract"
```

### Task 4: Perform Final Git, Build, and Browser Acceptance

**Files:**
- Modify: `design-qa.md`
- Verify only: all files changed by Plans 1-4

**Interfaces:**
- Consumes: all prior plan outputs.
- Produces: dated acceptance evidence and a clean, maintainable repository handoff.

- [ ] **Step 1: Run the complete automated acceptance from a clean baseline**

```bash
pnpm run check
git diff --check
git status --short --branch
git ls-files | wc -l
git ls-files '.pnpm-store/**' '.qoder/**' '.tools/**' 'package-lock.json'
git stash list --format='%gd %s' | head -n 1
git stash show --name-only stash@{0}
```

Expected:

- full Vitest, repository hygiene, links, assets, publish boundary, and production build PASS;
- tracked file count below 700;
- forbidden tracked-path query is empty;
- stash name and seven paths remain unchanged.

- [ ] **Step 2: Start or reuse the local production preview**

Run:

```bash
pnpm preview --host 127.0.0.1 --port 4173
```

If port 4173 is occupied by the expected project preview, inspect it before reusing it. Do not terminate an unrelated process.

- [ ] **Step 3: Load the required in-app browser skill and verify routes**

Before browser actions, read and follow `browser:control-in-app-browser`. Inspect both `https://wbx.sparkx.zone/` and the local production preview for:

```text
/
/wb-x/
/resources/
/help/
/wb-x/reading-guide/
```

At desktop `1440 x 900` and mobile `390 x 844`, verify:

- titles, navigation labels, hero/version markers, resources copy, service obstacles, and reading-guide content match the approved live baseline;
- `document.documentElement.scrollWidth <= document.documentElement.clientWidth`;
- all primary links resolve to the same URLs as before;
- console error count is zero;
- `/reading-guide` still redirects to `/wb-x/reading-guide/`.

If the in-app browser is unavailable, stop this task and report the blocked acceptance step. Do not substitute Chrome.

- [ ] **Step 4: Append dated QA evidence**

Append a completed section to `design-qa.md` with these exact headings:

```markdown
# 2026-08-18 仓库全面整理 Design QA

## 自动验证
## 仓库治理
## 浏览器回归
## 结论
```

Under the four headings, write the measured results from Steps 1-3: exact `pnpm run check` counts; link, asset, and build outcomes; tracked file count; forbidden-path result; local cache and stash preservation; archive locations; five routes; two viewports; redirect; overflow measurements; console state; and live/local comparison. End with exactly `final result: passed` only when every check passed; otherwise use `final result: blocked` and name the unmet check.

- [ ] **Step 5: Commit QA evidence and rerun the documentation boundary test**

```bash
pnpm exec vitest run tests/publish-boundary.test.ts tests/maintenance-contract.test.ts
git add design-qa.md
git diff --cached --check
git commit -m "docs: record repository maintenance acceptance"
```

- [ ] **Step 6: Final handoff audit**

```bash
git status --short --branch
git log --oneline --decorate -12
pnpm run check:repo
git stash list --format='%gd %s' | head -n 1
```

Expected: no tracked working-tree changes, only intentionally preserved ignored/local files, all plan commits visible, repository hygiene PASS, and the preserved stash still first in the list.
