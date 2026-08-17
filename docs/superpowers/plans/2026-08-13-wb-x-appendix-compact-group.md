# 小白书附录入口紧凑分组实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/wb-x/` 的附录 A、B、C 收拢为无内部横线的紧凑纵向入口组，同时保持整行可点击和现有内容不变。

**Architecture:** 保留现有 Markdown DOM 和入口链接，以 CSS 选择器区分“附录组首项”与“附录组内部项”。测试先锁定 DOM 连续性、唯一外部分区和无内部边框，再做最小 CSS 修改。

**Tech Stack:** VitePress 1.6、Markdown/HTML、CSS、Vitest 2、JSDOM。

## Global Constraints

- 仅修改 `/wb-x/` 总览页附录 A、B、C 三个入口的布局样式与对应测试。
- 保留附录标题、说明、顺序和 URL。
- 三个附录入口继续纵向排列且整行可点击。
- 附录组内部不显示横向分割线。
- 附录组与第四篇之间保留一次清晰区块间隔。
- 不修改四篇正文章节、侧边栏、更新时间或翻页导航。
- 不新增依赖。

---

### Task 1: 锁定附录组结构与样式合同

**Files:**
- Modify: `tests/wb-x-index.test.ts`

**Interfaces:**
- Consumes: `.wbx-book-index__entry--appendix` 三个连续列表项。
- Produces: 附录组首项/内部项边界和紧凑间距的回归合同。

- [ ] **Step 1: 写入失败测试**

将现有“single appendix separator”测试改为：

```ts
it('groups appendix entries with one outer gap and no internal dividers', () => {
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry--appendix:first-of-type/,
  )
  expect(readingCss).toMatch(/margin-top:\s*20px/)
  expect(readingCss).not.toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry--appendix\s*{[^}]*border-top/,
  )
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry--appendix \+ \.wbx-book-index__entry--appendix\s*{[^}]*margin-top:\s*-4px/,
  )
})
```

保留现有 50px 徽标断言；额外断言三个附录项在 DOM 中连续，且每项仍只有一个整行 `<a>`。

- [ ] **Step 2: 运行聚焦测试确认失败**

Run: `./node_modules/.bin/vitest run tests/wb-x-index.test.ts`

Expected: FAIL，指出仍存在通用 `border-top` 且缺少首项/相邻项规则。

- [ ] **Step 3: 提交测试红灯**

```bash
git add tests/wb-x-index.test.ts
git commit -m "测试附录入口紧凑分组"
```

---

### Task 2: 实现紧凑附录入口组

**Files:**
- Modify: `docs/.vitepress/theme/reading.css`
- Test: `tests/wb-x-index.test.ts`

**Interfaces:**
- Consumes: Task 1 的 CSS 合同。
- Produces: `.wbx-book-index__entry--appendix:first-of-type` 外部分区和相邻附录项紧凑规则。

- [ ] **Step 1: 写入最小 CSS 实现**

用以下规则替换当前所有附录项通用分割线：

```css
.wbx-reading-layout .wbx-book-index__entry--appendix:first-of-type {
  margin-top: 20px;
  padding-top: 20px;
}

.wbx-reading-layout
  .wbx-book-index__entry--appendix
  + .wbx-book-index__entry--appendix {
  margin-top: -4px;
}
```

不设置 `border-top`；不修改链接、徽标、标题、说明和 hover/focus 规则。

- [ ] **Step 2: 运行聚焦测试确认通过**

Run: `./node_modules/.bin/vitest run tests/wb-x-index.test.ts`

Expected: PASS。

- [ ] **Step 3: 运行完整验证**

Run:

```bash
./node_modules/.bin/vitest run
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
./node_modules/.bin/vitepress build docs
node scripts/generate-legacy-redirects.mjs
node scripts/verify-publish-boundary.mjs
git diff --check
```

Expected: 全部退出码为 0；仅允许既有 Vite chunk size warning。

- [ ] **Step 4: 生产预览验收**

启动独立 production preview，检查 `/wb-x/`：

- 1440×900：A/B/C 为连续紧凑纵向组，无内部横线；第四篇与 A 之间保留一次间隔。
- 390×844：三项整行可点击、键盘焦点可见、无横向溢出。
- A/B/C 三条链接分别进入原对应页面。

- [ ] **Step 5: 提交实现**

```bash
git add docs/.vitepress/theme/reading.css tests/wb-x-index.test.ts
git commit -m "收拢小白书附录入口"
```

---

### Task 3: 审查与交付

**Files:**
- Review: `docs/.vitepress/theme/reading.css`
- Review: `tests/wb-x-index.test.ts`

**Interfaces:**
- Consumes: Task 2 的已验证提交。
- Produces: 可供用户本地验收的生产预览。

- [ ] **Step 1: 只读规格审查**

核对：范围只涉及附录组；链接/文字未变；内部无分割线；首项仅保留一次外部间隔。

- [ ] **Step 2: 只读代码质量审查**

核对：选择器仅命中 `/wb-x/` 阅读布局附录项；测试能在恢复旧通用 `border-top` 时失败；无无效选择器。

- [ ] **Step 3: 提供本地预览**

保持 production preview 运行并给出 URL，等待用户界面验收；未经用户确认不部署生产。
