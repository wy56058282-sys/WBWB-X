# Custom Service Offer and Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the legacy pay-first diagnostic page with a truthful, configurable service ladder and a consult-first conversion flow that separates paid services from WorkBuddy enterprise-seat purchasing.

**Architecture:** Keep service data and readiness validation in `docs/.vitepress/service-config.ts`, render all public states from `ServicePage.vue`, and preserve the existing VitePress theme and route. Three independent readiness flags control business WeChat, the application form, and the enterprise channel; absent assets must render explicit disabled placeholders rather than invented links or QR codes.

**Tech Stack:** Vue 3, VitePress 1.6, TypeScript, CSS, Vitest/jsdom, existing HackerNoon pixel icon font.

## Global Constraints

- Preserve `serviceConfig.freeCaseFormUrl` and the free case-submission flow.
- Do not publish the Anchang partner portal URL or any internal sales material.
- Do not expose a public payment QR. Payment is sent privately only after scope and time are confirmed.
- Do not invent business WeChat, application-form, enterprise-channel, price-source, or support-contact values.
- Default production state must be safe: `商务微信即将开放`, disabled `报名表准备中`, and an unavailable enterprise-channel action.
- Treat enterprise seat fees as tool-side payments; this site must never imply that it collects seat fees.
- State the 20+ seat benefit precisely as one or two 90-minute online workshops, not half-day FDE.
- Keep all prices in one typed configuration source and pair the enterprise public price with a source URL and verification date before displaying it.
- Preserve unrelated dirty worktree changes. Each commit must stage only files named by its task.
- Use `apply_patch` for manual edits and run `git diff --check` before every commit.

---

### Task 1: Replace the legacy readiness model with independent channel configuration

**Files:**
- Modify: `docs/.vitepress/service-config.ts`
- Modify: `docs/.vitepress/build-data-boundaries.ts`
- Modify: `docs/.vitepress/config.mts`
- Modify: `tests/service-config.test.ts`
- Modify: `tests/build-data-boundaries.test.ts`

- [ ] **Step 1: Write failing configuration tests**

Add tests that require:

```ts
expect(getServiceChannelState(config)).toEqual({
  businessWechatReady: false,
  applicationFormReady: false,
  enterpriseChannelReady: false,
})
```

Cover HTTPS-only external form URLs, local `/article-assets/` QR paths, independent readiness, empty safe defaults, centralized ladder prices, and enterprise-price source metadata. Assert that a configured application form cannot make business WeChat or enterprise purchasing appear ready.

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```bash
./node_modules/.bin/vitest run tests/service-config.test.ts tests/build-data-boundaries.test.ts
```

Expected: failures for the missing channel-state API and obsolete pay-first assertions.

- [ ] **Step 3: Implement the typed configuration**

Replace `paidDiagnosticFormUrl`, `paymentQrPath`, and the single `isPaidServiceReady` gate with typed data similar to:

```ts
export interface ServiceChannelConfig {
  businessWechatQrPath: string
  applicationFormUrl: string
  enterpriseChannelQrPath: string
}

export const serviceCatalog = {
  diagnosis: { price: 399, duration: '45 分钟' },
  training: { priceFrom: 2999, duration: '约 2 小时' },
  fde: { priceFrom: 5999, duration: '半天' },
  implementation: { priceFrom: 12800 },
  ongoingSupport: { billing: '按月' },
} as const
```

Retain `freeCaseFormUrl`. Export one pure readiness function whose three booleans are derived independently from validated values. Keep local asset path validation and HTTPS URL normalization.

- [ ] **Step 4: Update build-time asset boundaries**

Validate only configured local QR assets. Empty placeholders must build successfully; configured paths must resolve inside `docs/public/article-assets/`. Remove the obsolete requirement for a public payment QR.

- [ ] **Step 5: Run tests and verify GREEN**

Run:

```bash
./node_modules/.bin/vitest run tests/service-config.test.ts tests/build-data-boundaries.test.ts tests/case-submission-flow.test.ts
```

Expected: all pass, including unchanged free-case submission behavior.

- [ ] **Step 6: Commit the configuration layer**

```bash
git add docs/.vitepress/service-config.ts docs/.vitepress/build-data-boundaries.ts docs/.vitepress/config.mts tests/service-config.test.ts tests/build-data-boundaries.test.ts
git diff --cached --check
git commit -m "重构定制服务渠道配置"
```

---

### Task 2: Rebuild the service page information architecture and conversion flow

