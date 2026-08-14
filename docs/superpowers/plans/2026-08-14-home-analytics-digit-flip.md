# 首页访问统计数字翻动动效实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为首页四项访问统计增加按数位错速、错峰启动的向上翻动动效，并在验收通过后部署线上。

**Architecture:** 新建独立的 `AnalyticsFlipValue.vue` 负责格式化字符串的数位拆分、右对齐定位和局部 Vue transition；`HomeAnalyticsStrip.vue` 只负责取数并传入当前显示值。样式继续集中在 `home.css`，使用 CSS 自定义属性控制各数位时长和延迟，不引入动画依赖。

**Tech Stack:** Vue 3、TypeScript、VitePress、CSS transitions、Vitest/JSDOM

## Global Constraints

- 个位约 360ms、十位约 410ms、百位约 460ms、千位及以上约 500ms。
- 个位、十位、百位、千位依次错峰约 35ms；万位及更高位沿用千位的 105ms 延迟上限，整组动画约 605ms 内结束。
- 只翻动发生变化的数字位；分隔符、标签和 LIVE 状态保持静止。
- 首次成功加载只做一次入场，不模拟从 0 递增。
- `prefers-reduced-motion: reduce` 下直接显示最终值。
- 不改变 Umami 口径、5 分钟刷新、错误保留旧值、统计条尺寸和响应式结构。
- 不引入第三方依赖。

---

### Task 1: 数位拆分与翻动值组件

**Files:**
- Create: `docs/.vitepress/theme/analyticsFlipValue.ts`
- Create: `docs/.vitepress/theme/AnalyticsFlipValue.vue`
- Create: `tests/analytics-flip-value.test.ts`

**Interfaces:**
- Consumes: `value: string`，值来自 `Intl.NumberFormat('zh-CN')` 或静态占位符。
- Produces: 默认导出的 Vue SFC；数字节点使用 `.wbx-flip-value__digit`，分隔符使用 `.wbx-flip-value__separator`，辅助文本使用 `.wbx-sr-only`。
- Produces: `digitTokens(value: string): FlipToken[]` 与 `digitTiming(place: number): { duration: string; delay: string }`，其中 `FlipToken` 为 `{ id: string; char: string; kind: 'digit' | 'separator'; place: number }`。

- [ ] **Step 1: 为 token 拆分与首次渲染写失败测试**

```ts
import { createApp, h, nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import AnalyticsFlipValue from '../docs/.vitepress/theme/AnalyticsFlipValue.vue'
import { digitTokens, digitTiming } from '../docs/.vitepress/theme/analyticsFlipValue'

function mountValue(initialValue: string) {
  const host = document.createElement('div')
  document.body.append(host)
  const value = ref(initialValue)
  const app = createApp({
    setup: () => () => h(AnalyticsFlipValue, { value: value.value }),
  })
  app.mount(host)
  return {
    host,
    value,
    unmount: () => {
      app.unmount()
      host.remove()
    },
  }
}

it('aligns numeric places from the right and keeps separators static', () => {
  expect(digitTokens('12,355')).toEqual([
    { id: 'place-4', char: '1', kind: 'digit', place: 4 },
    { id: 'place-3', char: '2', kind: 'digit', place: 3 },
    { id: 'separator-2', char: ',', kind: 'separator', place: -1 },
    { id: 'place-2', char: '3', kind: 'digit', place: 2 },
    { id: 'place-1', char: '5', kind: 'digit', place: 1 },
    { id: 'place-0', char: '5', kind: 'digit', place: 0 },
  ])
})

it('uses a bounded duration and stagger for each numeric place', () => {
  expect([0, 1, 2, 3, 4].map(digitTiming)).toEqual([
    { duration: '360ms', delay: '0ms' },
    { duration: '410ms', delay: '35ms' },
    { duration: '460ms', delay: '70ms' },
    { duration: '500ms', delay: '105ms' },
    { duration: '500ms', delay: '105ms' },
  ])
})
```

- [ ] **Step 2: 运行测试并确认 RED**

Run: `./node_modules/.bin/vitest run tests/analytics-flip-value.test.ts`

Expected: FAIL，因为翻动组件与 helper 尚不存在。

- [ ] **Step 3: 实现最小 token 拆分与无障碍结构**

```ts
export interface FlipToken {
  id: string
  char: string
  kind: 'digit' | 'separator'
  place: number
}

export function digitTokens(value: string): FlipToken[] {
  let place = [...value].filter((char) => /\d/.test(char)).length - 1
  let separator = 0
  return [...value].map((char) => /\d/.test(char)
    ? { id: `place-${place}`, char, kind: 'digit', place: place-- }
    : { id: `separator-${separator++}`, char, kind: 'separator', place: -1 })
}

export function digitTiming(place: number) {
  const durations = [360, 410, 460, 500] as const
  return {
    duration: `${durations[Math.min(place, 3)]}ms`,
    delay: `${Math.min(place, 3) * 35}ms`,
  }
}
```

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { digitTiming, digitTokens } from './analyticsFlipValue'

