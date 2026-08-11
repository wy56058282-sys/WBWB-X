# Cases and Custom Service Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the submission-heavy case index with a searchable outcome-led card gallery, and turn `/help/` into a clearly bounded ¥399 paid diagnostic service while keeping free case submissions separate.

**Architecture:** Case metadata remains in each case Markdown frontmatter and is collected at VitePress build time through a typed data loader. Dedicated Vue components render the case gallery, detail-page service CTA, and custom-service page; Markdown files keep route metadata and mount those components. External form URLs and QR assets live in one typed operations configuration, with closed-state UI until all paid-service inputs are valid.

**Tech Stack:** VitePress, Vue 3 Composition API, TypeScript, CSS, Vitest, JSDOM.

## Global Constraints

- Keep `/cases/`, all existing case detail routes, and `/help/` stable.
- Rename the top-level navigation label from `提需求` to `定制服务`.
- Case gallery layout is three columns on desktop, two on tablet, and one on mobile.
- Case filters are single-select scenario categories plus keyword search; no difficulty, tool, sorting, pagination, likes, or favorites.
- Every case card contains a real outcome cover, category, title, one-sentence outcome, and product tag.
- Free case submission and paid diagnostic must use different external form URLs and different copy.
- Paid diagnostic product copy is exactly `WorkBuddy 需求诊断`, `¥399 / 次`, and `45 分钟`.
- The ¥399 fee is fully deducted only when the same project is confirmed and its first payment is made within 7 natural days after the diagnostic.
- A completed or started diagnostic is non-refundable; rescheduling requires 24 hours' notice; more than 15 minutes late forfeits the session.
- Do not build native payment, upload, order management, customer accounts, refunds, or calendar booking.
- The paid CTA stays unavailable until both a production paid-form URL and payment QR asset are supplied and validated.
- Preserve existing unrelated dirty files and do not stage `.gitignore`, `package-lock.json`, `.pnpm-store/`, `.vercel-tmp/`, audit files, or screenshots.

---

## File Structure

- Create `docs/.vitepress/case-catalog.ts`: shared `CaseCatalogItem` type, normalization, filtering, category derivation, and validation.
- Create `docs/.vitepress/case-catalog.data.ts`: VitePress build-time loader for `docs/cases/submissions/*/index.md`.
- Create `docs/.vitepress/theme/CasesPage.vue`: page header, controls, result count, empty state, card grid, and submission section.
- Create `docs/.vitepress/theme/CaseServiceCta.vue`: lightweight detail-page link to `/help/`.
- Create `docs/.vitepress/theme/ServicePage.vue`: paid diagnostic offer, rules, workflow, QR/form state, and related cases.
- Create `docs/.vitepress/theme/cases.css`: case gallery, cards, filters, submission block, detail CTA, and responsive styles.
- Create `docs/.vitepress/theme/service.css`: custom-service page, rules, payment block, responsive styles, and dark theme.
- Create `docs/.vitepress/service-config.ts`: typed free-submission and paid-diagnostic operations configuration.
- Modify all seven `docs/cases/submissions/*/index.md`: add `category`, `outcome`, `cover`, and mount `<CaseServiceCta />` at the end.
- Modify `docs/cases/index.md`: retain frontmatter and mount `<CasesPage />` only.
- Modify `docs/help/index.md`: retain frontmatter and mount `<ServicePage />` only.
- Modify `docs/.vitepress/theme/index.ts`: register components and import the new stylesheets.
- Modify `docs/.vitepress/navigation.ts`: change the navigation label.
- Modify `docs/.vitepress/case-sidebar.ts`: reuse the catalog validation contract and suppress the case sidebar on the index through page layout behavior, not route deletion.
- Modify `docs/.vitepress/theme/Layout.vue`: render the case sidebar only on case detail/contribution routes and not `/cases/`.
- Modify existing case/help/navigation tests and create focused catalog, gallery, service, and detail-CTA tests.

---

