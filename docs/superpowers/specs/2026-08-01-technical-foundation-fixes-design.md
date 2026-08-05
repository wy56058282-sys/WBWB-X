# WorkBuddy WB-X Technical Foundation Fixes Design

## Objective

Stabilize the published WorkBuddy WB-X site without committing to unfinished visual, editorial, or media-asset decisions. This phase fixes the confirmed mobile regression, makes tests deterministic, adds search-engine discovery files, and restores legacy `/bluebook/` routes on GitHub Pages.

## Scope

### Included

- Fix homepage and header clipping at a 390px viewport.
- Restrict Vitest discovery to the root `tests/**/*.test.ts` suite.
- Exclude generated, dependency, cache, and worktree directories from tests.
- Publish `robots.txt` for the production origin `https://wbwbx.sparkx.zone`.
- Generate a production `sitemap.xml` from the VitePress content routes.
- Preserve the current development-server `/bluebook/` redirect behavior.
- Generate GitHub Pages-compatible static redirect pages for `/bluebook/` and legacy nested chapter routes.
- Add automated regression coverage for every included behavior.
- Verify tests, links, replacement assets, production build output, and the 390px viewport.

### Deferred

- Homepage or site-wide visual redesign.
- Case-index information-architecture changes.
- Chapter copy editing or custom per-page descriptions.
- Bulk image-alt rewriting.
- Image conversion, compression, asset relocation, or Git-history rewriting.

The deferred work will be designed after the visual and editorial direction is approved.

## Constraints

- Preserve the existing GitHub Pages deployment workflow.
- Preserve pnpm 11.9.0 and the current VitePress stack.
- Preserve the production origin and canonical URL behavior.
- Do not overwrite or reformat unrelated uncommitted reading-system changes.
- Do not change desktop homepage composition.
- Do not introduce a new runtime service, hosted redirect service, or client framework.
- Generated legacy pages must not become canonical search results.

## Design

### 1. Mobile Homepage and Header

The homepage regression is caused by nowrap content inside containers that intentionally clip overflow. Below 760px, the hero heading will wrap normally and long copy will remain inside the viewport. The site-title area in the VitePress header will receive a narrow-screen width rule so the brand, search button, and mobile-menu button fit together at 390px.

Desktop and tablet rules above 760px remain unchanged. The success condition is `document.documentElement.scrollWidth === document.documentElement.clientWidth` and no visible clipping of the brand, hero heading, summary, or both hero actions at 390x844.

### 2. Deterministic Test Discovery

Vitest will explicitly include only `tests/**/*.test.ts`. It will also exclude `node_modules`, `.pnpm-store`, `.worktrees`, VitePress cache, and VitePress distribution output.

The test command remains `vitest run`. Test discovery must not depend on the developer's local cache or worktree layout.

### 3. Robots and Sitemap

`docs/public/robots.txt` will permit normal crawling and declare:

```text
Sitemap: https://wbwbx.sparkx.zone/sitemap.xml
```

A focused build script will enumerate publishable Markdown pages under `docs`, excluding internal design and implementation records under `docs/superpowers`. It will convert `index.md` and clean-URL pages using the same route rules as the site and emit an XML sitemap into `docs/public/sitemap.xml` before VitePress builds.

The generator will sort and deduplicate URLs for deterministic output. All sitemap locations will use the production origin.

### 4. GitHub Pages Legacy Redirects

GitHub Pages does not interpret `docs/public/_redirects`. A build script will derive legacy routes from current `/wb-x/` routes and generate static HTML redirect documents in a temporary public subtree before VitePress builds.

Each redirect document will contain:

- An immediate HTML refresh to the matching `/wb-x/` route.
- A JavaScript `location.replace` fallback that preserves query strings and fragments.
- A visible link for users with scripting and refresh disabled.
- `noindex` metadata.
- A canonical URL pointing at the current `/wb-x/` destination.

The overview `/bluebook/` maps to `/wb-x/`. Nested paths preserve their suffix. The existing development plugin remains responsible for local 302 redirects.

Generated redirect files are build artifacts, not editorial source pages. The generator must remove only its own known output directory before regenerating it.

### 5. Build Integration

One prebuild command will generate sitemap and legacy compatibility files, followed by the existing VitePress build. Generation failures must stop the build with a non-zero exit code and a clear path-specific error.

The GitHub Actions workflow continues to install with `pnpm install --frozen-lockfile`, run tests, build, and deploy `docs/.vitepress/dist`.

## Testing Strategy

All behavior changes follow red-green-refactor:

1. Add a failing mobile CSS regression test covering title wrapping and narrow-header constraints.
2. Add a failing Vitest configuration test covering include and exclude rules.
3. Add failing sitemap-generator tests for route conversion, exclusions, escaping, sorting, and deduplication.
4. Add failing legacy-page-generator tests for overview mapping, nested routes, noindex, canonical URL, and query/fragment preservation.
5. Implement only enough production code to pass each group.
6. Run the root suite with normal `pnpm test` to prove hidden directories are not discovered.
7. Run content-link and replacement-asset checks.
8. Run the production build and assert that `robots.txt`, `sitemap.xml`, `/bluebook/index.html`, and at least one nested legacy page exist in the distribution directory.
9. Recheck the published-equivalent local build at 390x844.

## Error Handling and Safety

- Generators use explicit source and destination roots resolved inside the repository.
- A missing source directory or an output path outside its expected root stops generation.
- Sitemap XML values and redirect HTML values are escaped before serialization.
- Redirect generation never deletes editorial Markdown or general public assets.
- Existing uncommitted files outside this phase remain untouched.

## Success Criteria

- The homepage brand, hero title, summary, and actions are fully visible at 390x844.
- `pnpm test` runs only root tests and passes.
- `/robots.txt` returns crawler instructions rather than the VitePress 404 page.
- `/sitemap.xml` returns a valid, deterministic sitemap containing public content pages and excluding internal planning documents.
- `/bluebook/` and nested legacy routes reach their matching `/wb-x/` destinations in the GitHub Pages artifact.
- The existing main navigation, desktop homepage, reading pages, and deployment workflow continue to work.

