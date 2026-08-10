# Site Content Governance Design

## Goal

Remove internal implementation material from the public WorkBuddy WB-X site, align published navigation content with the actual book structure, restore legacy `/bluebook/` routes on GitHub Pages, and remove misleading or unused assets without disturbing intentional content reuse.

## Scope

### Included

- Keep `docs/superpowers/**` in the repository while excluding it from VitePress page generation and local search.
- Add regression coverage proving internal Markdown is excluded from production output.
- Replace the stale second-part difficulty map with entries matching chapters 11 through 21.
- Generate static GitHub Pages-compatible redirects for `/bluebook/` and every current `/wb-x/` content route.
- Remove the incorrect duplicate model-selection screenshot from the article while keeping the surrounding explanation.
- Delete the four confirmed unreferenced assets found in the 2026-08-10 audit.
- Verify production build output, formal routes, search content, and legacy redirects.

### Excluded

- Moving or deleting the 53 internal design and implementation documents.
- Deduplicating intentionally reused case and chapter images.
- Creating a replacement model-selection screenshot without a trustworthy source image.
- Editing or staging the pre-existing `.gitignore`, `package-lock.json`, `.pnpm-store/`, or `.vercel-tmp/` changes.
- Redesigning page layout or visual language.

## Architecture

### Production Content Boundary

VitePress will use `srcExclude` to exclude `superpowers/**`. The source files remain reviewable in Git, but VitePress must not generate HTML, route chunks, canonical tags, or local-search records for them.

A regression test will inspect the VitePress configuration and production build output. It must fail if a `superpowers` page or its title appears in `docs/.vitepress/dist`.

### Legacy Route Compatibility

GitHub Pages does not process the repository's `_redirects` wildcard and the existing Vite middleware only runs during local development. A post-build script will discover the built `/wb-x/` HTML routes and create small redirect documents beneath `docs/.vitepress/dist/bluebook/`, mirroring the `/wb-x/` route tree. The package `build` command will run this script only after VitePress succeeds, so generated output never dirties authored source directories.

Each generated document will use an immediate meta refresh, a canonical target, and a visible fallback link. The script must generate the root `/bluebook/` redirect and nested redirects for all current book pages. Generated output will be deterministic and refreshed before every production build.

### Published Content Alignment

The second-part difficulty map will list exactly chapters 11 through 21, using the same chapter titles as `sidebar.ts`. Capability summaries may remain concise, but no row may refer to chapters 22 or 23 or to superseded titles.

The duplicated `03-model-selection.png` does not depict model selection. Its Markdown image reference will be removed while retaining the model-selection guidance. `02-task-mode.png` remains because it accurately depicts task modes.

### Asset Cleanup

Delete only these confirmed unreferenced files:

- `docs/public/article-assets/source-calibration/community/003.jpg`
- `docs/public/article-assets/source-calibration/community/004.jpg`
- `docs/public/brand/sparkx-logo.svg`
- `docs/public/images/new-user-settings/10-custom-instruction-template.png`

Exact duplicates used by two published contexts remain unchanged.

## Error Handling

- Redirect generation must fail with a clear path-specific error if a source route cannot be normalized safely.
- Generated redirects must reject paths outside the built `/wb-x/` tree and must never write outside `docs/.vitepress/dist/bluebook/`.
- Production checks must fail when internal pages reappear, a legacy target is missing, or the stale chapter labels return.

## Verification

- Run focused regression tests through Vitest.
- Run the full root test suite while excluding local worktrees and pnpm cache directories.
- Run internal link and replacement-asset checks.
- Run a clean VitePress production build.
- Assert that no `dist/superpowers` directory or internal-plan search entry exists.
- Assert that representative `/bluebook/` redirect files target the matching `/wb-x/` routes.
- Preview the homepage, book index, second-part index, and a legacy route at desktop and mobile widths.

## Success Criteria

- All 53 internal documents remain in Git but none is publicly built or searchable.
- The second-part map and sidebar describe one consistent 11-to-21 chapter sequence.
- `/bluebook/` and representative nested legacy URLs redirect on static hosting.
- The article no longer labels a task-mode screenshot as model selection.
- The four unused assets are absent.
- Existing intentional image reuse and unrelated local changes remain untouched.
