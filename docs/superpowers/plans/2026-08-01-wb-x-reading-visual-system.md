# WB-X Reading Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在不改变内容、URL、信息架构和首页像素主视觉的前提下，为 `/wb-x/` 总览、27 个章节与附录建立一致、克制、可访问的阅读视觉系统。

**Architecture:** 在 `route-state.ts` 中识别 `/wb-x/` 阅读路由，由 `Layout.vue` 给 VitePress 根布局增加 `wbx-reading-layout` 类。新增独立的 `reading.css`，所有首轮重构规则都以该类为作用域；`custom.css` 只保留全站基础变量和既有通用样式。这样可以复用 VitePress 原有 DOM，不新增 Vue 组件，同时确保首页、案例、提需求、指南和社区页面不受影响。

**Tech Stack:** VitePress、Vue 3、TypeScript、CSS 自定义属性、Vitest、JSDOM、pnpm。

## Global Constraints

- 仅覆盖 `/wb-x/` 总览、四篇导读、27 个章节和附录；不修改 `/`、`/cases/`、`/help/`、`/reading-guide/`、`/community/`。
- 不改正文、导航文案、URL、目录结构、Mermaid 源内容或现有链接目标。
- 不新增 Vue 组件，不重写 VitePress 布局；只增加路由状态、布局类和主题 CSS。
- 浅灰背景与留白负责分区；普通表面使用白底、1px 浅灰描边、8px 圆角。
- 悬停只使用中性灰；品牌绿 `#32E6B9` 只用于当前状态、编号、焦点与关键操作。
- 每项功能修改先写失败测试，再写最小实现，再运行相关测试；每个任务独立提交。
- 保留用户现有未跟踪文件，不执行清理、重置或覆盖无关改动。

---

### Task 1: 建立 `/wb-x/` 路由作用域和阅读样式入口

**Files:**

- Modify: `docs/.vitepress/route-state.ts`
- Modify: `docs/.vitepress/theme/Layout.vue`
- Modify: `docs/.vitepress/theme/index.ts`
- Create: `docs/.vitepress/theme/reading.css`
- Create: `tests/wb-x-reading-scope.test.ts`

- [ ] **Step 1: 写路由识别的失败测试**

在 `tests/wb-x-reading-scope.test.ts` 写入：

```ts
// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { isReadingRoute } from '../docs/.vitepress/route-state'

const layoutSource = readFileSync(
  resolve('docs/.vitepress/theme/Layout.vue'),
  'utf8',
)
const themeSource = readFileSync(
  resolve('docs/.vitepress/theme/index.ts'),
  'utf8',
)

describe('WB-X reading visual scope', () => {
  it('recognizes reading routes at root and GitHub Pages base paths', () => {
    expect(isReadingRoute('/wb-x/', '/')).toBe(true)
    expect(isReadingRoute('/wb-x/chapter/', '/')).toBe(true)
    expect(isReadingRoute('/WBWB-X/wb-x/', '/WBWB-X/')).toBe(true)
    expect(isReadingRoute('/WBWB-X/wb-x/chapter/', '/WBWB-X/')).toBe(true)
  })

  it('does not classify non-reading routes as WB-X reading pages', () => {
    for (const path of ['/', '/cases/', '/help/', '/reading-guide/', '/community/']) {
      expect(isReadingRoute(path, '/')).toBe(false)
    }
  })

  it('adds a route-scoped layout class and imports its stylesheet', () => {
    expect(layoutSource).toContain("'wbx-reading-layout': isReading")
    expect(themeSource).toContain("import './reading.css'")
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-scope.test.ts
```

Expected: 因 `isReadingRoute` 尚未导出而失败。

- [ ] **Step 3: 实现稳定的 base-aware 路由判断**

在 `docs/.vitepress/route-state.ts` 保留 `isHomeRoute`，新增：

```ts
function stripBase(path: string, base: string) {
  const normalizedPath = withTrailingSlash(path)
  const normalizedBase = withTrailingSlash(base)

  if (normalizedBase === '/') return normalizedPath
  if (!normalizedPath.startsWith(normalizedBase)) return normalizedPath

  return `/${normalizedPath.slice(normalizedBase.length)}`
}

export function isReadingRoute(path: string, base: string) {
  const relativePath = stripBase(path, base)
  return relativePath === '/wb-x/' || relativePath.startsWith('/wb-x/')
}
```

- [ ] **Step 4: 给布局增加作用域类**

在 `Layout.vue`：

```ts
import { isHomeRoute, isReadingRoute } from '../route-state'

const isReading = computed(() => isReadingRoute(route.path, site.value.base))
```

