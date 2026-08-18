# Image Manifest Modularization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce `scripts/build-image-manifest.mjs` to orchestration by extracting CSV, media, path, workflow-state, and atomic-write responsibilities while preserving all generated output and rollback behavior.

**Architecture:** Small ESM modules expose pure or dependency-injected functions. The existing CLI remains the only user-facing entry, and the existing subprocess integration suite remains the authoritative end-to-end contract.

**Tech Stack:** Node.js ESM, `node:fs/promises`, pnpm 11.9.0, Vitest 2.

**Spec:** `docs/superpowers/specs/2026-08-18-repository-maintenance-and-organization-design.md`

**Execution order:** Plan 3 of 4. Run after repository hygiene. It is independent of the homepage modularization plan and must finish before final documentation/CI verification.

## Global Constraints

- Keep the CLI path `scripts/build-image-manifest.mjs` and environment variable `WORKBUDDY_SOURCE_DOCS` unchanged.
- Preserve JSON/CSV schemas, record order, Markdown rewrites, path validation, console output, error messages, exit codes, and atomic rollback semantics.
- Do not modify generated manifests, Markdown, calibration assets, or replacement assets as part of the refactor commit.
- Every new module must have one responsibility and explicit exports.
- Use the current generator integration tests as the final oracle; add focused unit coverage before moving logic.

---

## File Structure

- Create `scripts/lib/image-manifest/csv.mjs`: schema columns, CSV parsing, and serialization.
- Create `scripts/lib/image-manifest/media.mjs`: Markdown image/video discovery plus image metadata.
- Create `scripts/lib/image-manifest/paths.mjs`: recursive file listing, existence checks, and managed-path conversion.
- Create `scripts/lib/image-manifest/workflow-state.mjs`: preserved status, notes, replacement path, and user-provided record handling.
- Create `scripts/lib/image-manifest/atomic-replace.mjs`: candidate swap and rollback.
- Create `tests/image-manifest-modules.test.ts`: direct unit contracts for extracted modules.
- Modify `scripts/build-image-manifest.mjs`: imports modules and retains configuration plus page orchestration.
- Verify only `tests/image-manifest-generator.test.ts` and `tests/image-manifest.test.ts` unless a failing regression requires a targeted correction.

### Task 1: Extract CSV and Media Primitives

**Files:**
- Create: `scripts/lib/image-manifest/csv.mjs`
- Create: `scripts/lib/image-manifest/media.mjs`
- Create: `tests/image-manifest-modules.test.ts`
- Modify: `scripts/build-image-manifest.mjs`

**Interfaces:**
- Produces: `manifestColumns`, `csvColumns`, `parseCsv(csv, filePath)`, `csvFor(records, notesById)`.
- Produces: `imageReferences(markdown)`, `videoReferences(markdown)`, `imageFormat(buffer, filePath)`, `imageDimensions(buffer, format, filePath)`, `purposeFor(pageTitle, alt, order)`.
- Consumes: no repository global state.

- [ ] **Step 1: Write failing pure-module tests**

