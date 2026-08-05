# WorkBuddy WB-X Technical Foundation Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the confirmed 390px regressions, deterministic test discovery, crawler discovery files, and GitHub Pages-compatible `/bluebook/` redirects without changing unfinished visual or editorial work.

**Architecture:** Keep the existing VitePress site and deployment workflow. Add small deterministic Node generators for sitemap and static legacy pages, wire them into `prebuild`, and protect every behavior with root-scoped Vitest tests before changing production files.

**Tech Stack:** Node.js 20+, pnpm 11.9.0, VitePress 1.6.4, Vue 3, TypeScript, Vitest 2, CSS.

## Global Constraints

- Preserve the existing GitHub Pages deployment workflow.
- Preserve pnpm 11.9.0 and the current VitePress stack.
- Preserve `https://wbwbx.sparkx.zone` as the production origin.
- Do not overwrite or reformat unrelated uncommitted reading-system changes.
- Do not change the desktop homepage composition.
- Do not add a runtime service or client framework.
- Generated legacy pages must use `noindex` and canonical `/wb-x/` destinations.
- Defer case-index redesign, chapter copy, bulk alt text, image compression, asset relocation, and Git-history rewriting.

---

## File Structure

- `tests/mobile-home-layout.test.ts`: regression assertions for 390px homepage and narrow header CSS.
- `tests/vitest-scope.test.ts`: asserts deterministic Vitest include and exclude rules.
- `tests/site-route-generator.test.ts`: exercises route discovery and sitemap generation against temporary docs trees.
- `tests/legacy-static-pages.test.ts`: exercises legacy static-page generation against temporary public roots.
- `docs/.vitepress/theme/home.css`: mobile-only hero wrapping rule.
- `docs/.vitepress/theme/custom.css`: narrow-header sizing rule.
- `vitest.config.ts`: root test discovery contract.
- `scripts/site-routes.mjs`: pure route discovery, normalization, sorting, and XML escaping helpers.
- `scripts/generate-sitemap.mjs`: sitemap XML creation and safe file output.
- `scripts/generate-legacy-pages.mjs`: safe, generated-only legacy redirect subtree creation.
- `scripts/prepare-site.mjs`: runs both generators for production builds.
- `docs/public/robots.txt`: static crawler policy and sitemap declaration.
- `.gitignore`: ignores generated sitemap and legacy public subtree.
- `package.json`: adds `prepare:site` and `prebuild` integration.

---

### Task 1: Deterministic Vitest Discovery

**Files:**
- Create: `tests/vitest-scope.test.ts`
- Modify: `vitest.config.ts`

**Interfaces:**
- Consumes: Vitest's `defineConfig` test configuration.
- Produces: `test.include = ['tests/**/*.test.ts']` and explicit generated/cache exclusions.

- [ ] **Step 1: Write the failing configuration test**

```ts
import { describe, expect, it } from 'vitest'
import config from '../vitest.config'

describe('Vitest test discovery', () => {
  it('runs only root tests and excludes generated project copies', () => {
    const test = config.test

    expect(test?.include).toEqual(['tests/**/*.test.ts'])
    expect(test?.exclude).toEqual(
      expect.arrayContaining([
        'node_modules/**',
        '.pnpm-store/**',
        '.worktrees/**',
        'docs/.vitepress/cache/**',
        'docs/.vitepress/dist/**',
      ]),
    )
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run tests/vitest-scope.test.ts`

Expected: FAIL because `include` and `exclude` are undefined.

- [ ] **Step 3: Add the minimal discovery configuration**

```ts
test: {
  environment: 'jsdom',
  include: ['tests/**/*.test.ts'],
  exclude: [
    'node_modules/**',
    '.pnpm-store/**',
    '.worktrees/**',
    'docs/.vitepress/cache/**',
    'docs/.vitepress/dist/**',
  ],
},
```

- [ ] **Step 4: Verify GREEN and normal discovery**