并将根布局改为：

```vue
<DefaultTheme.Layout
  :class="{
    'wbx-home-layout': isHome,
    'wbx-reading-layout': isReading,
  }"
>
```

- [ ] **Step 5: 新增阅读变量与独立样式入口**

创建 `reading.css`：

```css
.wbx-reading-layout {
  --wbx-reading-radius: 8px;
  --wbx-reading-space: 8px;
  --wbx-reading-section-gap: 48px;
}
```

在 `index.ts` 中置于通用样式之后、首页样式之前：

```ts
import './custom.css'
import './reading.css'
import './home.css'
```

- [ ] **Step 6: 运行作用域与导航回归测试**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-scope.test.ts tests/navigation.test.ts
```

Expected: 全部通过。

- [ ] **Step 7: 提交路由隔离基础**

```bash
git add docs/.vitepress/route-state.ts docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/index.ts docs/.vitepress/theme/reading.css tests/wb-x-reading-scope.test.ts
git commit -m "scope WB-X reading visual system"
```

---

### Task 2: 统一阅读页侧栏的层级、悬停和滚动区

**Files:**

- Modify: `docs/.vitepress/theme/reading.css`
- Modify: `tests/wb-x-reading-scope.test.ts`
- Modify: `tests/sidebar-scroll.test.ts`

- [ ] **Step 1: 写侧栏视觉契约的失败测试**

在 `wb-x-reading-scope.test.ts` 读取 `reading.css`，新增：

```ts
const readingCss = readFileSync(
  resolve('docs/.vitepress/theme/reading.css'),
  'utf8',
)

it('scopes neutral sidebar interactions to reading pages', () => {
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.VPSidebarItem \.link:hover[\s\S]*?background:\s*var\(--wbx-hover-surface\)/,
  )
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.VPSidebarItem\.is-active[\s\S]*?background:\s*var\(--wbx-accent\)/,
  )
  expect(readingCss).toContain('border-radius: var(--wbx-reading-radius)')
})
```

在 `sidebar-scroll.test.ts` 的 JSDOM fixture 根节点增加 `wbx-reading-layout`，并断言 `.VPSidebar .nav` 仍为内部滚动区、链接最小高度不小于 44px。

- [ ] **Step 2: 运行测试并确认失败**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-scope.test.ts tests/sidebar-scroll.test.ts
```

Expected: `reading.css` 尚无侧栏规则，视觉契约失败。

- [ ] **Step 3: 增加仅限阅读页的侧栏规则**

在 `reading.css` 增加：

```css
.wbx-reading-layout .VPSidebar {
  background: var(--wbx-paper);
  border-right: 1px solid var(--wbx-line);
}

.wbx-reading-layout .VPSidebar .curtain {
  border: 0;
  box-shadow: none;
}

.wbx-reading-layout .VPSidebarItem .link {
  min-height: 44px;
  padding: 9px 12px;
  border: 0;
  border-radius: var(--wbx-reading-radius);
  background: transparent;
}

.wbx-reading-layout .VPSidebarItem .link:hover {
  background: var(--wbx-hover-surface);
}

.wbx-reading-layout .VPSidebarItem .link:focus-visible {
  outline: 2px solid var(--wbx-accent);
  outline-offset: 2px;
}

.wbx-reading-layout .VPSidebarItem.is-active > .item .link {
  color: var(--wbx-ink);
  background: var(--wbx-accent);
}

.wbx-reading-layout .VPSidebarItem.level-0 + .VPSidebarItem.level-0 {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--wbx-line);
}

.wbx-reading-layout .VPSidebar .nav {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--wbx-muted) 45%, transparent)
    transparent;
}

.wbx-reading-layout .VPSidebar .nav::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--wbx-muted) 45%, transparent);
}
```

删除或收窄 `custom.css` 中与这些规则重复且会制造双分割线、双背景的旧侧栏声明；保留 logo、固定布局和滚动高度计算。

- [ ] **Step 4: 检查暗色模式，不复制颜色值**

确认规则只使用 `--wbx-paper`、`--wbx-line`、`--wbx-hover-surface`、`--wbx-accent` 等变量，因此 `.dark` 下自动继承现有暗色 token；不得新增白色硬编码。

