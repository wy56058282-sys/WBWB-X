# Reference Title, Cases Sidebar, and Footer Design

## Goal

Align documentation titles and the cases sidebar with the presentation used by `workbuddy.homes`, remove the global page-edit footer action, and preserve the existing automatic `Last updated` behavior.

## Scope

This change applies to documentation-style pages only:

- Small-book chapter and section pages under `/wb-x/`.
- The reading guide.
- The cases index and individual case pages.

The homepage and `/help/` keep their existing independent hero-title systems. Body typography, small-book sidebar typography, navigation typography, and content prose do not change.

## Documentation Title System

Desktop documentation H1 headings use the reference site's measured values:

- Font family: the existing `--wbx-body` stack (`Avenir Next`, Avenir, `PingFang SC`, `Hiragino Sans GB`, `Microsoft YaHei`, sans-serif).
- Font size: `51.2px`.
- Font weight: `850`.
- Line height: `58.88px`.
- Letter spacing: `-2.816px`.
- Bottom margin: `34px`.

The rule is scoped to normal VitePress document content so it cannot override the homepage or help-page hero headings. At narrower widths, the heading scales down responsively to prevent clipping and horizontal overflow. The mobile value remains visually strong while fitting 390px viewports.

## Cases Sidebar

The `/cases/` sidebar uses this structure:

1. `案例集首页` linking to `/cases/`.
2. `如何提交 Case` linking to `/community/case-contributing`.
3. A group titled `社区 Case` containing generated case links.

Case entries remain generated from `docs/cases/submissions/*/index.md` frontmatter. They remain sorted by date descending, with route ordering as a deterministic tie-breaker. This intentionally keeps the site's current newest-first discovery behavior while adopting the reference site's information structure and labels.

Invalid or incomplete case frontmatter continues to fail the build rather than silently producing a broken navigation item.

## Footer Behavior

Remove `themeConfig.editLink` from the VitePress configuration. This removes `在 GitHub 上改进此页` from all documentation footers while leaving the top navigation GitHub link unchanged.

Keep `lastUpdated: true`. VitePress will continue to derive each page's last-updated value from the most recent Git commit that changed that Markdown file. Changes to shared CSS or theme configuration do not alter a page's displayed timestamp unless the page Markdown itself changes. The browser continues to localize the rendered date and time.

## Testing and Verification

Add or update focused tests that assert:

- Documentation H1 rules contain the approved desktop values and a responsive mobile override.
- The title selector does not target homepage or help hero headings.
- The cases sidebar has the approved two fixed links followed by the generated group.
- Generated case entries remain newest-first.
- `themeConfig.editLink` is absent while `lastUpdated` remains enabled.

Run the full Vitest suite, content-link and replacement-asset checks, and the production VitePress build. Verify the built cases HTML contains the sidebar labels and no edit-link text. In a browser, verify a chapter page and `/cases/` at desktop width plus a chapter page at 390px with no horizontal overflow.

## Non-Goals

- No homepage or help-page hero redesign.
- No body-copy, H2/H3, sidebar font-size, or sidebar-spacing changes.
- No manual maintenance of case links.
- No removal or manual replacement of `Last updated`.
- No unrelated visual changes from other local branches.