Create `tests/image-manifest-modules.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import {
  csvColumns,
  csvFor,
  parseCsv,
} from '../scripts/lib/image-manifest/csv.mjs'
import {
  imageDimensions,
  imageFormat,
  imageReferences,
  purposeFor,
  videoReferences,
} from '../scripts/lib/image-manifest/media.mjs'

describe('image manifest CSV primitives', () => {
  it('round-trips quoted notes using the production schema', () => {
    const record = {
      id: 'ch01-001', page: '/wb-x/demo/', order: 1,
      purpose: 'Demo', sourceUrl: 'https://workbuddy.homes/demo.png',
      calibrationPath: '/article-assets/source-calibration/ch01/001.png',
      replacementPath: '/article-assets/replacements/ch01/001.png',
      sourceWidth: 800, sourceHeight: 600, format: 'png',
      status: 'awaiting-replacement',
    }
    const csv = csvFor([record], new Map([[record.id, 'owner, "review"']]))
    const rows = parseCsv(csv, 'fixture.csv')
    expect(rows[0]).toEqual(csvColumns)
    expect(rows[1]).toHaveLength(csvColumns.length)
    expect(rows[1].at(-1)).toBe('owner, "review"')
  })

  it('rejects an unterminated quoted cell with the source path', () => {
    expect(() => parseCsv('id,notes\n1,"open', 'broken.csv'))
      .toThrow('Unterminated quoted CSV cell in broken.csv')
  })
})

describe('image manifest media primitives', () => {
  it('extracts Markdown, HTML image, and video references in order', () => {
    const source = [
      '![Markdown alt](./one.png)',
      '<img alt="HTML alt" src="./two.jpg">',
      '<video src="./demo.mp4"></video>',
    ].join('\n')
    expect(imageReferences(source)).toEqual([
      { alt: 'Markdown alt', target: './one.png', type: 'markdown' },
      { alt: 'HTML alt', target: './two.jpg', type: 'html' },
    ])
    expect(videoReferences(source)).toEqual(['./demo.mp4'])
  })

  it('reads the production PNG signature and dimensions', () => {
    const path = 'docs/public/article-assets/source-calibration/ch02/004.png'
    const buffer = readFileSync(path)
    expect(imageFormat(buffer, path)).toBe('png')
    const [width, height] = imageDimensions(buffer, 'png', path)
    expect(width).toBeGreaterThan(0)
    expect(height).toBeGreaterThan(0)
  })

  it('uses alt text before the generated purpose fallback', () => {
    expect(purposeFor('Chapter', ' Diagram ', 2)).toBe('Diagram')
    expect(purposeFor('Chapter', '', 2)).toBe('Chapter — image 2')
  })
})
```

- [ ] **Step 2: Run the tests and verify RED**

```bash
pnpm exec vitest run tests/image-manifest-modules.test.ts
```

Expected: FAIL because the two module files do not exist.

- [ ] **Step 3: Move the exact primitives into focused modules**

Move the existing bodies without semantic edits:

```text
build-image-manifest.mjs lines 43-68, 244-300
  -> csv.mjs (schema arrays, csvCell private, parseCsv, csvFor)
build-image-manifest.mjs lines 65-101, 181-242
  -> media.mjs (patterns private; exported reference and metadata functions)
```

`csv.mjs` must prefix the existing schema arrays and function declarations with `export`; after the move its public declarations are:

```text
manifestColumns: exported array in the current column order
csvColumns: exported manifest columns followed by notes
parseCsv(csv, filePath): exported function with the current body
csvFor(records, notesById = new Map()): exported function with the current body
```

`media.mjs` exports the five signatures named in Interfaces and keeps `pageImagePattern` and `videoPattern` private. Also export these two patterns because the orchestration uses them for replacement:

```js
export { pageImagePattern, videoPattern }
```

Import the new exports in `build-image-manifest.mjs` and remove only the duplicated local declarations.

- [ ] **Step 4: Run unit and generator integration tests**

```bash
pnpm exec vitest run tests/image-manifest-modules.test.ts tests/image-manifest-generator.test.ts tests/image-manifest.test.ts
```

Expected: all tests PASS; generator fixture snapshots and rollback cases remain unchanged.

- [ ] **Step 5: Commit the primitive extraction**

```bash
git add scripts/lib/image-manifest/csv.mjs scripts/lib/image-manifest/media.mjs scripts/build-image-manifest.mjs tests/image-manifest-modules.test.ts
git diff --cached --check
git commit -m "refactor: extract image manifest primitives"
```

### Task 2: Extract Path and Workflow-State Boundaries

**Files:**
- Create: `scripts/lib/image-manifest/paths.mjs`
- Create: `scripts/lib/image-manifest/workflow-state.mjs`
- Modify: `tests/image-manifest-modules.test.ts`
- Modify: `scripts/build-image-manifest.mjs`

