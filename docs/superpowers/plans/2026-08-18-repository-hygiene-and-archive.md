# Repository Hygiene and Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove generated dependencies and local tools from Git tracking, normalize pnpm ownership, and place all current maintenance evidence into explicit archives without deleting local-only data.

**Architecture:** A small read-only repository checker owns enforceable path rules. The cleanup first proves the checker in isolation, then performs an explicit, recoverable inventory migration and enables the checker in the standard pnpm workflow.

**Tech Stack:** Node.js 24 in CI, Node.js >=20 locally, pnpm 11.9.0, Vitest 2, Git.

**Spec:** `docs/superpowers/specs/2026-08-18-repository-maintenance-and-organization-design.md`

**Execution order:** Plan 1 of 4. Complete this plan before the homepage, image-manifest, and documentation/CI plans.

## Global Constraints

- Do not rewrite Git history or force-push.
- Do not change public URLs, public asset paths, page content, or runtime behavior.
- Keep `stash@{0}` named `pre-live-alignment-2026-08-18` with its seven recorded paths unchanged.
- Keep local `.pnpm-store`, `.tools`, `.vercel`, `.vercel-tmp`, `node_modules.preview-backup`, and other user data on disk.
- Use pnpm 11.9.0 as the only package manager and `pnpm-lock.yaml` as the only tracked dependency lockfile.
- Move evidence by exact path; do not use recursive deletion or broad globs.
- Run `git diff --check` before every commit.

---

## File Structure

- Create `scripts/check-repository-hygiene.mjs`: pure violation collector plus read-only CLI.
- Create `tests/repository-hygiene.test.ts`: isolated rules and current-repository integration coverage.
- Modify `.gitignore`: categorized local/generated exclusions.
- Modify `package.json`: `check:repo` and pnpm-only command composition.
- Remove tracked `package-lock.json`: duplicate lockfile; recoverable from Git and the preserved stash.
- Stop tracking `.pnpm-store/**` and `.tools/bin/gh`: keep physical files in place.
- Move `.qoder/better-harness/2026-08-05/130954-workbuddy-wb/*` to `audit/archive/2026-08-05-qoder-harness/`.
- Move `.superpowers/sdd/2026-08-02-case-qr-left-alignment/task-1-report.md` to `docs/superpowers/reports/2026-08-02-case-qr-left-alignment-task-1.md`.
- Create `audit/README.md`: tracked evidence policy and archive map.
- Move top-level and loose screenshots into dated `audit/` subdirectories.
- Move unused `WB-X LOGO.png` to `audit/archive/source-assets/WB-X-LOGO-legacy.png`.
- Modify `design-qa.md`: replace obsolete absolute screenshot paths with repository-relative archive paths.
- Track the completed `docs/superpowers/plans/2026-08-16-service-diagnostic-summary-layout.md` plan in place.

### Task 1: Build the Read-Only Repository Hygiene Checker

**Files:**
- Create: `scripts/check-repository-hygiene.mjs`
- Create: `tests/repository-hygiene.test.ts`

**Interfaces:**
- Consumes: arrays of POSIX-style Git tracked paths.
- Produces: `findRepositoryHygieneViolations(trackedPaths: string[]): string[]`.
- Produces: CLI `node scripts/check-repository-hygiene.mjs`, exit `0` with a summary or exit `1` with one violation per line.

- [ ] **Step 1: Write isolated rule tests**

Create `tests/repository-hygiene.test.ts` with these initial cases:

```ts
import { describe, expect, it } from 'vitest'
import { findRepositoryHygieneViolations } from '../scripts/check-repository-hygiene.mjs'

describe('repository hygiene rules', () => {
  it('accepts pnpm-owned source and dated audit evidence', () => {
    expect(findRepositoryHygieneViolations([
      'package.json',
      'pnpm-lock.yaml',
      'audit/README.md',
      'audit/2026-08-17-online-baseline-sync/wb-x-desktop.png',
      'audit/archive/source-assets/WB-X-LOGO-legacy.png',
    ])).toEqual([])
  })

  it('rejects generated roots, duplicate locks, and loose audit files', () => {
    expect(findRepositoryHygieneViolations([
      '.pnpm-store/v11/index/00/example',
      '.tools/bin/gh',
      '.qoder/report.json',
      'package-lock.json',
      'audit/loose.png',
    ])).toEqual([
      'tracked local/generated path: .pnpm-store/v11/index/00/example',
      'tracked local/generated path: .qoder/report.json',
      'tracked local/generated path: .tools/bin/gh',
      'audit evidence must use a dated topic or archive directory: audit/loose.png',
      'duplicate package-manager lockfile: package-lock.json',
    ])
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
pnpm exec vitest run tests/repository-hygiene.test.ts
```