**Files:**
- Modify: `docs/.vitepress/theme/ServicePage.vue`
- Modify: `tests/service-page.test.ts`
- Modify: `tests/case-submission-flow.test.ts`
- Modify: `tests/help-survey-poster.test.ts`

- [ ] **Step 1: Replace old behavioral assertions with the approved contract**

Write tests for:

- the five-offer ladder and exact public prices/durations;
- enterprise purchase as a separate section;
- Tencent Cloud registration and personal real-name verification;
- 20+ seats receiving one or two 90-minute online workshops;
- no base deployment requirement;
- discretionary free help for simple tasks;
- the ordered consult-first process;
- no public payment QR or pay-first language;
- independent placeholder and ready states;
- the 30-day unclosed-data deletion rule;
- existing related-case links and free case submission remaining intact.

Ready-state tests must configure real-looking test fixtures only, for example `https://forms.example.com/diagnosis`, and must restore `serviceConfig` after each case.

- [ ] **Step 2: Run functional tests and confirm RED**

Run:

```bash
./node_modules/.bin/vitest run tests/service-page.test.ts tests/case-submission-flow.test.ts tests/help-survey-poster.test.ts
```

Expected: failures because the page still renders the old pay-first flow.

- [ ] **Step 3: Rewrite the page structure**

Implement these sections in order:

1. Hero: `WorkBuddy 需求诊断`, ¥399, 45 minutes, fixed deliverable summary.
2. Service ladder: diagnosis, training, FDE, project implementation, ongoing support.
3. Enterprise purchase: dedicated channel, seat-fee boundary, 20+ seat workshop benefit.
4. Suitable problems and diagnostic outputs.
5. Consult-first application process.
6. Exclusions, service rules, privacy, and related cases.

Use semantic headings, lists, `aria-labelledby`, and real anchors. Do not add decorative nested cards.

- [ ] **Step 4: Implement independent public states**

Render exact fallback behavior:

```vue
<span v-if="!channelState.businessWechatReady" aria-disabled="true">
  商务微信即将开放
</span>
<button v-if="!channelState.applicationFormReady" type="button" disabled>
  报名表准备中
</button>
```

When ready, business WeChat and enterprise-channel QR images use `withBase`; the application form is an HTTPS external link with `target="_blank" rel="noopener noreferrer"`. The enterprise action must not reuse the diagnostic application-form URL.

- [ ] **Step 5: Verify functional behavior**

Run:

```bash
./node_modules/.bin/vitest run tests/service-page.test.ts tests/case-submission-flow.test.ts tests/help-survey-poster.test.ts
```

Expected: all pass. Search the rendered source contract to confirm `paymentQrPath`, `微信支付`, and `先支付` are absent.

- [ ] **Step 6: Commit the page behavior**

```bash
git add docs/.vitepress/theme/ServicePage.vue tests/service-page.test.ts tests/case-submission-flow.test.ts tests/help-survey-poster.test.ts
git diff --cached --check
git commit -m "重构定制服务产品与转化流程"
```

---

### Task 3: Align the rebuilt page with the site visual system

**Files:**
- Modify: `docs/.vitepress/theme/service.css`
- Modify: `tests/service-page-style.test.ts`
- Modify: `tests/product-page-computed-style.test.ts`
- Modify: `tests/case-page-style.test.ts`

- [ ] **Step 1: Add failing visual-contract tests**

Require:

- the existing 1104px page baseline and guide-like type scale;
- a readable desktop service ladder without nested cards;
- straight 2px borders, zero-radius command buttons, accent-green primary actions;
- visibly disabled placeholder controls;
- distinct diagnostic and enterprise conversion surfaces;
- 3/2/1 responsive service grids where applicable;
- no horizontal overflow at 390px;
- focus-visible treatment with high-contrast ink/accent rings;
- compact helper text, prices, labels, and metadata on mobile.

Use real production-like DOM hierarchy in computed-style fixtures. Do not use manual specificity emulation or jsdom `getBoundingClientRect()` as proof of geometry.

- [ ] **Step 2: Run style tests and confirm RED**

Run:

```bash
./node_modules/.bin/vitest run tests/service-page-style.test.ts tests/product-page-computed-style.test.ts tests/case-page-style.test.ts
```

Expected: failures for missing new service classes and responsive contracts.

- [ ] **Step 3: Implement the visual system**

Update `service.css` using existing tokens (`--wbx-ink`, `--wbx-accent`, `--wbx-line`, VitePress theme variables). Keep headings at letter-spacing `0`, reserve Silkscreen for small labels/numbers, and avoid section-level decorative boxes. Make disabled states unmistakable without lowering text contrast below readable levels.

- [ ] **Step 4: Implement responsive layout**

