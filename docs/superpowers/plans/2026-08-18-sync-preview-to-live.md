# Preview-to-Live Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the local preview match the currently published `https://wbx.sparkx.zone/` baseline while preserving all pre-alignment local edits in a recoverable stash.

**Architecture:** Add one source-level contract test for the externally verified live markers, then stash only the seven modified tracked files and merge the verified `origin/main` baseline into the current feature branch. Keep the stash unapplied so the preview stays on the live baseline, and finish with focused tests, the complete project check, and browser comparisons of the live and local routes.

**Tech Stack:** Git, VitePress 1.6.4, Vue 3.5, TypeScript, Vitest 2.1, Node.js 20+, npm scripts, browser DOM inspection.

## Global Constraints

- Treat `https://wbx.sparkx.zone/` as the authoritative rendered result.
- Preserve the seven currently modified tracked files in a named Git stash; do not drop or pop that stash during this plan.
- Do not delete or stash untracked audit files, screenshots, plans, caches, or `.vercel-tmp/`.
- Merge the verified `origin/main` baseline; do not use the newer local `main` commit because it is not the currently published baseline.
- Preserve the current branch's service-page design and plan commits, but do not include the unshipped fourth service obstacle in the preview.
- Do not reset branches, rewrite history, merge to `main`, push, publish, or deploy.
- If the merge reports conflicts, stop with the conflict state intact and report the exact files; do not force resolution or reset.

---

### Task 1: Lock the Live-Site Contract and Preserve Local Work

**Files:**
- Create: `tests/live-site-alignment.test.ts`
- Preserve in stash: `.gitignore`
- Preserve in stash: `docs/.vitepress/theme/HomePage.vue`
- Preserve in stash: `docs/.vitepress/theme/service.css`
- Preserve in stash: `package-lock.json`
- Preserve in stash: `tests/home-hero-icons.test.ts`
- Preserve in stash: `tests/service-page-style.test.ts`
- Preserve in stash: `tests/service-page.test.ts`

**Interfaces:**
- Consumes: exported `nav` and `sidebar` arrays plus the source file `docs/.vitepress/theme/HomePage.vue`.
- Produces: a Vitest contract that captures the verified online navigation, version labels, analytics component, download link, and canonical reading-guide/resource files; a named recoverable stash containing exactly the seven modified tracked files.

- [ ] **Step 1: Reconfirm the exact modified tracked-file set**

Run:

```bash
git diff --name-only
```

Expected output contains exactly:

```text
.gitignore
docs/.vitepress/theme/HomePage.vue
docs/.vitepress/theme/service.css
package-lock.json
tests/home-hero-icons.test.ts
tests/service-page-style.test.ts
tests/service-page.test.ts
```

If any additional tracked path appears, stop and report it before stashing.

- [ ] **Step 2: Write the failing live-alignment test**

Create `tests/live-site-alignment.test.ts` with:

```ts
// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { nav } from '../docs/.vitepress/navigation'
import { sidebar } from '../docs/.vitepress/sidebar'

const homeSource = readFileSync(
  'docs/.vitepress/theme/HomePage.vue',
  'utf8',
)

describe('published live-site alignment contract', () => {
  it('uses the published top-level navigation', () => {
    expect(nav.map((item) => item.text)).toEqual([
      '首页',
      '开始阅读',
      '案例集',
      '定制服务',
      '资料',
      '交流群',
    ])
    expect(nav.find((item) => item.text === '资料')?.link).toBe('/resources/')
  })

  it('keeps the published homepage labels, analytics strip, and download', () => {
    expect(homeSource).toContain("import HomeAnalyticsStrip from './HomeAnalyticsStrip.vue'")
    expect(homeSource).toContain('中国版 v5.3.13')
    expect(homeSource).toContain('国际版 v5.2.7')
    expect(homeSource).toContain('<HomeAnalyticsStrip')
    expect(homeSource).toContain('https://pan.quark.cn/s/4b2488289c79')
  })

  it('exposes the published canonical resource and reading-guide routes', () => {
    expect(existsSync('docs/resources/index.md')).toBe(true)
    expect(existsSync('docs/wb-x/reading-guide/index.md')).toBe(true)
    expect(sidebar.slice(0, 2)).toEqual([
      { text: '小白书总览', link: '/wb-x/' },
      { text: '阅读指南', link: '/wb-x/reading-guide/' },
    ])
  })
})
```

- [ ] **Step 3: Run the contract test and verify RED**

Run:

```bash
npm test -- tests/live-site-alignment.test.ts
```

Expected: FAIL because the current preview still exposes `指南`, lacks `HomeAnalyticsStrip`, uses unversioned locale labels, and lacks the canonical resource/reading-guide files.

- [ ] **Step 4: Save only the seven modified tracked files**

Run:

```bash
git stash push -m "pre-live-alignment-2026-08-18" -- .gitignore docs/.vitepress/theme/HomePage.vue docs/.vitepress/theme/service.css package-lock.json tests/home-hero-icons.test.ts tests/service-page-style.test.ts tests/service-page.test.ts
```

