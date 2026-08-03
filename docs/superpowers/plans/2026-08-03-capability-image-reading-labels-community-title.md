# 能力架构图、阅读指南文案与资料区标题 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在第一章补充完整能力架构图，更新阅读指南三处篇章名称，并确保首页资料区标题在中等宽度屏幕完整换行展示。

**Architecture:** 内容更新继续使用现有 Markdown 与 VitePress public 静态资源路径，不引入新组件或依赖。响应式修复只在现有 `@media (max-width: 1200px)` 中覆盖标题换行规则，保留大桌面单行和手机端既有单列样式。

**Tech Stack:** VitePress、Vue 3、CSS media queries、Vitest、Markdown、静态 JPG 素材。

## Global Constraints

- 第一章图片必须紧跟 Mermaid 代码块，并使用 `/article-assets/source-calibration/ch01/004.jpg`。
- 图片 alt 必须为“WorkBuddy 完整能力架构图”，不增加图注、边框、灯箱或点击放大。
- 第一篇、第三篇、第四篇只改链接显示文案，原 href、句式、段落与列表保持不变。
- 首页资料区标题在宽度大于 `1200px` 时保持单行，在宽度不超过 `1200px` 时允许自然换成两行。
- 不缩小资料区标题字号，不改变按钮、IP 图片与现有手机端单列布局。
- 不新增运行时依赖。

---

### Task 1: 第一章完整能力架构图

**Files:**
- Create: `docs/public/article-assets/source-calibration/ch01/004.jpg`
- Modify: `docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 1 章 初识 WorkBuddy/index.md:19-32`
- Test: `tests/content-links.test.ts:53-73`

**Interfaces:**
- Consumes: 用户素材 `/Users/wangyi/Downloads/1783101228901_kno9pn_HMOXgjAbkAASPAl.jpg`。
- Produces: VitePress public 路径 `/article-assets/source-calibration/ch01/004.jpg` 与对应 Markdown 图片引用。

- [ ] **Step 1: 写入会失败的内容回归测试**

在 `content inventory` 测试组加入：

```ts
it('places the complete capability image immediately after the chapter-one Mermaid flowchart', () => {
  const chapter = readFileSync(
    'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 1 章 初识 WorkBuddy/index.md',
    'utf8',
  )
  const mermaidEnd = chapter.indexOf('```', chapter.indexOf('```mermaid') + 3) + 3
  const image = '![WorkBuddy 完整能力架构图](/article-assets/source-calibration/ch01/004.jpg)'
  const exampleIndex = chapter.indexOf('例如，用户可以直接告诉 WorkBuddy')

  expect(existsSync('docs/public/article-assets/source-calibration/ch01/004.jpg')).toBe(true)
  expect(chapter.slice(mermaidEnd, exampleIndex).trim()).toBe(image)
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm test -- --run tests/content-links.test.ts
```

Expected: FAIL，因为 `004.jpg` 尚不存在，且第一章尚未引用该图片。

- [ ] **Step 3: 复制素材并插入 Markdown**

复制用户提供的原图：

```bash
cp "/Users/wangyi/Downloads/1783101228901_kno9pn_HMOXgjAbkAASPAl.jpg" "docs/public/article-assets/source-calibration/ch01/004.jpg"
```

在 Mermaid 结束标记之后、示例段落之前插入：

```md
![WorkBuddy 完整能力架构图](/article-assets/source-calibration/ch01/004.jpg)
```

- [ ] **Step 4: 运行定向测试并确认通过**

Run:

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm test -- --run tests/content-links.test.ts
```

Expected: PASS。

- [ ] **Step 5: 提交第一章内容更新**

```bash
git add tests/content-links.test.ts "docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 1 章 初识 WorkBuddy/index.md" docs/public/article-assets/source-calibration/ch01/004.jpg
git commit -m "content: add WorkBuddy capability architecture"
```

---

### Task 2: 阅读指南篇章名称

**Files:**
- Modify: `docs/reading-guide.md:14,38`
- Test: `tests/content-links.test.ts:64-73`

**Interfaces:**
- Consumes: 现有第一篇、第三篇、第四篇路由 URL。
- Produces: 三个新的链接显示名称，href 保持逐字不变。

- [ ] **Step 1: 写入会失败的文案与 href 回归测试**

在现有 reading guide 测试后加入：

```ts
it('uses the approved part labels without changing their routes', () => {
  const readingGuide = readFileSync('docs/reading-guide.md', 'utf8')

  expect(readingGuide).toContain(
    '[第一篇：基础篇《从0到1：先把 WorkBuddy 用起来》](/wb-x/%E7%AC%AC%E4%B8%80%E7%AF%87%20%E4%BD%BF%E7%94%A8%E6%89%8B%E5%86%8C%EF%BC%9A%E5%85%88%E6%8A%8A%20WorkBuddy%20%E7%94%A8%E8%B5%B7%E6%9D%A5/)',
  )
  expect(readingGuide).toContain(
    '[第三篇：进阶篇《把案例变成可复用的工作系统》](/wb-x/%E7%AC%AC%E4%B8%89%E7%AF%87%20%E8%BF%9B%E9%98%B6%E7%AF%87%EF%BC%9A%E6%8A%8A%E6%A1%88%E4%BE%8B%E5%8F%98%E6%88%90%E8%87%AA%E5%B7%B1%E7%9A%84%E5%B7%A5%E4%BD%9C%E7%B3%BB%E7%BB%9F/)',
  )
  expect(readingGuide).toContain(
    '[第四篇：实战篇《落到岗位与行业，组建AI团队》](/wb-x/%E7%AC%AC%E5%9B%9B%E7%AF%87%20%E5%B2%97%E4%BD%8D%E4%B8%8E%E8%A1%8C%E4%B8%9A%E8%90%BD%E5%9C%B0/)',
  )
})
```

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm test -- --run tests/content-links.test.ts
```

