# 第二篇阅读指南文案 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将阅读指南第二篇链接的显示文案改为“第二篇：案例篇《从一项任务到一支 AI 团队》”，同时保持原跳转地址和页面结构不变。

**Architecture:** 继续使用现有 Markdown 链接作为唯一内容来源，不引入组件或运行时代码。通过 `tests/content-links.test.ts` 对完整 Markdown 链接进行精确断言，使显示文案和既有 URL 同时受到回归保护。

**Tech Stack:** Markdown、Vitest、Node.js、VitePress

## Global Constraints

- 仅修改第二篇链接的显示文案。
- 文案必须精确为“第二篇：案例篇《从一项任务到一支 AI 团队》”。
- 保留现有 `/wb-x/%E7%AC%AC%E4%BA%8C%E7%AF%87.../` 目标地址，不修改路由。
- 保留“直接进入……，按问题选择章节：”句式及下方章节列表。
- 不调整第一篇、第三篇和第四篇已确认文案。

---

### Task 1: 更新第二篇链接显示文案

**Files:**
- Modify: `tests/content-links.test.ts`
- Modify: `docs/reading-guide.md`

**Interfaces:**
- Consumes: `docs/reading-guide.md` 中现有第二篇 Markdown 链接及其 URL。
- Produces: 显示文案为“第二篇：案例篇《从一项任务到一支 AI 团队》”、目标 URL 不变的 Markdown 链接。

- [ ] **Step 1: 写入失败的精确链接断言**

在 `tests/content-links.test.ts` 的阅读指南文案测试中加入：

```ts
expect(readingGuide).toContain(
  '[第二篇：案例篇《从一项任务到一支 AI 团队》](/wb-x/%E7%AC%AC%E4%BA%8C%E7%AF%87%20%E6%A1%88%E4%BE%8B%E7%AF%87%EF%BC%9A%E4%BB%8E%E4%B8%80%E9%A1%B9%E4%BB%BB%E5%8A%A1%E5%88%B0%E4%B8%80%E6%94%AF%20AI%20%E5%9B%A2%E9%98%9F/)',
)
```

- [ ] **Step 2: 运行测试并确认因旧显示文案而失败**

运行：

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/vitest run tests/content-links.test.ts
```

预期：FAIL；失败信息指出 `docs/reading-guide.md` 尚不包含新的第二篇完整链接字符串。

- [ ] **Step 3: 最小化修改 Markdown 链接文案**

将 `docs/reading-guide.md` 中：

```md
[第二篇：案例篇](/wb-x/%E7%AC%AC%E4%BA%8C%E7%AF%87%20%E6%A1%88%E4%BE%8B%E7%AF%87%EF%BC%9A%E4%BB%8E%E4%B8%80%E9%A1%B9%E4%BB%BB%E5%8A%A1%E5%88%B0%E4%B8%80%E6%94%AF%20AI%20%E5%9B%A2%E9%98%9F/)
```

改为：

```md
[第二篇：案例篇《从一项任务到一支 AI 团队》](/wb-x/%E7%AC%AC%E4%BA%8C%E7%AF%87%20%E6%A1%88%E4%BE%8B%E7%AF%87%EF%BC%9A%E4%BB%8E%E4%B8%80%E9%A1%B9%E4%BB%BB%E5%8A%A1%E5%88%B0%E4%B8%80%E6%94%AF%20AI%20%E5%9B%A2%E9%98%9F/)
```

- [ ] **Step 4: 运行目标测试并确认通过**

运行：

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/vitest run tests/content-links.test.ts
```

预期：PASS。

- [ ] **Step 5: 运行完整回归测试和生产构建**

运行：

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" node_modules/.bin/vitest run
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm run docs:build
git diff --check
```

预期：完整测试通过；VitePress 生产构建成功；`git diff --check` 无输出。

- [ ] **Step 6: 提交实现**

```bash
git add tests/content-links.test.ts docs/reading-guide.md
git commit -m "docs: expand second reading guide label"
```
