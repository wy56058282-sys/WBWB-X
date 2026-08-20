# Core Experience Quality Baseline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build reproducible static, browser, Lighthouse, and resource-usage audits for the five approved routes, then record the real pre-remediation baseline without changing page behavior.

**Architecture:** One JSON gate contract feeds focused ESM audit modules. A Node pipeline builds the site, owns a temporary production preview, runs deterministic checks, Playwright/axe, Lighthouse, and report generation, then always stops the preview. This is Plan 1 of three: Plan 1 records the baseline; findings-based Plan 2 fixes actual P0/P1 issues; Plan 3 approves budgets and enforces the gate in CI.

**Tech Stack:** Node.js 24 in CI, Node.js 20 minimum locally, pnpm 11.9.0, Vitest 2, jsdom 25, Playwright Chromium, axe-core, Lighthouse CI, VitePress 1.6.

**Spec:** `docs/superpowers/specs/2026-08-20-core-experience-quality-gates-design.md`

## Global Constraints

- Cover exactly `/`, `/wb-x/`, `/resources/`, `/help/`, and `/wb-x/reading-guide/`.
- Browser viewports are exactly desktop `1440 × 900` and mobile `390 × 844`.
- Preserve current visual style, content hierarchy, navigation, CTA destinations, canonical URLs, public URLs, and legacy redirects.
- Add Playwright, axe, and Lighthouse as development dependencies only.
- Keep `pnpm run check` unchanged.
- `pnpm run quality:baseline` records findings but fails on tool errors.
- `pnpm run check:quality` enforces findings and requires an approved `quality-budget.json`; do not add it to CI in this plan.
- Do not create `quality-budget.json` from pre-remediation values.
- Do not modify application source or CSS in this plan.
- Preserve existing untracked user files, especially `audit/adversarial-2026-08-10/`.
- Use TDD and make one commit per task.

## File Structure

- `quality-gates.json`: editable route, viewport, threshold, and third-party-block contract.
- `scripts/quality/config.mjs`: validates and exposes that contract.
- `scripts/quality/findings.mjs`: shared finding shape and ordering.
- `scripts/quality/static-audit.mjs`: generated HTML and SEO checks.
- `scripts/quality/resource-usage.mjs`: resource measurement and later budget comparison.
- `playwright.quality.config.ts` and `tests/quality/browser/core-routes.spec.ts`: browser matrix.
- `lighthouserc.desktop.cjs`, `lighthouserc.mobile.cjs`, and `scripts/quality/lighthouse-summary.mjs`: three-run performance collection and median evaluation.
- `scripts/quality/preview-server.mjs`, `report.mjs`, `run-quality.mjs`, and `scripts/check-quality.mjs`: owned preview and pipeline.
- `audit/2026-08-20-core-quality-baseline/`: generated, committed baseline summary.

---

### Task 1: Lock the quality gate contract

**Files:**
- Create: `quality-gates.json`
- Create: `scripts/quality/config.mjs`
- Test: `tests/quality-config.test.ts`

**Interfaces:**
- Produces: `loadQualityGates(path?) -> QualityGates`
- Produces: `routeOutputPath(routePath: string) -> string`

- [ ] **Step 1: Write the failing contract test**

