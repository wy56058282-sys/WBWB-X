# 案例详情页 Logo 基线对齐实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让案例详情页桌面端返回入口、标题和正文以顶部文字 Logo 左边缘为基准对齐，同时保持窄屏可读性。

**Architecture:** 继续使用 `wbx-case-detail-layout` 路由作用域，只调整 VitePress 详情内容容器的响应式内边距。以自动化 CSS 合同锁定桌面 `40px` 和 `959px` 以下回退，再以生产浏览器量测验证实际几何位置。

**Tech Stack:** VitePress 1.6、Vue 3、CSS、Vitest、内置浏览器验收

## Global Constraints

- 仅作用于 `/cases/submissions/` 下的案例详情页。
- 桌面端详情内容容器左右内边距为 `40px`。
- `959px` 及以下沿用现有响应式留白。
- 不恢复侧栏，不修改正文和其他页面。
- 桌面端详情内容左边缘与顶部文字 Logo 左边缘误差不超过 `2px`。
- 所有验收视口均不得产生横向溢出。

---

### Task 1: 对齐案例详情内容容器

**Files:**
- Modify: `docs/.vitepress/theme/custom.css`
- Test: `tests/case-detail-layout.test.ts`

**Interfaces:**
- Consumes: `Layout.vue` 已提供的 `.wbx-case-detail-layout` 路由作用域。
- Produces: 桌面 `40px` 左右留白及 `959px` 以下响应式回退合同。

- [ ] **Step 1: 写入失败测试**

在 `tests/case-detail-layout.test.ts` 增加断言：

```ts
expect(customCss).toMatch(
  /\.wbx-case-detail-layout \.VPDoc \.content\s*\{[^}]*padding-left:\s*40px[^}]*padding-right:\s*40px/s,
)
expect(customCss).toMatch(
  /@media \(max-width:\s*959px\)[\s\S]*?\.wbx-case-detail-layout \.VPDoc \.content\s*\{[^}]*padding-left:\s*32px[^}]*padding-right:\s*32px/s,
)
```

- [ ] **Step 2: 验证测试因缺少规则而失败**

运行：

```bash
../../node_modules/.bin/vitest run tests/case-detail-layout.test.ts
```

预期：新增的桌面 `40px` 对齐合同失败。

- [ ] **Step 3: 实现最小 CSS 调整**

在 `custom.css` 的案例详情作用域加入：

```css
@media (min-width: 960px) {
  .wbx-case-detail-layout .VPDoc .content {
    max-width: none;
    padding-left: 40px;
    padding-right: 40px;
  }
}

@media (max-width: 959px) {
  .wbx-case-detail-layout .VPDoc .content {
    padding-left: 32px;
    padding-right: 32px;
  }
}
```

- [ ] **Step 4: 验证自动化测试与生产构建**

运行：

```bash
../../node_modules/.bin/vitest run tests/case-detail-layout.test.ts tests/navigation.test.ts
../../node_modules/.bin/vitest run --dir tests
../../node_modules/.bin/vitepress build docs
git diff --check
```

预期：所有命令退出码为 `0`。

- [ ] **Step 5: 完成真实浏览器验收**

使用最新生产预览检查 `1440x900`、`900x900`、`390x844`：

```text
1440：H1、返回入口和正文左边缘一致；H1 与 Logo 左边缘误差 <= 2px
900/390：保持现有响应式留白，正文不被压缩
全部视口：scrollWidth === clientWidth；侧栏不可见；返回入口可见且可聚焦
```

- [ ] **Step 6: 提交实现**

```bash
git add docs/.vitepress/theme/custom.css tests/case-detail-layout.test.ts
git commit -m "对齐案例详情页内容基线"
```
