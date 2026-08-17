# Service Obstacle Four-Column Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the confirmed fourth service obstacle “推不开” and render the obstacle list as a responsive 4/2/1 grid without changing the home page or the lower service sections.

**Architecture:** Keep the obstacle content in the existing `fdeObstacles` tuple array so rendering and visual numbering remain data-driven. Add a narrowly scoped `.wbx-service-fde-obstacles` style block in `service.css`, then extend existing component and stylesheet contract tests before rebuilding and visually checking `/help/`.

**Tech Stack:** Vue 3 SFC, VitePress 1.6, TypeScript, CSS Grid, Vitest + jsdom.

## Global Constraints

- The four items are ordered `不会用`, `跑不通`, `管不住`, `推不开`.
- The fourth description is exactly `方案已经跑通，却缺少负责人、推广节奏和使用反馈，难以从试点扩展到团队。`.
- Desktop uses four equal columns, tablet uses two columns, and mobile uses one column.
- Reuse the service page background and visual language; do not add card borders, rounded cards, a large gray panel, icons, images, links, interactions, or animation.
- Keep “三层服务” and “五步实施方法” unchanged.
- Do not modify `HomePage.vue` or `home.css`.
- Do not deploy.

---

### Task 1: Add the fourth obstacle and update the semantic contract

**Files:**
- Modify: `tests/service-page.test.ts:203-228`
- Modify: `docs/.vitepress/theme/ServicePage.vue:17-21,108-114`

**Interfaces:**
- Consumes: `fdeObstacles`, a readonly array of `[title: string, description: string]` tuples rendered by the existing `v-for`.
- Produces: four `.wbx-service-fde-obstacles > li` elements, visual indexes `01` through `04`, and the list accessible name `企业 AI 落地的四类障碍`.

- [ ] **Step 1: Write the failing component test**

Update the existing FDE test to assert the fourth item, exact description, accessible name, and the new total number of visual indexes:

```ts
const obstacleList = model?.querySelector('.wbx-service-fde-obstacles')
const obstacles = obstacleList?.querySelectorAll(':scope > li') ?? []
const obstacleIndexes = Array.from(obstacleList?.querySelectorAll(':scope > li > span') ?? [])

expect(obstacles).toHaveLength(4)
expect(obstacleList?.getAttribute('aria-label')).toBe('企业 AI 落地的四类障碍')
expect(Array.from(obstacles, (item) => item.querySelector('h3')?.textContent)).toEqual([
  '不会用',
  '跑不通',
  '管不住',
  '推不开',
])
expect(obstacles[3]?.querySelector('p')?.textContent).toBe(
  '方案已经跑通，却缺少负责人、推广节奏和使用反馈，难以从试点扩展到团队。',
)
expect(obstacleIndexes.map((index) => index.textContent)).toEqual(['01', '02', '03', '04'])
expect(manualIndexes).toHaveLength(12)
```

- [ ] **Step 2: Run the test and verify the new contract fails**

Run:

```bash
npm test -- tests/service-page.test.ts
```

Expected: FAIL because the current list has three items, lacks “推不开”, still says `三类障碍`, and has 11 visual indexes.

- [ ] **Step 3: Implement the minimal content change**

Append the confirmed tuple and update the accessible name:

```ts
const fdeObstacles = [
  ['不会用', '团队知道工具，却还没有把能力映射到岗位任务和日常工作流。'],
  ['跑不通', '场景、资料、权限与协作链路没有形成可验证的完整闭环。'],
  ['管不住', '成果缺少验收标准、权限边界、复盘机制和持续治理。'],
  ['推不开', '方案已经跑通，却缺少负责人、推广节奏和使用反馈，难以从试点扩展到团队。'],
] as const
```

```vue
<ul class="wbx-service-fde-obstacles" aria-label="企业 AI 落地的四类障碍">
```

- [ ] **Step 4: Run the component test and verify it passes**

Run:

```bash
npm test -- tests/service-page.test.ts
```

Expected: 15 tests pass with zero failures.

- [ ] **Step 5: Commit only the component contract and content**

```bash
git add tests/service-page.test.ts docs/.vitepress/theme/ServicePage.vue
git commit -m "feat: add fourth service obstacle"
```

Before committing, confirm `git diff --cached --name-only` lists exactly those two files so unrelated working-tree changes remain untouched.

---

### Task 2: Add the responsive four-column obstacle layout

**Files:**
- Modify: `tests/service-page-style.test.ts:27-46`
- Modify: `docs/.vitepress/theme/service.css:198-202,508-533,542-615`

**Interfaces:**
- Consumes: `.wbx-service-fde-obstacles`, its direct `li` children, and the existing variables `--vp-c-brand-1`, `--wbx-pixel`, `--wbx-ink`, and `--wbx-muted`.
- Produces: a borderless 4-column grid above 900px, a 2-column grid at 900px and below, and a 1-column grid at 640px and below.

- [ ] **Step 1: Write the failing stylesheet contract test**

Add a focused test to `tests/service-page-style.test.ts`:

