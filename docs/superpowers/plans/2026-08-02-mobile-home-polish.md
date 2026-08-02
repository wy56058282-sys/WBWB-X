# 首页移动端细节优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变桌面端首页的前提下，完成 760px 以下 Hero IP、图标卡片、阅读路径箭头和资料下载区域的五项移动端视觉修正。

**Architecture:** 保持 `HomePage.vue` 结构不变，只在现有 `home.css` 移动端断点内覆盖定位与网格规则。使用现有 CSS 文本回归测试锁定断点值，并通过完整测试、生产构建和 390px/579px 浏览器检查防止桌面回归、横向溢出或图片裁切。

**Tech Stack:** VitePress 1.6、Vue 3、CSS、Vitest 2、jsdom

## Global Constraints

- 仅修改 `docs/.vitepress/theme/home.css` 中 `@media (max-width: 760px)` 及其更窄断点的规则。
- 保留现有组件结构、链接、文案、图片素材和交互动效。
- 桌面端与平板端现有布局保持不变。
- Hero 官网 IP 在移动端放大到 `106px`，底部与绿色价值区保持 `0px` 间距。
- 第一篇目录卡片移动端旋转 `-30deg`，工作系统进阶卡片移动端向左移动 `10px`。
- 阅读路径卡片在 `760px` 和 `420px` 断点下均保留图标、正文、箭头三列，箭头靠右并垂直居中。
- 资料下载区移动端底部空间缩短 `10px`，IP 尺寸不变且不能裁切。

---

### Task 1: 锁定移动端响应式设计要求

**Files:**
- Modify: `tests/home-hero-icons.test.ts:326-371`
- Modify: `tests/home-hero-icons.test.ts:560-654`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: `docs/.vitepress/theme/home.css` 的 `@media (max-width: 760px)` 与 `@media (max-width: 420px)` CSS 文本。
- Produces: 覆盖五项移动端要求且能在实现前失败、实现后通过的 Vitest 回归断言。

- [ ] **Step 1: 更新 Hero 官网 IP 的失败断言**

将 `positions the official-site IP link without duplicate hero metrics` 中的移动端断言改为：

```ts
expect(mobile).toMatch(
  /\.wbx-hero__official\s*\{[^}]*right:\s*12px;[^}]*bottom:\s*0;[^}]*width:\s*108px;/s,
)
expect(mobile).toMatch(
  /\.wbx-hero__official-ip\s*\{[^}]*width:\s*106px;/s,
)
```

- [ ] **Step 2: 增加 Hero 图标卡片的失败断言**

在同一测试文件中新增：

```ts
it('uses the approved mobile hero card placement', () => {
  const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
  const mobile = css.slice(
    css.indexOf('@media (max-width: 760px)'),
    css.indexOf('@media (max-width: 444px)'),
  )

  expect(mobile).toMatch(
    /\.wbx-icon-card--book\s*\{[^}]*--wbx-icon-rotation:\s*-30deg;/s,
  )
  expect(mobile).toMatch(
    /\.wbx-icon-card--flow\s*\{[^}]*right:\s*calc\(8% \+ 10px\);/s,
  )
})
```

- [ ] **Step 3: 增加阅读路径三列与箭头定位的失败断言**

新增：

```ts
it('keeps mobile reading arrows in a right-aligned third column', () => {
  const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
  const mobileStart = css.indexOf('@media (max-width: 760px)')
  const narrowStart = css.indexOf('@media (max-width: 420px)')
  const mobile = css.slice(mobileStart, css.indexOf('@media (max-width: 444px)'))
  const narrow = css.slice(narrowStart)

  expect(mobile).toMatch(
    /\.wbx-reading-card\s*\{[^}]*grid-template-columns:\s*70px minmax\(0, 1fr\) auto;/s,
  )
  expect(mobile).toMatch(
    /\.wbx-reading-card__arrow\s*\{[^}]*display:\s*block;[^}]*align-self:\s*center;[^}]*justify-self:\s*end;/s,
  )
  expect(narrow).toMatch(
    /\.wbx-reading-card\s*\{[^}]*grid-template-columns:\s*56px minmax\(0, 1fr\) auto;/s,
  )
})
```

- [ ] **Step 4: 增加资料区缩短且不裁切的失败断言**

在 `renders the complete IP as one static image` 的移动端断言中加入：

```ts
expect(mobile).toMatch(
  /\.wbx-community\s*\{[^}]*overflow:\s*visible;/s,
)
expect(mobile).toMatch(
  /\.wbx-community__art\s*\{[^}]*min-height:\s*170px;[^}]*overflow:\s*visible;/s,
)
expect(mobile).toMatch(
  /\.wbx-community__ip-stage\s*\{[^}]*max-width:\s*300px;[^}]*margin:\s*0 auto -10px;/s,
)
```

同时把原有移动端 `overflow: hidden` 断言替换为 `overflow: visible`，避免测试要求互相冲突。

- [ ] **Step 5: 运行定向测试并确认失败原因准确**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: FAIL；失败项只指向旧的 `bottom: 54px`、`width: 100px`、旧旋转/定位、两列阅读卡片、隐藏箭头或资料区旧高度/裁切规则。

- [ ] **Step 6: 提交失败测试**

```bash
git add tests/home-hero-icons.test.ts
git commit -m "test: cover mobile homepage polish"
```

---

