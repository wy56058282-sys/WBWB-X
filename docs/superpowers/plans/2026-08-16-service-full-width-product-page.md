# 定制服务通栏产品展示页 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 `/help/` 重构为无右侧固定目录的通栏产品与服务展示页，解决内容拥挤、重复编号、装饰性分割线过多和渠道入口混淆，同时保留已经确认的服务内容、价格、申请流程、规则与隐私边界。

**Architecture:** 保留 `ServicePage.vue` 作为页面唯一业务组件，以语义化 section 组成单一通栏内容流；`service-config.ts` 继续作为商务微信、报名表、企业采购渠道及价格的唯一配置源；`service.css` 负责与指南页一致的内容宽度、间距节奏以及 3/2/1 响应式产品网格。测试分成内容/渠道合同、DOM 结构、CSS 级联与真实浏览器验收四层，禁止用压缩 fixture 或字符串匹配冒充生产布局验证。

**Tech Stack:** Vue 3, VitePress, TypeScript, CSS, Vitest, Vue Test Utils, jsdom, production VitePress preview, in-app browser

## Global Constraints

- 当前工作树已有未提交改动；不得使用 `git reset --hard`、`git checkout --` 或任何会覆盖现有工作的命令。
- `ServicePage.vue`、`service.css`、`tests/service-page.test.ts`、`tests/service-page-style.test.ts` 已经是脏文件。每个任务开始前先保存 `git diff -- <files>` 基线，结束时只暂存本任务新增的精确补丁。
- 不触碰首页统计、案例集、小白书附录、二维码悬停、导航品牌或其他页面改动。
- 不臆造商务微信二维码、报名表 URL、支付链接、企业采购价格、合作资质或交付承诺。
- 商务微信咨询、企业版采购渠道和服务付款是三个不同角色，DOM、文案和配置必须保持分离。
- 当前没有公开付款二维码时，不展示可误认为能付款的占位二维码；页面只说明沟通、确认范围、再付款的流程。
- 保留已确认价格：需求诊断 `¥399 / 45 分钟`、定制培训 `¥2,999 起`、FDE 现场支持 `¥5,999 起`、项目实施 `¥12,800 起`、持续支持 `按月`。
- 保留企业采购规则：客户经专属渠道注册腾讯云账号并完成个人实名，在工具内购买企业版席位；20 席及以上可获得一场或两场 90 分钟线上工作坊，简单任务是否赠送由实际场景判断。
- 不新增装饰性粗分割线；允许使用留白、轻背景带和必要的卡片边界组织内容。
- 每个条目只显示一套编号。禁止同时出现浏览器有序列表编号与手工 `01`，也禁止同一条目显示 `1. 01`。
- 视觉以指南页的内容宽度、左右 gutter、字号和模块节奏为基线，桌面 3 列、平板 2 列、移动端 1 列。
- 所有按钮、链接、二维码图片与禁用状态必须支持键盘访问、清晰焦点、明暗主题和 reduced-motion。
- 每个任务严格执行 RED -> GREEN -> REFACTOR，测试失败原因必须与当前任务一致后才能改生产代码。
- 每个任务完成后运行 `git diff --check`；提交时只提交本任务相关文件或精确 hunk。

---

### Task 1: 锁定服务内容与三个渠道角色

**Files:**
- Modify: `tests/service-config.test.ts`
- Modify: `tests/case-submission-flow.test.ts`
- Modify: `tests/service-page.test.ts`
- Verify: `docs/.vitepress/service-config.ts`

- [ ] **Step 1: 保存脏文件基线并核对配置接口**

Run:

```bash
git diff -- docs/.vitepress/service-config.ts tests/service-config.test.ts tests/case-submission-flow.test.ts tests/service-page.test.ts
sed -n '1,240p' docs/.vitepress/service-config.ts
```

Expected: `serviceConfig` 仍只包含免费案例表单、商务微信二维码、服务报名表和企业采购二维码；不出现旧的 `paidDiagnosticFormUrl` 或任何新增付款 URL。

- [ ] **Step 2: 为三个渠道角色写失败测试**

在 `tests/service-config.test.ts` 与 `tests/service-page.test.ts` 增加明确合同：

