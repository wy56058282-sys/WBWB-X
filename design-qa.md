# Task 5 Design QA

## Comparison target

- Source visual truth:
  - `/Users/nick/Desktop/WORKBUDDY WB/audit/01-workbuddy-guide-desktop.png`
  - `/Users/nick/Desktop/WORKBUDDY WB/audit/02-workbuddy-guide-mobile.png`
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
