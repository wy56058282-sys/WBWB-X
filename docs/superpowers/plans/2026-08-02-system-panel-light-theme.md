# 首页系统区域浅灰主题 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将首页系统区域从深色面板改为浅灰外层、白色四格和黑色正文，同时保留现有宽度、圆角与响应式布局。

**Architecture:** 只修改首页专用样式文件中的系统区域颜色，不改 Vue 结构或全局主题变量。现有样式测试扩展为颜色契约测试，以防后续回退到深色主题。

**Tech Stack:** Vue 3、VitePress、CSS、Vitest

## Global Constraints

- 外层背景必须为 `#F3F4F2`。
- 主文字必须为 `#0D100D`。
- 右侧四格背景必须为 `#FFFFFF`。
- 分隔线必须为 `#D9E0DC`。
- `.wbx-system` 必须局部固定 `--wbx-ink: #0D100D`，使深色主题不会改变浅色面板的混合基色。
- 像素标签、编号和步骤标题必须为 `color-mix(in srgb, var(--wbx-accent) 50%, var(--wbx-ink))`。
- 保留 `20px` 圆角、桌面端 `52px` 左右缩进和移动端 `4px` 左右缩进。
- 绿色共创区域保持不变。

---

### Task 1: 系统区域浅灰主题

**Files:**
- Modify: `tests/home-hero-icons.test.ts:384`
- Modify: `docs/.vitepress/theme/home.css:577-643`

**Interfaces:**
- Consumes: 现有 `.wbx-system`、`.wbx-system__intro`、`.wbx-system__steps` 样式选择器。
- Produces: 浅灰系统区域的稳定颜色契约；不新增组件接口。

- [ ] **Step 1: 写入失败的颜色契约测试**

将现有系统区域测试扩展为：

```ts
it('uses the approved light-gray system panel palette', () => {
  const css = readFileSync('docs/.vitepress/theme/home.css', 'utf8')
  const system = baseRule(css, '.wbx-system')
  const introLabel = baseRule(css, '.wbx-system__intro .wbx-pixel-label')
  const introCopy = baseRule(css, '.wbx-system__intro > p:last-child')
  const steps = baseRule(css, '.wbx-system__steps')
  const step = baseRule(css, '.wbx-system__steps li')
  const number = baseRule(css, '.wbx-system__steps b')
  const title = baseRule(css, '.wbx-system__steps strong')
  const copy = baseRule(css, '.wbx-system__steps span')

  expect(system).toMatch(/color:\s*#0d100d;/)
  expect(system).toMatch(/--wbx-ink:\s*#0d100d;/)
  expect(system).toMatch(/background:\s*#f3f4f2;/)
  expect(introLabel).toMatch(/color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/)
  expect(introCopy).toMatch(/color:\s*#0d100d;/)
  expect(steps).toMatch(/background:\s*#d9e0dc;/)
  expect(step).toMatch(/background:\s*#ffffff;/)
  expect(number).toMatch(/color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/)
  expect(title).toMatch(/color:\s*color-mix\(in srgb, var\(--wbx-accent\) 50%, var\(--wbx-ink\)\);/)
  expect(copy).toMatch(/color:\s*#0d100d;/)
})
```

- [ ] **Step 2: 运行测试并确认因旧深色主题而失败**

Run:

```bash
pnpm vitest run tests/home-hero-icons.test.ts
```

Expected: FAIL，实际样式仍包含 `#0d100d` 背景、白色文字和深色四格。

- [ ] **Step 3: 最小化修改系统区域颜色**

在 `docs/.vitepress/theme/home.css` 中设置：

```css
.wbx-system {
  --wbx-ink: #0d100d;
  color: #0d100d;
  background: #f3f4f2;
}

.wbx-system__intro .wbx-pixel-label,
.wbx-system__steps b,
.wbx-system__steps strong {
  color: color-mix(in srgb, var(--wbx-accent) 50%, var(--wbx-ink));
}

.wbx-system__intro > p:last-child,
.wbx-system__steps span {
  color: #0d100d;
}

.wbx-system__steps {
  background: #d9e0dc;
}

.wbx-system__steps li {
  background: #ffffff;
}
```

保留选择器中已有的布局属性，只替换对应颜色声明。

- [ ] **Step 4: 运行定向测试**

Run:

```bash
pnpm vitest run tests/home-hero-icons.test.ts
```

Expected: PASS。

- [ ] **Step 5: 运行全量测试与生产构建**

Run:

```bash
pnpm test
pnpm build
git diff --check
```

Expected: 90 项以上测试全部通过，VitePress 构建成功，diff 无空白错误。

- [ ] **Step 6: 提交实现**

```bash
git add tests/home-hero-icons.test.ts docs/.vitepress/theme/home.css
git commit -m "restyle homepage system panel in light gray"
```

- [ ] **Step 7: 发布与线上验收**

推送 `codex/system-panel-light-theme`，创建 PR，合并后等待 Pages 部署成功。在线上桌面端和移动端确认：浅灰外层、白色四格、黑色正文、深绿标签、`20px` 圆角和原有宽度全部生效。
