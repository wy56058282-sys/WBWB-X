# 案例集固定侧栏布局 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将案例集首页改为桌面端 `3:1` 主内容与固定工具侧栏，并在 `1024px` 及以下恢复规定顺序的单栏布局。

**Architecture:** `CasesPage.vue` 继续作为唯一案例集交互组件，但 DOM 重组为主栏与侧栏两个明确边界；现有 `query`、`category`、`cases` 和投稿条件逻辑原样复用。`cases.css` 负责桌面 3:1 网格、侧栏 sticky、卡片断点和移动端排序，不新增运行时布局代码。

**Tech Stack:** Vue 3、VitePress 1.6、TypeScript、CSS Grid、Vitest/jsdom。

## Global Constraints

- 保留现有案例数据、筛选行为、卡片内容和投稿条件逻辑。
- 桌面左侧主栏包含标题、案例卡片或无结果状态；右侧只包含搜索、分类筛选和投稿入口。
- 右侧工具栏使用 `position: sticky`，顶部偏移避开全局导航。
- `1024px` 及以下顺序为标题、筛选、案例列表、投稿，并取消 sticky。
- 不修改案例详情页侧边栏、案例内容、封面、分类、排序或后台系统。
- 不覆盖当前工作树中与视觉验收相关的未提交改动。

---

### Task 1: 重组主栏与固定侧栏

**Files:**
- Modify: `docs/.vitepress/theme/CasesPage.vue`
- Modify: `docs/.vitepress/theme/cases.css`
- Test: `tests/cases-page.test.ts`
- Test: `tests/case-page-style.test.ts`

**Interfaces:**
- Consumes: 现有 `query: Ref<string>`、`category: Ref<string>`、`cases: ComputedRef<CaseCatalogItem[]>`、`resetFilters()`、`serviceConfig.freeCaseFormUrl`。
- Produces: `.wbx-cases-layout-grid`、`.wbx-cases-main-column`、`.wbx-cases-tools-column` 三个布局边界；现有 `.wbx-cases-filter-panel`、`.wbx-cases-submit` 作为侧栏内容保留。

- [ ] **Step 1: 写结构失败测试**

在 `tests/cases-page.test.ts` 挂载真实组件后断言：

```ts
const layout = document.querySelector('.wbx-cases-layout-grid')
const main = layout?.querySelector(':scope > .wbx-cases-main-column')
const tools = layout?.querySelector(':scope > .wbx-cases-tools-column')

expect(main?.querySelector('#case-gallery-title')).not.toBeNull()
expect(main?.querySelector('.wbx-cases-gallery-results')).not.toBeNull()
expect(main?.querySelector('.wbx-cases-submit')).toBeNull()
expect(tools?.querySelector('.wbx-cases-search')).not.toBeNull()
expect(tools?.querySelector('.wbx-cases-categories')).not.toBeNull()
expect(tools?.querySelector('#submit-case')).not.toBeNull()
```

在 `tests/case-page-style.test.ts` 断言 CSS 合同：

```ts
expect(source).toMatch(/\.wbx-cases-layout-grid\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0, 3fr\) minmax\(240px, 1fr\)/s)
expect(source).toMatch(/\.wbx-cases-tools-column\s*\{[^}]*position:\s*sticky[^}]*top:\s*calc\(var\(--vp-nav-height\) \+ 24px\)/s)
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
./node_modules/.bin/vitest run tests/cases-page.test.ts tests/case-page-style.test.ts
```

Expected: FAIL，缺少新的主栏、工具栏和 sticky CSS。

- [ ] **Step 3: 实现最小 DOM 重排**

将 `CasesPage.vue` 改为以下结构，保留现有卡片循环、空状态和投稿条件分支的内部内容：

```vue
<section class="wbx-cases" aria-labelledby="case-gallery-title">
  <div class="wbx-cases-layout-grid">
    <main class="wbx-cases-main-column">
      <header class="wbx-cases-hero">...</header>
      <section class="wbx-cases-gallery-results">...</section>
    </main>
    <aside class="wbx-cases-tools-column" aria-label="案例搜索、筛选与投稿">
      <section id="case-gallery" class="wbx-cases-filter-panel">...</section>
      <section id="submit-case" class="wbx-cases-submit">...</section>
    </aside>
  </div>
</section>
```