Create `tests/quality-config.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { loadQualityGates, routeOutputPath } from '../scripts/quality/config.mjs'

describe('core quality gate contract', () => {
  it('locks the approved routes, viewports, and thresholds', () => {
    const gates = loadQualityGates()
    expect(gates.routes.map(({ path }) => path)).toEqual([
      '/', '/wb-x/', '/resources/', '/help/', '/wb-x/reading-guide/',
    ])
    expect(gates.viewports).toEqual({
      desktop: { width: 1440, height: 900 },
      mobile: { width: 390, height: 844 },
    })
    expect(gates.thresholds).toEqual({
      performance: { desktop: 0.9, mobile: 0.8 },
      accessibility: 0.95,
      seo: 0.95,
      bestPractices: 0.95,
      lcpMs: 2500,
      cls: 0.1,
      tbtMs: 200,
      maxChunkBytes: 500_000,
    })
    expect(gates.resourceGrowthAllowance).toBe(0.02)
  })

  it.each([
    ['/', 'index.html'],
    ['/wb-x/', 'wb-x/index.html'],
    ['/resources/', 'resources/index.html'],
    ['/help/', 'help/index.html'],
    ['/wb-x/reading-guide/', 'wb-x/reading-guide/index.html'],
  ])('maps %s to %s', (route, output) => {
    expect(routeOutputPath(route)).toBe(output)
  })

  it('rejects an unreadable contract', () => {
    expect(() => loadQualityGates('tests/fixtures/missing-quality-gates.json'))
      .toThrow(/quality gate contract/i)
  })
})
```

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run tests/quality-config.test.ts
```

Expected: FAIL because `scripts/quality/config.mjs` does not exist.

- [ ] **Step 3: Create the exact contract**

Create `quality-gates.json`:

```json
{
  "origin": "https://wbx.sparkx.zone",
  "routes": [
    { "path": "/", "marker": "WorkBuddy小白书", "focusTargets": ["/resources/", "/wb-x/reading-guide/"] },
    { "path": "/wb-x/", "marker": "27 章", "focusTargets": ["/resources/"] },
    { "path": "/resources/", "marker": "资料整理中。", "focusTargets": ["/"] },
    { "path": "/help/", "marker": "45 分钟", "focusTargets": ["/resources/"] },
    { "path": "/wb-x/reading-guide/", "marker": "从入门到团队落地", "focusTargets": ["/resources/"] }
  ],
  "viewports": {
    "desktop": { "width": 1440, "height": 900 },
    "mobile": { "width": 390, "height": 844 }
  },
  "thresholds": {
    "performance": { "desktop": 0.9, "mobile": 0.8 },
    "accessibility": 0.95,
    "seo": 0.95,
    "bestPractices": 0.95,
    "lcpMs": 2500,
    "cls": 0.1,
    "tbtMs": 200,
    "maxChunkBytes": 500000
  },
  "resourceGrowthAllowance": 0.02,
  "blockedThirdPartyPatterns": ["https://hm.baidu.com/*", "https://cloud.umami.is/*"]
}
```

- [ ] **Step 4: Implement validation and mapping**

Create `scripts/quality/config.mjs`:

```js
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))))
const approvedRoutes = ['/', '/wb-x/', '/resources/', '/help/', '/wb-x/reading-guide/']

export function routeOutputPath(routePath) {
  if (!approvedRoutes.includes(routePath)) {
    throw new Error(`quality gate contract contains an unsupported route: ${routePath}`)
  }
  return routePath === '/' ? 'index.html' : `${routePath.slice(1)}index.html`
}

export function loadQualityGates(path = resolve(repositoryRoot, 'quality-gates.json')) {
  let gates
  try {
    gates = JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    throw new Error(`quality gate contract cannot be read: ${error.message}`)
  }
  const routes = gates.routes?.map(({ path: routePath }) => routePath)
  if (JSON.stringify(routes) !== JSON.stringify(approvedRoutes)
    || new Set(routes).size !== approvedRoutes.length
    || gates.origin !== 'https://wbx.sparkx.zone') {
    throw new Error('quality gate contract does not match the approved scope')
  }
  return {
    ...gates,
    routes: gates.routes.map((route) => ({ ...route, output: routeOutputPath(route.path) })),
  }
}
```

Add explicit validation for every threshold, viewport dimension, marker, focus target, growth allowance, and block pattern. Reject non-finite numbers, empty strings, unknown keys, duplicate targets, and paths that do not begin and end with `/`.

- [ ] **Step 5: Run GREEN and full checks**

```bash
pnpm exec vitest run tests/quality-config.test.ts
pnpm run check
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add quality-gates.json scripts/quality/config.mjs tests/quality-config.test.ts
git commit -m "test: define core quality gate contract"
```

---

### Task 2: Build the static HTML auditor

**Files:**
- Create: `scripts/quality/findings.mjs`
- Create: `scripts/quality/static-audit.mjs`
- Test: `tests/quality-static-audit.test.ts`

**Interfaces:**
- Produces: `createFinding(input) -> QualityFinding`
- Produces: `blockingFindings(findings) -> QualityFinding[]`
- Produces: `auditStaticBuild({ distRoot, gates }) -> Promise<QualityFinding[]>`
- `QualityFinding` fields: `layer`, `rule`, `severity`, `path`, `viewport`, `expected`, `actual`, `evidence`.

- [ ] **Step 1: Write fixture-driven failing tests**

Create `tests/quality-static-audit.test.ts` using `mkdtempSync()` fixtures. A valid fixture for every route is:

```ts
function validHtml(route: { path: string; marker: string }) {
  return `<!doctype html><html lang="zh-CN"><head>
    <title>${route.marker}</title>
    <meta name="description" content="A complete description">
    <link rel="canonical" href="https://wbx.sparkx.zone${route.path}">
  </head><body><header></header><nav></nav><main>
    <h1>${route.marker}</h1><p>${route.marker}</p>
  </main><footer></footer></body></html>`
}
```

Assert the valid matrix returns `[]`. For `<html><head><title></title></head><body><h1>A</h1><h1>B</h1></body></html>`, assert sorted rules equal:

```ts
[
  'canonical', 'description', 'footer-landmark', 'header-landmark',
  'main-landmark', 'marker', 'navigation-landmark', 'single-h1', 'title',
]
```

Add cases for missing output, wrong canonical, missing marker, decorative `alt=""`, non-decorative missing alt, and missing positive numeric image width/height.

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run tests/quality-static-audit.test.ts
```

Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement finding helpers**

