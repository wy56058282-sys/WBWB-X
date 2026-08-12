# 首页访问统计数据条实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在首页 Hero 与阅读路线之间增加由 Umami Cloud 真实聚合数据驱动的访问统计条，并在全站安全加载一次 Umami 跟踪脚本。

**Architecture:** 先以真实 Share URL 验证公开统计接口与浏览器 CORS，失败则在写 UI 前停止。通过后由 `homeAnalytics.ts` 隔离 Umami 请求、北京时间边界和响应校验，`HomeAnalyticsStrip.vue` 管理刷新生命周期与展示状态，`HomePage.vue` 只负责放置组件；VitePress 配置与 GitHub Actions 只注入公开 Website ID 和 Share URL，不接触 API Key。

**Tech Stack:** VitePress、Vue 3 Composition API、TypeScript、Vitest/jsdom、Umami Cloud、GitHub Pages、GitHub Actions Variables

## Global Constraints

- 今日访问使用 Umami `visits`；今日浏览使用 `pageviews`；累计指标从统计脚本上线时开始，不回填历史数据。
- 所有日界线按 `Asia/Shanghai` 计算。
- 页面首次加载立即取数，此后每 5 分钟刷新；页面隐藏时不轮询，重新可见且数据过期时立即刷新。
- 前端和构建产物不得包含 Umami API Key、账户令牌或登录凭据。
- Share URL 只开放 Overview 和 Realtime；若公开接口或 CORS 不满足真实取数要求，停止实施并回到服务端中转方案确认。
- 缺少 Website ID 或 Share URL 时，不加载跟踪脚本、不渲染统计条，生产构建仍须成功。
- 桌面端为状态区加四项指标单行布局；移动端状态区独占一行，指标为 2 x 2 网格。
- 加载态不得显示伪造的 0；失败态显示 `--`/“暂未同步”，最近一次成功数据可保留。
- 不启用 Session Replay、Heatmap 或个人级数据展示。
- 不修改首页现有 Hero、更新通知、阅读路线或其他内容行为。

---

## File Map

- Create `docs/.vitepress/theme/homeAnalytics.ts`: 公开配置解析、北京时间范围、Umami 请求、响应校验和统一数据类型。
- Create `docs/.vitepress/theme/HomeAnalyticsStrip.vue`: 加载/成功/陈旧/失败状态、5 分钟刷新和可见性生命周期。
- Modify `docs/.vitepress/theme/HomePage.vue`: 在 Hero 后、阅读路线前放置统计组件。
- Modify `docs/.vitepress/theme/home.css`: 首页视觉语言、五区桌面布局、移动端 2 x 2、主题与 reduced-motion。
- Modify `docs/.vitepress/config.mts`: 有完整公开配置时在根 `<head>` 注入一次 Umami tracker。
- Modify `.github/workflows/deploy-pages.yml`: 将 GitHub Repository Variables 注入测试与构建。
- Create `tests/home-analytics.test.ts`: 时间边界、配置、请求 URL、解析和错误合同。
- Create `tests/home-analytics-strip.test.ts`: 组件状态、刷新、并发、visibility、清理和无障碍。
- Create `tests/home-analytics-config.test.ts`: VitePress head、缺配置降级和无密钥边界。
- Create `tests/home-analytics-style.test.ts`: 结构顺序、桌面/移动布局和 reduced-motion 合同。

---

### Task 1: 验证真实 Umami 公开读取合同并实现数据适配层

**Files:**
- Create: `docs/.vitepress/theme/homeAnalytics.ts`
- Create: `tests/home-analytics.test.ts`
- Create: `docs/superpowers/evidence/home-analytics-public-api.md`

**Interfaces:**
- Consumes: `VITE_WBX_UMAMI_WEBSITE_ID`、`VITE_WBX_UMAMI_SHARE_URL` 与 `VITE_WBX_UMAMI_COLLECTION_STARTED_AT`；前两项由用户提供，第三项在首次 tracker 生产部署时记录。变量只用于本地命令环境，线上由 GitHub Repository Variables 映射注入。
- Produces: `HomeAnalyticsConfig`, `HomeAnalyticsSnapshot`, `readHomeAnalyticsConfig()`, `shanghaiRanges()`, `fetchHomeAnalytics()`。