```ts
expect(serviceConfig).toHaveProperty('businessWechatQrPath')
expect(serviceConfig).toHaveProperty('applicationFormUrl')
expect(serviceConfig).toHaveProperty('enterpriseChannelQrPath')
expect(serviceConfig).not.toHaveProperty('paidDiagnosticFormUrl')
```

页面合同至少包括：

```ts
expect(wrapper.findAll('[data-service-channel="business-wechat"]')).toHaveLength(1)
expect(wrapper.findAll('[data-service-channel="enterprise-purchase"]')).toHaveLength(1)
expect(wrapper.findAll('[data-service-channel="application-form"]')).toHaveLength(1)
```

并断言三个区域互不嵌套、文案不把席位费写成服务费、不把咨询二维码写成付款二维码。

- [ ] **Step 3: 运行 RED 测试**

Run:

```bash
node_modules/.bin/vitest run tests/service-config.test.ts tests/case-submission-flow.test.ts tests/service-page.test.ts
```

Expected: 新增页面角色断言失败，因为生产 DOM 尚未提供稳定的 `data-service-channel` 标记；既有配置测试继续通过。

- [ ] **Step 4: 只补充稳定语义，不改业务配置**

在 `ServicePage.vue` 后续会用到的三个渠道节点上添加稳定语义属性；此任务不填写任何真实 URL，也不更改安全 URL 归一化逻辑。如果当前商务微信尚无真实二维码，保留不可点击的明确状态文案。

- [ ] **Step 5: 运行 GREEN 测试**

Run:

```bash
node_modules/.bin/vitest run tests/service-config.test.ts tests/case-submission-flow.test.ts tests/service-page.test.ts
```

Expected: 全部通过，且失败输出中没有陈旧字段或角色混用。

- [ ] **Step 6: 提交渠道合同**

```bash
git diff --check
git add -p docs/.vitepress/theme/ServicePage.vue tests/service-config.test.ts tests/case-submission-flow.test.ts tests/service-page.test.ts
git diff --cached --check
git commit -m "test: lock service channel roles"
```

---

### Task 2: 重建通栏语义结构并移除右侧目录

**Files:**
- Modify: `docs/.vitepress/theme/ServicePage.vue`
- Modify: `tests/service-page.test.ts`

- [ ] **Step 1: 为最终页面顺序写失败测试**

测试页面主结构按以下顺序出现，并且每个锚点恰好一次：

```text
service-offer
service-fde-model
service-ladder
enterprise-purchase
service-problems
service-application
service-exclusions
service-rules
service-related
```

增加结构断言：

```ts
expect(wrapper.find('.wbx-service-outline').exists()).toBe(false)
expect(wrapper.find('.wbx-service-body-layout').exists()).toBe(false)
expect(wrapper.find('.wbx-service-body-layout__main').exists()).toBe(false)
expect(wrapper.findAll('.wbx-service-main > .wbx-service-section').length).toBeGreaterThan(0)
```

同时断言主标题、说明、价格、时长与固定交付摘要只出现一次。

- [ ] **Step 2: 运行 RED 测试**

Run:

```bash
node_modules/.bin/vitest run tests/service-page.test.ts
```

Expected: 因右侧 `.wbx-service-outline` 和双栏 wrapper 仍存在而失败。

- [ ] **Step 3: 重构 `ServicePage.vue` 为单一内容流**

实施结构：

```vue
<div class="wbx-service">
  <header id="service-offer" class="wbx-service-offer">...</header>
  <div class="wbx-service-main">
    <section id="service-fde-model" class="wbx-service-section">...</section>
    <section id="service-ladder" class="wbx-service-section">...</section>
    <section id="enterprise-purchase" class="wbx-service-section">...</section>
    <section id="service-problems" class="wbx-service-section">...</section>
    <section id="service-application" class="wbx-service-section">...</section>
    <section id="service-exclusions" class="wbx-service-section">...</section>
    <section id="service-rules" class="wbx-service-section">...</section>
    <section id="service-related" class="wbx-service-section">...</section>
  </div>
</div>
```

要求：

