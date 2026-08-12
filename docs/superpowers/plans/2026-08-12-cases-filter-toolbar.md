# 案例集筛选工具横栏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将案例集分类标签与搜索框组成桌面端左标签、右搜索的水平工具栏，并在窄屏恢复搜索在上、标签在下。

**Architecture:** `CasesPage.vue` 继续复用现有 `query`、`category` 和分类按钮，不新增状态；只把筛选区从投稿侧栏移动到主内容区，并将投稿模块单独保留在固定侧栏。`cases.css` 使用 CSS Grid 实现桌面工具栏，用断点切换单列顺序；测试覆盖真实 DOM 归属、组合筛选和三档响应式合同。

**Tech Stack:** Vue 3、VitePress 1.6、TypeScript、CSS Grid、Vitest/jsdom。

## Global Constraints

- 桌面端分类标签位于左侧，搜索框位于右侧，顶部水平对齐。
- 标签顺序保持“全部、内容创作、数据分析、知识管理、自动化”。
- 标签优先单行排列，空间不足时允许标签组自然换行，不压缩文字。
- `1024px` 及以下搜索在上、标签在下；`640px` 及以下仍不得横向溢出。
- 右侧投稿二维码、投稿入口、固定侧栏和现有案例数据不变。
- 保留查询与分类组合筛选、`aria-pressed`、键盘焦点、空状态和清除筛选行为。

---

### Task 1: 重组筛选工具栏

**Files:**
- Modify: `docs/.vitepress/theme/CasesPage.vue`
- Test: `tests/cases-page.test.ts`

**Interfaces:**
- Consumes: `query: Ref<string>`、`category: Ref<string>`、`categories: ComputedRef<string[]>`、`categoryIcons: Record<string, string>`。
- Produces: 主栏内 `.wbx-cases-filter-toolbar`，包含 `.wbx-cases-categories` 与 `.wbx-cases-search`；侧栏仅保留 `#submit-case`。

- [ ] **Step 1: 写结构失败测试**

在真实组件挂载后增加：

```ts
const main = document.querySelector('.wbx-cases-main-column')
const toolbar = main?.querySelector('.wbx-cases-filter-toolbar')
const tools = document.querySelector('.wbx-cases-tools-column')

expect(toolbar?.querySelector('.wbx-cases-categories')).not.toBeNull()
expect(toolbar?.querySelector('.wbx-cases-search')).not.toBeNull()
expect(tools?.querySelector('.wbx-cases-search')).toBeNull()
expect(tools?.querySelector('.wbx-cases-categories')).toBeNull()
expect(tools?.querySelector('#submit-case')).not.toBeNull()
expect(
  [...toolbar!.querySelectorAll<HTMLButtonElement>('.wbx-cases-categories button')]
    .map((button) => button.dataset.category),
).toEqual(['全部', '内容创作', '数据分析', '知识管理', '自动化'])
```

- [ ] **Step 2: 运行测试并确认 RED**

Run:

```bash
../../node_modules/.bin/vitest run tests/cases-page.test.ts
```

Expected: FAIL，主栏内还没有 `.wbx-cases-filter-toolbar`。

- [ ] **Step 3: 实现最小 DOM 重排**

在 `CasesPage.vue` 的主标题与 `.wbx-cases-gallery-results` 之间加入：

```vue
<section class="wbx-cases-filter-toolbar" aria-label="案例搜索与分类筛选">
  <div class="wbx-cases-categories" aria-label="案例分类">
    <!-- 保留现有 v-for 按钮、图标、aria-pressed 与 click 逻辑 -->
  </div>
  <label class="wbx-cases-search">
    <span>搜索案例</span>
    <input v-model="query" type="search" placeholder="搜索场景、成果或产品" autocomplete="off">
  </label>
</section>
```

删除侧栏里的 `.wbx-cases-filter-panel`，侧栏只保留现有 `#submit-case`，不复制任何筛选控件。

- [ ] **Step 4: 运行测试并确认 GREEN**

```bash
../../node_modules/.bin/vitest run tests/cases-page.test.ts
```

Expected: PASS。

- [ ] **Step 5: 提交结构调整**

```bash
git add docs/.vitepress/theme/CasesPage.vue tests/cases-page.test.ts
git commit -m "重组案例集筛选工具栏"
```

---

### Task 2: 实现水平对齐与响应式规则