### Task 1: Typed Case Catalog and Build-Time Validation

**Files:**
- Create: `docs/.vitepress/case-catalog.ts`
- Create: `docs/.vitepress/case-catalog.data.ts`
- Modify: `docs/.vitepress/case-sidebar.ts`
- Modify: `docs/cases/submissions/annual-report-digital-transformation/index.md`
- Modify: `docs/cases/submissions/tea-shop-sales-analysis/index.md`
- Modify: `docs/cases/submissions/jz-2025-showreel/index.md`
- Modify: `docs/cases/submissions/wechat-ima-knowledge/index.md`
- Modify: `docs/cases/submissions/daily-ai-news/index.md`
- Modify: `docs/cases/submissions/vibe-resume/index.md`
- Modify: `docs/cases/submissions/wechat-format-publish/index.md`
- Test: `tests/case-catalog.test.ts`
- Test: `tests/case-sidebar.test.ts`

**Interfaces:**
- Produces: `CaseCatalogItem`, `validateCaseCatalogItem(input)`, `validateCaseCatalog(items)`, `filterCaseCatalog(items, query, category)`, `caseCategories(items)`, and loader export `data: readonly CaseCatalogItem[]`.
- `CaseCatalogItem` fields: `route`, `title`, `date`, `productTag`, `category`, `outcome`, `cover`, and `coverAlt`, all non-empty strings.

- [ ] **Step 1: Write failing catalog contract tests**

```ts
expect(validateCaseCatalogItem(validItem)).toEqual(validItem)
expect(() => validateCaseCatalogItem({ ...validItem, outcome: '' })).toThrow(/outcome/)
expect(() => validateCaseCatalogItem({ ...validItem, cover: 'https://example.com/x.png' })).toThrow(/local cover/)
expect(caseCategories(items)).toEqual(['全部', '内容创作', '数据分析'])
expect(filterCaseCatalog(items, 'workbuddy+ima', '全部').map((item) => item.route)).toEqual(['/cases/submissions/wechat-ima-knowledge/'])
expect(filterCaseCatalog(items, '  excel  ', '数据分析')).toHaveLength(1)
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run: `./node_modules/.bin/vitest run tests/case-catalog.test.ts tests/case-sidebar.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

Expected: FAIL because `case-catalog.ts` and the required frontmatter fields do not exist.

- [ ] **Step 3: Implement the catalog contract**

```ts
export interface CaseCatalogItem {
  route: string
  title: string
  date: string
  productTag: string
  category: string
  outcome: string
  cover: string
  coverAlt: string
}

export function filterCaseCatalog(
  items: readonly CaseCatalogItem[],
  query: string,
  category: string,
) {
  const needle = query.trim().toLocaleLowerCase('zh-CN')
  return items.filter((item) => {
    const categoryMatches = category === '全部' || item.category === category
    const haystack = [item.title, item.outcome, item.category, item.productTag]
      .join('\n')
      .toLocaleLowerCase('zh-CN')
    return categoryMatches && (!needle || haystack.includes(needle))
  })
}
```

Validation must reject missing strings, invalid ISO dates, non-`/cases/submissions/` routes, duplicate routes, remote cover URLs, and cover paths outside `/article-assets/` or `/brand/`.

Update `case-sidebar.ts` to pass discovered frontmatter through the same validation contract before mapping validated items to VitePress sidebar entries. Sidebar labels still contain only title and product tag.

- [ ] **Step 4: Add explicit frontmatter metadata to all seven cases**

Use one category per case from this fixed set: `数据分析`, `内容创作`, `知识管理`, `自动化`. Add an outcome sentence based on the visible result, a real existing local cover path, and a factual `coverAlt`. Do not alter body headings or existing product tags.

- [ ] **Step 5: Implement the VitePress loader**

