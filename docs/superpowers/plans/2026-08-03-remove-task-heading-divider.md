# 首页任务标题分割线移除 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 移除首页任务标题区域顶部横线，同时保留现有间距与任务网格边框。

**Architecture:** 不改动 Vue 结构，只调整 `home.css` 中 compact 标题修饰类的边框声明。使用现有首页 CSS 回归测试同时锁定“标题无顶边框”和“任务网格仍有顶边框”。

**Tech Stack:** VitePress 1.6、CSS、Vitest 2

## Global Constraints

- 仅移除 `.wbx-section__heading--compact` 的 `border-top`。
- 保留 `padding-top: 18px`。
- 保留 `.wbx-task-grid` 的 `border-top: 1px solid var(--wbx-line)`。
- 不修改文案、组件结构、卡片样式或响应式布局。

---

### Task 1: 移除任务标题分割线

**Files:**
- Modify: `tests/home-hero-icons.test.ts`
- Modify: `docs/.vitepress/theme/home.css:577-585`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: `.wbx-section__heading--compact` 与 `.wbx-task-grid` 的 CSS 声明。
- Produces: 标题区域无横线、任务网格边框不变的首页样式和回归测试。

- [ ] **Step 1: 编写失败测试**

在 `tests/home-hero-icons.test.ts` 中新增：

```ts
it('removes the task heading divider while keeping the task-grid border', () => {
  const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
  const heading = baseRule(css, '.wbx-section__heading--compact')
  const taskGrid = baseRule(css, '.wbx-task-grid')

  expect(heading).toMatch(/padding-top:\s*18px;/)
  expect(heading).not.toMatch(/border-top:/)
  expect(taskGrid).toMatch(/border-top:\s*1px solid var\(--wbx-line\);/)
})
```

- [ ] **Step 2: 运行定向测试并确认失败**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: 新测试因 `.wbx-section__heading--compact` 仍包含 `border-top` 而 FAIL；其他测试 PASS。

- [ ] **Step 3: 最小化修改 CSS**

将规则改为：

```css
.wbx-section__heading--compact {
  padding-top: 18px;
}
```

不要修改紧随其后的 `.wbx-task-grid` 规则。

- [ ] **Step 4: 运行定向测试**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: PASS。

- [ ] **Step 5: 运行完整测试和生产构建**

Run:

```bash
pnpm test
pnpm build
git diff --check
```

Expected: 所有测试 PASS；VitePress 构建成功；`git diff --check` 无输出。

- [ ] **Step 6: 本地视觉确认**

在 `http://127.0.0.1:5173/` 确认：

- “你现在想让 AI 帮你做什么？”上方横线消失。
- 标题与上方阅读路径卡片仍保留原有垂直间距。
- 下方任务网格外框和内部卡片分割线保持可见。

- [ ] **Step 7: 提交实现**

```bash
git add tests/home-hero-icons.test.ts docs/.vitepress/theme/home.css
git commit -m "style: remove task heading divider"
```