**Interfaces:**
- Produces from `paths.mjs`: `filesUnder`, `pathExists`, `assertManagedPath`, `localPublicAssetPath`, `stagedCalibrationPath`, `stagedReplacementPath`.
- Produces from `workflow-state.mjs`: `allowedStatuses`, `userProvidedSourcePattern`, `loadWorkflowState`, `preservedWorkflowState`, `supplementalRecordsForPage`.
- `loadWorkflowState({ jsonPath, csvPath })` receives paths instead of closing over repository globals.
- `supplementalRecordsForPage({ page, pagePrefix, workflowState, contentRoot })` receives the public content root explicitly.

- [ ] **Step 1: Add failing path and workflow tests**

Append imports and cases to `tests/image-manifest-modules.test.ts`:

```ts
import {
  assertManagedPath,
  stagedCalibrationPath,
} from '../scripts/lib/image-manifest/paths.mjs'
import {
  preservedWorkflowState,
} from '../scripts/lib/image-manifest/workflow-state.mjs'

describe('image manifest path boundaries', () => {
  it('maps a managed calibration URL under the staging root', () => {
    expect(stagedCalibrationPath(
      '/tmp/staging',
      '/article-assets/source-calibration/ch01/001.png',
    )).toBe('/tmp/staging/ch01/001.png')
  })

  it('rejects public paths that escape the managed prefix', () => {
    expect(() => assertManagedPath(
      '/article-assets/other/001.png',
      '/article-assets/source-calibration',
      'Calibration path',
    )).toThrow(
      'Calibration path escapes /article-assets/source-calibration',
    )
  })
})

describe('image manifest workflow state', () => {
  it('preserves one approved status, custom path, and CSV notes', () => {
    const record = { id: 'ch01-001' }
    const state = {
      manifestById: new Map([['ch01-001', {
        id: 'ch01-001', status: 'approved',
        replacementPath: '/article-assets/replacements/custom/001.png',
      }]]),
      csvById: new Map([['ch01-001', {
        id: 'ch01-001', status: 'approved', notes: 'reviewed',
        replacementPath: '/article-assets/replacements/custom/001.png',
      }]]),
    }
    expect(preservedWorkflowState(
      record,
      '/article-assets/replacements/ch01/001.png',
      state,
    )).toEqual({
      status: 'approved',
      replacementPath: '/article-assets/replacements/custom/001.png',
      notes: 'reviewed',
    })
  })
})
```

- [ ] **Step 2: Run the new cases and verify RED**

```bash
pnpm exec vitest run tests/image-manifest-modules.test.ts
```

Expected: FAIL because `paths.mjs` and `workflow-state.mjs` do not exist.

- [ ] **Step 3: Extract path helpers with explicit roots**

Move these existing bodies:

```text
filesUnder                lines 70-81
pathExists                lines 302-310
assertManagedPath         lines 312-322
localPublicAssetPath      lines 324-327
stagedCalibrationPath     lines 491-501
stagedReplacementPath     lines 503-513
```

Change only `localPublicAssetPath` to receive `contentRoot` first:

```js
export function localPublicAssetPath(
  contentRoot,
  publicPath,
  prefix,
  label,
) {
  assertManagedPath(publicPath, prefix, label)
  return join(contentRoot, 'public', posix.relative('/', publicPath))
}
```

- [ ] **Step 4: Extract workflow-state helpers with dependency injection**

Move the existing allowed-status and user-source constants plus functions at original lines 329-489 into `workflow-state.mjs`. Import `readFile`, `readFileSync`, CSV helpers, media metadata, and path helpers there. Preserve all existing error strings.

Use these exact public signatures:

```js
export async function loadWorkflowState({ jsonPath, csvPath })
export function preservedWorkflowState(
  record,
  defaultReplacementPath,
  { manifestById, csvById },
)
export function supplementalRecordsForPage({
  page,
  pagePrefix,
  workflowState,
  contentRoot,
})
```

Update only the two call sites in the CLI to pass `{ jsonPath, csvPath }` and `{ page, pagePrefix, workflowState, contentRoot }`.

- [ ] **Step 5: Run all image-manifest tests and commit**

```bash
pnpm exec vitest run tests/image-manifest-modules.test.ts tests/image-manifest-generator.test.ts tests/image-manifest.test.ts
git diff --check
git add scripts/lib/image-manifest/paths.mjs scripts/lib/image-manifest/workflow-state.mjs scripts/build-image-manifest.mjs tests/image-manifest-modules.test.ts
git commit -m "refactor: isolate image manifest workflow state"
```