Expected: FAIL because `scripts/check-repository-hygiene.mjs` does not exist.

- [ ] **Step 3: Implement the rule collector and CLI**

Create `scripts/check-repository-hygiene.mjs` with this public shape and behavior:

```js
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const blockedTrackedRoots = [
  '.pnpm-store/',
  '.qoder/',
  '.tools/',
  '.vercel/',
  '.vercel-tmp/',
  'node_modules/',
  'node_modules.preview-backup/',
]

const duplicateLockfiles = new Set([
  'package-lock.json',
  'npm-shrinkwrap.json',
  'yarn.lock',
])

function isGovernedAuditPath(path) {
  return path === 'audit/README.md'
    || /^audit\/\d{4}-\d{2}-\d{2}-[^/]+\/.+/.test(path)
    || /^audit\/archive\/[^/]+\/.+/.test(path)
}

export function findRepositoryHygieneViolations(trackedPaths) {
  const violations = []
  for (const path of [...trackedPaths].sort()) {
    if (blockedTrackedRoots.some((root) => path.startsWith(root))) {
      violations.push(`tracked local/generated path: ${path}`)
    }
    if (duplicateLockfiles.has(path)) {
      violations.push(`duplicate package-manager lockfile: ${path}`)
    }
    if (path.startsWith('audit/') && !isGovernedAuditPath(path)) {
      violations.push(
        `audit evidence must use a dated topic or archive directory: ${path}`,
      )
    }
  }
  return violations
}

function trackedPaths(repositoryRoot) {
  const result = spawnSync('git', ['ls-files', '-z'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })
  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || 'git ls-files failed')
  }
  return result.stdout.split('\0').filter(Boolean)
}

export function checkRepositoryHygiene(repositoryRoot = process.cwd()) {
  return findRepositoryHygieneViolations(trackedPaths(repositoryRoot))
}

if (
  process.argv[1]
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url
) {
  const violations = checkRepositoryHygiene()
  if (violations.length > 0) {
    console.error(violations.map((item) => `- ${item}`).join('\n'))
    process.exitCode = 1
  } else {
    console.log('Repository hygiene checks passed.')
  }
}
```

- [ ] **Step 4: Run the isolated test and verify GREEN**

Run:

```bash
pnpm exec vitest run tests/repository-hygiene.test.ts
node scripts/check-repository-hygiene.mjs
```

Expected: Vitest PASS. The direct CLI intentionally exits `1` and lists the current tracked `.pnpm-store`, `.qoder`, `.tools`, `package-lock.json`, and loose audit paths; this proves the repository cleanup is still required.

- [ ] **Step 5: Commit the checker without enabling it globally**

```bash
git add scripts/check-repository-hygiene.mjs tests/repository-hygiene.test.ts
git diff --cached --check
git commit -m "test: add repository hygiene rules"
```

### Task 2: Migrate the Inventory and Enable the Hygiene Gate

**Files:**
- Modify: `.gitignore`
- Modify: `package.json`
- Modify: `tests/repository-hygiene.test.ts`
- Modify: `design-qa.md`
- Create: `audit/README.md`
- Create/move: the exact archive paths listed in File Structure
- Remove from tracking: `.pnpm-store/**`, `.tools/bin/gh`, `.qoder/**`, `package-lock.json`, `WB-X LOGO.png`, loose audit files, and the old `.superpowers` report path

**Interfaces:**
- Consumes: `findRepositoryHygieneViolations()` from Task 1.
- Produces: `pnpm run check:repo` and a clean current-repository integration contract.
- Produces: a Git-tracked audit tree with no loose files directly below `audit/` except `README.md`.

