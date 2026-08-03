# Case QR Left Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align the case collection co-creation QR card with the left edge of its text column.

**Architecture:** Keep the existing Markdown structure and embedded page styles. Add one source-level regression test, then replace the QR card's automatic horizontal margin with a zero margin.

**Tech Stack:** VitePress, Markdown, CSS, Vitest, TypeScript

## Global Constraints

- Keep the QR card width, padding, border, radius, background, image sizing, link, and copy unchanged.
- Apply the same left alignment on desktop and mobile.
- Do not add a new breakpoint or component.

---

### Task 1: Left-align the case co-creation QR card

**Files:**
- Create: `tests/case-page-style.test.ts`
- Modify: `docs/cases/index.md:158-169`

**Interfaces:**
- Consumes: the embedded `.case-co-create__qr` CSS rule in `docs/cases/index.md`
- Produces: a QR card whose horizontal margin is `0`

- [ ] **Step 1: Write the failing test**

```ts
// @vitest-environment node

import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

describe('case collection page styles', () => {
  it('left-aligns the co-creation QR card with the copy column', () => {
    const source = readFileSync('docs/cases/index.md', 'utf8')
    const rule = source.match(/\.case-co-create__qr\s*\{([^}]*)\}/)?.[1]

    expect(rule).toBeDefined()
    expect(rule).toMatch(/margin:\s*0;/)
    expect(rule).not.toMatch(/margin:\s*0\s+auto;/)
  })
})
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitest/vitest.mjs run tests/case-page-style.test.ts
```

Expected: FAIL because the existing rule contains `margin: 0 auto;`.

- [ ] **Step 3: Implement the minimal CSS change**

In `.case-co-create__qr`, replace:

```css
margin: 0 auto;
```

with:

```css
margin: 0;
```

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitest/vitest.mjs run tests/case-page-style.test.ts
/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitest/vitest.mjs run
/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node node_modules/vitepress/bin/vitepress.js build docs
```

Expected: the focused test passes, the full suite passes, and VitePress completes the production build.

- [ ] **Step 5: Commit and push the implementation**

```bash
git add tests/case-page-style.test.ts docs/cases/index.md docs/superpowers/plans/2026-08-02-case-qr-left-alignment.md
git commit -m "style: align case QR card with copy"
git push origin codex/global-footer-copy
```