Expected: all focused tests PASS and no generated project file changes appear in `git status`.

### Task 3: Extract Atomic Replacement and Verify the CLI Contract

**Files:**
- Create: `scripts/lib/image-manifest/atomic-replace.mjs`
- Modify: `tests/image-manifest-modules.test.ts`
- Modify: `scripts/build-image-manifest.mjs`

**Interfaces:**
- Produces: `replaceCandidatesAtomically(candidates, stagingRoot)`.
- Consumes: candidate objects shaped `{ candidate: string, target: string }`.
- Keeps orchestration, configuration constants, page mapping, Markdown rewriting, record validation, and final console output in `build-image-manifest.mjs`.

- [ ] **Step 1: Add a failing atomic rollback unit test**

Extend the test imports and add a dedicated cleanup list:

```ts
import {
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach } from 'vitest'

const atomicFixtureRoots: string[] = []

afterEach(() => {
  while (atomicFixtureRoots.length > 0) {
    rmSync(atomicFixtureRoots.pop()!, { recursive: true, force: true })
  }
})
```

Then append the rollback case:

```ts
import { replaceCandidatesAtomically } from '../scripts/lib/image-manifest/atomic-replace.mjs'

it('restores an earlier target when a later candidate cannot be renamed', async () => {
  const root = mkdtempSync(join(tmpdir(), 'workbuddy-atomic-'))
  atomicFixtureRoots.push(root)
  const firstCandidate = join(root, 'first-candidate.txt')
  const firstTarget = join(root, 'first-target.txt')
  const missingCandidate = join(root, 'missing.txt')
  const secondTarget = join(root, 'second-target.txt')
  writeFileSync(firstCandidate, 'new first')
  writeFileSync(firstTarget, 'old first')

  await expect(replaceCandidatesAtomically([
    { candidate: firstCandidate, target: firstTarget },
    { candidate: missingCandidate, target: secondTarget },
  ], root)).rejects.toThrow()

  expect(readFileSync(firstTarget, 'utf8')).toBe('old first')
})
```

- [ ] **Step 2: Run the case and verify RED**

```bash
pnpm exec vitest run tests/image-manifest-modules.test.ts
```

Expected: FAIL because `atomic-replace.mjs` does not exist.

- [ ] **Step 3: Move the atomic replacement implementation verbatim**

Move original lines 515-542 into `scripts/lib/image-manifest/atomic-replace.mjs`. Import `mkdir`, `rename`, and `rm` from `node:fs/promises`, `dirname` from `node:path`, and `pathExists` from `./paths.mjs`. Export:

```js
export async function replaceCandidatesAtomically(candidates, stagingRoot)
```

Import it from the CLI and remove only the old local definition.

- [ ] **Step 4: Snapshot real generated inputs before and after a no-op run**

Run the existing successful-rerun and rollback integration cases:

```bash
pnpm exec vitest run tests/image-manifest-modules.test.ts tests/image-manifest-generator.test.ts tests/image-manifest.test.ts
```

Expected: all tests PASS, including:

```text
leaves existing outputs and Markdown unchanged when a source asset is missing
preserves workflow state and keeps advanced Markdown on replacement paths
rolls back replacement slot scaffolding when a late swap fails
produces identical outputs on a successful rerun
preserves a user-provided image missing from upstream in Markdown order
```

- [ ] **Step 5: Run full verification and inspect generated-file cleanliness**

```bash
pnpm test
pnpm run check:assets
pnpm run build
git status --short
git diff --check
```

Expected: all checks PASS. No Markdown, manifest JSON, manifest CSV, calibration asset, replacement asset, or public URL changes are present.

- [ ] **Step 6: Commit the final module boundary**

```bash
git add scripts/lib/image-manifest/atomic-replace.mjs scripts/build-image-manifest.mjs tests/image-manifest-modules.test.ts
git diff --cached --check
git commit -m "refactor: preserve atomic image manifest writes"
```