- [ ] **Step 5: 运行侧栏、悬停和全站导航测试**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-scope.test.ts tests/sidebar-scroll.test.ts tests/neutral-hover-colors.test.ts tests/navigation.test.ts
```

Expected: 全部通过；普通悬停为中性灰，当前项仍为品牌绿。

- [ ] **Step 6: 提交侧栏视觉层级**

```bash
git add docs/.vitepress/theme/custom.css docs/.vitepress/theme/reading.css tests/wb-x-reading-scope.test.ts tests/sidebar-scroll.test.ts
git commit -m "refine WB-X reading sidebar hierarchy"
```

---

### Task 3: 把 `/wb-x/` 五行目录统一为阅读索引卡片

**Files:**

- Modify: `docs/.vitepress/theme/reading.css`
- Modify: `docs/.vitepress/theme/custom.css`
- Modify: `tests/wb-x-index.test.ts`

- [ ] **Step 1: 为目录卡片写失败测试**

在 `wb-x-index.test.ts` 读取 `reading.css`，新增：

```ts
it('uses one neutral reading surface per entry', () => {
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry > a\s*{[\s\S]*?background:\s*var\(--wbx-surface\)/,
  )
  expect(readingCss).toMatch(/border:\s*1px solid var\(--wbx-line\)/)
  expect(readingCss).toMatch(/border-radius:\s*var\(--wbx-reading-radius\)/)
})

it('keeps the 50 pixel index badge and a single appendix separator', () => {
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__number[\s\S]*?width:\s*50px[\s\S]*?height:\s*50px/,
  )
  expect(readingCss).toMatch(
    /\.wbx-reading-layout \.wbx-book-index__entry--appendix[\s\S]*?border-top:\s*1px solid var\(--wbx-line\)/,
  )
})
```

- [ ] **Step 2: 运行目录测试并确认视觉断言失败**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-index.test.ts
```

Expected: 语义和链接测试通过，新视觉断言失败。

- [ ] **Step 3: 实现卡片表面、间距和交互**

在 `reading.css` 增加：

```css
.wbx-reading-layout .wbx-book-index {
  gap: 12px;
}

.wbx-reading-layout .wbx-book-index__entry > a {
  min-height: 76px;
  padding: 12px 16px;
  border: 1px solid var(--wbx-line);
  border-radius: var(--wbx-reading-radius);
  background: var(--wbx-surface);
}

.wbx-reading-layout .wbx-book-index__entry > a:hover {
  border-color: var(--wbx-line);
  background: var(--wbx-hover-surface);
  transform: translateX(4px);
}

.wbx-reading-layout .wbx-book-index__entry > a:focus-visible {
  outline: 2px solid var(--wbx-accent);
  outline-offset: 2px;
}

.wbx-reading-layout .wbx-book-index__number {
  width: 50px;
  height: 50px;
  color: var(--wbx-accent);
  background: var(--wbx-ink);
}

.wbx-reading-layout .wbx-book-index__entry--appendix {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--wbx-line);
}
```

从 `custom.css` 删除同一目录组件的旧背景、边框和悬停声明，只保留不冲突的基础排版，避免两套规则长期并存。

- [ ] **Step 4: 增加移动端收缩规则**

```css
@media (max-width: 640px) {
  .wbx-reading-layout .wbx-book-index__entry > a {
    grid-template-columns: 50px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
  }

  .wbx-reading-layout .wbx-book-index__description {
    white-space: normal;
  }
}
```

- [ ] **Step 5: 运行目录、链接和悬停测试**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-index.test.ts tests/neutral-hover-colors.test.ts
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm check:links
```

Expected: 目录语义、五个既有目标路径、视觉契约和站内链接全部通过。

- [ ] **Step 6: 提交阅读索引卡片**

```bash
git add docs/.vitepress/theme/custom.css docs/.vitepress/theme/reading.css tests/wb-x-index.test.ts
git commit -m "style WB-X chapter index as reading cards"
```

---

### Task 4: 统一正文区、代码、表格、提示块和 Mermaid 表面

**Files:**

- Modify: `docs/.vitepress/theme/reading.css`
- Create: `tests/wb-x-reading-surfaces.test.ts`

- [ ] **Step 1: 写阅读表面契约的失败测试**

创建 `tests/wb-x-reading-surfaces.test.ts`：

```ts
// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve('docs/.vitepress/theme/reading.css'), 'utf8')

