# Hero 20px 圆角实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页 Hero 外层圆角从 `8px` 增加到 `20px`，并保持底部绿色价值条与外层轮廓连续。

**Architecture:** 继续由 `.wbx-hero` 统一管理 Hero 的边框、圆角和裁切。只修改外层 `border-radius`，依赖现有 `overflow: hidden` 裁切内部 stage 与价值条，不给子组件增加重复圆角。

**Tech Stack:** VitePress、Vue 3、CSS、Vitest。

## Global Constraints

- 桌面端与移动端统一使用 `20px` 外圆角。
- 保持现有 `2px` 边框、阴影、尺寸与内部布局不变。
- 内部按钮和图标卡片的圆角不随本次修改变化。

---

### Task 1: Hero 外层圆角

**Files:**
- Modify: `docs/.vitepress/theme/home.css:39-45`
- Test: `tests/home-hero-icons.test.ts:206-219`

**Interfaces:**
- Consumes: `.wbx-hero` 现有 `overflow: hidden` 与 `border: 2px solid #0d100d`。
- Produces: 桌面端和移动端共享的 `border-radius: 20px` 外轮廓。

- [ ] **Step 1: 写入失败的样式回归测试**

在 Hero 外框测试中加入：

```ts
expect(css).toMatch(
  /\.wbx-hero\s*\{[^}]*border-radius:\s*20px;/s,
)
```

- [ ] **Step 2: 运行聚焦测试并确认失败**

运行：

```bash
node ./node_modules/vitest/vitest.mjs run tests/home-hero-icons.test.ts
```

预期：测试因当前样式仍为 `border-radius: 8px` 而失败。

- [ ] **Step 3: 完成最小样式修改**

将 `docs/.vitepress/theme/home.css` 中 `.wbx-hero` 更新为：

```css
.wbx-hero {
  overflow: hidden;
  border: 2px solid #0d100d;
  border-radius: 20px;
  background: #f7f7f7;
  box-shadow: 0 18px 60px rgb(13 16 13 / 8%);
}
```

- [ ] **Step 4: 运行聚焦测试并确认通过**

运行：

```bash
node ./node_modules/vitest/vitest.mjs run tests/home-hero-icons.test.ts
```

预期：`tests/home-hero-icons.test.ts` 全部通过。

- [ ] **Step 5: 完整验证**

依次运行：

```bash
node ./node_modules/vitest/vitest.mjs run --reporter=dot
node ./node_modules/vitepress/bin/vitepress.js build docs
git diff --check
```

预期：全部测试通过、VitePress 构建成功、`git diff --check` 无输出。

- [ ] **Step 6: 提交实现**

```bash
git add docs/.vitepress/theme/home.css tests/home-hero-icons.test.ts docs/superpowers/plans/2026-08-02-hero-radius.md
git commit -m "style: enlarge home hero radius"
```