Run: `pnpm vitest run tests/vitest-scope.test.ts && pnpm test`

Expected: PASS; output lists only files under the root `tests/` directory.

- [ ] **Step 5: Commit only this task's files**

```bash
git add vitest.config.ts tests/vitest-scope.test.ts
git commit -m "test: scope Vitest to root suite"
```

---

### Task 2: 390px Homepage and Header Regression

**Files:**
- Create: `tests/mobile-home-layout.test.ts`
- Modify: `docs/.vitepress/theme/home.css`
- Modify: `docs/.vitepress/theme/custom.css`

**Interfaces:**
- Consumes: existing `.wbx-hero__copy h1` and `.VPNavBarTitle .title` selectors.
- Produces: mobile-only wrapping and a narrow header-title width contract.

- [ ] **Step 1: Write the failing CSS regression tests**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('390px homepage layout', () => {
  it('allows the hero title to wrap below 760px', () => {
    const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')

    expect(css).toMatch(
      /@media \(max-width: 760px\)[\s\S]*?\.wbx-hero__copy h1\s*\{[^}]*white-space:\s*normal;[^}]*overflow-wrap:\s*anywhere;/s,
    )
  })

  it('reserves room for search and menu controls at 420px and below', () => {
    const css = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')

    expect(css).toMatch(
      /@media \(max-width: 420px\)[\s\S]*?\.VPNavBarTitle\s*\{[^}]*max-width:\s*calc\(100% - 112px\);/s,
    )
    expect(css).toMatch(
      /@media \(max-width: 420px\)[\s\S]*?\.VPNavBarTitle \.title\s*\{[^}]*overflow:\s*hidden;[^}]*text-overflow:\s*ellipsis;[^}]*white-space:\s*nowrap;/s,
    )
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run tests/mobile-home-layout.test.ts`

Expected: FAIL because neither mobile contract exists.

- [ ] **Step 3: Add the minimal mobile hero rule**

Inside the existing `@media (max-width: 760px)` block:

```css
.wbx-hero__copy h1 {
  white-space: normal;
  overflow-wrap: anywhere;
}
```

- [ ] **Step 4: Add the narrow-header constraint**

Append to `custom.css` without changing desktop selectors:

```css
@media (max-width: 420px) {
  .VPNavBarTitle {
    max-width: calc(100% - 112px);
    min-width: 0;
  }

  .VPNavBarTitle .title {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
```

- [ ] **Step 5: Verify GREEN and existing homepage tests**

Run: `pnpm vitest run tests/mobile-home-layout.test.ts tests/home-hero-icons.test.ts tests/brand.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit only this task's files**

```bash
git add docs/.vitepress/theme/home.css docs/.vitepress/theme/custom.css tests/mobile-home-layout.test.ts
git commit -m "fix: keep mobile homepage within viewport"
```

---

### Task 3: Sitemap and Robots Discovery

**Files:**
- Create: `tests/site-route-generator.test.ts`
- Create: `scripts/site-routes.mjs`
- Create: `scripts/generate-sitemap.mjs`
- Create: `docs/public/robots.txt`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `discoverSiteRoutes(docsRoot: string): string[]`.
- Produces: `routeForMarkdown(relativePath: string): string`.
- Produces: `sitemapXml(routes: string[], origin: string): string`.
- Produces CLI: `node scripts/generate-sitemap.mjs [docsRoot] [outputPath] [origin]`.

- [ ] **Step 1: Write failing route and sitemap tests**

```ts
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  discoverSiteRoutes,
  routeForMarkdown,
  sitemapXml,
} from '../scripts/site-routes.mjs'

describe('site route generation', () => {
  it('maps VitePress Markdown paths to clean routes', () => {
    expect(routeForMarkdown('index.md')).toBe('/')
    expect(routeForMarkdown('reading-guide.md')).toBe('/reading-guide')
    expect(routeForMarkdown('wb-x/index.md')).toBe('/wb-x/')
  })

  it('sorts public routes and excludes internal specs and public assets', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbx-routes-'))
    mkdirSync(join(root, 'wb-x'), { recursive: true })
    mkdirSync(join(root, 'superpowers/specs'), { recursive: true })
    mkdirSync(join(root, 'public'), { recursive: true })
    writeFileSync(join(root, 'index.md'), '# Home')
    writeFileSync(join(root, 'wb-x/index.md'), '# Book')
    writeFileSync(join(root, 'superpowers/specs/internal.md'), '# Internal')
    writeFileSync(join(root, 'public/asset.md'), '# Asset')

    expect(discoverSiteRoutes(root)).toEqual(['/', '/wb-x/'])
  })

  it('escapes, sorts, and deduplicates sitemap locations', () => {
    expect(sitemapXml(['/b?a=1&b=2', '/', '/'], 'https://example.com')).toBe(
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
        '  <url><loc>https://example.com/</loc></url>\n' +
        '  <url><loc>https://example.com/b?a=1&amp;b=2</loc></url>\n' +
        '</urlset>\n',
    )
  })
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `pnpm vitest run tests/site-route-generator.test.ts`

Expected: FAIL because `scripts/site-routes.mjs` does not exist.

- [ ] **Step 3: Implement route discovery and serialization**

Create `scripts/site-routes.mjs` with recursive directory traversal that:

```js
export function routeForMarkdown(relativePath) {
  const normalized = relativePath.split('\\').join('/')
  if (normalized === 'index.md') return '/'
  if (normalized.endsWith('/index.md')) {
    return `/${normalized.slice(0, -'index.md'.length)}`
  }
  return `/${normalized.slice(0, -'.md'.length)}`
}
```

`discoverSiteRoutes` must skip directory names `public`, `.vitepress`, and `superpowers`, return Markdown routes only, then sort and deduplicate them. `sitemapXml` must XML-escape `&`, `<`, `>`, `'`, and `"` and normalize a trailing slash off the origin.

- [ ] **Step 4: Implement the safe sitemap CLI**

Create `scripts/generate-sitemap.mjs`. Resolve the docs root and output path, require the output path to equal `<docsRoot>/public/sitemap.xml`, create its parent, then write `sitemapXml(discoverSiteRoutes(docsRoot), origin)`.

Export `generateSitemap({ docsRoot, outputPath, origin })` for tests and run it when `import.meta.url === pathToFileURL(process.argv[1]).href`.

- [ ] **Step 5: Add crawler policy and ignore generated XML**

Create `docs/public/robots.txt`:

```text
User-agent: *
Allow: /

Sitemap: https://wbwbx.sparkx.zone/sitemap.xml
```

Append to `.gitignore`:

```gitignore
docs/public/sitemap.xml
docs/public/bluebook/
```

- [ ] **Step 6: Verify GREEN and generated content**

Run:

```bash
pnpm vitest run tests/site-route-generator.test.ts
node scripts/generate-sitemap.mjs
test -s docs/public/sitemap.xml
rg -n 'https://wbwbx.sparkx.zone/(wb-x/|cases/|help/)' docs/public/sitemap.xml
```

Expected: PASS; sitemap contains public routes and no `/superpowers/` URL.

- [ ] **Step 7: Commit only this task's source files**

Do not add the ignored generated `docs/public/sitemap.xml`.

```bash
git add .gitignore docs/public/robots.txt scripts/site-routes.mjs scripts/generate-sitemap.mjs tests/site-route-generator.test.ts
git commit -m "feat: generate crawler discovery files"
```

---

### Task 4: GitHub Pages Legacy Static Pages

**Files:**
- Create: `tests/legacy-static-pages.test.ts`
- Create: `scripts/generate-legacy-pages.mjs`

**Interfaces:**
- Consumes: `discoverSiteRoutes(docsRoot)` from Task 3.
- Produces: `legacyRouteFor(currentRoute: string): string | null`.
- Produces: `legacyRedirectHtml(target: string): string`.
- Produces: `generateLegacyPages({ docsRoot, outputRoot, origin }): string[]`.

- [ ] **Step 1: Write failing legacy generation tests**

```ts
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  generateLegacyPages,
  legacyRedirectHtml,
  legacyRouteFor,
} from '../scripts/generate-legacy-pages.mjs'

describe('legacy static pages', () => {
  it('maps the book overview and nested routes', () => {
    expect(legacyRouteFor('/wb-x/')).toBe('/bluebook/')
    expect(legacyRouteFor('/wb-x/第一篇/第 1 章/')).toBe(
      '/bluebook/第一篇/第 1 章/',
    )
    expect(legacyRouteFor('/cases/')).toBeNull()
  })

  it('emits noindex, canonical, fallback link, and query/hash preservation', () => {
    const html = legacyRedirectHtml('/wb-x/第一篇/')
    expect(html).toContain('<meta name="robots" content="noindex">')
    expect(html).toContain(
      '<link rel="canonical" href="https://wbwbx.sparkx.zone/wb-x/第一篇/">',
    )
    expect(html).toContain('location.search + location.hash')
    expect(html).toContain('href="/wb-x/第一篇/"')
  })

  it('writes overview and nested index.html files inside its output root', () => {
    const root = mkdtempSync(join(tmpdir(), 'wbx-legacy-'))
    const docsRoot = join(root, 'docs')
    const outputRoot = join(docsRoot, 'public/bluebook')
    mkdirSync(join(docsRoot, 'wb-x/第一篇'), { recursive: true })
    writeFileSync(join(docsRoot, 'wb-x/index.md'), '# Book')
    writeFileSync(join(docsRoot, 'wb-x/第一篇/index.md'), '# Part')

    const files = generateLegacyPages({
      docsRoot,
      outputRoot,
      origin: 'https://wbwbx.sparkx.zone',
    })

    expect(files).toHaveLength(2)
    expect(existsSync(join(outputRoot, 'index.html'))).toBe(true)
    expect(existsSync(join(outputRoot, '第一篇/index.html'))).toBe(true)
    expect(readFileSync(join(outputRoot, 'index.html'), 'utf8')).toContain(
      'url=/wb-x/',
    )
  })
})
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `pnpm vitest run tests/legacy-static-pages.test.ts`

Expected: FAIL because the generator does not exist.

- [ ] **Step 3: Implement route mapping and safe HTML generation**

Create `scripts/generate-legacy-pages.mjs` using `discoverSiteRoutes`. `legacyRouteFor` maps only `/wb-x/` routes. `legacyRedirectHtml` HTML-escapes the target and emits UTF-8, noindex, canonical, refresh, visible link, and this query/hash-preserving script:

```html
<script>location.replace("/wb-x/…" + location.search + location.hash)</script>
```

Serialize the script target with `JSON.stringify(target)` instead of interpolating raw content into JavaScript.

Export all three interfaces for tests. Add a CLI entry guarded by `import.meta.url === pathToFileURL(process.argv[1]).href`, using `docs` and `docs/public/bluebook` as defaults.

- [ ] **Step 4: Implement output-boundary checks and generation**

Require `outputRoot` to equal `<docsRoot>/public/bluebook`. If it exists, enumerate it without following symbolic links; abort if any entry is a symbolic link. Remove only that validated output root, recreate it, and write one `index.html` per mapped route.

- [ ] **Step 5: Verify GREEN and existing development redirect tests**

Run:

```bash
pnpm vitest run tests/legacy-static-pages.test.ts tests/legacy-routes.test.ts
node scripts/generate-legacy-pages.mjs
test -s docs/public/bluebook/index.html
```

Expected: PASS; overview and nested files exist.

- [ ] **Step 6: Commit only this task's source files**

Do not add ignored generated pages.

```bash
git add scripts/generate-legacy-pages.mjs tests/legacy-static-pages.test.ts
git commit -m "feat: generate GitHub Pages legacy routes"
```

---

### Task 5: Build Integration and Artifact Verification

**Files:**
- Create: `scripts/prepare-site.mjs`
- Create: `tests/site-prebuild.test.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: `generateSitemap` and `generateLegacyPages`.
- Produces CLI: `node scripts/prepare-site.mjs`.
- Produces package scripts `prepare:site` and `prebuild`.

- [ ] **Step 1: Write the failing package integration test**

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('site prebuild integration', () => {
  it('prepares sitemap and legacy pages before every production build', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'))

    expect(pkg.scripts['prepare:site']).toBe('node scripts/prepare-site.mjs')
    expect(pkg.scripts.prebuild).toBe('pnpm prepare:site')
    expect(pkg.scripts.build).toBe('vitepress build docs')
  })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm vitest run tests/site-prebuild.test.ts`

Expected: FAIL because `prepare:site` and `prebuild` are missing.

- [ ] **Step 3: Implement the prebuild orchestrator**

Create `scripts/prepare-site.mjs`:

```js
import { resolve } from 'node:path'
import { generateLegacyPages } from './generate-legacy-pages.mjs'
import { generateSitemap } from './generate-sitemap.mjs'

const docsRoot = resolve('docs')

generateSitemap({
  docsRoot,
  outputPath: resolve(docsRoot, 'public/sitemap.xml'),
  origin: 'https://wbwbx.sparkx.zone',
})

generateLegacyPages({
  docsRoot,
  outputRoot: resolve(docsRoot, 'public/bluebook'),
  origin: 'https://wbwbx.sparkx.zone',
})
```

Wrap failures once to print `SITE_PREPARE_FAILED: <message>` and set a non-zero exit status.

- [ ] **Step 4: Wire generation into package scripts**

Add without changing the existing `build` command:

```json
"prepare:site": "node scripts/prepare-site.mjs",
"prebuild": "pnpm prepare:site"
```

- [ ] **Step 5: Verify GREEN**

Run: `pnpm vitest run tests/site-prebuild.test.ts`

Expected: PASS.

- [ ] **Step 6: Run complete automated verification**

Run:

```bash
pnpm test
pnpm check:links
pnpm check:assets
pnpm build
test -s docs/.vitepress/dist/robots.txt
test -s docs/.vitepress/dist/sitemap.xml
test -s docs/.vitepress/dist/bluebook/index.html
find docs/.vitepress/dist/bluebook -mindepth 2 -name index.html -print -quit | grep .
```

Expected: all commands exit 0. `pnpm test` reports only root tests. The distribution contains crawler files and legacy overview plus nested redirects.

- [ ] **Step 7: Run local responsive verification**

Start `pnpm preview`, inspect `/`, `/wb-x/`, `/bluebook/`, `/robots.txt`, and `/sitemap.xml`, and capture the homepage at 390x844. Confirm:

- `scrollWidth === clientWidth`.
- Header brand, search, and menu are visible.
- Hero heading, summary, and both CTA buttons are visible without clipping.
- `/bluebook/` arrives at `/wb-x/` while preserving query and fragment.

- [ ] **Step 8: Commit only this task's files**

```bash
git add package.json scripts/prepare-site.mjs tests/site-prebuild.test.ts
git commit -m "build: prepare SEO and legacy artifacts"
```

---

## Final Review Checklist

- [ ] Compare `git status --short` with the pre-implementation snapshot and confirm unrelated reading-system changes remain present and untouched.
- [ ] Confirm every new behavior test was observed failing before its implementation.
- [ ] Confirm `pnpm test`, link checks, asset checks, and production build pass with clean output.
- [ ] Confirm the 390px screenshot fixes the exact clipping captured in the audit.
- [ ] Confirm desktop homepage composition remains unchanged.
- [ ] Confirm generated sitemap and legacy pages remain ignored and are not accidentally staged.
- [ ] Confirm the GitHub Pages workflow still deploys `docs/.vitepress/dist`.