At desktop, allow comparison scanning across the ladder while keeping the enterprise path visually separate. At tablet, reduce to two columns; at mobile, stack to one column with full-width commands and stable tap targets of at least 44px.

- [ ] **Step 5: Verify visual contracts**

Run:

```bash
./node_modules/.bin/vitest run tests/service-page-style.test.ts tests/product-page-computed-style.test.ts tests/case-page-style.test.ts
```

Expected: all pass without weakening existing guide/cases contracts.

- [ ] **Step 6: Commit styles and regression tests**

```bash
git add docs/.vitepress/theme/service.css tests/service-page-style.test.ts tests/product-page-computed-style.test.ts tests/case-page-style.test.ts
git diff --cached --check
git commit -m "统一定制服务页面视觉与响应式"
```

---

### Task 4: Verify security, content boundaries, and the full production build

**Files:**
- Modify only if a genuine defect is found: files already listed in Tasks 1–3
- Create: `docs/superpowers/reports/2026-08-15-custom-service-offer-and-conversion.md`

- [ ] **Step 1: Run the complete automated suite**

Run:

```bash
./node_modules/.bin/vitest run
npm run check:links
npm run check:assets
npm run build
git diff --check
```

Expected: all commands pass. Record command output summaries in the report.

- [ ] **Step 2: Audit forbidden public content**

Run:

```bash
rg -n "agentos-app|paymentQrPath|微信支付|先支付|半天 FDE" docs tests
```

Expected: no public Anchang URL, no public payment QR, no pay-first flow, and no incorrect 20+ seat FDE promise. Test descriptions may mention forbidden strings only when asserting their absence.

- [ ] **Step 3: Start a fresh production preview**

Run:

```bash
npm run preview -- --host 127.0.0.1 --port 4192
```

If the port is occupied, choose the next free port and record it.

- [ ] **Step 4: Complete browser acceptance at 1440, 900, and 390px**

For `/help/` in light and dark themes verify:

- the service ladder, enterprise path, and diagnosis path are visually distinct;
- default placeholders display exact approved copy and cannot be activated;
- no payment QR or fake form/channel link exists;
- all headings, prices, durations, rules, and 20+ seat benefit are correct;
- keyboard focus follows document order and remains visible;
- no horizontal overflow, overlap, clipped copy, layout jump, or console error occurs;
- `/cases/`, `/community/case-contributing`, and related-case links still work.

Capture screenshots for each viewport and preserve them beside the report.

- [ ] **Step 5: Test each ready state independently**

Using test-only configuration values, rebuild or mount the page three times so each channel is enabled alone. Verify that enabling one channel never enables another, QR alternative text is meaningful, external links are HTTPS and safe, and empty values return to disabled placeholders.

- [ ] **Step 6: Write the verification report**

Document exact commands, pass counts, preview URL, viewport/theme matrix, screenshots, known limitations, and the explicit statement that real channel assets are still required before enabling each flag.

- [ ] **Step 7: Commit verification artifacts**

```bash
git add docs/superpowers/reports/2026-08-15-custom-service-offer-and-conversion.md
git diff --cached --check
git commit -m "记录定制服务页面验收结果"
```

---

### Task 5: Prepare activation without deploying placeholder credentials

**Files:**
- Modify when real assets arrive: `docs/.vitepress/service-config.ts`
- Add when real assets arrive: `docs/public/article-assets/<approved-business-wechat-asset>`
- Add when real assets arrive: `docs/public/article-assets/<approved-enterprise-channel-asset>`

- [ ] **Step 1: Obtain and verify the real assets**

Require from the owner:

- approved enterprise WeChat QR for diagnosis consulting;
- approved WeCom collection-form HTTPS URL;
- approved enterprise purchase channel QR;
- current enterprise seat-price source URL and verification date;
- public support/contact wording.

Do not proceed from screenshots, internal portals, or guessed URLs.

- [ ] **Step 2: Activate one channel at a time**

Copy approved QR files into `docs/public/article-assets/`, configure exact values, then run focused config, boundary, and page tests after each change. Confirm only the intended readiness flag becomes true.

- [ ] **Step 3: Run final release verification**

Run:

```bash
./node_modules/.bin/vitest run
npm run check:links
npm run check:assets
npm run build
git diff --check
```

Expected: all pass and the production build contains no internal Anchang URL or public payment QR.

- [ ] **Step 4: Commit activation separately**

```bash
git add docs/.vitepress/service-config.ts docs/public/article-assets/
git diff --cached --check
git commit -m "启用定制服务咨询与企业采购渠道"
```
