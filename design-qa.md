# Task 5 Design QA

## Comparison target

- Source visual truth:
  - `audit/2026-07-30-homepage-clone/workbuddy-guide-desktop-reference.png`
  - `audit/2026-07-30-homepage-clone/workbuddy-guide-mobile-reference.png`
- Source pixels:
  - Desktop: `1280 × 2847`
  - Mobile: `390 × 5366`
- Implementation: local VitePress route `/` served at port `4173`
- Intended comparison viewports: `1280px` desktop and `390 × 844` mobile
- State: light theme, homepage, no menu or dialog open
- Density normalization: source files are 1× PNG captures; no implementation capture was available to normalize.

## Evidence availability

- Both source screenshots were opened and inspected at original detail.
- The `390px` source capture shows a deliberately oversized hero rather than a reflowed card:
  - the hero begins at approximately `x = 28px`, while its right border remains outside the `390px` capture;
  - hero copy begins at approximately `x = 80px`;
  - metadata, headline, summary, both buttons, and the white pixel-icon cards continue past the right edge and are visibly clipped;
  - the headline stays on one oversized line, while the large buttons retain centered labels that are only partly visible.
- The narrow CSS preserves those source-observed proportions with a `960px` hero, `64px` no-wrap headline, `472 × 126px` hero buttons, and enlarged icon cards. The layout root uses `overflow-x: clip` so this intentional crop does not create page-level horizontal scrolling.
- The local preview server started successfully and returned the VitePress development shell over HTTP.
- The in-app browser reported `Browser is not available: iab`.
- The Chrome fallback reported `Browser is not available: extension`.
- No browser-rendered implementation screenshot could therefore be captured.
- Primary interactions and browser console errors could not be checked.

## Required fidelity surfaces

- Fonts and typography: the `@fontsource/silkscreen` 400/700 files are bundled locally under the SIL Open Font License 1.1 and loaded by the theme; browser-rendered wrapping and optical weight remain unverified.
- Spacing and layout rhythm: source desktop/tablet/mobile breakpoints and section measurements were implemented, but rendered comparison remains unverified.
- Colors and visual tokens: the source accent was replaced globally with `#32e6b9`; highlight, border, icon, and tint variants derive from that token with `color-mix` or alpha rather than separate branded green hex values.
- Image quality and asset fidelity: visible icons use the licensed `@hackernoon/pixel-icon-library` package credited by the source. The supplied WB-X logo remains the VitePress navigation asset. No placeholder, custom inline SVG, CSS drawing, gradient, or emoji asset was introduced.
- Copy and content: the seven homepage sections retain source order and copy, with approved WB-X brand substitutions.

## Full-view comparison evidence

Blocked. A browser-rendered implementation image is unavailable, so the required combined source/implementation visual comparison cannot be produced.

## Focused-region comparison evidence

Blocked for the same reason. The hero, reading cards, task grid, workflow, contribution callout, navigation, and mobile overflow cannot be judged from a rendered capture.

## Findings

- [P1] Browser-rendered visual comparison unavailable
  - Location: desktop and mobile homepage.
  - Evidence: both supported browser surfaces reported unavailable.
  - Impact: pixel fidelity, 390px overflow, navigation behavior, font rendering, hover/focus states, and console health cannot be accepted visually.
  - Fix: run the Task 10 QA pass when a browser surface is available, capture both target viewports, compare against the supplied references, and fix all P0/P1/P2 drift.

## Comparison history

- Initial pass: blocked before implementation capture; no visual fixes were made from browser evidence.

## Implementation checklist

- Capture the homepage at `1280px` in light mode.
- Capture the homepage at `390 × 844` in light mode.
- Confirm the intentional oversized hero is clipped at the viewport while `document.documentElement.scrollWidth === window.innerWidth`.
- Compare each capture together with its matching source screenshot.
- Test the semantic navigation and primary homepage links.
- Check the browser console and horizontal overflow.
- Resolve all P0/P1/P2 differences before changing this result.

final result: blocked

---

# 2026-08-17 线上基线同步 Design QA

## 验收基线与范围

