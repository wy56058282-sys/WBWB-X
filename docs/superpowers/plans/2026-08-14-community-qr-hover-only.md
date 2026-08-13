# 交流群二维码纯悬停交互实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将桌面交流群二维码改为纯悬停预览，移动端保留点击打开与外部关闭，并移除关闭按钮、固定态和焦点陷阱。

**Architecture:** `Layout.vue` 根据 hover capability 选择桌面 pointer 预览或移动端 click 打开；`CommunityQr.vue` 只保留 `closed/preview/touch-open` 所需状态和关闭机制。模板变为无交互控件的信息浮层，定位算法与二维码资源保持不变。

**Tech Stack:** Vue 3、VitePress 1.6、TypeScript、CSS、Vitest 2、JSDOM。

## Global Constraints

- 桌面端仅悬停显示，完全移开后约 180ms 关闭。
- 桌面点击不固定、不切换二维码浮层。
- 移动端点击打开，点击外部或按 Escape 关闭。
- 所有视口删除关闭按钮。
- 底部文案为“欢迎创客一起共创 · 二维码有效期至 8 月 20 日”。
- 保留二维码资源、定位算法、视觉尺寸、边框和阴影。
- 不修改其他导航项，不与附录入口样式合并提交。
- 不新增依赖。

---

### Task 1: 重写行为合同

**Files:**
- Modify: `tests/community-qr.test.ts`

**Interfaces:**
- Consumes: `previewCommunityQr`、`scheduleCommunityQrClose`、`cancelCommunityQrClose` 和 Layout 导航事件。
- Produces: 桌面 hover-only、移动 click-open、无关闭按钮与有效期文案测试合同。

- [ ] **Step 1: 删除 pinned/关闭按钮旧断言并写入新失败测试**

覆盖以下行为：

```ts
expect(dialog?.textContent).toContain('二维码有效期至 8 月 20 日')
expect(dialog?.querySelector('button')).toBeNull()
expect(document.activeElement).toBe(before)
```

桌面 `matchMedia(true)` 下点击导航后断言浮层未打开；移动端 `matchMedia(false)` 下点击后断言打开，外部点击与 Escape 均关闭。保留 hover 延迟关闭、进入浮层取消关闭、定位和资源断言。

- [ ] **Step 2: 运行聚焦测试确认红灯**

Run: `./node_modules/.bin/vitest run tests/community-qr.test.ts tests/community-popover-position.test.ts`

Expected: FAIL，包含旧 pinned 行为、关闭按钮和缺失有效期文案。

- [ ] **Step 3: 提交测试红灯**

```bash
git add tests/community-qr.test.ts
git commit -m "测试二维码纯悬停交互"
```

---

### Task 2: 简化二维码组件状态与模板

**Files:**
- Modify: `docs/.vitepress/theme/CommunityQr.vue`
- Modify: `docs/.vitepress/theme/Layout.vue`
- Modify: `docs/.vitepress/theme/custom.css`
- Test: `tests/community-qr.test.ts`

**Interfaces:**
- Consumes: Task 1 新行为合同。
- Produces: `previewCommunityQr(trigger)` 桌面预览、`openCommunityQr(trigger)` 移动打开，以及共同的延迟/外部关闭机制。

- [ ] **Step 1: 删除 pinned 状态与关闭按钮**

将 action 缩减为 `preview | open-touch | schedule-close | cancel-close`。`openCommunityQr` 发送 `open-touch`；组件模式仅保留 `closed | preview | touch-open`。删除 `pinCommunityQr`、点击切换、焦点恢复、焦点陷阱和关闭按钮模板。

- [ ] **Step 2: 调整 Layout 点击策略**

```ts
if (hoverMedia?.matches) return
event.preventDefault()
event.stopPropagation()
openCommunityQr(trigger)
```

桌面 click 不拦截、不打开；触摸设备 click 打开。

- [ ] **Step 3: 更新提示文案和 CSS**

将提示改为：

```html
欢迎创客一起共创 · 二维码有效期至 8 月 20 日
```

删除 `.wbx-community-qr__close*` 全部规则，将 heading 改为普通左对齐标题容器。

- [ ] **Step 4: 运行聚焦测试确认绿色**

Run: `./node_modules/.bin/vitest run tests/community-qr.test.ts tests/community-popover-position.test.ts`

Expected: PASS。

- [ ] **Step 5: 提交实现**

```bash
git add docs/.vitepress/theme/CommunityQr.vue docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/custom.css tests/community-qr.test.ts
git commit -m "简化交流群二维码交互"
```

---

### Task 3: 完整验证与浏览器验收

**Files:**
- Review: `docs/.vitepress/theme/CommunityQr.vue`
- Review: `docs/.vitepress/theme/Layout.vue`
- Review: `docs/.vitepress/theme/custom.css`
- Review: `tests/community-qr.test.ts`

**Interfaces:**
- Consumes: Task 2 已提交实现。
- Produces: 可供用户验收的 production preview。

- [ ] **Step 1: 运行完整门禁**

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

- [ ] **Step 2: 真实浏览器验收**

- 1440×900：悬停展示；移入浮层保持；完全移开关闭；点击不固定；无关闭按钮。
- 390×844：点击打开；点外部关闭；Escape 关闭；无横向溢出。
- 两种视口均显示有效期至 8 月 20 日，二维码可见且资源加载成功。

- [ ] **Step 3: 只读审查**

核对无残留 `pinned`、关闭按钮或焦点陷阱；桌面 click 不拦截；移动 click 可用；测试在恢复旧 pinned 行为时会失败。

- [ ] **Step 4: 提供本地预览**

保持 production preview 运行并给出 URL，等待用户验收；未经用户确认不部署。