Create `scripts/quality/findings.mjs`:

```js
const order = new Map([['P0', 0], ['P1', 1], ['P2', 2]])

export function createFinding(input) {
  if (!order.has(input.severity)) throw new Error(`unsupported quality severity: ${input.severity}`)
  return {
    layer: input.layer,
    rule: input.rule,
    severity: input.severity,
    path: input.path,
    viewport: input.viewport ?? null,
    expected: String(input.expected),
    actual: String(input.actual),
    evidence: input.evidence ?? null,
  }
}

export function sortFindings(findings) {
  return [...findings].sort((a, b) =>
    order.get(a.severity) - order.get(b.severity)
    || a.path.localeCompare(b.path)
    || a.rule.localeCompare(b.rule))
}

export function blockingFindings(findings) {
  return sortFindings(findings).filter(({ severity }) => severity === 'P0' || severity === 'P1')
}
```

- [ ] **Step 4: Implement `auditStaticBuild`**

Use the existing `jsdom` dependency. For each route, read `resolve(distRoot, route.output)` and enforce title, description, canonical `${gates.origin}${route.path}`, exactly one H1, header/nav/main/footer, normalized marker text, and the image rules from Step 1. Missing output, canonical, and marker are P0; other rules are P1. Return sorted findings and never call `process.exit()`.

Core rules:

```js
const rules = {
  title: (document) => document.title.trim().length > 0,
  description: (document) => Boolean(document.querySelector('meta[name="description"]')?.content?.trim()),
  'single-h1': (document) => document.querySelectorAll('h1').length === 1,
  'header-landmark': (document) => Boolean(document.querySelector('header')),
  'navigation-landmark': (document) => Boolean(document.querySelector('nav')),
  'main-landmark': (document) => Boolean(document.querySelector('main')),
  'footer-landmark': (document) => Boolean(document.querySelector('footer')),
}
```

- [ ] **Step 5: Run GREEN and full checks**

```bash
pnpm exec vitest run tests/quality-static-audit.test.ts tests/quality-config.test.ts
pnpm run check
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/quality/findings.mjs scripts/quality/static-audit.mjs tests/quality-static-audit.test.ts
git commit -m "feat: audit static page quality contracts"
```

---

### Task 3: Collect resource usage without approving a budget

**Files:**
- Create: `scripts/quality/resource-usage.mjs`
- Test: `tests/quality-resource-usage.test.ts`

**Interfaces:**
- Produces: `collectResourceUsage({ distRoot, gates }) -> Promise<ResourceUsage>`
- Produces: `compareResourceBudget({ usage, budget, allowance }) -> QualityFinding[]`
- `ResourceUsage` contains `routes`, `shared`, `largestChunk`, and `blockedThirdPartyRequests`.

- [ ] **Step 1: Write failing fixture tests**