Expected: FAIL，三处批准文案尚未出现。

- [ ] **Step 3: 只替换三处链接显示文本**

在 `docs/reading-guide.md` 中将显示文案分别改为：

```md
第一篇：基础篇《从0到1：先把 WorkBuddy 用起来》
第三篇：进阶篇《把案例变成可复用的工作系统》
第四篇：实战篇《落到岗位与行业，组建AI团队》
```

不要修改三个链接括号内的 URL，不调整前后句子和任何列表。

- [ ] **Step 4: 运行内容测试与链接检查**

Run:

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm test -- --run tests/content-links.test.ts
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm run check:links
```

Expected: 两条命令均 PASS，内部链接无断链。

- [ ] **Step 5: 提交阅读指南更新**

```bash
git add tests/content-links.test.ts docs/reading-guide.md
git commit -m "content: clarify reading guide part labels"
```

---

### Task 3: 首页资料区中宽度标题换行

**Files:**
- Modify: `docs/.vitepress/theme/home.css:824-848`
- Test: `tests/home-hero-icons.test.ts:599-675`

**Interfaces:**
- Consumes: 基础规则 `.wbx-community h2 { white-space: nowrap; }`。
- Produces: `@media (max-width: 1200px)` 内的 `.wbx-community h2 { white-space: normal; }` 覆盖规则。

- [ ] **Step 1: 写入会失败的中宽度响应式测试**

在 `renders the complete IP as one static image` 中、`compactDesktop` 已创建后加入：

```ts
expect(compactDesktop).toMatch(
  /\.wbx-community h2\s*\{[^}]*white-space:\s*normal;/s,
)
expect(compactDesktop).not.toMatch(/\.wbx-community h2\s*\{[^}]*font-size:/s)
```

保留基础规则 `white-space: nowrap` 和现有移动端 `font-size: 30px; white-space: normal` 断言，以共同约束大桌面、823px 中宽度和手机端行为。

- [ ] **Step 2: 运行测试并确认失败**

Run:

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm test -- --run tests/home-hero-icons.test.ts
```

Expected: FAIL，因为 `@media (max-width: 1200px)` 目前只设置资料区左边距，没有解除标题不换行。

- [ ] **Step 3: 添加最小 CSS 覆盖**

在现有 `@media (max-width: 1200px)` 内、`.wbx-community__copy` 后加入：

```css
.wbx-community h2 {
  white-space: normal;
}
```

不要在此断点改字号、字重、按钮、IP 图片或网格结构。

- [ ] **Step 4: 运行定向测试并检查 823px 预览**

Run:

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm test -- --run tests/home-hero-icons.test.ts
```

Expected: PASS。

在本地预览将视口设为约 `823px`，确认标题完整显示为最多两行、按钮和 IP 图片位置不变、页面没有水平滚动；再用宽度大于 `1200px` 的视口确认标题仍为单行。

- [ ] **Step 5: 提交响应式修复**

```bash
git add tests/home-hero-icons.test.ts docs/.vitepress/theme/home.css
git commit -m "fix: wrap community title on compact screens"
```

---

### Task 4: 全量验证

**Files:**
- Verify: `tests/**/*.test.ts`
- Verify: VitePress production output

**Interfaces:**
- Consumes: Tasks 1–3 的全部提交。
- Produces: 可合并的、测试与构建通过的分支。

- [ ] **Step 1: 运行完整测试套件**

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm test -- --run
```

Expected: 所有测试 PASS，无快照或断言失败。

- [ ] **Step 2: 运行生产构建**

```bash
PATH="/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH" npm run build
```

Expected: VitePress 生产构建成功，无 Markdown、资源或链接错误。

- [ ] **Step 3: 检查工作树范围**

```bash
git status --short
git diff --check
```

Expected: 仅包含计划内文件；`git diff --check` 无输出。

- [ ] **Step 4: 记录验证结果**

若验证步骤未产生新的文件修改，则不创建空提交；在最终交付中报告测试数量、构建结果和 823px/大桌面人工检查结论。