- 线上代码基线：`origin/main`，提交 `9d2c0edafff189e30dd3407204f2e7dc6544f5f1`。
- 生产预览：`http://127.0.0.1:5174/`。
- 已检查页面：`/wb-x/`、`/wb-x/reading-guide/`、`/resources/`、`/community/contributing`、`/reading-guide`、`/guide/reading-guide`。
- 本轮只验收已批准的信息架构、兼容跳转和联系人卡片尺寸；定制服务、二维码弹层及构建边界均未改动。

## 视觉证据

- 小白书桌面页：`audit/2026-08-17-online-baseline-sync/wb-x-desktop.png`。
- 联系人卡片桌面焦点图：`audit/2026-08-17-online-baseline-sync/contact-cards-desktop.png`。
- 联系人卡片移动端上、下两个真实滚动位置：
  - `audit/2026-08-17-online-baseline-sync/contact-cards-mobile-card-1.png`
  - `audit/2026-08-17-online-baseline-sync/contact-cards-mobile-card-2.png`
- 移动端证据未拼接图片：两个文件均来自同一真实 CSS `390 × 844` 视口，分别完整显示第一张和第二张卡片，以同时验证卡片内容、标签、换行和纵向间距。
- 四个证据文件均为真实 PNG；文件像素尺寸受浏览器截图密度影响，不等同于 CSS 视口尺寸。

## 验收结果

- 桌面视口：实际 CSS `1440 × 1000`。顶部导航包含 `资料` 并指向 `/resources/`；小白书侧边栏前两项依次为 `小白书总览`、`阅读指南`。
- `/wb-x/` 保留线上版本信息 `v5.3.12`。附录 A 的上外边距和上内边距均为 `20px`，且只有 A 之前保留分隔线；附录 B/C 的上外边距均为 `-4px`，保持紧凑分组。
- `/wb-x/reading-guide/` 正常显示阅读指南，侧边栏 `阅读指南` 为当前项；`/resources/` 显示标题 `资料` 和占位文案 `资料整理中。`。
- `/reading-guide`、`/reading-guide/`、`/guide/reading-guide`、`/guide/reading-guide/` 均跳转到 `/wb-x/reading-guide/`；`SITE_BASE=/WBWB-X/` 构建也生成带基路径的目标地址。
- 桌面联系人卡片保持同一行，网格 `gap: 24px`、`flex-wrap: wrap`；两张卡片和图片宽度均为 `170px`，图片高度按原始比例自动计算为约 `216.52px`。
- 移动端实际 CSS 视口为 `390 × 844`，内容宽度和滚动宽度均为 `373px`，无横向溢出。两张 `170px` 卡片自然纵向换行，垂直间距约 `24px`，图片比例和标签居中保持不变。
- 两张联系人卡片仍分别链接到原始资源 `/article-assets/source-calibration/community/001.jpg` 与 `/article-assets/replacements/community/002.jpg`。
- 所检查页面均无横向溢出；浏览器控制台错误数为 `0`。

## 与用户标注区域的对比

- 联系人区域只将卡片及其直接图片从 `140px` 等比例扩大至 `170px`；原有两列桌面排列、`24px` 间距、居中标签、图片资源和点击行为均保留。
- 窄屏下没有强制压缩或裁剪卡片，而是使用原有 `flex-wrap` 自然换行，符合等比例增加后的布局预期。

## 遗留风险

- 无 P0、P1、P2 视觉问题。
- 本节替代上方历史 Task 5 中“浏览器不可用”的阻塞结论；历史记录保留用于说明之前的验收环境。

final result: passed

---

# 2026-08-17 案例页移动端筛选间距 Design QA

## 对比目标与证据