describe('WB-X reading surfaces', () => {
  it.each([
    '.vp-doc div[class*="language-"]',
    '.vp-doc .custom-block',
    '.vp-doc table',
    '.vp-doc .language-mermaid',
  ])('gives %s one shared surface treatment', (selector) => {
    expect(css).toContain(selector)
  })

  it('uses one-pixel borders and the reading radius', () => {
    expect(css).toMatch(/border:\s*1px solid var\(--wbx-line\)/)
    expect(css).toMatch(/border-radius:\s*var\(--wbx-reading-radius\)/)
  })

  it('uses neutral table row hover rather than the brand color', () => {
    expect(css).toMatch(
      /\.wbx-reading-layout \.vp-doc tbody tr:hover[\s\S]*?background:\s*var\(--wbx-hover-surface\)/,
    )
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-surfaces.test.ts tests/mermaid-rendering.test.ts
```

Expected: Mermaid 功能测试通过，新的统一表面断言失败。

- [ ] **Step 3: 统一正文节奏与标题分隔**

在 `reading.css` 增加：

```css
.wbx-reading-layout .vp-doc > div > section,
.wbx-reading-layout .vp-doc > div > h2 {
  margin-top: var(--wbx-reading-section-gap);
}

.wbx-reading-layout .vp-doc h2 {
  padding-top: 24px;
  border-top: 1px solid var(--wbx-line);
}

.wbx-reading-layout .vp-doc h2:first-of-type {
  border-top: 0;
}
```

不得给整个 `.vp-doc` 增加大白色卡片或外框。

- [ ] **Step 4: 统一代码、提示块、表格与 Mermaid**

```css
.wbx-reading-layout .vp-doc div[class*='language-'],
.wbx-reading-layout .vp-doc .custom-block,
.wbx-reading-layout .vp-doc .language-mermaid,
.wbx-reading-layout .vp-doc table {
  border: 1px solid var(--wbx-line);
  border-radius: var(--wbx-reading-radius);
  background: var(--wbx-surface);
  box-shadow: none;
}

.wbx-reading-layout .vp-doc .language-mermaid pre,
.wbx-reading-layout .vp-doc .language-mermaid svg {
  border: 0;
  box-shadow: none;
}

.wbx-reading-layout .vp-doc table {
  display: table;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
}

.wbx-reading-layout .vp-doc thead {
  background: var(--wbx-hover-surface);
}

.wbx-reading-layout .vp-doc tbody tr:hover {
  background: var(--wbx-hover-surface);
}

.wbx-reading-layout .vp-doc .custom-block-title,
.wbx-reading-layout .vp-doc div[class*='language-'] > span.lang {
  color: var(--wbx-accent);
}
```

对于 VitePress 已经在子元素绘制的边框，显式设为 `border: 0`；每个组件只能保留一个可见外边界。

- [ ] **Step 5: 增加窄屏内部横向滚动**

```css
@media (max-width: 640px) {
  .wbx-reading-layout .vp-doc div[class*='language-'],
  .wbx-reading-layout .vp-doc .table-container,
  .wbx-reading-layout .vp-doc .language-mermaid {
    max-width: 100%;
    overflow-x: auto;
  }
}
```

- [ ] **Step 6: 运行阅读表面、Mermaid 和资源测试**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-surfaces.test.ts tests/mermaid-rendering.test.ts
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm check:assets
```

Expected: 全部通过，Mermaid 仍渲染为图形而不是源代码块。

- [ ] **Step 7: 提交正文表面系统**

```bash
git add docs/.vitepress/theme/reading.css tests/wb-x-reading-surfaces.test.ts
git commit -m "unify WB-X reading content surfaces"
```

---

### Task 5: 收敛翻页、页脚、响应式和减少动效

**Files:**

- Modify: `docs/.vitepress/theme/reading.css`
- Create: `tests/wb-x-reading-responsive.test.ts`

- [ ] **Step 1: 写翻页与可访问性失败测试**

创建 `tests/wb-x-reading-responsive.test.ts`：

```ts
// @vitest-environment node

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(resolve('docs/.vitepress/theme/reading.css'), 'utf8')

describe('WB-X responsive reading behavior', () => {
  it('uses neutral eight-pixel pager cards', () => {
    expect(css).toMatch(
      /\.wbx-reading-layout \.VPDocFooter \.pager-link[\s\S]*?border-radius:\s*var\(--wbx-reading-radius\)/,
    )
    expect(css).toMatch(
      /\.wbx-reading-layout \.VPDocFooter \.pager-link:hover[\s\S]*?background:\s*var\(--wbx-hover-surface\)/,
    )
  })

  it('provides mobile and reduced-motion fallbacks', () => {
    expect(css).toContain('@media (max-width: 640px)')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toMatch(/min-height:\s*44px/)
  })
})
```

- [ ] **Step 2: 运行测试并确认失败**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-responsive.test.ts
```

Expected: 翻页与 reduced-motion 规则尚不完整而失败。

- [ ] **Step 3: 实现中性翻页卡片和精简页脚分隔**

```css
.wbx-reading-layout .VPDocFooter {
  border-top: 1px solid var(--wbx-line);
}

.wbx-reading-layout .VPDocFooter .pager-link {
  min-height: 64px;
  border: 1px solid var(--wbx-line);
  border-radius: var(--wbx-reading-radius);
  background: var(--wbx-surface);
  box-shadow: none;
}

.wbx-reading-layout .VPDocFooter .pager-link:hover {
  border-color: var(--wbx-line);
  background: var(--wbx-hover-surface);
  transform: translateY(-2px);
}

.wbx-reading-layout .VPDocFooter .pager-link:focus-visible {
  outline: 2px solid var(--wbx-accent);
  outline-offset: 2px;
}
```

检查相邻 `.edit-info`、`.prev-next` 的上边框；只保留一条，不让页脚出现连续双线。

- [ ] **Step 4: 补齐移动端触控尺寸和自然换行**

```css
@media (max-width: 640px) {
  .wbx-reading-layout .VPDocFooter .pager-link,
  .wbx-reading-layout .VPSidebarItem .link {
    min-height: 44px;
  }

  .wbx-reading-layout .VPDocFooter .prev-next {
    gap: 12px;
  }
}
```

- [ ] **Step 5: 尊重减少动效偏好**

```css
@media (prefers-reduced-motion: reduce) {
  .wbx-reading-layout .wbx-book-index__entry > a,
  .wbx-reading-layout .VPDocFooter .pager-link,
  .wbx-reading-layout .VPSidebarItem .link {
    transition: none;
  }

  .wbx-reading-layout .wbx-book-index__entry > a:hover,
  .wbx-reading-layout .VPDocFooter .pager-link:hover {
    transform: none;
  }
}
```

- [ ] **Step 6: 运行响应式、悬停与侧栏回归测试**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm vitest run tests/wb-x-reading-responsive.test.ts tests/neutral-hover-colors.test.ts tests/sidebar-scroll.test.ts
```

Expected: 全部通过。

- [ ] **Step 7: 提交响应式与页脚收敛**

```bash
git add docs/.vitepress/theme/reading.css tests/wb-x-reading-responsive.test.ts
git commit -m "polish WB-X reading navigation and accessibility"
```

---

### Task 6: 全量验证与人工视觉验收

**Files:**

- Verify: `docs/.vitepress/theme/reading.css`
- Verify: `docs/.vitepress/theme/custom.css`
- Verify: `docs/.vitepress/theme/home.css`
- Verify: `docs/wb-x/**/*.md`

- [ ] **Step 1: 运行全部自动化测试**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test
```

Expected: 所有 Vitest 测试通过。

- [ ] **Step 2: 运行链接与资源检查**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm check:links
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm check:assets
```

Expected: 无断链、无缺失资源。

- [ ] **Step 3: 运行 VitePress 生产构建**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm build
```

Expected: 构建成功且无 Mermaid、Markdown 或 CSS 错误。

- [ ] **Step 4: 启动本地预览并逐页验收**

```bash
PATH=/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/nick/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm preview --host 127.0.0.1
```

人工检查：

- `/wb-x/`：五个目录入口、50px 编号、附录单分割线、悬停和键盘焦点。
- 任一普通章节：标题节奏、侧栏当前项、翻页卡片和页脚无双线。
- 含 Mermaid 的第 1 章：显示图形而非 Mermaid 源码，且只有一层外边界。
- 含代码、表格和提示块的章节：统一白底、浅灰描边、8px 圆角，窄屏可内部滚动。
- 375px、768px、桌面宽度：内容不横向溢出，触控项不小于 44px。
- 昼夜模式：文字、边框、悬停和焦点对比清晰，无硬编码白底。
- 首页 `/`、`/cases/`、`/help/`：确认没有获得 `wbx-reading-layout`，视觉未改变。

- [ ] **Step 5: 核对变更范围**

```bash
git diff --stat HEAD~5..HEAD
git diff HEAD~5..HEAD -- docs/.vitepress/theme/home.css docs/.vitepress/theme/HomePage.vue
```

Expected: 第二条命令无输出；首页专用文件未被修改。

- [ ] **Step 6: 如验收无需修正，记录最终验证提交**

若自动化或人工验收发现问题，先补失败测试、修复并重跑全部验证。若仅补充测试或小范围 CSS 修正：

```bash
git add docs/.vitepress/theme/reading.css tests
git commit -m "verify WB-X reading visual system"
```

若没有任何新增改动，不创建空提交。