- [ ] **Step 1: Capture and validate the exact pre-migration inventory**

Run these read-only commands and preserve their output in the task report, not in a temporary repository file:

```bash
git status --short --branch
git stash list --format='%gd %s'
git stash show --name-only stash@{0}
git ls-files | wc -l
git ls-files '.pnpm-store/**' | wc -l
git ls-files '.qoder/**' '.superpowers/**' '.tools/**' 'audit/**'
```

Expected stash paths, exactly:

```text
.gitignore
docs/.vitepress/theme/HomePage.vue
docs/.vitepress/theme/service.css
package-lock.json
tests/home-hero-icons.test.ts
tests/service-page-style.test.ts
tests/service-page.test.ts
```

Validate that `.pnpm-store` and `.tools` are real directories, not symbolic links, before changing the index:

```bash
test -d .pnpm-store && test ! -L .pnpm-store
test -d .tools && test ! -L .tools
```

- [ ] **Step 2: Add a failing current-repository integration test**

Replace the existing single-name script import at the top of `tests/repository-hygiene.test.ts` with:

```ts
import {
  checkRepositoryHygiene,
  findRepositoryHygieneViolations,
} from '../scripts/check-repository-hygiene.mjs'
```

Then append:

```ts
describe('current repository hygiene', () => {
  it('tracks only governed project files', () => {
    expect(checkRepositoryHygiene()).toEqual([])
  })
})
```

Run:

```bash
pnpm exec vitest run tests/repository-hygiene.test.ts
```

Expected: FAIL with the same concrete repository violations printed by the CLI.

- [ ] **Step 3: Replace `.gitignore` with categorized rules**

Use this exact content, retaining the existing worktree and VitePress exclusions:

```gitignore
# Operating-system files
.DS_Store

# Dependencies and package-manager state
node_modules/
node_modules.preview-backup/
.pnpm-store/

# Local worktrees and agent/tool state
.worktrees/
.superpowers/
.qoder/
.tools/

# Local deployment state
.vercel/
.vercel-tmp/

# Generated build and test output
docs/.vitepress/cache/
docs/.vitepress/dist/
coverage/

# Unclassified local captures must be moved into audit/ before tracking
/screenshot-*.png
```

- [ ] **Step 4: Move every governed record by its explicit path**

Create destination directories, verify they are inside the repository, and move only these exact files:

```text
.qoder/better-harness/2026-08-05/130954-workbuddy-wb/canvas.json
  -> audit/archive/2026-08-05-qoder-harness/canvas.json
.qoder/better-harness/2026-08-05/130954-workbuddy-wb/findings.json
  -> audit/archive/2026-08-05-qoder-harness/findings.json
.qoder/better-harness/2026-08-05/130954-workbuddy-wb/report.canvas.tsx
  -> audit/archive/2026-08-05-qoder-harness/report.canvas.tsx
.superpowers/sdd/2026-08-02-case-qr-left-alignment/task-1-report.md
  -> docs/superpowers/reports/2026-08-02-case-qr-left-alignment-task-1.md
audit/01-workbuddy-guide-desktop.png
  -> audit/2026-07-30-homepage-clone/workbuddy-guide-desktop-reference.png
audit/02-workbuddy-guide-mobile.png
  -> audit/2026-07-30-homepage-clone/workbuddy-guide-mobile-reference.png
audit/adversarial-2026-08-10/01-home.png
  -> audit/2026-08-10-adversarial/01-home.png
audit/adversarial-2026-08-10/02-book-index.png
  -> audit/2026-08-10-adversarial/02-book-index.png
audit/adversarial-2026-08-10/03-public-internal-plan.png
  -> audit/2026-08-10-adversarial/03-public-internal-plan.png
audit/adversarial-2026-08-10/04-stale-part-two-index.png
  -> audit/2026-08-10-adversarial/04-stale-part-two-index.png
screenshot-full-page.png
  -> audit/archive/2026-08-18-unclassified-screenshots/screenshot-full-page.png
screenshot-page1-cover.png
  -> audit/archive/2026-08-18-unclassified-screenshots/screenshot-page1-cover.png
screenshot-page2.png
  -> audit/archive/2026-08-18-unclassified-screenshots/screenshot-page2.png
screenshot-right-panel.png
  -> audit/archive/2026-08-18-unclassified-screenshots/screenshot-right-panel.png
WB-X LOGO.png
  -> audit/archive/source-assets/WB-X-LOGO-legacy.png
```