const props = defineProps<{ value: string }>()

const tokens = computed(() => digitTokens(props.value))
</script>

<template>
  <span class="wbx-flip-value">
    <span class="wbx-sr-only">{{ value }}</span>
    <span class="wbx-flip-value__visual" aria-hidden="true">
      <template v-for="token in tokens" :key="token.id">
        <span v-if="token.kind === 'separator'" class="wbx-flip-value__separator">{{ token.char }}</span>
        <span
          v-else
          class="wbx-flip-value__digit"
          :style="{
            '--wbx-digit-duration': digitTiming(token.place).duration,
            '--wbx-digit-delay': digitTiming(token.place).delay,
          }"
        >
          <Transition name="wbx-digit" appear>
            <span :key="token.char" class="wbx-flip-value__glyph">{{ token.char }}</span>
          </Transition>
        </span>
      </template>
    </span>
  </span>
</template>
```

- [ ] **Step 4: 增加更新、位数变化和节点复用测试**

```ts
it('reuses unchanged places and replaces only changed digit glyphs', async () => {
  const view = mountValue('1,234')
  const beforeDigits = [...view.host.querySelectorAll('.wbx-flip-value__digit')]
  const beforeGlyphs = beforeDigits.map((node) => node.querySelector('.wbx-flip-value__glyph'))
  view.value.value = '1,235'
  await nextTick()
  const afterDigits = [...view.host.querySelectorAll('.wbx-flip-value__digit')]
  const afterGlyphs = afterDigits.map((node) => node.querySelector('.wbx-flip-value__glyph'))
  expect(afterDigits).toEqual(beforeDigits)
  expect(afterGlyphs.slice(0, 3)).toEqual(beforeGlyphs.slice(0, 3))
  expect(afterGlyphs[3]).not.toBe(beforeGlyphs[3])
  expect(view.host.querySelectorAll('.wbx-flip-value__separator')).toHaveLength(1)
  view.unmount()
})

it('keeps ones tens and hundreds place ids stable when length changes', () => {
  expect(digitTokens('999').map(({ id }) => id)).toEqual(['place-2', 'place-1', 'place-0'])
  expect(digitTokens('1,000').filter(({ kind }) => kind === 'digit').map(({ id }) => id))
    .toEqual(['place-3', 'place-2', 'place-1', 'place-0'])
})

it('keeps one complete accessible value and hides the animated layer', () => {
  const view = mountValue('12,355')
  expect(view.host.querySelector('.wbx-sr-only')?.textContent).toBe('12,355')
  expect(view.host.querySelector('.wbx-flip-value__visual')?.getAttribute('aria-hidden')).toBe('true')
  view.unmount()
})
```

- [ ] **Step 5: 运行组件测试并确认 GREEN**

Run: `./node_modules/.bin/vitest run tests/analytics-flip-value.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交组件与测试**

```bash
git add docs/.vitepress/theme/analyticsFlipValue.ts docs/.vitepress/theme/AnalyticsFlipValue.vue tests/analytics-flip-value.test.ts
git commit -m "实现统计数字分位翻动组件"
```

---

### Task 2: 集成统计条与错速样式

**Files:**
- Modify: `docs/.vitepress/theme/HomeAnalyticsStrip.vue`
- Modify: `docs/.vitepress/theme/home.css`
- Modify: `tests/home-analytics-strip.test.ts`
- Modify: `tests/home-analytics-style.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `AnalyticsFlipValue`，传入 `displayValue(key)`。
- Produces: 四个 `dd` 内各一个翻动值组件；加载与错误占位继续以同一组件静态呈现。
- Produces: CSS 变量 `--wbx-digit-duration` 与 `--wbx-digit-delay`。

- [ ] **Step 1: 写统计条集成失败测试**

```ts
it('renders one accessible flip value per metric after loading', async () => {
  fetchMock.mockResolvedValueOnce({
    todayVisits: 1234,
    todayPageviews: 5678,
    lifetimeVisits: 9012,
    lifetimePageviews: 34567,
    fetchedAt: Date.now(),
  })
  const view = mountStrip()
  await Promise.resolve()
  await nextTick()
  expect(view.host.querySelectorAll('.wbx-flip-value')).toHaveLength(4)
  expect([...view.host.querySelectorAll('dd .wbx-sr-only')].map((node) => node.textContent?.trim()))
    .toEqual(['1,234', '5,678', '9,012', '34,567'])
})
```

- [ ] **Step 2: 运行统计条测试并确认 RED**

Run: `./node_modules/.bin/vitest run tests/home-analytics-strip.test.ts`

Expected: FAIL，因为统计条尚未挂载 `.wbx-flip-value`。

- [ ] **Step 3: 将翻动组件接入四个数值**

```vue
<script setup lang="ts">
import AnalyticsFlipValue from './AnalyticsFlipValue.vue'
</script>