Create a temporary dist with one route referencing two scripts, one stylesheet, a font from CSS, and one image. Use known byte strings and assert exact deduplicated totals:

```ts
expect(await collectResourceUsage({ distRoot, gates })).toEqual({
  routes: { '/': { javascript: 12, css: 8, fonts: 6, images: 10 } },
  shared: { javascript: 12, css: 8, fonts: 6, images: 10 },
  largestChunk: { path: 'assets/app.js', bytes: 12 },
  blockedThirdPartyRequests: [],
})
```

Add budget cases proving exact budget and 2% growth pass, growth above 2% emits P1 `resource-growth`, a chunk above 500000 bytes emits P1 `max-chunk-size`, and malformed budget throws `quality budget is invalid`.

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run tests/quality-resource-usage.test.ts
```

Expected: FAIL because `resource-usage.mjs` does not exist.

- [ ] **Step 3: Implement collection and comparison**

Use JSDOM to resolve same-origin `<script src>`, stylesheet `<link href>`, and `<img src>` references. Parse CSS `url(...)` references for fonts and images. Resolve every path under `distRoot` and reject traversal. Ignore `data:` and `blob:` references. Record configured third-party matches without fetching them.

Use this exact comparison:

```js
const allowedBytes = Math.floor(budgetBytes * (1 + allowance))
if (actualBytes > allowedBytes) {
  findings.push(createFinding({
    layer: 'resource',
    rule: 'resource-growth',
    severity: 'P1',
    path: routePath,
    expected: `<= ${allowedBytes} bytes`,
    actual: `${actualBytes} bytes`,
  }))
}
```

Do not create `quality-budget.json`.

- [ ] **Step 4: Run GREEN and full checks**

```bash
pnpm exec vitest run tests/quality-resource-usage.test.ts tests/quality-static-audit.test.ts
pnpm run check
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/quality/resource-usage.mjs tests/quality-resource-usage.test.ts
git commit -m "feat: measure core route resource usage"
```

---

### Task 4: Add the Playwright and axe browser matrix

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `vitest.config.ts`
- Modify: `tests/vitest-config.test.ts`
- Create: `playwright.quality.config.ts`
- Create: `tests/quality/browser/core-routes.spec.ts`
- Test: `tests/quality-browser-contract.test.ts`

**Interfaces:**
- Consumes: `loadQualityGates()`.
- Produces: Playwright projects `desktop` and `mobile`.
- Produces: `.quality-artifacts/playwright/results.json`, traces, and failure screenshots.

- [ ] **Step 1: Write the failing dependency/config contract**

Create `tests/quality-browser-contract.test.ts`:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('quality browser contract', () => {
  it('keeps browser tooling development-only', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
    expect(pkg.dependencies ?? {}).not.toHaveProperty('@playwright/test')
    expect(pkg.dependencies ?? {}).not.toHaveProperty('@axe-core/playwright')
    expect(pkg.devDependencies).toHaveProperty('@playwright/test')
    expect(pkg.devDependencies).toHaveProperty('@axe-core/playwright')
  })

  it('defines exact viewports and failure artifacts', () => {
    const source = readFileSync('playwright.quality.config.ts', 'utf8')
    const suite = readFileSync('tests/quality/browser/core-routes.spec.ts', 'utf8')
    expect(source).toContain("name: 'desktop'")
    expect(source).toContain('width: 1440, height: 900')
    expect(source).toContain("name: 'mobile'")
    expect(source).toContain('width: 390, height: 844')
    expect(source).toContain("trace: 'retain-on-failure'")
    expect(source).toContain("screenshot: 'only-on-failure'")
    expect(suite).toContain('WB_QUALITY_MODE')
    expect(suite).toContain('testInfo.attach')
  })
})
```

Also append this case to the existing `tests/vitest-config.test.ts`:

```ts
it('excludes Playwright quality suites from Vitest', () => {
  expect(config).toMatch(
    /exclude:\s*\[[\s\S]*?['"]tests\/quality\/browser\/\*\*['"]/,
  )
})
```

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run tests/quality-browser-contract.test.ts
```

Expected: FAIL because dependencies and config are absent.

- [ ] **Step 3: Add development-only browser dependencies**

```bash
pnpm add --save-dev @playwright/test @axe-core/playwright
pnpm exec playwright install chromium
```

Expected: package metadata and lockfile change; the browser binary remains untracked.

- [ ] **Step 4: Create the Playwright config**

Create `playwright.quality.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