- [ ] **Step 1: 用真实 Share URL 验证公开请求和 CORS**

从 Share URL 解析 share slug/id，按 Umami 当前官方分享页真实网络请求确认统计端点、鉴权参数和响应字段。使用浏览器 Network 与 `curl` 各请求一次今日范围和累计范围，并把下列证据写入 `docs/superpowers/evidence/home-analytics-public-api.md`：

```markdown
# Umami public stats verification

- Verified at: record the exact ISO-8601 timestamp when the requests complete
- Website ID: record the exact public UUID supplied by Umami Cloud
- Share URL: record the exact read-only URL supplied by Umami Cloud
- Stats endpoint shape: record the verified URL shape, retaining only public identifiers
- Browser origin: https://wbx.sparkx.zone
- CORS: record PASS or FAIL and the exact Access-Control-Allow-Origin value
- Today response fields: visits, pageviews
- Lifetime response fields: visits, pageviews
- No Authorization/API key required: record PASS or FAIL
```

Expected: 请求无需 `Authorization` 或 API Key，浏览器允许从 `https://wbx.sparkx.zone` 读取 JSON，响应能提供非负整数 `visits` 与 `pageviews`。任一条件失败时记录 FAIL，停止 Task 1，不创建前端降级密钥方案。

- [ ] **Step 2: 写数据适配层失败测试**

在 `tests/home-analytics.test.ts` 固定当前时间为 `2026-08-12T14:30:00+08:00`，覆盖：

```ts
expect(shanghaiRanges(now, collectionStartedAt)).toEqual({
  today: {
    startAt: Date.parse('2026-08-12T00:00:00+08:00'),
    endAt: now.getTime(),
  },
  lifetime: {
    startAt: collectionStartedAt,
    endAt: now.getTime(),
  },
})

await expect(fetchHomeAnalytics(config, { fetchImpl, now })).resolves.toEqual({
  todayVisits: 12,
  todayPageviews: 34,
  lifetimeVisits: 56,
  lifetimePageviews: 78,
  fetchedAt: now.getTime(),
})
```

再断言缺字段、字符串、负数、非 2xx 与取消请求均 reject；断言两个请求只携带公开 share 参数，不含 `authorization`、`token`、`key` 查询参数或请求头。

- [ ] **Step 3: 运行测试确认 RED**

Run: `pnpm exec vitest run tests/home-analytics.test.ts`

Expected: FAIL，因为 `homeAnalytics.ts` 尚不存在。

- [ ] **Step 4: 实现最小数据适配层**

在 `homeAnalytics.ts` 定义稳定的 UI 边界：

```ts
export interface HomeAnalyticsConfig {
  websiteId: string
  shareUrl: string
  collectionStartedAt: number
}

export interface HomeAnalyticsSnapshot {
  todayVisits: number
  todayPageviews: number
  lifetimeVisits: number
  lifetimePageviews: number
  fetchedAt: number
}

export interface FetchHomeAnalyticsOptions {
  fetchImpl?: typeof fetch
  now?: Date
  signal?: AbortSignal
}

export function readHomeAnalyticsConfig(
  env: Record<string, string | undefined>,
): HomeAnalyticsConfig | null

export function shanghaiRanges(
  now: Date,
  collectionStartedAt: number,
): {
  today: { startAt: number; endAt: number }
  lifetime: { startAt: number; endAt: number }
}

export async function fetchHomeAnalytics(
  config: HomeAnalyticsConfig,
  options: FetchHomeAnalyticsOptions = {},
): Promise<HomeAnalyticsSnapshot>
```

使用 `Intl.DateTimeFormat(..., { timeZone: 'Asia/Shanghai' })` 提取上海年月日并构造 `+08:00` 日界线。响应解析必须显式检查四个值为有限、非负整数；具体 endpoint 拼装只存在于此文件，并与 Step 1 证据一致。

- [ ] **Step 5: 运行数据适配测试确认 GREEN**

Run: `pnpm exec vitest run tests/home-analytics.test.ts`

Expected: PASS。

- [ ] **Step 6: 提交适配层和真实接口证据**

```bash
git add docs/.vitepress/theme/homeAnalytics.ts tests/home-analytics.test.ts docs/superpowers/evidence/home-analytics-public-api.md
git commit -m "接入 Umami 公开统计数据"
```