Expected: Git reports `Saved working directory and index state` and leaves `tests/live-site-alignment.test.ts` plus all pre-existing untracked files untouched.

- [ ] **Step 5: Verify the stash and worktree safety boundary**

Run:

```bash
git stash list --format='%gd %s'
git stash show --name-status 'stash@{0}'
git status --short
```

Expected: `stash@{0}` is named `pre-live-alignment-2026-08-18`, its file list is exactly the seven paths from Step 1, and no pre-existing untracked path was removed.

---

### Task 2: Merge the Verified Published Baseline

**Files:**
- Merge from: `origin/main`
- Retain: `tests/live-site-alignment.test.ts`
- Verify against: `docs/.vitepress/**`, `docs/**`, `scripts/**`, `tests/**`, `package.json`, `package-lock.json`, `CONTENT_INVENTORY.md`

**Interfaces:**
- Consumes: the red live-site contract and the clean tracked worktree produced by Task 1.
- Produces: a merge commit whose application/runtime source matches `origin/main`, plus a committed regression contract that guards the live markers.

- [ ] **Step 1: Record the baseline identity before merging**

Run:

```bash
git rev-parse origin/main
git show -s --format='%H %s' origin/main
```

Expected baseline: commit `56796d72` with subject `chore: update WorkBuddy China version to 5.3.13`. If the ref differs, compare its source markers with the live page before continuing.

- [ ] **Step 2: Merge the baseline without rewriting history**

Run:

```bash
git merge --no-ff origin/main -m "merge: sync preview with live baseline"
```

Expected: a merge commit is created without conflicts. If conflicts occur, stop and report the conflicting files without resetting or discarding the merge state.

- [ ] **Step 3: Run the contract test and verify GREEN**

Run:

```bash
npm test -- tests/live-site-alignment.test.ts
```

Expected: PASS for all three contract cases.

- [ ] **Step 4: Verify application source matches the published baseline**

Run:

```bash
git diff --exit-code origin/main -- . ':(exclude)docs/superpowers/**' ':(exclude)tests/live-site-alignment.test.ts'
```

Expected: no output and exit status 0. The current branch may differ from `origin/main` only in planning/specification documents and the new alignment contract test.

- [ ] **Step 5: Commit the regression contract**

Run:

```bash
git add tests/live-site-alignment.test.ts
git commit -m "test: lock published site alignment"
```

Expected: one commit containing only `tests/live-site-alignment.test.ts`.

---

### Task 3: Automated and Browser Acceptance

**Files:**
- Verify: entire tracked project
- Preserve: `stash@{0}` and all pre-existing untracked files

**Interfaces:**
- Consumes: the merged baseline and passing live-site contract.
- Produces: a tested production build and browser evidence that the local preview matches the live page on the required routes; no deployment or remote mutation.

- [ ] **Step 1: Run focused baseline tests**

Run:

```bash
npm test -- tests/live-site-alignment.test.ts tests/navigation.test.ts tests/home-hero-icons.test.ts tests/home-analytics.test.ts tests/home-analytics-strip.test.ts tests/content-links.test.ts tests/legacy-routes.test.ts tests/service-page.test.ts tests/service-page-style.test.ts
```

Expected: all selected tests pass, including navigation, version labels, analytics, canonical routes, legacy redirects, and the published three-obstacle service page.

- [ ] **Step 2: Run the complete verification command**

Run:

```bash
npm run check
```

Expected: the full Vitest suite, link check, replacement-asset check, VitePress production build, legacy redirect generation, and publish-boundary verification all pass without errors.

- [ ] **Step 3: Refresh and compare the home pages**

Open `https://wbx.sparkx.zone/` and `http://127.0.0.1:5173/`, reload the local page, and compare visible DOM plus the rendered viewport. Confirm exactly:

- navigation order is `首页 / 开始阅读 / 案例集 / 定制服务 / 资料 / 交流群`;
- hero labels are `中国版 v5.3.13` and `国际版 v5.2.7`;
- `.wbx-home-analytics` exists locally and online;
- the teaching-material link target is `https://pan.quark.cn/s/4b2488289c79`;
- primary headings, section order, and visible layout have no material mismatch.

- [ ] **Step 4: Refresh and compare the canonical content routes**

Compare live and local versions of:

```text
/wb-x/
/resources/
/wb-x/reading-guide/
/help/
```

Confirm the same navigation, page titles, main headings, canonical links, sidebar opening entries, and service-page obstacle count. Confirm `/reading-guide` redirects to `/wb-x/reading-guide/` locally.

- [ ] **Step 5: Confirm preservation and final scope**

Run:

```bash
git stash list --format='%gd %s'
git stash show --name-status 'stash@{0}'
git status --short --branch
git log --oneline --decorate -5
```

Expected: the named stash still contains the original seven modified paths; all pre-existing untracked files remain; the branch contains the design commit, merge commit, and contract-test commit; the tracked worktree is clean.

- [ ] **Step 6: Keep the aligned preview open**

Leave `http://127.0.0.1:5173/` open in the app browser after the final reload so the user sees the aligned home page. Do not deploy or push.