- 删除整个 `<aside class="wbx-service-outline">`。
- 删除只为双栏存在的 `.wbx-service-body-layout` 和 `__main` wrapper。
- Hero 只保留一组价格事实，不再在紧邻位置重复 `¥399 · 45 分钟 · 固定诊断结论摘要`。
- 将商务微信区放在 Hero 的咨询动作旁，但不与企业采购二维码混排。
- 五项服务目录使用普通列表或卡片容器，不使用会产生原生编号的 `<ol>` 与手工编号叠加。
- 保留所有已确认内容，不进行营销夸大或内容删减。

- [ ] **Step 4: 运行 GREEN 测试并清理死选择器依赖**

Run:

```bash
node_modules/.bin/vitest run tests/service-page.test.ts
rg -n 'wbx-service-outline|wbx-service-body-layout|CUSTOM SERVICE' docs/.vitepress/theme/ServicePage.vue tests/service-page.test.ts
```

Expected: 测试通过；生产模板中不再有目录、双栏类名和 `CUSTOM SERVICE` 英文眉题。

- [ ] **Step 5: 提交通栏 DOM**

```bash
git diff --check
git add -p docs/.vitepress/theme/ServicePage.vue tests/service-page.test.ts
git diff --cached --check
git commit -m "refactor: make service page full width"
```

---

### Task 3: 建立统一的产品展示层级与反拥挤节奏

**Files:**
- Modify: `docs/.vitepress/theme/service.css`
- Modify: `tests/service-page-style.test.ts`
- Modify: `tests/product-page-computed-style.test.ts`

- [ ] **Step 1: 用生产层级 fixture 写 CSS RED 测试**

fixture 必须复制 `ServicePage.vue` 的实际父子类名，禁止把事实区、按钮、服务卡片或渠道区移出其生产容器。断言：

- `.wbx-service` 与指南页使用相同 max-width/gutter 基线。
- `.wbx-service-main` 为单列内容流，不为右侧目录预留列宽。
- Hero、问题模型、服务目录、企业采购、申请流程都有独立纵向节奏。
- 障碍、三层服务、五步方法、服务目录都不使用粗 `border-top` 或装饰性伪元素横线。
- 标题与正文保持指南页字级；辅助信息不得放大。
- 每个列表项只有一个可见编号。

示例合同：

```ts
expect(getComputedStyle(root).maxWidth).toBe('1104px')
expect(getComputedStyle(main).gridTemplateColumns).toBe('none')
expect(document.querySelector('.wbx-service-outline')).toBeNull()
expect(getComputedStyle(obstacleItem).borderTopWidth).toBe('0px')
expect(getComputedStyle(serviceCard).borderTopWidth).toBe('0px')
```

目录必须从 DOM 删除，测试不得用 `display: none` 掩盖残留结构。

- [ ] **Step 2: 运行 RED 测试**

Run:

```bash
node_modules/.bin/vitest run tests/service-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: 旧双栏、旧 outline、旧横线或旧紧凑间距合同导致失败。

- [ ] **Step 3: 重写桌面通栏样式**

在 `service.css` 中：

- 将根容器设为与指南页一致的 `max-width: 1104px` 和居中 gutter。
- 删除 `.wbx-service-outline`、`.wbx-service-body-layout` 及其 sticky/rail 媒体规则。
- Hero 使用两列：左侧价值与 CTA，右侧价格事实和商务微信；内容不足时不制造空目录列。
- FDE 模型分成三组清晰 band：三个问题、三层服务、五步实施，每组之间使用 48-64px 留白而非横线。
- 服务目录统一成同一种卡片/列表语法，价格、时长、交付范围和 CTA 的位置一致。
- 企业采购单独成 section，二维码、渠道说明与 20 席规则同组展示。
- 申请流程取消上边横线，以编号、标题、说明和留白形成层次。
- 规则与隐私使用安静的定义列表或轻背景带，不嵌套卡片。

- [ ] **Step 4: 明确编号策略**

CSS 只负责一种编号来源：

```css
.wbx-service-numbered-list {
  list-style: none;
  padding: 0;
}

.wbx-service-numbered-list > li::marker {
  content: '';
}
```

若编号由模板中的 `<span aria-hidden="true">01</span>` 提供，就必须为屏幕阅读器补充不重复的可访问名称，且不得再用 CSS counter 生成第二份编号。

- [ ] **Step 5: 运行 GREEN 测试**

Run:

```bash
node_modules/.bin/vitest run tests/service-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: 全部通过，并且测试使用真实 CSSOM 级联，不通过手写 specificity 后塞 inline style 的方式模拟生产结果。