---

### Task 2: 实现统计条组件生命周期与展示状态

**Files:**
- Create: `docs/.vitepress/theme/HomeAnalyticsStrip.vue`
- Create: `tests/home-analytics-strip.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `HomeAnalyticsConfig`, `HomeAnalyticsSnapshot`, `fetchHomeAnalytics()`。
- Produces: `<HomeAnalyticsStrip :config="config" />`，无公开事件；刷新间隔常量 `HOME_ANALYTICS_REFRESH_MS = 300_000`。

- [ ] **Step 1: 写组件加载、成功和失败状态测试**

mock `fetchHomeAnalytics()`，挂载组件并断言：

```ts
expect(region.getAttribute('aria-label')).toBe('网站访问统计')
expect(labels).toEqual(['今日访问', '今日浏览', '累计访问', '累计浏览'])
expect(values).toEqual(['···', '···', '···', '···'])

resolveRequest(snapshot)
await nextTick()
expect(values).toEqual(['1,234', '5,678', '9,012', '34,567'])
expect(status.textContent).toContain('实时统计')
```

失败且无旧数据时断言四项为 `--` 且状态为“暂未同步”；刷新失败但已有成功数据时断言数字不变、状态为“暂未同步”。

- [ ] **Step 2: 写刷新、visibility、并发和清理测试**

使用 fake timers 覆盖：立即请求一次；`300_000ms` 后请求一次；页面隐藏时不请求；恢复可见且 `fetchedAt` 超过 5 分钟时请求；上一次 Promise 未完成时不启动第二次；卸载后清理 timer 并调用 `AbortController.abort()`。

- [ ] **Step 3: 运行组件测试确认 RED**

Run: `pnpm exec vitest run tests/home-analytics-strip.test.ts`

Expected: FAIL，因为组件不存在。

- [ ] **Step 4: 实现状态机与生命周期**

组件内部只保留四类状态：

```ts
type AnalyticsState =
  | { kind: 'loading' }
  | { kind: 'ready'; data: HomeAnalyticsSnapshot }
  | { kind: 'stale'; data: HomeAnalyticsSnapshot }
  | { kind: 'error' }
```

以 `requestInFlight` 阻止并发，以单个 `AbortController` 管理取消；`visibilitychange` 只在重新可见且没有活动请求时检查过期。模板中状态点加 `aria-hidden="true"`，统计区域不设置 `aria-live`，四项使用 `<dl><div><dt>…</dt><dd>…</dd></div></dl>`。

- [ ] **Step 5: 运行组件测试确认 GREEN**

Run: `pnpm exec vitest run tests/home-analytics-strip.test.ts`

Expected: PASS，且 fake timer/全局事件监听在每个测试后恢复。

- [ ] **Step 6: 提交组件**

```bash
git add docs/.vitepress/theme/HomeAnalyticsStrip.vue tests/home-analytics-strip.test.ts
git commit -m "实现首页访问统计组件"
```

---

### Task 3: 集成首页布局与响应式视觉

**Files:**
- Modify: `docs/.vitepress/theme/HomePage.vue`
- Modify: `docs/.vitepress/theme/home.css`
- Create: `tests/home-analytics-style.test.ts`

**Interfaces:**
- Consumes: Task 1 的 `readHomeAnalyticsConfig()` 与 Task 2 的 `HomeAnalyticsStrip`。
- Produces: Hero 后、`.wbx-reading` 前的 `.wbx-home-analytics`，仅在公开配置完整时渲染。

- [ ] **Step 1: 写首页顺序和配置降级测试**

断言模板顺序为 `.wbx-hero` → `.wbx-home-analytics` → `.wbx-reading`；配置为 `null` 时不渲染区域，完整配置时恰好渲染一个统计区域。测试不得修改或覆盖现有更新通知轮播断言。

- [ ] **Step 2: 写 CSS 合同测试**

使用原生 CSSOM/getComputedStyle fixture 覆盖 1440px、900px、390px：桌面统计根为五列，390px 状态区跨两列且指标为 2 x 2；根边框 `2px`、圆角 `0`；指标最小宽度不导致 `scrollWidth > clientWidth`。断言 `prefers-reduced-motion: reduce` 下数值 transition 为 `none`。

- [ ] **Step 3: 运行首页集成测试确认 RED**

Run: `pnpm exec vitest run tests/home-analytics-style.test.ts tests/home-hero-icons.test.ts tests/home-update-carousel-sync.test.ts`

Expected: 新统计测试 FAIL；现有首页测试保持 PASS。

- [ ] **Step 4: 在首页放置组件**

在 `HomePage.vue` 导入组件与配置读取函数，配置从 `import.meta.env` 的公开变量读取；在 `</section><!-- .wbx-hero -->` 后立即放置：

```vue
<HomeAnalyticsStrip
  v-if="homeAnalyticsConfig"
  :config="homeAnalyticsConfig"