```ts
import { createContentLoader } from 'vitepress'
import { validateCaseCatalog } from './case-catalog'

export default createContentLoader('cases/submissions/*/index.md', {
  includeSrc: false,
  transform(raw) {
    return validateCaseCatalog(raw.map(({ url, frontmatter }) => ({
      route: url,
      title: frontmatter.title,
      date: frontmatter.date,
      productTag: frontmatter.productTag,
      category: frontmatter.category,
      outcome: frontmatter.outcome,
      cover: frontmatter.cover,
      coverAlt: frontmatter.coverAlt,
    })))
  },
})

export declare const data: readonly import('./case-catalog').CaseCatalogItem[]
```

- [ ] **Step 6: Run focused tests and asset validation**

Run: `./node_modules/.bin/vitest run tests/case-catalog.test.ts tests/case-sidebar.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

Run: `node scripts/check-replacement-assets.mjs`

Expected: all focused tests pass and every selected cover exists.

- [ ] **Step 7: Commit Task 1**

```bash
git add docs/.vitepress/case-catalog.ts docs/.vitepress/case-catalog.data.ts docs/.vitepress/case-sidebar.ts docs/cases/submissions tests/case-catalog.test.ts tests/case-sidebar.test.ts
git commit -m "建立案例目录数据源"
```

---

### Task 2: Searchable Case Gallery

**Files:**
- Create: `docs/.vitepress/theme/CasesPage.vue`
- Create: `docs/.vitepress/theme/cases.css`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/cases/index.md`
- Modify: `docs/.vitepress/theme/Layout.vue`
- Test: `tests/cases-page.test.ts`
- Test: `tests/case-page-style.test.ts`
- Test: `tests/navigation.test.ts`

**Interfaces:**
- Consumes: `data` from `case-catalog.data.ts`, plus `filterCaseCatalog()` and `caseCategories()`.
- Produces: globally registered `<CasesPage />` and stable CSS hooks prefixed with `.wbx-cases-`.

- [ ] **Step 1: Write failing rendering and interaction tests**

Mount `CasesPage` with a mocked catalog and assert:

```ts
expect(wrapper.findAll('.wbx-case-card')).toHaveLength(3)
await wrapper.get('input[type="search"]').setValue('excel')
expect(wrapper.findAll('.wbx-case-card')).toHaveLength(1)
await wrapper.get('[data-category="内容创作"]').trigger('click')
expect(wrapper.text()).toContain('没有找到匹配的案例')
await wrapper.get('.wbx-cases-empty button').trigger('click')
expect(wrapper.findAll('.wbx-case-card')).toHaveLength(3)
```

Also assert card links use `withBase`, images have `alt`, the selected category exposes `aria-pressed="true"`, and `/cases/` does not render the duplicate case sidebar.

- [ ] **Step 2: Run tests and confirm RED**

Run: `./node_modules/.bin/vitest run tests/cases-page.test.ts tests/case-page-style.test.ts tests/navigation.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

Expected: FAIL because the component and gallery styles do not exist.

- [ ] **Step 3: Implement the page component**

Use `ref('')` for query, `ref('全部')` for category, and a `computed()` filtered list. Render a compact header with “浏览案例” anchored to `#case-gallery` and “提交案例” anchored to `#submit-case`. Render category controls as buttons, not decorative pills. The entire card link must have one accessible name and no nested interactive control.

- [ ] **Step 4: Replace the case-index Markdown body**

```md
---
title: WorkBuddy WB-X 案例集
description: 浏览 WorkBuddy 真实案例，并按场景或关键词找到可复用的工作方法。
aside: false
outline: false
pageClass: community-cases-page
---

<CasesPage />
```

The bottom submission section initially preserves the existing `/help/#scenario-survey` entry and links to `/community/case-contributing`. Task 4 replaces the temporary internal entry with the confirmed independent free-case form URL when centralized operations configuration is introduced.

- [ ] **Step 5: Add stable responsive styling**

Define `grid-template-columns: repeat(3, minmax(0, 1fr))`, switch to two columns at `960px`, and one column at `640px`. Give covers a stable `aspect-ratio`, clamp title/outcome text, use radius no greater than `8px`, and preserve light/dark contrast without a one-hue page treatment.