- [ ] **Step 6: 提交视觉层级**

```bash
git diff --check
git add -p docs/.vitepress/theme/service.css tests/service-page-style.test.ts tests/product-page-computed-style.test.ts
git diff --cached --check
git commit -m "style: unify service product hierarchy"
```

---

### Task 4: 完成 3/2/1 响应式、交互与无障碍合同

**Files:**
- Modify: `docs/.vitepress/theme/service.css`
- Modify: `tests/service-page-style.test.ts`
- Modify: `tests/product-page-computed-style.test.ts`
- Modify: `tests/service-page.test.ts`

- [ ] **Step 1: 写断点边界 RED 测试**

至少覆盖 `1440`、`1200`、`1199`、`900`、`641`、`640`、`390`。目标：

| Surface | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| 产品/问题/服务层 | 3 列 | 2 列 | 1 列 |
| 五步实施 | 3 列后自然换行 | 2 列 | 1 列 |
| Hero | 2 列 | 1 列 | 1 列 |
| 企业采购 | 文案 + 二维码 | 文案 + 二维码或紧凑 2 列 | 单列 |

断言所有 viewport 下 `scrollWidth <= clientWidth`，卡片最小可读宽度不低于合同值，且 641/640 断点没有布局悬崖。

- [ ] **Step 2: 写键盘与状态 RED 测试**

覆盖：

- `开始需求沟通` 的可见焦点与锚点行为。
- 报名表 ready/disabled 两种状态。
- 商务微信和企业采购二维码的 ready/unavailable 两种状态。
- 所有外链 `target="_blank"` 时必须有 `rel="noopener noreferrer"`。
- 暗色主题下 CTA 正常态文字与背景可读，不只检查 focus 态。
- `prefers-reduced-motion: reduce` 下不执行不必要动画。

- [ ] **Step 3: 运行 RED 测试**

Run:

```bash
node_modules/.bin/vitest run tests/service-page.test.ts tests/service-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: 新增断点或状态合同至少一项失败。

- [ ] **Step 4: 实施响应式与焦点样式**

要求：

- 使用稳定 grid/flex 约束，避免内容变化推挤布局。
- 触摸端按钮高度至少 44px。
- focus-visible 使用高对比 ink/双环，不只用低对比品牌绿。
- 二维码图片有明确 `alt`；未开放状态不伪装成可扫码内容。
- 不用 viewport width 缩放字号。
- 移动端正文保持 16px 左右，metadata 14px 左右，标题按指南页既有断点值。

- [ ] **Step 5: 运行 GREEN 测试**

Run:

```bash
node_modules/.bin/vitest run tests/service-page.test.ts tests/service-page-style.test.ts tests/product-page-computed-style.test.ts
```

Expected: 全部通过，无 jsdom `getBoundingClientRect()` 零值假几何测试；几何验收留给 Task 5 的真实浏览器。

- [ ] **Step 6: 提交响应式与无障碍修复**

```bash
git diff --check
git add -p docs/.vitepress/theme/service.css tests/service-page-style.test.ts tests/product-page-computed-style.test.ts tests/service-page.test.ts
git diff --cached --check
git commit -m "fix: harden service responsive behavior"
```

---

### Task 5: 全量验证与真实浏览器验收

**Files:**
- Verify: `docs/.vitepress/theme/ServicePage.vue`
- Verify: `docs/.vitepress/theme/service.css`
- Verify: `docs/.vitepress/service-config.ts`
- Verify: `tests/service-config.test.ts`
- Verify: `tests/case-submission-flow.test.ts`
- Verify: `tests/service-page.test.ts`
- Verify: `tests/service-page-style.test.ts`
- Verify: `tests/product-page-computed-style.test.ts`
- Create: `docs/superpowers/reports/2026-08-16-service-full-width-product-page.md`

- [ ] **Step 1: 运行聚焦测试**

```bash
node_modules/.bin/vitest run \
  tests/service-config.test.ts \
  tests/case-submission-flow.test.ts \
  tests/service-page.test.ts \
  tests/service-page-style.test.ts \
  tests/product-page-computed-style.test.ts