Use `git mv -- <source> <destination>` for every currently tracked source (`.qoder` files, the `.superpowers` report, the two top-level audit references, and `WB-X LOGO.png`). Use ordinary `mv -- <source> <destination>` only for the currently untracked adversarial directory and four root screenshots. Create each named destination directory first and inspect it before moving; do not use a wildcard source.

Keep `audit/2026-08-16-reading-guide/**` in place and track it. Track the completed `docs/superpowers/plans/2026-08-16-service-diagnostic-summary-layout.md` in place. Do not move or edit `.vercel/**`, `.vercel-tmp/**`, the three untracked `.pnpm-store/v11/projects/*` entries, or `node_modules.preview-backup/**`.

- [ ] **Step 5: Add the audit policy and repair QA references**

Create `audit/README.md` with these enforceable headings and rules:

```markdown
# Visual and Maintenance Evidence

## Active evidence

Store reproducible review evidence under `audit/YYYY-MM-DD-topic/`.

## Archive

Store historical tool reports, unclassified captures, and retired source inputs under `audit/archive/topic/`.

## Rules

- Do not place evidence files directly under `audit/`.
- Use descriptive lowercase names for new files.
- Record viewport and route context in the related QA or plan document.
- Never publish files from `audit/` as website assets.
```

In `design-qa.md`, replace the two obsolete `/Users/nick/Desktop/...` paths with:

```text
audit/2026-07-30-homepage-clone/workbuddy-guide-desktop-reference.png
audit/2026-07-30-homepage-clone/workbuddy-guide-mobile-reference.png
```

- [ ] **Step 6: Stop tracking generated roots and remove the duplicate lockfile**

After verifying the exact paths again, remove only their Git index entries while leaving local directories present:

```bash
git rm -r --cached -- .pnpm-store
git rm -r --cached -- .tools
git rm -- package-lock.json
```

The `.qoder` and `.superpowers` tracked files are already represented by their archive moves. Do not run `rm`, `git clean`, `git reset`, or any history-rewrite command.

- [ ] **Step 7: Enable pnpm-owned repository checking**

Update only the `scripts` object in `package.json` to include:

```json
{
  "check:repo": "node scripts/check-repository-hygiene.mjs",
  "check": "pnpm test && pnpm run check:repo && pnpm run check:links && pnpm run check:assets && pnpm run build"
}
```

Retain all existing script names and commands not shown above.

- [ ] **Step 8: Verify GREEN and preservation**

Run:

```bash
pnpm exec vitest run tests/repository-hygiene.test.ts tests/vitest-config.test.ts
pnpm run check:repo
git ls-files | wc -l
git ls-files '.pnpm-store/**' '.qoder/**' '.tools/**' 'package-lock.json'
test -d .pnpm-store && test -f .tools/bin/gh
git stash list --format='%gd %s' | head -n 1
git stash show --name-only stash@{0}
git status --short --ignored
git diff --check
```

Expected:

- focused tests PASS;
- `check:repo` prints `Repository hygiene checks passed.`;
- tracked count is below 700;
- the forbidden `git ls-files` query prints nothing;
- `.pnpm-store` and `.tools/bin/gh` still exist locally;
- stash name and seven paths are unchanged;
- `.pnpm-store`, `.tools`, `.vercel`, `.vercel-tmp`, root screenshots, and backup dependencies are ignored or archived, not deleted.

- [ ] **Step 9: Commit the governed repository inventory**

Stage the explicit paths and inspect the staged rename/delete summary before committing:

```bash
git add -- .gitignore package.json tests/repository-hygiene.test.ts design-qa.md audit docs/superpowers/reports docs/superpowers/plans/2026-08-16-service-diagnostic-summary-layout.md
git diff --cached --stat
git diff --cached --check
git commit -m "chore: govern repository files and archives"
```

After the commit, rerun `pnpm run check:repo` and the preservation checks from Step 8.