/>
```

不要把刷新 timer 或 Umami response 解析放进 `HomePage.vue`。

- [ ] **Step 5: 实现视觉与响应式样式**

在 `home.css` 新增 `.wbx-home-analytics` 命名空间：与 `.wbx-section` 使用相同 `max-width`/横向 margin；桌面 grid 为 `minmax(140px, .8fr) repeat(4, minmax(0, 1fr))`；每项用左侧细分隔线。`max-width: 760px` 时改为两列，状态区 `grid-column: 1 / -1`，去除第一指标在新行不需要的边线。数字设置 `font-variant-numeric: tabular-nums` 与 `overflow-wrap: anywhere`，不得使用 viewport 字号缩放。

- [ ] **Step 6: 运行首页测试确认 GREEN**

Run: `pnpm exec vitest run tests/home-analytics-style.test.ts tests/home-analytics-strip.test.ts tests/home-analytics.test.ts tests/home-hero-icons.test.ts tests/home-update-carousel-sync.test.ts`

Expected: PASS。

- [ ] **Step 7: 生产预览视觉验收**

构建并启动新端口预览，使用 1440x900、900x900、390x844，分别检查浅色/深色和 reduced-motion：模块位于 Hero 与阅读路线之间；桌面五区单行；移动 2 x 2；数字不截断；页面无横向溢出；加载/成功/失败都不引起模块高度跳动。保存截图和 DOM 尺寸到 `docs/superpowers/evidence/home-analytics-visual/`。

- [ ] **Step 8: 提交首页集成**

```bash
git add docs/.vitepress/theme/HomePage.vue docs/.vitepress/theme/home.css tests/home-analytics-style.test.ts docs/superpowers/evidence/home-analytics-visual
git commit -m "展示首页访问统计数据条"
```

---

### Task 4: 注入跟踪脚本与部署配置并完成生产验收

**Files:**
- Modify: `docs/.vitepress/config.mts`
- Modify: `.github/workflows/deploy-pages.yml`
- Create: `tests/home-analytics-config.test.ts`
- Modify: `docs/superpowers/evidence/home-analytics-public-api.md`

**Interfaces:**
- Consumes: GitHub Repository Variables `WBX_UMAMI_WEBSITE_ID`, `WBX_UMAMI_SHARE_URL`, `WBX_UMAMI_COLLECTION_STARTED_AT`，映射为客户端 `VITE_WBX_UMAMI_WEBSITE_ID`, `VITE_WBX_UMAMI_SHARE_URL`, `VITE_WBX_UMAMI_COLLECTION_STARTED_AT`；Task 1 从 Umami Cloud 实际 Tracking code 核验并固定的公开 tracker URL 常量。
- Produces: 全站唯一 Umami `<script defer data-website-id="…">`，首页可用的公开 Vite env 配置，部署后真实数据闭环。

- [ ] **Step 1: 写配置和安全边界失败测试**

测试通过隔离加载 `config.mts` 覆盖无配置、半配置和完整配置：前两者 `head` 不含 Umami script；完整配置恰好一个 script，含 `defer`、官方 tracker `src`、`data-website-id` 和 `data-domains="wbx.sparkx.zone"`。扫描 `.vitepress/dist` 与 tracked source，禁止出现 `UMAMI_API_KEY`、`Authorization: Bearer` 或用户账户令牌。

- [ ] **Step 2: 运行配置测试确认 RED**

Run: `pnpm exec vitest run tests/home-analytics-config.test.ts`

Expected: FAIL，因为 config/workflow 尚未注入变量和 tracker。

- [ ] **Step 3: 实现 VitePress build-time 配置**

在 `config.mts` 创建纯函数 `umamiHead(env)`，只有三项公开配置均合法时返回 tracker script；将客户端所需值通过 Vite `define` 或 `VITE_` 公共变量注入。Website ID 必须为 UUID，Share URL 必须为 `https:` 且 hostname 属于 Umami Cloud；collection start 必须为有限正整数。禁止读取任何 API Key 环境变量。

- [ ] **Step 4: 配置 GitHub Actions Repository Variables**

先在仓库 Settings → Secrets and variables → Actions → Variables 创建：

```text
WBX_UMAMI_WEBSITE_ID：填写 Umami Website 的公开 UUID
WBX_UMAMI_SHARE_URL：填写只开放 Overview 与 Realtime 的只读 URL
WBX_UMAMI_COLLECTION_STARTED_AT：填写首次生产部署 tracker 时的 Unix epoch 毫秒值
```

然后在 workflow 的 Test 与 Build step 显式映射：

```yaml
env:
  VITE_WBX_UMAMI_WEBSITE_ID: ${{ vars.WBX_UMAMI_WEBSITE_ID }}
  VITE_WBX_UMAMI_SHARE_URL: ${{ vars.WBX_UMAMI_SHARE_URL }}
  VITE_WBX_UMAMI_COLLECTION_STARTED_AT: ${{ vars.WBX_UMAMI_COLLECTION_STARTED_AT }}