**Files:**
- Modify: `docs/.vitepress/theme/cases.css`
- Test: `tests/case-page-style.test.ts`
- Test: `tests/product-page-computed-style.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `.wbx-cases-filter-toolbar`、`.wbx-cases-categories`、`.wbx-cases-search`。
- Produces: 桌面左右工具栏、`1024px` 单列顺序和 `640px` 安全换行合同。

- [ ] **Step 1: 写响应式失败测试**

在样式测试中断言：

```ts
expect(source).toMatch(
  /\.wbx-cases-filter-toolbar\s*\{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(240px, 320px\)[^}]*align-items:\s*start/s,
)
expect(source).toMatch(
  /@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-filter-toolbar\s*\{[^}]*grid-template-columns:\s*1fr/s,
)
expect(source).toMatch(
  /@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-search\s*\{[^}]*order:\s*1[^}]*width:\s*100%/s,
)
expect(source).toMatch(
  /@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-categories\s*\{[^}]*order:\s*2/s,
)
```

在 computed-style fixture 中使用生产 DOM 层级，分别验证 `1440`、`1100`、`1024`、`900`、`390`：桌面两列、搜索宽度不超过 `320px`、窄屏单列、搜索在标签之前、按钮不缩小、页面级容器无宽度溢出。

- [ ] **Step 2: 运行测试并确认 RED**

```bash
../../node_modules/.bin/vitest run tests/case-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: FAIL，缺少新工具栏 CSS 和 computed-style 合同。

- [ ] **Step 3: 实现桌面工具栏**

在 `cases.css` 中添加并替换旧筛选面板规则：

```css
.wbx-cases-filter-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(240px, 320px);
  gap: 24px;
  align-items: start;
  margin: 28px 0 30px;
}

.wbx-cases-filter-toolbar .wbx-cases-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;
  margin: 0;
}

.wbx-cases-filter-toolbar .wbx-cases-search {
  width: 100%;
  max-width: 320px;
  justify-self: end;
}

.wbx-cases-categories button {
  flex: 0 0 auto;
  white-space: nowrap;
}
```

删除只服务旧 `.wbx-cases-filter-panel` 的布局规则，保留按钮、输入框和焦点样式。

- [ ] **Step 4: 实现窄屏顺序**

```css
@media (max-width: 1024px) {
  .wbx-cases-filter-toolbar {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .wbx-cases-filter-toolbar .wbx-cases-search {
    order: 1;
    width: 100%;
    max-width: none;
    justify-self: stretch;
  }

  .wbx-cases-filter-toolbar .wbx-cases-categories {
    order: 2;
  }
}
```

确认 `640px` 以下没有固定宽度或 `white-space` 施加到容器；按钮可以换行，但按钮文字保持完整。

- [ ] **Step 5: 运行聚焦测试并确认 GREEN**

```bash
../../node_modules/.bin/vitest run tests/cases-page.test.ts tests/case-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: PASS。

- [ ] **Step 6: 提交响应式实现**

```bash
git add docs/.vitepress/theme/cases.css tests/case-page-style.test.ts tests/product-page-computed-style.test.ts
git commit -m "完善案例筛选横栏响应式布局"
```

---

### Task 3: 全量验证与真实浏览器验收

**Files:**
- Verify only; no production files unless a verified defect requires a new TDD cycle.

**Interfaces:**
- Consumes: Tasks 1-2 的完整页面。
- Produces: 可供用户验收的本地生产预览与验证记录。

- [ ] **Step 1: 运行完整测试**

```bash
../../node_modules/.bin/vitest run --dir tests
```

Expected: 所有测试通过，零失败。

- [ ] **Step 2: 运行完整生产构建**

```bash
../../node_modules/.bin/vitepress build docs \
  && node scripts/generate-legacy-redirects.mjs \
  && node scripts/verify-publish-boundary.mjs
```

Expected: exit `0`，生产页面、旧路由和发布边界均通过。

- [ ] **Step 3: 验收桌面与响应式布局**

在生产预览检查 `/cases/`：

- `1440x900`：五个分类按钮优先单行；搜索框在右侧，顶部与按钮对齐；投稿二维码仍在固定侧栏。
- `1100x900`：标签可自然换行但不压字，搜索仍在右侧；没有横向溢出。
- `1024x900` 与 `900x900`：搜索在上、标签在下，搜索使用全宽。
- `390x844`：按钮自然换行，输入框与卡片均不超出视口。
- 每档记录 `scrollWidth === clientWidth`，并检查明暗主题与键盘焦点。

- [ ] **Step 4: 验收交互行为**

- 输入搜索词后卡片数量按标题、成果或产品过滤。
- 点击分类后 `aria-pressed` 与卡片结果同步。
- 同时使用搜索与分类后结果取交集。
- 空结果显示“没有找到匹配的案例”；点击“清除筛选”恢复全部案例。
- 投稿二维码和“查看投稿指南”仍可访问。

- [ ] **Step 5: 检查变更边界**

```bash
git diff --check
git status --short
```

Expected: 无格式错误；只包含本计划规定的实现、测试和验收记录。
