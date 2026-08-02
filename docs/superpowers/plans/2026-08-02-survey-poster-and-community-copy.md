# 场景海报与交流群文案更新实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 替换 `/help/` 场景收集海报，并简化交流群二维码浮层底部文案。

**Architecture:** 保持帮助页现有图片 URL 和布局，仅覆盖同名 PNG 资源。交流群组件继续保留 Escape 关闭逻辑，但将可见提示改为共创文案、删除维护说明，并同步收紧 `aria-describedby`。

**Tech Stack:** Vue 3、VitePress、Vitest、Node.js `crypto`。

## Global Constraints

- 新海报必须保持 `1560 × 1936` PNG 尺寸。
- 帮助页的图片路径、点击大图行为、alt 文案和布局不变。
- Escape 关闭、关闭按钮、焦点恢复和浮层定位行为不变。
- 浮层只显示 `欢迎创客一起共创`，不得显示二维码维护说明。

---

### Task 1: 替换场景收集海报

**Files:**
- Modify: `docs/public/article-assets/source-calibration/help/001.png`
- Test: `tests/help-survey-poster.test.ts`

**Interfaces:**
- Consumes: `docs/help/index.md` 对 `/article-assets/source-calibration/help/001.png` 的现有引用。
- Produces: SHA-256 为 `80816579e797eb39697857397d68a71972f178324408f54f8a7e00f9e716a15b` 的新版海报。

- [ ] **Step 1: 添加失败的海报哈希测试**

```ts
import { createHash } from 'node:crypto'

const poster = readFileSync('docs/public/article-assets/source-calibration/help/001.png')
expect(createHash('sha256').update(poster).digest('hex')).toBe(
  '80816579e797eb39697857397d68a71972f178324408f54f8a7e00f9e716a15b',
)
```

- [ ] **Step 2: 运行测试并确认旧海报哈希导致失败**

运行：

```bash
node ./node_modules/vitest/vitest.mjs run tests/help-survey-poster.test.ts
```

预期：哈希断言失败，收到旧文件哈希 `837ce2682720d4df8ac0d7d078fa265de8de641857edb934a4e9edb932289275`。

- [ ] **Step 3: 覆盖同名海报资源**

将 `/Users/wangyi/Desktop/场景收集二维码.png` 原样复制到 `docs/public/article-assets/source-calibration/help/001.png`，不转码、不缩放。

- [ ] **Step 4: 运行聚焦测试并确认通过**

运行同一测试，预期全部通过。

### Task 2: 更新交流群浮层文案

**Files:**
- Modify: `docs/.vitepress/theme/CommunityQr.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Test: `tests/brand.test.ts`
- Test: `tests/community-qr.test.ts`

**Interfaces:**
- Consumes: `openCommunityQr(trigger)`、现有 Escape 键处理与焦点恢复逻辑。
- Produces: 只由 `wbx-community-qr-help` 描述的非模态二维码浮层。

- [ ] **Step 1: 添加失败的文案与无障碍回归测试**

```ts
expect(source).toContain('欢迎创客一起共创')
expect(source).not.toContain('二维码过期后')
expect(source).toContain('aria-describedby="wbx-community-qr-help"')
expect(source).not.toContain('wbx-community-qr-maintenance')
```

组件测试打开浮层后断言：

```ts
expect(dialog?.textContent).toContain('欢迎创客一起共创')
expect(dialog?.textContent).not.toContain('二维码过期后')
expect(dialog?.getAttribute('aria-describedby')).toBe('wbx-community-qr-help')
```

- [ ] **Step 2: 运行聚焦测试并确认失败**

```bash
node ./node_modules/vitest/vitest.mjs run tests/brand.test.ts tests/community-qr.test.ts
```

预期：旧提示文案、旧维护说明和双 ID `aria-describedby` 导致失败。

- [ ] **Step 3: 完成最小组件修改**

将 `aria-describedby` 更新为 `wbx-community-qr-help`，将帮助文案改为 `欢迎创客一起共创`，删除 `wbx-community-qr-maintenance` 段落及其专用 CSS；不修改脚本中的 Escape 处理。

- [ ] **Step 4: 运行聚焦测试并确认通过**

运行 Task 2 的聚焦测试，预期全部通过。

### Task 3: 完整验证与提交

**Files:**
- Verify: `docs/public/article-assets/source-calibration/help/001.png`
- Verify: `docs/.vitepress/theme/CommunityQr.vue`
- Verify: `tests/help-survey-poster.test.ts`
- Verify: `tests/brand.test.ts`
- Verify: `tests/community-qr.test.ts`

**Interfaces:**
- Consumes: Tasks 1–2 的修改。
- Produces: 可构建、可推送的完整变更集。

- [ ] **Step 1: 运行完整验证**

```bash
node ./node_modules/vitest/vitest.mjs run --reporter=dot
node ./node_modules/vitepress/bin/vitepress.js build docs
git diff --check
```

预期：全部测试通过、生产构建成功、diff 检查无输出。

- [ ] **Step 2: 提交**

```bash
git add docs/public/article-assets/source-calibration/help/001.png docs/.vitepress/theme/CommunityQr.vue tests/help-survey-poster.test.ts tests/brand.test.ts tests/community-qr.test.ts docs/superpowers/plans/2026-08-02-survey-poster-and-community-copy.md
git commit -m "content: update survey poster and community copy"
```