```

这些是公开标识，不创建 Secrets，也不配置 API Key。

- [ ] **Step 5: 运行聚焦与完整验证**

Run:

```bash
pnpm exec vitest run tests/home-analytics.test.ts tests/home-analytics-strip.test.ts tests/home-analytics-style.test.ts tests/home-analytics-config.test.ts tests/home-hero-icons.test.ts tests/home-update-carousel-sync.test.ts
pnpm test
pnpm run check:links
pnpm run check:assets
pnpm run build
git diff --check
```

Expected: 全部退出码 0；构建产物只出现公开 Website ID/share 标识，不出现密钥。

- [ ] **Step 6: 生产联调与数值核对**

部署候选版本后访问首页和至少两个内部路由，确认 Network 中 tracker script 只加载一次且 SPA 跳转产生单次 pageview。等待 Umami 入库后，以北京时间同一时间范围对照首页和 Umami Overview：今日/累计的 visits/pageviews 四项一致；刷新 5 分钟后无重复请求；Share URL 只能看到允许的 Overview/Realtime。

- [ ] **Step 7: 完成失败路径生产检查**

临时在本地 preview 使用无效公开 endpoint，确认首页显示 `--`/“暂未同步”、控制台无未处理异常、Hero 与阅读路线可正常使用；恢复真实配置重新构建。检查 ad blocker 拦截 tracker 时页面仍可用，统计条进入降级状态而非伪造 0。

- [ ] **Step 8: 更新证据并提交部署配置**

把真实部署 URL、workflow run、四项数值对照、Network 请求数量和安全扫描结果追加到 `home-analytics-public-api.md`，然后：

```bash
git add docs/.vitepress/config.mts .github/workflows/deploy-pages.yml tests/home-analytics-config.test.ts docs/superpowers/evidence/home-analytics-public-api.md
git commit -m "配置 Umami 全站统计采集"
```

---

## Final Acceptance

- [ ] 首页统计条只在公开配置完整时显示，位置严格位于 Hero 后、阅读路线前。
- [ ] 今日和累计值与 Umami Overview 在 `Asia/Shanghai` 同范围内一致。
- [ ] tracker 在全站只加载一次，SPA 每次路由导航只记录一次 pageview。
- [ ] 五分钟刷新、后台暂停、恢复可见、并发保护、卸载清理均有自动化覆盖。
- [ ] 1440/900/390、浅色/深色、正常/reduced-motion 均无溢出或布局跳动。
- [ ] 失败或拦截状态不显示假 0，不影响首页其他功能。
- [ ] 源码、CI 日志与构建产物不含 API Key、账户令牌或登录凭据。
- [ ] 完整测试、链接、资源、生产构建、发布边界和线上请求检查全部通过。