### Task 2: 实现移动端 Hero 与阅读卡片修正

**Files:**
- Modify: `docs/.vitepress/theme/home.css:971-1056`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: Task 1 中针对 Hero IP、书本卡片、进阶卡片和阅读路径三列网格的失败断言。
- Produces: 仅在 `max-width: 760px` 与 `max-width: 420px` 生效的移动端 CSS 覆盖。

- [ ] **Step 1: 修改移动端 Hero 卡片与官网 IP 定位**

在 `@media (max-width: 760px)` 中使用：

```css
.wbx-icon-card--book {
  top: 140px;
  left: 8%;
  --wbx-icon-rotation: -30deg;
}

.wbx-icon-card--flow {
  top: 135px;
  right: calc(8% + 10px);
}

.wbx-hero__official {
  right: 12px;
  bottom: 0;
  width: 108px;
}

.wbx-hero__official-ip {
  width: 106px;
}
```

- [ ] **Step 2: 恢复移动端阅读卡片的箭头列**

在 `@media (max-width: 760px)` 中使用：

```css
.wbx-reading-card {
  grid-template-columns: 70px minmax(0, 1fr) auto;
  gap: 18px;
  padding: 18px;
}

.wbx-reading-card__arrow {
  display: block;
  align-self: center;
  justify-self: end;
}
```

- [ ] **Step 3: 保持 420px 以下的三列结构**

在 `@media (max-width: 420px)` 中使用：

```css
.wbx-reading-card {
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 14px;
  padding: 16px;
}
```

- [ ] **Step 4: 运行定向测试**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: Hero 与阅读路径相关断言 PASS；资料下载区断言仍 FAIL。

- [ ] **Step 5: 提交 Hero 与阅读卡片实现**

```bash
git add docs/.vitepress/theme/home.css
git commit -m "style: polish mobile hero and reading cards"
```

---

### Task 3: 收紧移动端资料下载区域

**Files:**
- Modify: `docs/.vitepress/theme/home.css:1070-1110`
- Test: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: Task 1 中移动端资料区高度、负外边距与可见溢出的失败断言。
- Produces: 图片尺寸不变、资料区底部减少 `10px`、IP 不被裁切的移动端布局。

- [ ] **Step 1: 允许资料区 IP 超出缩短后的容器**

在 `@media (max-width: 760px)` 中修改为：

```css
.wbx-community {
  grid-template-columns: 1fr;
  gap: 0;
  height: auto;
  min-height: 0;
  margin-top: 38px;
  overflow: visible;
}

.wbx-community__art {
  min-height: 170px;
  overflow: visible;
}

.wbx-community__ip-stage {
  position: relative;
  right: auto;
  bottom: auto;
  left: auto;
  max-width: 300px;
  margin: 0 auto -10px;
  transform: none;
}
```

不要修改 `.wbx-community__ip` 的宽度规则，确保 IP 图片仍使用原尺寸与比例。

- [ ] **Step 2: 运行定向测试**

Run:

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
```

Expected: PASS。

- [ ] **Step 3: 提交资料区实现**

```bash
git add docs/.vitepress/theme/home.css
git commit -m "style: tighten mobile community panel"
```

---

### Task 4: 全量回归与移动端视觉验收

**Files:**
- Verify: `docs/.vitepress/theme/home.css`
- Verify: `tests/home-hero-icons.test.ts`

**Interfaces:**
- Consumes: Tasks 1-3 的 CSS 与回归测试。
- Produces: 可交付的生产构建和 390px/579px 视觉验收证据。

- [ ] **Step 1: 运行完整测试套件**

Run:

```bash
pnpm test
```

Expected: 所有 Vitest 测试 PASS。

- [ ] **Step 2: 运行生产构建**

Run:

```bash
pnpm build
```

Expected: VitePress build 完成且退出码为 `0`。

- [ ] **Step 3: 启动或复用本地预览并检查 390px**

在 `http://127.0.0.1:5173/` 设置 `390px` 视口，确认：

- Hero 官网 IP 宽 `106px`，底边贴绿色价值区且未被裁切。
- 第一篇目录卡片逆时针旋转 `30deg`。
- 工作系统进阶卡片向左移动 `10px`。
- 四张阅读路径卡片箭头位于最右侧并垂直居中。
- 页面不存在横向滚动。
- 资料区 IP 尺寸不变，底部空间缩短且图片完整。

- [ ] **Step 4: 检查 579px 与桌面视口**

在 `579px` 重复移动端检查；随后恢复 `1292px`，确认桌面 Hero、阅读路径卡片、资料区高度与官网 IP 位置没有变化。

- [ ] **Step 5: 检查工作树差异**

Run:

```bash
git diff --check
git status --short
```

Expected: `git diff --check` 无输出；工作树只包含计划执行中预期的文件变更或已全部提交。

- [ ] **Step 6: 如视觉验收产生必要微调，重新运行验证并提交**

仅在 390px/579px 验收发现与设计不符时微调同一移动端断点；随后重新执行：

```bash
pnpm exec vitest run tests/home-hero-icons.test.ts
pnpm test
pnpm build
git diff --check
git add docs/.vitepress/theme/home.css tests/home-hero-icons.test.ts
git commit -m "fix: finalize mobile homepage spacing"
```

Expected: 所有命令成功，最终提交只包含本计划范围内的 CSS 与测试变更。