<dd><AnalyticsFlipValue :value="displayValue(key)" /></dd>
```

保留 `displayValue`、`refresh`、定时器、可见性刷新和错误状态逻辑原样。

- [ ] **Step 4: 写错速、稳定布局与 reduced-motion 失败测试**

```ts
it('defines place-specific timing without animating separators', () => {
  expect(css).toMatch(/\.wbx-flip-value__digit[^}]*width:\s*1ch/s)
  expect(css).toMatch(/transition:[^;]*var\(--wbx-digit-duration\)/s)
  expect(css).toMatch(/transition:[^;]*var\(--wbx-digit-delay\)/s)
  expect(css).toMatch(/\.wbx-digit-enter-active[^}]*transform[^}]*opacity/s)
  expect(css).toMatch(/@media \(prefers-reduced-motion:\s*reduce\)[\s\S]*\.wbx-digit-enter-active/)
})
```

- [ ] **Step 5: 实现 CSS 翻动与减弱动效**

```css
.wbx-flip-value,
.wbx-flip-value__visual {
  display: inline-flex;
  align-items: baseline;
  white-space: nowrap;
}

.wbx-flip-value__digit {
  position: relative;
  display: inline-block;
  width: 1ch;
  height: 1em;
  overflow: hidden;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.wbx-flip-value__glyph {
  position: absolute;
  inset: 0;
  text-align: center;
}

.wbx-digit-enter-active,
.wbx-digit-leave-active {
  transition:
    transform var(--wbx-digit-duration) cubic-bezier(.22, 1, .36, 1) var(--wbx-digit-delay),
    opacity var(--wbx-digit-duration) ease var(--wbx-digit-delay);
}

.wbx-digit-enter-from { transform: translateY(100%); opacity: 0; }
.wbx-digit-leave-to { transform: translateY(-100%); opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .wbx-digit-enter-active,
  .wbx-digit-leave-active { transition: none; }
}
```

- [ ] **Step 6: 运行聚焦测试并确认 GREEN**

Run: `./node_modules/.bin/vitest run tests/analytics-flip-value.test.ts tests/home-analytics-strip.test.ts tests/home-analytics-style.test.ts`

Expected: PASS。

- [ ] **Step 7: 提交集成与样式**

```bash
git add docs/.vitepress/theme/HomeAnalyticsStrip.vue docs/.vitepress/theme/home.css tests/home-analytics-strip.test.ts tests/home-analytics-style.test.ts
git commit -m "接入首页统计数字错速翻动"
```

---

### Task 3: 完整验证、浏览器验收与部署

**Files:**
- Modify only if a verified defect is found in Task 1 or Task 2 files.
- Create: `docs/superpowers/reports/2026-08-14-home-analytics-digit-flip-verification.md`

**Interfaces:**
- Consumes: Task 1 和 Task 2 的最终组件、CSS 与测试。
- Produces: 可复核的 CLI、桌面/移动端和线上部署验证记录。

- [ ] **Step 1: 运行完整项目验证**

```bash
npm test
npm run check:links
npm run check:assets
npm run build
git diff --check origin/main...HEAD
```

Expected: 全部退出码为 0；若存在既有环境告警，记录原文并确认与本功能无关。

- [ ] **Step 2: 启动全新 production preview**

Run: `npm run preview -- --host 127.0.0.1 --port 4192`

Expected: `http://127.0.0.1:4192/` 可访问，使用新端口避免旧构建缓存。

- [ ] **Step 3: 桌面浏览器验收**

在 1440×900 下验证：

```text
1. 首次加载四个数值由下方进入。
2. 通过开发者工具或测试桩更新一组值，只有变化数位翻动。
3. 个位先完成，高位稍后完成；千位及更高位延迟封顶，整组约 605ms 内结束。
4. 统计条 top/height/width 与动画前后差值均不超过 1px。
5. 千分位逗号保持静止；明暗主题均无裁切或重影。
```

- [ ] **Step 4: 移动端与减弱动效验收**

在 390×844 下验证两列布局、长数字无溢出、页面 `scrollWidth === clientWidth`。启用 reduced motion 后再次更新数据，确认数值立即替换且无 transform/opacity transition。

- [ ] **Step 5: 写验证报告并提交**

报告记录命令、通过数量、preview URL、viewport、动画前后几何值、reduced-motion 结果和任何残余风险。

```bash
git add docs/superpowers/reports/2026-08-14-home-analytics-digit-flip-verification.md
git commit -m "记录首页统计翻动验收结果"
```

- [ ] **Step 6: 合并并部署**

确认主工作树未覆盖用户未提交改动后，将 `codex/home-analytics-digit-flip` 快进合并到 `main`，推送 `origin/main`，等待现有部署流水线完成。

```bash
git push origin main
```

- [ ] **Step 7: 线上复验**

访问 `https://wbx.sparkx.zone/?verify=analytics-flip-20260814`，确认新构建资源加载、四项数据存在、数字翻动生效、控制台无错误，并记录部署提交与线上状态。