在 `cases.css` 增加：

```css
.wbx-cases-layout-grid {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(240px, 1fr);
  gap: 44px;
  align-items: start;
}

.wbx-cases-main-column,
.wbx-cases-tools-column {
  min-width: 0;
}

.wbx-cases-tools-column {
  position: sticky;
  top: calc(var(--vp-nav-height) + 24px);
  display: grid;
  gap: 36px;
  align-self: start;
}
```

删除旧首屏两栏和 `translateY(30px)` 规则，避免双重布局。

- [ ] **Step 4: 运行聚焦测试并确认 GREEN**

Run:

```bash
./node_modules/.bin/vitest run tests/cases-page.test.ts tests/case-page-style.test.ts
```

Expected: PASS。

- [ ] **Step 5: 提交独立实现**

```bash
git add docs/.vitepress/theme/CasesPage.vue docs/.vitepress/theme/cases.css tests/cases-page.test.ts tests/case-page-style.test.ts
git commit -m "重构案例集固定工具侧栏"
```

---

### Task 2: 卡片列数与移动端内容顺序

**Files:**
- Modify: `docs/.vitepress/theme/cases.css`
- Test: `tests/case-page-style.test.ts`
- Test: `tests/product-page-computed-style.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `.wbx-cases-layout-grid`、`.wbx-cases-main-column`、`.wbx-cases-tools-column`。
- Produces: 桌面主栏可读卡片断点、`1024px` 单栏规则、无横向溢出的宽度合同。

- [ ] **Step 1: 写响应式失败测试**

在样式测试中加入：

```ts
expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-layout-grid\s*\{[^}]*grid-template-columns:\s*1fr/s)
expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-tools-column\s*\{[^}]*position:\s*static/s)
expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-tools-column\s*\{[^}]*order:\s*2/s)
expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-gallery-results\s*\{[^}]*order:\s*3/s)
expect(source).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-submit\s*\{[^}]*order:\s*4/s)
```

扩展 computed-style fixture，使 `1440`、`1100`、`1024`、`900`、`390` 均包含真实 main/tools 结构，并断言对应 grid/position/order。

- [ ] **Step 2: 运行测试并确认 RED**

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: FAIL，移动端仍使用旧 hero 断点且没有内容顺序合同。

- [ ] **Step 3: 实现响应式布局**

在 `cases.css` 中使用 grid areas，确保桌面和单栏顺序明确：

```css
.wbx-cases-layout-grid {
  grid-template-areas: "main tools";
}

.wbx-cases-main-column {
  grid-area: main;
}

.wbx-cases-tools-column {
  grid-area: tools;
}