```ts
it('renders the four service obstacles as a borderless 4/2/1 responsive grid', () => {
  const styles = readFileSync('docs/.vitepress/theme/service.css', 'utf8')

  expect(styles).toMatch(/\.wbx-service-fde-obstacles\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\)[^}]*list-style:\s*none/s)
  expect(styles).toMatch(/\.wbx-service-fde-obstacles\s*>\s*li\s*\{[^}]*min-width:\s*0[^}]*border:\s*0/s)
  expect(styles).toMatch(/\.wbx-service-fde-obstacles\s*>\s*li\s*>\s*span\s*\{[^}]*color:\s*var\(--vp-c-brand-1\)[^}]*font-family:\s*var\(--wbx-pixel\)/s)
  expect(styles).toMatch(/@media \(max-width:\s*900px\)[\s\S]*?\.wbx-service-fde-obstacles\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/s)
  expect(styles).toMatch(/@media \(max-width:\s*640px\)[\s\S]*?\.wbx-service-fde-obstacles\s*\{[^}]*grid-template-columns:\s*1fr/s)
  expect(styles).not.toMatch(/\.wbx-service-fde-obstacles\s*>\s*li\s*\{[^}]*border-radius:/s)
})
```

- [ ] **Step 2: Run the style test and verify the new contract fails**

Run:

```bash
npm test -- tests/service-page-style.test.ts
```

Expected: FAIL because `service.css` has no dedicated obstacle grid rules.

- [ ] **Step 3: Implement the desktop visual hierarchy**

Insert after `.wbx-service-section__heading`:

```css
.wbx-service-fde-obstacles {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.wbx-service-fde-obstacles > li {
  min-width: 0;
  margin: 0;
  border: 0;
  padding: 0;
}

.wbx-service-fde-obstacles > li > span {
  color: var(--vp-c-brand-1);
  font-family: var(--wbx-pixel);
  font-size: 12px;
}

.wbx-service-fde-obstacles h3 {
  margin: 8px 0 7px;
  color: var(--wbx-ink);
}

.wbx-service-fde-obstacles p {
  margin-bottom: 0;
  color: var(--wbx-muted);
  font-size: 14px;
  line-height: 1.7;
}
```

- [ ] **Step 4: Implement tablet and mobile column changes**

Add inside the existing `@media (max-width: 900px)` block:

```css
.wbx-service-fde-obstacles {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
```

Add inside the existing `@media (max-width: 640px)` block:

```css
.wbx-service-fde-obstacles {
  grid-template-columns: 1fr;
}
```

- [ ] **Step 5: Run both focused test files and verify they pass**

Run:

```bash
npm test -- tests/service-page.test.ts tests/service-page-style.test.ts
```

Expected: 21 tests pass with zero failures after the new style test is added.

- [ ] **Step 6: Commit only the responsive layout and its test**

```bash
git add tests/service-page-style.test.ts docs/.vitepress/theme/service.css
git commit -m "style: lay out four service obstacles"
```

Before committing, confirm `git diff --cached --name-only` lists exactly those two files.

---

### Task 3: Verify the build and refresh the local preview

**Files:**
- Verify: `docs/.vitepress/theme/ServicePage.vue`
- Verify: `docs/.vitepress/theme/service.css`
- Verify: `tests/service-page.test.ts`
- Verify: `tests/service-page-style.test.ts`

**Interfaces:**
- Consumes: the updated page source and the existing VitePress preview route `http://127.0.0.1:4197/help/`.
- Produces: fresh test/build evidence and a running local preview; no source changes and no deployment.

- [ ] **Step 1: Run the full repository verification**

Run:

```bash
npm run check
```

Expected: all Vitest files pass, internal links report zero broken links, replacement assets pass, and VitePress completes the production build. The existing Rollup chunk-size warning is non-blocking.

- [ ] **Step 2: Restart the static preview against the fresh build**

Resolve the exact process listening on port 4197 with `lsof -nP -iTCP:4197 -sTCP:LISTEN`. If it is the existing VitePress preview for this workspace, stop that exact PID with `SIGTERM`, then run:

```bash
npm run preview -- --host 127.0.0.1 --port 4197
```

Expected: `Built site served at http://localhost:4197/`.

- [ ] **Step 3: Verify desktop behavior in the local browser**

Open `http://127.0.0.1:4197/help/` and verify:

- the obstacle list contains exactly four items in the confirmed order;
- the fourth title is `推不开` with the exact confirmed description;
- the list is four equal columns at the default desktop viewport;
- there are no obstacle card borders, rounded cards, icons, or gray outer panel;
- “三层服务” and “五步实施方法” retain their existing content.

- [ ] **Step 4: Verify tablet and mobile behavior**

Use a viewport at or below 900px to confirm two columns, then a viewport at or below 640px to confirm one column. At the mobile viewport confirm `document.documentElement.scrollWidth <= document.documentElement.clientWidth`.

- [ ] **Step 5: Reset the temporary viewport and keep the clean preview URL open**

Reset the browser viewport override, return to `http://127.0.0.1:4197/help/`, keep the tab as the deliverable, and report that no deployment occurred.
