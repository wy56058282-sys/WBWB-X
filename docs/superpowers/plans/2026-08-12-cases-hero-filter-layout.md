# 案例集首屏筛选双栏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将案例集首页首屏改为标题左栏、筛选右栏，删除页内目录，并保持筛选功能及响应式卡片布局稳定。

**Architecture:** 只重排 `CasesPage.vue` 的现有节点，不引入新状态或组件。CSS 将首屏设为与定制服务页相近的双栏网格，案例卡片网格继续使用现有数据与过滤计算；`1024px` 及以下切回单栏。

**Tech Stack:** Vue 3、VitePress、CSS、Vitest、项目现有 HackerNoon 像素图标库。

## Global Constraints

- 删除案例集首页右侧“本页目录”及全部相关锚点。
- 桌面首屏左侧为标题介绍，右侧为浏览标题、搜索和分类筛选。
- `1024px` 及以下为单栏；搜索框占满可用宽度，分类自然换行。
- 筛选状态、空状态、分类图标、案例数据、投稿模块和详情页行为不变。
- 不引入新依赖，不产生横向溢出。

---

### Task 1: 重排案例集首屏并验证

**Files:**
- Modify: `docs/.vitepress/theme/CasesPage.vue`
- Modify: `docs/.vitepress/theme/cases.css`
- Modify: `tests/case-page-style.test.ts`
- Modify: `tests/cases-page.test.ts`

**Interfaces:**
- Consumes: `categories`, `cases`, `query`, `category`, `resetFilters()` 的现有 Vue 状态与行为。
- Produces: `.wbx-cases-hero` 双栏首屏、`.wbx-cases-filter-panel` 筛选右栏；不再输出 `.wbx-cases-outline`。

- [ ] **Step 1: 写入失败测试**

在 `tests/case-page-style.test.ts` 断言：

```ts
expect(pageSource).toContain('class="wbx-cases-hero"')
expect(pageSource).toContain('class="wbx-cases-filter-panel"')
expect(pageSource).not.toContain('class="wbx-cases-outline"')
expect(styles).toMatch(/\.wbx-cases-hero\s*\{[^}]*grid-template-columns:[^}]*minmax\(320px, 0\.7fr\)/s)
expect(styles).toMatch(/@media \(max-width:\s*1024px\)[\s\S]*?\.wbx-cases-hero\s*\{[^}]*grid-template-columns:\s*1fr/s)
```

在 `tests/cases-page.test.ts` 保留并运行现有搜索、分类和清除筛选交互断言，确认结构重排不改变状态流。

- [ ] **Step 2: 运行测试并验证 RED**

Run:

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/cases-page.test.ts
```

Expected: 因 `.wbx-cases-hero`、`.wbx-cases-filter-panel` 尚不存在且目录仍存在而失败；既有筛选交互测试继续通过。

- [ ] **Step 3: 最小化实现组件结构**

在 `CasesPage.vue`：

```vue
<section class="wbx-cases" aria-labelledby="case-gallery-title">
  <header class="wbx-cases-hero">
    <div class="wbx-cases-hero__copy">...</div>
    <section id="case-gallery" class="wbx-cases-filter-panel" aria-labelledby="case-gallery-heading">
      <!-- 浏览案例、搜索、分类按钮 -->
    </section>
  </header>
  <section class="wbx-cases-gallery-results">
    <!-- 原案例列表与空状态 -->
  </section>
  <!-- 原投稿模块 -->
</section>
```

删除 `.wbx-cases-outline` 的模板节点，不改变搜索、分类、卡片、空状态和投稿节点内部行为。

- [ ] **Step 4: 最小化实现响应式样式**

在 `cases.css`：

```css
.wbx-cases-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: 44px;
  align-items: start;
  padding: 26px 0 36px;
  border-bottom: 2px solid var(--wbx-ink);
}

.wbx-cases-filter-panel {
  min-width: 0;
}

@media (max-width: 1024px) {
  .wbx-cases-hero {
    grid-template-columns: 1fr;
    gap: 26px;
  }
}
```

移除旧 `.wbx-cases-shell` 双栏目录轨道和 `.wbx-cases-outline` 规则；让案例结果区继续使用现有 3/2/1 卡片网格。

- [ ] **Step 5: 运行聚焦测试并验证 GREEN**

Run:

```bash
./node_modules/.bin/vitest run tests/case-page-style.test.ts tests/cases-page.test.ts tests/product-page-computed-style.test.ts
```

Expected: 全部通过，标题/正文/紧凑控件排版合同不退化。

- [ ] **Step 6: 构建并进行真实浏览器验收**

Run:

```bash
./node_modules/.bin/vitepress build docs
```

在 production preview 检查：

- 1440px：标题与筛选区顶部对齐，目录不存在，案例卡片三列。
- 900px：首屏单栏，卡片两列。
- 390px：首屏单栏、搜索满宽、分类换行、卡片一列。
- 三档 `scrollWidth === clientWidth`；搜索、分类、清除筛选均可用。

- [ ] **Step 7: 提交**

```bash
git add docs/.vitepress/theme/CasesPage.vue docs/.vitepress/theme/cases.css tests/case-page-style.test.ts tests/cases-page.test.ts
git commit -m "重排案例集首屏筛选布局"
```