- 用户视觉目标：案例页移动端标注区域要求搜索框与筛选器增加间距。
- 同状态修复前基线：`audit/2026-08-17-cases-filter-spacing/cases-mobile-before.png`。
- 修复后实现：`audit/2026-08-17-cases-filter-spacing/cases-mobile-after.png`。
- 同画布对比：`audit/2026-08-17-cases-filter-spacing/cases-mobile-comparison.png`。
- CSS 视口：`390 × 844`；浏览器截图像素：修复前、修复后均为 `414 × 938`；浏览器截图密度一致，无额外缩放归一化。
- 页面状态：浅色主题、`/cases/`、搜索为空、分类为“全部”、移动导航收起。
- 修复前实测：搜索框下边缘 `358.9236px`，筛选器上边缘 `358.9236px`，可见间距约 `0px`。
- 修复后实测：搜索框下边缘 `358.9236px`，筛选器上边缘 `374.9219px`，可见间距约 `15.9983px`；计算样式 `margin-bottom: 16px`。
- 页面内容宽度与滚动宽度均为 `373px`，无横向溢出。

## 全视图与重点区域对比

- 同画布对比图将相同视口、相同状态的修复前后画面并排展示；唯一可见的结构变化是搜索框与筛选按钮组之间新增 16px 垂直留白。
- 搜索框、分类按钮、首张案例卡片、浮动入口和移动导航的位置、尺寸、换行与视觉样式均保持一致。
- 无需额外裁切重点图：搜索与筛选区域在 `900 × 1028` 的并排对比图中可清晰辨认，0px 与 16px 间距差异可直接判断。

## 必查视觉面

- 字体与排版：字体、字号、字重、行高、标题换行和控件文案未改动。
- 间距与布局节奏：移动端搜索与筛选之间从 0px 调整为 16px；筛选按钮内部及按钮之间原有 8px 间距保持不变。
- 色彩与视觉令牌：背景、边框、文字、激活绿和阴影未改动。
- 图片质量与资产：案例封面资源、裁切、比例和清晰度未改动，没有新增或替换可见资产。
- 文案与内容：标题、说明、搜索占位文字、筛选名称和案例内容未改动。

## 交互与运行检查

- 搜索框输入 `Excel` 后只显示 1 条匹配案例，标题为“清洗 119 份门店 Excel 并生成可交互运营看板”。
- 点击“数据分析”后 `aria-pressed="true"` 正确切换到该分类，并显示 1 条数据分析案例；点击“全部”可恢复。
- 浏览器控制台错误数为 `0`。

## Findings

- 无 P0、P1、P2 视觉或交互问题。

## Comparison history

- 初始对比：发现搜索框与筛选按钮组的可见间距约为 0px，符合用户标注的问题。
- 修复：仅在 `max-width: 1024px` 的单栏布局为搜索框增加 `16px` 下外边距。
- 修复后对比：同视口、同状态实测间距约为 16px；无横向溢出，其他可见元素无漂移。

final result: passed

---

# 2026-08-18 仓库全面整理 Design QA

## 自动验证

- 标准命令 `pnpm run check` 无环境前缀通过，且没有依赖状态警告：Vitest `59` 个测试文件、`374` 个测试全部通过；仓库卫生检查通过；`17` 个内部 Markdown 链接、`0` 个失效链接；批准的替代资产齐全且无源站热链；VitePress 构建、兼容跳转和发布边界检查全部通过，构建用时 `6.72s`。
- 标准命令 `pnpm exec vitest run tests/publish-boundary.test.ts tests/maintenance-contract.test.ts` 通过 `2` 个测试文件、`17` 个测试；标准命令 `pnpm run check:repo` 亦通过。本机 pnpm 为 `11.19`，仓库源码与 CI 继续固定为 `11.9.0`；唯一运行警告是 Vite/Rollup 对大于 `500 kB` chunk 的建议。

## 仓库治理