@media (max-width: 1024px) {
  .wbx-cases-layout-grid {
    display: contents;
  }

  .wbx-cases {
    display: flex;
    flex-direction: column;
  }

  .wbx-cases-main-column,
  .wbx-cases-tools-column {
    display: contents;
  }

  .wbx-cases-hero { order: 1; }
  .wbx-cases-filter-panel { order: 2; }
  .wbx-cases-gallery-results { order: 3; }
  .wbx-cases-submit { order: 4; }
}
```

若 `display: contents` 导致语义或浏览器可访问树风险，则改用同一 DOM 的 CSS Grid areas，不复制筛选或投稿节点。搜索框宽度设为 `100%`，二维码使用 `max-width: 100%; height: auto`。

卡片网格按主栏实际宽度设置：宽桌面三列、中等桌面两列、`640px` 以下单列；每卡可用宽度不得低于 `220px`。

- [ ] **Step 4: 运行响应式测试并确认 GREEN**

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: PASS。

- [ ] **Step 5: 提交响应式实现**

```bash
git add docs/.vitepress/theme/cases.css tests/case-page-style.test.ts tests/product-page-computed-style.test.ts
git commit -m "完善案例集侧栏响应式布局"
```

---

### Task 3: 投稿状态与交互回归

**Files:**
- Modify: `tests/cases-page.test.ts`
- Modify: `tests/case-page-style.test.ts`
- Verify: `docs/.vitepress/theme/CasesPage.vue`
- Verify: `docs/.vitepress/theme/cases.css`

**Interfaces:**
- Consumes: 现有 `isServiceFormUrl()` 与 `serviceConfig.freeCaseFormUrl` 条件渲染。
- Produces: 侧栏内筛选、空状态恢复、表单/二维码互斥和键盘焦点回归合同。

- [ ] **Step 1: 增加真实交互断言**

在 `tests/cases-page.test.ts` 保留现有搜索、分类与清除筛选流程，并补充：

```ts
expect(document.querySelector('.wbx-cases-tools-column #submit-case')).not.toBeNull()
expect(document.querySelectorAll('.wbx-cases-submit').length).toBe(1)
expect(document.querySelector('.wbx-cases-submit__qr img')?.getAttribute('alt')).toContain('投稿问卷二维码')
expect(document.querySelector('.wbx-cases-submit a[href*="case-contributing"]')).not.toBeNull()
```

通过现有配置 fixture 分别验证有效表单 URL 与二维码 fallback 不会同时显示。

- [ ] **Step 2: 增加焦点与溢出样式合同**

在 `tests/case-page-style.test.ts` 断言搜索、筛选、二维码链接和投稿指南均有 `:focus-visible` 样式；二维码图片不超过侧栏宽度。

- [ ] **Step 3: 运行相关测试**

```bash
./node_modules/.bin/vitest run tests/cases-page.test.ts tests/case-page-style.test.ts tests/case-submit-qr.test.ts tests/product-page-computed-style.test.ts
```

Expected: PASS；如既有测试文件名不同，使用 `rg -l "投稿问卷二维码|freeCaseFormUrl" tests` 找到并运行真实测试文件，不创建重复测试。

- [ ] **Step 4: 运行全量测试与构建**

```bash
./node_modules/.bin/vitest run --dir tests
./node_modules/.bin/vitepress build docs
git diff --check
```

Expected: 全部 PASS；构建仅允许既有 chunk-size warning。

- [ ] **Step 5: 提交回归覆盖**

```bash
git add tests/cases-page.test.ts tests/case-page-style.test.ts tests/product-page-computed-style.test.ts
git commit -m "补充案例集固定侧栏回归测试"
```

---

### Task 4: 生产预览视觉验收

**Files:**
- Create: `.superpowers/sdd/2026-08-12-cases-sticky-sidebar/task-4-report.md`
- Verify: `docs/.vitepress/theme/CasesPage.vue`
- Verify: `docs/.vitepress/theme/cases.css`

**Interfaces:**
- Consumes: Task 1-3 的最终生产构建。
- Produces: 可复核的桌面 sticky、响应式顺序、交互、主题与溢出验收记录。

- [ ] **Step 1: 启动全新生产预览**

```bash
./node_modules/.bin/vitepress preview docs --host 127.0.0.1 --port 4181
```

若端口占用，先停止本任务现有预览进程，再启动当前构建；不要在构建进行中复用旧 preview。

- [ ] **Step 2: 验收 1440x900 桌面布局**

记录 DOM bounding boxes 与 computed styles：主栏/侧栏宽度接近 `3:1`；侧栏顶部偏移避开导航；滚动 800px 前后侧栏 `top` 保持 sticky 值；标题与三列/两列卡片不重叠；二维码完整解码；`scrollWidth === clientWidth`。

- [ ] **Step 3: 验收 1024x900 与 390x844 单栏**

确认 DOM 视觉顺序严格为标题、筛选、案例、投稿；侧栏 computed `position` 非 sticky；搜索满宽、标签自然换行、二维码不溢出；390px 案例卡单列且页面无横向滚动。

- [ ] **Step 4: 验收交互与主题**

在浅色和深色主题验证搜索+分类组合、清除筛选、卡片跳转、二维码大图和投稿指南；键盘依次聚焦输入框、全部分类按钮、案例卡片、二维码和投稿指南，焦点清晰可见。

- [ ] **Step 5: 写验收报告并最终检查**

在报告中记录 URL、viewport、主题、关键 bounding boxes、sticky 前后位置、交互步骤、console 错误数和溢出数值。最后运行：

```bash
git status --short
git diff --check
```

明确区分本任务提交与进入任务前已有的未提交验收改动；不部署线上。
