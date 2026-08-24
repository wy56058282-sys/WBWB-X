# Task 1 report: WorkBuddy-X full-site style, homepage workshop, and About page

## Implementation summary

- Replaced the top-navigation `资料` item with `关于我们` at `/about/`, while retaining `docs/resources/index.md` at `/resources/`.
- Added the `/about/` page with title, description, breadcrumb metadata, the existing six team member cards, and the existing join contact interaction.
- Moved the team section and join interaction out of the service page. The service page now flows directly from the workshop module to `不同阶段，只解决当下最重要的问题`, and `#workshop-registration` now targets the workshop section.
- Extracted typed workshop editions into `docs/.vitepress/workshop-editions.ts`, including normalized Shanghai start/end timestamps and a pure relevance selector.
- Added a compact homepage workshop card between task categories and the system section. It selects one edition, opens the registration QR accessibly for upcoming/ongoing editions, and switches to recap behavior for past editions.
- Added focused About/home workshop styling and shared semantic tokens for content width, section spacing, controls, and focus treatment.

## Files changed

- `docs/.vitepress/navigation.ts`
- `docs/.vitepress/workshop-editions.ts`
- `docs/.vitepress/theme/{AboutPage.vue,HomeWorkshop.vue,HomePage.vue,ServicePage.vue,index.ts,about.css,custom.css,service.css}`
- `docs/.vitepress/theme/home/{home-sections.css,home-responsive.css}`
- `docs/about/index.md`
- `tests/{about-page.test.ts,home-workshop.test.ts,workshop-editions.test.ts,navigation.test.ts,live-site-alignment.test.ts,service-page.test.ts,service-page-style.test.ts}`

## TDD evidence

### RED

Command:

```sh
pnpm test tests/workshop-editions.test.ts tests/about-page.test.ts tests/home-workshop.test.ts
```

Exact result:

```text
Test Files  3 failed (3)
Tests  2 failed (2)
```

`workshop-editions.test.ts` and `about-page.test.ts` failed to resolve the new shared module and About component; the two homepage tests failed because `.wbx-home-workshop` and its registration trigger did not yet exist. These failures matched the missing implementation.

### GREEN

Command:

```sh
pnpm test tests/workshop-editions.test.ts tests/about-page.test.ts tests/home-workshop.test.ts
```

Exact result:

```text
Test Files  3 passed (3)
Tests  8 passed (8)
```

Follow-up integration command:

```sh
pnpm test tests/service-page.test.ts tests/service-page-style.test.ts tests/navigation.test.ts tests/workshop-editions.test.ts tests/about-page.test.ts tests/home-workshop.test.ts
```

Exact result:

```text
Test Files  6 passed (6)
Tests  41 passed (41)
```

## Full verification

- `pnpm test` — exit 0; `Test Files 63 passed (63)` and `Tests 390 passed (390)`.
- `pnpm run check:links` — exit 0; `Checked 17 internal Markdown links: 0 broken`.
- `pnpm run check:assets` — exit 0; `Approved replacement assets are present and contain no source hotlinks.`
- `pnpm build` — exit 0; VitePress built and rendered all pages successfully. The CSS syntax warning discovered during the first build was fixed and the final build had no CSS syntax warning.

## Self-review

- Confirmed the edition selector has explicit +08:00 timestamps and uses end time for upcoming/ongoing eligibility, then most recently ended edition for recap.
- Confirmed the homepage QR supports click activation, a second activation, Escape, outside pointer closure, focus restoration, and ARIA state.
- Confirmed the team content appears only in `AboutPage.vue`; service retains the legacy workshop fragment and history anchor.
- Confirmed mobile styles collapse the homepage workshop to one column and About team cards to two/one columns without image cropping.
- Ran `git diff --check`; no whitespace errors.

## Concerns

- The successful final build emits VitePress's advisory that some bundles exceed 500 kB. This is pre-existing build tooling guidance and was not changed by this task.

---

# Fix round 1 report

## Implementation summary

- Made the homepage workshop selection hydration-safe by using the exported fixed `homeWorkshopReferenceTime` during SSR and initial hydration, then switching to the client clock on mount.
- Added one boundary-based refresh timer. It schedules exactly for the next workshop start/end boundary, refreshes the selection, reschedules itself, and is cleared on unmount.
- Made workshop end instants exclusive: an edition is past at its exact `endsAt` value.
- Added component rendering coverage for second QR activation, ARIA linkage, ongoing registration, external recap, internal recap fallback, and the automatic boundary refresh.
- Added About join Escape/outside closure, frontmatter/title-template, About-nav, and responsive CSS contract coverage.
- Changed the About frontmatter to `titleTemplate: false`, eliminating the literal `%s` in the browser title.

## Focused TDD evidence

### RED

Command:

```sh
pnpm test tests/workshop-editions.test.ts tests/about-page.test.ts tests/home-workshop.test.ts tests/workshop-page-style.test.ts
```

Exact result:

```text
Test Files  3 failed | 1 passed (4)
Tests  4 failed | 12 passed (16)
```

The failures were the expected exclusive-end boundary (`ongoing` returned instead of `past`), the incompatible `%s` title template, and missing past-detail/fallback rendering because the component had no injected edition data/state handling.

An intermediate focused run also exposed the Vue compiler rule that `<script setup>` cannot export an ES module value. The stable reference time was moved into the shared workshop module before rerunning the suite.

### GREEN

Command:

```sh
pnpm test tests/workshop-editions.test.ts tests/about-page.test.ts tests/home-workshop.test.ts tests/workshop-page-style.test.ts
```

Exact result:

```text
Test Files  4 passed (4)
Tests  17 passed (17)
```

## Full verification

- `pnpm test` — exit 0; `Test Files 64 passed (64)` and `Tests 399 passed (399)`.
- `pnpm run check:links` — exit 0; `Checked 17 internal Markdown links: 0 broken`.
- `pnpm build` — exit 0; client/server bundles built and pages rendered successfully.

## Self-review

- Confirmed the server and first hydrated render both use the same fixed reference time; mounted clients immediately adopt the real clock.
- Confirmed the refresh delay is calculated from the nearest future start/end boundary rather than polling.
- Confirmed the `endsAt > now` rule changes only the requested exact-end behavior.
- Confirmed the About title uses an existing VitePress-compatible `titleTemplate: false` pattern and the new test rejects `%s`.
- Ran `git diff --check`; no whitespace errors.

## Concerns

- The successful build still emits VitePress's non-blocking chunk-size advisory for bundles over 500 kB.