```

Expected: 5 files 全部通过，无跳过、无未处理 promise rejection。

- [ ] **Step 2: 运行完整 CLI 验证**

```bash
node_modules/.bin/vitest run
node scripts/check-content-links.mjs
node scripts/check-replacement-assets.mjs
npm run build
git diff --check
```

Expected: 全量测试、内容链接、资源检查、VitePress build、旧路由生成和发布边界检查全部通过。记录准确文件数、测试数和 build warning；不得把 warning 写成 PASS 而不说明。

- [ ] **Step 3: 启动全新 production preview**

```bash
npm run preview -- --host 127.0.0.1 --port 4197
```

Expected: 使用刚完成的 production build；如端口占用则换新端口，不复用构建前启动的旧 preview。

- [ ] **Step 4: 在真实浏览器完成验收矩阵**

逐项保存截图或结构化 DOM/样式数据：

| Viewport | Theme | Required checks |
| --- | --- | --- |
| 1440x900 | light/dark | 通栏宽度、Hero、3 列、无目录、无粗横线、渠道分离 |
| 900x900 | light/dark | 2 列、Hero 单列、二维码尺寸、无内容拥挤 |
| 390x844 | light/dark | 1 列、按钮 44px、正文可读、无横向溢出 |

每档执行：

- 页面顶部、FDE 模型、服务目录、企业采购、申请流程、规则与结果区截图。
- Tab 键走完 CTA、报名表、企业采购与相关文章链接，确认焦点不被导航遮挡。
- 检查 `document.documentElement.scrollWidth === document.documentElement.clientWidth`。
- 检查 console 无 error、failed resource 和 hydration warning。
- 扫码区域只在配置 ready 时显示真实二维码；未开放状态不可点击。
- 价格、时长、服务内容、20 席规则、退款/隐私/保存边界与确认稿一致。
- 页面内每个条目只有一套编号，尤其服务目录不得出现 `1. 01`。

- [ ] **Step 5: 写验收报告并持久化证据**

报告必须包含：

- commit/HEAD、测试命令和完整结果摘要。
- 浏览器 viewport x theme 矩阵。
- 每个关键区域截图路径或导出证据路径。
- ready/unavailable 配置状态。
- 已知 warning、剩余风险和未配置外部渠道。
- 明确说明没有修改首页、案例集或小白书附录。

- [ ] **Step 6: 最终范围审计**

```bash
git status --short
git diff --stat
git diff --name-only
git diff --check
rg -n 'TODO|TBD|FIXME' \
  docs/.vitepress/theme/ServicePage.vue \
  docs/.vitepress/theme/service.css \
  tests/service-page.test.ts \
  tests/service-page-style.test.ts \
  tests/product-page-computed-style.test.ts
```

Expected: 没有新增待办或临时开发文本；范围只包含服务页、相关测试和验收报告。合法的用户可见“即将开放”状态必须由配置状态驱动。

- [ ] **Step 7: 提交验收报告**

```bash
git add docs/superpowers/reports/2026-08-16-service-full-width-product-page.md
git diff --cached --check
git commit -m "docs: report service page acceptance"
```

---

## Final Review Checklist

- [ ] 右侧固定目录已完全移除，桌面、平板和移动端均无预留空列。
- [ ] 页面是通栏产品展示结构，内容宽度和左右 gutter 与指南页一致。
- [ ] Hero 中价格、时长、固定交付摘要只出现一次。
- [ ] 三个障碍、三层服务和五步实施有清晰分组，不拥挤、不使用装饰性横线。
- [ ] 五项服务目录使用统一的标题、价格、时长、说明和 CTA 层级。
- [ ] 商务微信、企业采购二维码与服务付款概念完全分离。
- [ ] 企业采购二维码与 20 席规则正确，未新增未经确认的价格或承诺。
- [ ] 适合问题、诊断输出、申请流程、服务边界、规则、隐私和真实结果均保留。
- [ ] 所有条目只有一套可见编号，无 `1. 01` 或重复序号。
- [ ] 3/2/1 响应式、明暗主题、键盘焦点、reduced-motion、外链安全和无横向溢出均通过。
- [ ] 真实浏览器证据、CLI 日志和配置状态已写入验收报告。
- [ ] `git diff --check` 通过，提交未带入已有首页、案例集或其他无关脏改动。