- [ ] **Step 6: Hide the duplicate sidebar only on the case index**

Use route state in `Layout.vue` to distinguish exact `/cases/` from `/cases/submissions/.../` and `/community/case-contributing`. Keep the existing sidebar configuration and all detail routes intact.

- [ ] **Step 7: Run focused tests**

Run: `./node_modules/.bin/vitest run tests/cases-page.test.ts tests/case-page-style.test.ts tests/navigation.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

Expected: all focused tests pass.

- [ ] **Step 8: Commit Task 2**

```bash
git add docs/.vitepress/theme/CasesPage.vue docs/.vitepress/theme/cases.css docs/.vitepress/theme/index.ts docs/.vitepress/theme/Layout.vue docs/cases/index.md tests/cases-page.test.ts tests/case-page-style.test.ts tests/navigation.test.ts
git commit -m "重构案例集卡片目录"
```

---

### Task 3: Detail-Page Paid Diagnostic CTA

**Files:**
- Create: `docs/.vitepress/theme/CaseServiceCta.vue`
- Modify: all seven `docs/cases/submissions/*/index.md`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/theme/cases.css`
- Test: `tests/case-service-cta.test.ts`

**Interfaces:**
- Produces: globally registered `<CaseServiceCta />` with no props and one `withBase('/help/')` link.

- [ ] **Step 1: Write the failing CTA contract test**

```ts
expect(wrapper.text()).toContain('有类似需求？')
expect(wrapper.get('a').attributes('href')).toBe('/help/')
for (const source of caseSources) expect(source.trimEnd()).toMatch(/<CaseServiceCta\s*\/>$/)
```

- [ ] **Step 2: Run the test and confirm RED**

Run: `./node_modules/.bin/vitest run tests/case-service-cta.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

Expected: FAIL because the component is missing.

- [ ] **Step 3: Implement and register the CTA**

Render an unframed full-width band after the case body with short copy and one command button labelled `预约付费诊断`. Do not show price, QR, or a second form on detail pages.

- [ ] **Step 4: Mount the CTA in every case**

Append exactly one `<CaseServiceCta />` after the final body section of each of the seven case files.

- [ ] **Step 5: Run focused tests and commit**

Run: `./node_modules/.bin/vitest run tests/case-service-cta.test.ts tests/case-sidebar.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

```bash
git add docs/.vitepress/theme/CaseServiceCta.vue docs/.vitepress/theme/index.ts docs/.vitepress/theme/cases.css docs/cases/submissions tests/case-service-cta.test.ts
git commit -m "增加案例付费诊断入口"
```

---

### Task 4: Operations Configuration and Fail-Closed Service State

**Files:**
- Create: `docs/.vitepress/service-config.ts`
- Modify: `docs/.vitepress/theme/CasesPage.vue`
- Test: `tests/service-config.test.ts`
- Modify: `tests/case-submission-flow.test.ts`

**Interfaces:**
- Produces: `serviceConfig`, `isPaidServiceReady(config)`, and `assertPaidServiceReady(config)`.
- Configuration fields: `freeCaseFormUrl`, `paidDiagnosticFormUrl`, `paymentQrPath`, `confirmationWindow`, and `supportContact`.

- [ ] **Step 1: Write failing separation and readiness tests**

```ts
expect(serviceConfig.freeCaseFormUrl).not.toBe(serviceConfig.paidDiagnosticFormUrl)
expect(isPaidServiceReady({ ...serviceConfig, paidDiagnosticFormUrl: '' })).toBe(false)
expect(isPaidServiceReady({ ...serviceConfig, paymentQrPath: '' })).toBe(false)
expect(() => assertPaidServiceReady(invalidConfig)).toThrow(/paid diagnostic/i)
```

The validator must accept only `https:` form URLs and a local `/article-assets/` QR path. It must reject equal free/paid URLs.

- [ ] **Step 2: Run tests and confirm RED**

Run: `./node_modules/.bin/vitest run tests/service-config.test.ts tests/case-submission-flow.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

- [ ] **Step 3: Implement centralized configuration**

```ts
export interface ServiceConfig {
  freeCaseFormUrl: string
  paidDiagnosticFormUrl: string
  paymentQrPath: string
  confirmationWindow: string
  supportContact: string
}
```

Use the operator-confirmed independent free case form URL as `freeCaseFormUrl`. Until that URL is supplied, keep the existing free questionnaire QR entry visible but do not invent an external URL. Until the operator supplies production paid-service inputs, keep the paid fields empty and make `isPaidServiceReady()` return `false`; do not invent a URL or QR image.

- [ ] **Step 4: Update submission-flow tests**

Replace the old assertion that one questionnaire handles both needs and cases. Assert instead that the case page uses `freeCaseFormUrl`, paid service uses `paidDiagnosticFormUrl`, and GitHub remains only an optional advanced case-contribution path.

Update `CasesPage.vue` to consume `freeCaseFormUrl`. When it is unavailable, render the existing free questionnaire QR link rather than a broken form button.

- [ ] **Step 5: Run tests and commit**

Run: `./node_modules/.bin/vitest run tests/service-config.test.ts tests/case-submission-flow.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

```bash
git add docs/.vitepress/service-config.ts docs/.vitepress/theme/CasesPage.vue tests/service-config.test.ts tests/case-submission-flow.test.ts
git commit -m "分离免费投稿与付费诊断配置"
```

---

### Task 5: Custom Service Page

**Files:**
- Create: `docs/.vitepress/theme/ServicePage.vue`
- Create: `docs/.vitepress/theme/service.css`
- Modify: `docs/.vitepress/theme/index.ts`
- Modify: `docs/.vitepress/navigation.ts`
- Modify: `docs/help/index.md`
- Modify: `docs/.vitepress/service-config.ts`
- Add: operator-supplied QR image under `docs/public/article-assets/service/`
- Test: `tests/service-page.test.ts`
- Test: `tests/help-survey-poster.test.ts`
- Test: `tests/navigation.test.ts`

**Interfaces:**
- Consumes: `serviceConfig`, `isPaidServiceReady()`, and catalog `data`.
- Produces: globally registered `<ServicePage />`, `.wbx-service-*` hooks, and the `定制服务` navigation label.

- [ ] **Step 1: Obtain production operations inputs before enabling purchase**

Required operator inputs are one exact `https:` free case-submission form URL, one different exact `https:` paid diagnostic form URL, and one final WeChat payment QR PNG. Store the QR at `docs/public/article-assets/service/wechat-payment-qr.png` and set all configuration fields. If a paid-service input is unavailable, execute the remaining page work in closed state and do not deploy an enabled purchase CTA. If the free form URL is unavailable, preserve the existing free questionnaire QR entry without inventing a link.

- [ ] **Step 2: Write failing page contract tests**

Assert visible copy for `WorkBuddy 需求诊断`, `¥399 / 次`, `45 分钟`, 7-day deduction, 24-hour rescheduling, 15-minute lateness, refund boundary, and excluded deliverables. Assert the hero CTA points to `#payment-and-application`. In ready state, assert QR alt text and an external form link with `target="_blank"` and `rel="noopener noreferrer"`; in closed state, assert `暂未开放预约` and no clickable paid-form link.

- [ ] **Step 3: Run tests and confirm RED**

Run: `./node_modules/.bin/vitest run tests/service-page.test.ts tests/help-survey-poster.test.ts tests/navigation.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

- [ ] **Step 4: Implement `ServicePage.vue`**

Render full-width unframed sections in this order: compact offer header, suitable problems, deliverables, exclusions, six-step process, payment/application, rules, and 3–4 related cases. Use icons only where they improve scanning, sourced from the existing icon library. Do not nest cards inside cards.

- [ ] **Step 5: Replace `/help/` content and update navigation**

```md
---
title: WorkBuddy 定制服务
titleTemplate: false
description: 预约 45 分钟 WorkBuddy 需求诊断，明确范围、可行性、周期、风险与项目报价。
aside: false
outline: false
pageClass: custom-service-page
---

<ServicePage />
```

Change only the nav text from `提需求` to `定制服务`; retain `/help/`.

- [ ] **Step 6: Add responsive and theme styling**

Keep the page quiet and transactional: price, duration, CTA, rules, and QR must scan clearly. Use restrained full-width bands, radius no greater than `8px`, stable QR dimensions, no decorative gradients, and no oversized marketing hero. Confirm text wraps without overlapping at 390px.

- [ ] **Step 7: Run focused tests and commit**

Run: `./node_modules/.bin/vitest run tests/service-page.test.ts tests/help-survey-poster.test.ts tests/navigation.test.ts tests/case-submission-flow.test.ts --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

Always run:

```bash
git add docs/.vitepress/theme/ServicePage.vue docs/.vitepress/theme/service.css docs/.vitepress/theme/index.ts docs/.vitepress/navigation.ts docs/.vitepress/service-config.ts docs/help/index.md tests/service-page.test.ts tests/help-survey-poster.test.ts tests/navigation.test.ts tests/case-submission-flow.test.ts
```

When the operator supplied the payment asset, also run:

```bash
git add docs/public/article-assets/service/wechat-payment-qr.png
```

Then run `git commit -m "重构 WorkBuddy 定制服务页"`.

---

### Task 6: Full Verification and Browser Acceptance

**Files:**
- Modify only files required by defects found during verification.
- Test: all `tests/*.test.ts`

**Interfaces:**
- Consumes all earlier tasks.
- Produces a production-ready build and documented visual acceptance evidence.

- [ ] **Step 1: Run the full automated suite**

Run: `./node_modules/.bin/vitest run --dir tests --exclude '.worktrees/**' --exclude '.pnpm-store/**'`

Expected: every current-worktree test passes.

- [ ] **Step 2: Run content, asset, and production checks**

Run: `node scripts/check-content-links.mjs`

Run: `node scripts/check-replacement-assets.mjs`

Run: `./node_modules/.bin/vitepress build docs && node scripts/generate-legacy-redirects.mjs && node scripts/verify-publish-boundary.mjs`

Expected: zero broken internal links, zero missing assets, successful production build, valid legacy redirects, and no protected-path output.

- [ ] **Step 3: Start a production preview on a free port**

Run: `./node_modules/.bin/vitepress preview docs --host 127.0.0.1 --port 4181`

If `4181` is occupied, increment the port and record the actual URL. Keep the process running through browser acceptance.

- [ ] **Step 4: Verify the case gallery in a real browser**

At `1440x900`, `900x900`, and `390x844`, verify 3/2/1 columns, real cover rendering, stable card heights, search, category filtering, combined filtering, clear-filter empty state, keyboard focus, both themes, and `scrollWidth === clientWidth`.

- [ ] **Step 5: Verify both conversion paths**

From a case detail page, verify the paid CTA reaches `/help/`. From `/cases/`, verify “提交案例” opens only the free case form. Confirm the two URLs differ and both external links open in new pages.

- [ ] **Step 6: Verify the service flow**

Verify price, duration, rules, exclusions, QR readability, related-case links, and 390px wrapping. If production inputs are absent, verify closed state has no paid-form link; if present, verify the exact paid form URL and QR asset.

- [ ] **Step 7: Stop the preview and inspect the final diff**

Run: `git diff --check`

Run: `git status --short`

Confirm unrelated dirty files remain unstaged and unchanged.

- [ ] **Step 8: Commit only verification fixes, if any**

Stage each file actually changed during verification by its exact path, inspect `git diff --cached --stat`, then run `git commit -m "修复案例与定制服务验收问题"`.

Do not create an empty commit when no defects were found.
