# 小白书附录目录入口实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/wb-x/` 总览页的单一附录入口拆为可直接访问的 A、B、C 三个附录入口。

**Architecture:** 保留现有语义化有序列表与附录行样式，只扩展静态目录数据。测试通过渲染真实 Markdown，验证目录数量、显示文案、排序与目标路由，不引入新组件或样式。

**Tech Stack:** VitePress Markdown、HTML、Vitest、JSDOM

## Global Constraints

- 总览目录必须包含 7 项：4 篇正文与 A/B/C 三项附录。
- 附录入口按 A、B、C 排列并直接链接到已经存在的对应页面。
- 不修改附录正文、VitePress 导航配置、CSS 或其他页面。

---

### Task 1: 拆分附录目录入口

**Files:**
- Modify: `tests/wb-x-index.test.ts`
- Modify: `docs/wb-x/index.md`

**Interfaces:**
- Consumes: 现有 `.wbx-book-index` HTML 结构与三个附录目录路由。
- Produces: 7 项总览目录及 A/B/C 三条直接链接。

- [ ] **Step 1: 写入失败测试**

将目录数量期望从 5 改为 7，并将附录期望替换为：

```ts
['A', '附录 A · 常用指令模板', '整理可直接复用的常用指令'],
['B', '附录 B · 场景速查表', '按工作场景快速找到实践路径'],
['C', '附录 C · 个人版与企业版对比', '对比版本能力、适用对象与选择方式'],
```

同时把最后一个聚合路由替换为三个现有附录目录的 URL 编码路径。

- [ ] **Step 2: 运行聚焦测试并确认 RED**

Run: `./node_modules/.bin/vitest run tests/wb-x-index.test.ts`

Expected: FAIL，明确显示当前只有 5 项且仍使用聚合附录入口。

- [ ] **Step 3: 最小化修改总览 Markdown**

保留 A 项现有附录 class，并新增 B、C 两项。三项均复用：

```html
<li class="wbx-book-index__entry wbx-book-index__entry--appendix">
```

每项分别写入已批准的编号、标题、说明和直接路由。

- [ ] **Step 4: 运行聚焦测试并确认 GREEN**

Run: `./node_modules/.bin/vitest run tests/wb-x-index.test.ts`

Expected: PASS。

- [ ] **Step 5: 完成发布级验证**

Run: `./node_modules/.bin/vitest run tests/wb-x-index.test.ts tests/content-links.test.ts`

Run: `./node_modules/.bin/vitepress build docs`

Run: `git diff --check`

Expected: 全部 PASS，三个直接链接无断链，生产构建成功，diff 无空白错误。

- [ ] **Step 6: 提交实现**

```bash
git add docs/wb-x/index.md tests/wb-x-index.test.ts docs/superpowers/plans/2026-08-13-wb-x-appendix-index.md
git commit -m "完善小白书附录目录入口"
```