const baseURL = process.env.WB_QUALITY_ORIGIN
if (!baseURL) throw new Error('WB_QUALITY_ORIGIN is required')

export default defineConfig({
  testDir: 'tests/quality/browser',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['line'],
    ['json', { outputFile: '.quality-artifacts/playwright/results.json' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
})
```

Add `'tests/quality/browser/**'` to `test.exclude` in `vitest.config.ts`. Preserve the existing `.worktrees` and `.pnpm-store` exclusions. This makes Vitest own `*.test.ts` and Playwright own only `tests/quality/browser/*.spec.ts`.

- [ ] **Step 5: Write the browser matrix**

Create `tests/quality/browser/core-routes.spec.ts`. Read `WB_QUALITY_MODE`, defaulting to `gate`. For each configured route, collect console errors, abort only the configured analytics hosts, navigate with `networkidle`, measure marker/H1/overflow/focus/reduced-motion/axe results, and convert failures into the shared `QualityFinding` shape.

```ts
const mode = process.env.WB_QUALITY_MODE ?? 'gate'
const axe = await new AxeBuilder({ page }).analyze()
const seriousViolations = axe.violations.filter(({ impact }) =>
  impact === 'critical' || impact === 'serious')
if (seriousViolations.length > 0) {
  findings.push({
    layer: 'browser',
    rule: 'axe-serious',
    severity: 'P1',
    path: route.path,
    viewport: testInfo.project.name,
    expected: '0 critical or serious violations',
    actual: `${seriousViolations.length} violations`,
    evidence: seriousViolations,
  })
}
await testInfo.attach('quality-findings', {
  body: Buffer.from(JSON.stringify(findings)),
  contentType: 'application/json',
})
if (mode === 'gate') expect(findings).toEqual([])
```

Add a helper that presses `Tab` up to 40 times and records P1 for each focus target href that never becomes active with visible `outline` or `box-shadow`. Add `page.emulateMedia({ reducedMotion: 'reduce' })` and record P1 when a running CSS animation still has non-zero duration and infinite iterations after settling. Record console errors as P1. Marker absence and navigation failure are P0. The JSON reporter retains the attachment; `run-quality.mjs` parses every `quality-findings` attachment into the combined result.

- [ ] **Step 6: Verify the contract and list the matrix**

```bash
pnpm exec vitest run tests/quality-browser-contract.test.ts
WB_QUALITY_ORIGIN=http://127.0.0.1:4173 pnpm exec playwright test -c playwright.quality.config.ts --list
```

Expected: Vitest passes and Playwright lists 10 route/project tests. Do not use the current preview as baseline evidence.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts tests/vitest-config.test.ts playwright.quality.config.ts tests/quality/browser/core-routes.spec.ts tests/quality-browser-contract.test.ts
git commit -m "test: add core route browser quality matrix"
```

---

### Task 5: Collect Lighthouse runs and compute medians

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `lighthouserc.desktop.cjs`
- Create: `lighthouserc.mobile.cjs`
- Create: `scripts/quality/lighthouse-summary.mjs`
- Test: `tests/quality-lighthouse-summary.test.ts`

**Interfaces:**
- Produces: `median(values: number[]) -> number`
- Produces: `summarizeLighthouse({ reportRoots, gates }) -> { samples, medians, findings }`
- Requires exactly 30 samples: five routes × two form factors × three runs.

- [ ] **Step 1: Write failing summary tests**

Create synthetic LHR JSON fixtures. Assert `[70, 71, 99]` yields median `71`, all 30 samples are present, and scores or metrics outside thresholds emit P1 findings for `performance-score`, `accessibility-score`, `seo-score`, `best-practices-score`, `lcp`, `cls`, and `tbt`. Missing runs or malformed reports must throw tool errors.

```ts
expect(summary.medians['mobile:/'].performance).toBe(0.71)
expect(summary.findings.map(({ rule }) => rule)).toContain('performance-score')
expect(summary.samples).toHaveLength(30)
```

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run tests/quality-lighthouse-summary.test.ts
```

Expected: FAIL because the summary module does not exist.

- [ ] **Step 3: Add Lighthouse CI as a development dependency**

```bash
pnpm add --save-dev @lhci/cli
```

- [ ] **Step 4: Create desktop and mobile collection configs**

Each CJS config reads `quality-gates.json`, requires `WB_QUALITY_ORIGIN` and `CHROME_PATH`, collects every configured route three times, blocks configured third-party patterns, and uploads to filesystem under `.quality-artifacts/lighthouse/<form-factor>`.

Desktop settings:

```js
settings: {
  preset: 'desktop',
  screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
  blockedUrlPatterns: gates.blockedThirdPartyPatterns,
}
```

Mobile settings:

```js
settings: {
  formFactor: 'mobile',
  screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 1, disabled: false },
  throttlingMethod: 'simulate',
  blockedUrlPatterns: gates.blockedThirdPartyPatterns,
}
```

- [ ] **Step 5: Implement median summarization**

Read every `*.report.json`, validate `finalUrl`, categories, audits, and three-run cardinality. Group by `${formFactor}:${pathname}`. Use:

```js
export function median(values) {
  const ordered = [...values].sort((a, b) => a - b)
  if (ordered.length === 0) throw new Error('lighthouse sample set is empty')
  return ordered[Math.floor(ordered.length / 2)]
}
```

Compare median category scores, LCP, CLS, and TBT to the Task 1 contract. Page threshold failures are P1; missing or malformed samples are tool errors.

- [ ] **Step 6: Run GREEN and full checks**

```bash
pnpm exec vitest run tests/quality-lighthouse-summary.test.ts tests/quality-browser-contract.test.ts
pnpm run check
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml lighthouserc.desktop.cjs lighthouserc.mobile.cjs scripts/quality/lighthouse-summary.mjs tests/quality-lighthouse-summary.test.ts
git commit -m "feat: summarize lighthouse quality medians"
```

---

### Task 6: Build the owned preview and quality pipeline

**Files:**
- Create: `scripts/quality/preview-server.mjs`
- Create: `scripts/quality/report.mjs`
- Create: `scripts/quality/run-quality.mjs`
- Create: `scripts/check-quality.mjs`
- Create: `tests/quality-preview-server.test.ts`
- Create: `tests/quality-report.test.ts`
- Create: `tests/quality-pipeline.test.ts`
- Modify: `package.json`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `startPreview({ cwd, host, timeoutMs }) -> Promise<{ origin, stop }>`
- Produces: `writeQualityReport({ outputRoot, result }) -> Promise<{ jsonPath, markdownPath }>`
- Produces: `runQualityPipeline({ mode, outputRoot, repositoryRoot }, dependencies?) -> Promise<QualityResult>`
- CLI: `node scripts/check-quality.mjs --mode baseline|gate --output <path>`

- [ ] **Step 1: Write failing preview lifecycle tests**

Use a fixture HTTP child process and assert `startPreview()` returns after HTTP 200, `stop()` is idempotent, readiness timeout throws `quality preview did not become ready`, early exit throws `quality preview exited before readiness`, and every case leaves its reserved port free.

- [ ] **Step 2: Write failing report tests**

Given an unsorted result, assert stable JSON and Markdown sections in this exact order:

```text
Summary
Tool status
Blocking findings
Advisory findings
Route metrics
Resource usage
Blocked third-party requests
Evidence
```

The report must include mode, commit SHA, timestamp, route count, viewport count, sample count, P0/P1/P2 totals, expected/actual values, and evidence paths.

- [ ] **Step 3: Write failing pipeline tests with injected dependencies**

Inject fakes and assert this order:

```ts
expect(calls).toEqual([
  'build',
  'preview:start',
  'static',
  'browser',
  'lighthouse:desktop',
  'lighthouse:mobile',
  'resources',
  'report',
  'preview:stop',
])
```

Add cases proving baseline mode returns status 0 with findings; gate mode returns status 1 with P0/P1; gate mode throws a tool error when `quality-budget.json` is absent; baseline mode needs no budget; preview stops after every stage failure; report failure does not replace the original failure.

- [ ] **Step 4: Run RED**

```bash
pnpm exec vitest run tests/quality-preview-server.test.ts tests/quality-report.test.ts tests/quality-pipeline.test.ts
```

Expected: FAIL because pipeline modules do not exist.

- [ ] **Step 5: Implement preview ownership**

Reserve a loopback port using `node:net`, release the reservation, then spawn:

```text
pnpm exec vitepress preview docs --host 127.0.0.1 --port <reserved-port>
```

Poll `fetch(origin)` every 100 ms for at most 15 seconds. Capture stdout/stderr with a 1 MiB cap. `stop()` sends `SIGTERM` and waits 5 seconds. If it does not stop, return a tool error; do not kill unrelated processes or discover processes by port.

- [ ] **Step 6: Implement atomic reports**

`writeQualityReport()` writes sibling `.tmp` files and renames them. JSON uses two spaces and a final newline. Markdown and JSON come from the same in-memory result.

- [ ] **Step 7: Implement pipeline defaults and CLI**

Use these default dependencies:

```js
const defaultDependencies = {
  build: () => runCommand('pnpm', ['run', 'build']),
  startPreview,
  auditStaticBuild,
  runBrowserAudit: ({ origin, mode }) => runCommand('pnpm', [
    'exec', 'playwright', 'test', '-c', 'playwright.quality.config.ts',
  ], { env: { WB_QUALITY_ORIGIN: origin, WB_QUALITY_MODE: mode } }),
  runLighthouse: ({ origin, formFactor, chromePath }) => runCommand('pnpm', [
    'exec', 'lhci', 'collect', '--config', `lighthouserc.${formFactor}.cjs`,
  ], { env: { WB_QUALITY_ORIGIN: origin, CHROME_PATH: chromePath } }),
  collectResourceUsage,
  summarizeLighthouse,
  writeQualityReport,
}
```

Resolve `chromePath` through `chromium.executablePath()` from `@playwright/test`. Validate CLI mode and output before building. Baseline mode reports P0/P1 but exits 0 unless a tool fails. Gate mode requires `quality-budget.json`, compares it, and exits 1 for P0/P1.

- [ ] **Step 8: Add scripts and ignore generated artifacts**

Add to `package.json` without changing `check`:

```json
"quality:baseline": "node scripts/check-quality.mjs --mode baseline --output audit/2026-08-20-core-quality-baseline",
"check:quality": "node scripts/check-quality.mjs --mode gate --output .quality-artifacts/latest"
```

Add to `.gitignore`:

```text
# Generated quality-browser artifacts
.quality-artifacts/
playwright-report/
test-results/
.lighthouseci/
```

- [ ] **Step 9: Run GREEN and full checks**

```bash
pnpm exec vitest run tests/quality-preview-server.test.ts tests/quality-report.test.ts tests/quality-pipeline.test.ts
pnpm run check
```

Expected: all pass; artifacts remain ignored.

- [ ] **Step 10: Commit**

```bash
git add scripts/quality/preview-server.mjs scripts/quality/report.mjs scripts/quality/run-quality.mjs scripts/check-quality.mjs tests/quality-preview-server.test.ts tests/quality-report.test.ts tests/quality-pipeline.test.ts package.json .gitignore
git commit -m "feat: orchestrate core quality baseline audits"
```

---

### Task 7: Record the real baseline and update guidance

**Files:**
- Create from pipeline: `audit/2026-08-20-core-quality-baseline/summary.json`
- Create from pipeline: `audit/2026-08-20-core-quality-baseline/summary.md`
- Modify: `docs/maintenance/README.md`
- Modify: `docs/maintenance/future-optimizations.md`
- Test: `tests/quality-baseline-contract.test.ts`

**Interfaces:**
- Consumes: `pnpm run quality:baseline`
- Produces: exactly 10 browser samples and 30 Lighthouse samples.
- Produces: the ordered P0/P1/P2 findings used by the next plan.

- [ ] **Step 1: Write the failing evidence contract**

Create `tests/quality-baseline-contract.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const root = 'audit/2026-08-20-core-quality-baseline'

describe('core quality baseline evidence', () => {
  it('records the complete approved matrix', () => {
    expect(existsSync(`${root}/summary.json`)).toBe(true)
    expect(existsSync(`${root}/summary.md`)).toBe(true)
    const summary = JSON.parse(readFileSync(`${root}/summary.json`, 'utf8'))
    expect(summary.mode).toBe('baseline')
    expect(summary.scope).toMatchObject({ routeCount: 5, viewportCount: 2 })
    expect(summary.browser.samples).toHaveLength(10)
    expect(summary.lighthouse.samples).toHaveLength(30)
    expect(Object.keys(summary.resourceUsage.routes)).toHaveLength(5)
  })

  it('documents that enforcement waits for remediation', () => {
    const guide = readFileSync('docs/maintenance/README.md', 'utf8')
    expect(guide).toContain('pnpm run quality:baseline')
    expect(guide).toContain('pnpm run check:quality')
    expect(guide).toContain('基线记录不等于质量通过')
  })
})
```

Add an assertion that findings are sorted by P0/P1/P2, then route, then rule.

- [ ] **Step 2: Run RED**

```bash
pnpm exec vitest run tests/quality-baseline-contract.test.ts
```

Expected: FAIL because evidence does not exist.

- [ ] **Step 3: Run the real production baseline**

```bash
pnpm run quality:baseline
```

Expected: exit 0 if tools complete, create both summaries, record 10 browser and 30 Lighthouse samples, and leave no owned preview running. If a tool fails, use `superpowers:systematic-debugging`, repair it through RED/GREEN, and rerun the entire baseline. Do not classify tool failure as a page finding.

- [ ] **Step 4: Update maintenance docs from measured evidence**

Add `核心体验质量` to `docs/maintenance/README.md` with both commands and this exact statement:

```text
基线记录不等于质量通过；只有 P0/P1 修复、正式预算批准和 CI 门禁接入完成后，check:quality 才是发布门禁。
```

Replace the future-optimization baseline paragraph with a link to the committed summary and state that P0/P1 items require a findings-based remediation plan. Do not duplicate changing metric values in the guide.

- [ ] **Step 5: Verify the evidence and repository boundaries**

```bash
pnpm exec vitest run tests/quality-baseline-contract.test.ts tests/quality-pipeline.test.ts tests/quality-lighthouse-summary.test.ts
pnpm run check
git diff --check
git status --short --branch
```

Expected: focused tests and full checks pass; only pre-existing unrelated `audit/adversarial-2026-08-10/` remains untracked.

- [ ] **Step 6: Commit**

```bash
git add audit/2026-08-20-core-quality-baseline/summary.json audit/2026-08-20-core-quality-baseline/summary.md docs/maintenance/README.md docs/maintenance/future-optimizations.md tests/quality-baseline-contract.test.ts
git commit -m "docs: record core experience quality baseline"
```

- [ ] **Step 7: Stop and hand off measured findings**

Report P0/P1/P2 counts; every P0/P1 grouped by route and layer; median scores and LCP/CLS/TBT; largest resource contributors and chunk; blocked third-party endpoints; and tool limitations. Do not fix page source, approve a budget, or edit deployment CI in this plan.

## Plan-Level Verification

Run:

```bash
pnpm run check
pnpm run quality:baseline
pnpm exec vitest run tests/quality-config.test.ts tests/quality-static-audit.test.ts tests/quality-resource-usage.test.ts tests/quality-browser-contract.test.ts tests/quality-lighthouse-summary.test.ts tests/quality-preview-server.test.ts tests/quality-report.test.ts tests/quality-pipeline.test.ts tests/quality-baseline-contract.test.ts
git diff --check
git status --short --branch
```

Acceptance evidence must show all deterministic tests and the build pass; baseline mode records 10 browser and 30 Lighthouse samples; the owned preview stops; no `quality-budget.json` exists; deployment CI and application source/CSS remain unchanged; unrelated user evidence remains preserved.

## Program Handoff

Use the committed findings to write Plan 2 with exact page files, exact failing checks, and one task per P0/P1 cluster. After Plan 2 reaches all thresholds, write Plan 3 to approve `quality-budget.json`, enable `check:quality`, install Chromium in CI, upload failure artifacts, and require the gate before Pages upload.