- 当前分支为 `codex/repository-maintenance`；验收前工作树干净，`git diff --check` 无输出，共 `657` 个受跟踪文件。`.pnpm-store/**`、`.qoder/**`、`.tools/**`、`package-lock.json` 的受跟踪路径查询结果为空。
- 工作树中的 `.pnpm-store` 目录和 `.tools/bin/gh` 文件均保留。主检出目录中的 `.vercel`、`.vercel-tmp`、`node_modules.preview-backup` 以及 `.pnpm-store/v11/projects/` 下三个指定项目入口 `21e594b3af70d7f363c4142ec7d6ed70`、`add1f5404edf33ca6ceb79373cf56984`、`d4f1c45e2db7cb95bfbc810a77abe0d2` 均以只读方式确认存在；其中前两个入口指向已不存在的旧工作树，但符号链接本身按要求完整保留。
- 主检出目录中的 Qoder harness 三个源文件、案例二维码报告、两张 WorkBuddy Guide 参考图、`WB-X LOGO.png`、四张 adversarial 截图和四张根目录截图均保留；工作树内逐项确认以下具体归档目标存在：
  - `audit/archive/2026-08-05-qoder-harness/canvas.json`、`findings.json`、`report.canvas.tsx`；
  - `docs/superpowers/reports/2026-08-02-case-qr-left-alignment-task-1.md`；
  - `audit/2026-07-30-homepage-clone/workbuddy-guide-desktop-reference.png`、`workbuddy-guide-mobile-reference.png`；
  - `audit/archive/source-assets/WB-X-LOGO-legacy.png`；
  - `audit/2026-08-10-adversarial/01-home.png`、`02-book-index.png`、`03-public-internal-plan.png`、`04-stale-part-two-index.png`；
  - `audit/archive/2026-08-18-unclassified-screenshots/screenshot-full-page.png`、`screenshot-page1-cover.png`、`screenshot-page2.png`、`screenshot-right-panel.png`。
- 最新 stash 保持为 `stash@{0} On codex/service-page-polish: pre-live-alignment-2026-08-18`，且仍包含且仅包含 `.gitignore`、`docs/.vitepress/theme/HomePage.vue`、`docs/.vitepress/theme/service.css`、`package-lock.json`、`tests/home-hero-icons.test.ts`、`tests/service-page-style.test.ts`、`tests/service-page.test.ts`；主检出目录与 stash 均未修改。

## 浏览器回归

- 本工作树的生产预览运行于 `http://127.0.0.1:4173/`。仅使用 Codex 应用内浏览器，对线上 `https://wbx.sparkx.zone` 与本地预览的 `/`、`/wb-x/`、`/resources/`、`/help/`、`/wb-x/reading-guide/` 完成桌面与移动端共 `20` 个页面样本的逐项对比。
- 桌面目标 CSS 视口为 `1440 × 900`。滚动页面的线上 raw viewport 为 `1455 × 900`、本地为 `1311 × 810`；不滚动的 `/resources/` 分别为 `1440 × 900` 与 `1296 × 810`。校准后每个样本均实测 `clientWidth=1440`、`scrollWidth=1440`、`innerHeight=900`，横向溢出均为 `0`。
- 移动端目标 CSS 视口为 `390 × 844`。滚动页面的线上 raw viewport 为 `405 × 844`、本地为 `366 × 760`；不滚动的 `/resources/` 分别为 `390 × 844` 与 `351 × 760`。校准后每个样本均实测 `clientWidth=390`、`scrollWidth=390`、`innerHeight=844`，横向溢出均为 `0`。
- 五组线上/本地页面的标题、H1、H2/必需页面标记、语义导航和主要链接目标全部匹配：首页的 `WorkBuddy小白书`、中国版 `v5.3.13`、国际版 `v5.2.7` 与四段路径；小白书目录的 `27` 章、四部分和附录；资料页的 `资料整理中。`；帮助页的 `¥399`、`45 分钟`、`不会用`、`跑不通`、`管不住`；阅读指南的入门、真实任务、团队落地与改进内容均已确认。首页 ticker 独立轮播造成采样瞬间的当前条目可能不同，但稳定 CTA、卡片和目标地址一致。
- 每个页面样本的页面控制台错误数均为 `0`。本地 `/reading-guide` 精确跳转至 `http://127.0.0.1:4173/wb-x/reading-guide/`，目标标题正确且控制台错误数为 `0`。预览最终保留在应用内浏览器的本地首页。

## 结论

- 完整自动验证、仓库/归档/本地状态保留检查、线上与本地双视口浏览器回归、兼容跳转、链接、横向溢出和控制台检查均通过；未发现 P0、P1 或 P2 验收问题。

final result: passed
