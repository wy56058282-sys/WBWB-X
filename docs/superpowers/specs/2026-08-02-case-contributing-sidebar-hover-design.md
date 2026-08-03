# 投稿页侧栏与偏绿悬停色设计规格

日期：2026-08-02

## 背景

案例集侧栏配置目前只绑定 `/cases/` 路径前缀。“如何提交 Case”菜单链接指向 `/community/case-contributing`，进入该页面后 VitePress 无法匹配案例集侧栏，因此侧栏消失。

侧栏菜单当前复用全站中性的灰色悬停背景。用户希望侧栏悬停容器更偏绿，同时不改变首页卡片、搜索结果、按钮等其他交互组件。

## 目标

- 在 `/community/case-contributing` 页面显示完整案例集侧栏。
- 保持该页面现有 URL、内容和 SEO 地址不变。
- 小白书与案例集侧栏使用统一的偏绿悬停背景。
- 不改变当前页面的绿色选中状态，也不影响侧栏之外的组件。

## 路由与侧栏设计

在 VitePress `themeConfig.sidebar` 中增加精确路径映射：

- `/community/case-contributing` 使用现有 `casesSidebar`。
- `/cases/` 继续使用同一份 `casesSidebar`。
- 不迁移 Markdown 文件，不增加重定向，不新建社区侧栏。

进入“如何提交 Case”页面后，侧栏应展示“案例集首页”“如何提交 Case”“社区 Case”及动态案例条目，并将“如何提交 Case”标记为当前项。

## 悬停颜色设计

增加侧栏专用的主题变量：

- 浅色模式：`--wbx-sidebar-hover-surface: #e4ece5`。
- 深色模式：`--wbx-sidebar-hover-surface: #202a24`。

`.VPSidebarItem .link:hover` 与 `.VPSidebarItem .link:focus-visible` 使用该专用变量。全站已有的 `--wbx-hover-surface` 保持不变，因此首页卡片、搜索结果、二维码关闭按钮及其他组件不会随本次调整改变。

当前项继续使用 `--wbx-accent`，键盘焦点继续保留 `2px` 强调色轮廓；悬停色不得覆盖当前项的选中层级。

## 响应式与兼容性

- 桌面和移动端侧栏使用同一组浅色/深色悬停变量。
- 不修改侧栏宽度、菜单字号、行高、间距、分组或折叠行为。
- 不修改此前确认的桌面紧凑间距规则。

## 测试与验收

- 配置测试确认 `/community/case-contributing` 与 `/cases/` 指向同一份案例侧栏数据。
- 侧栏测试确认“如何提交 Case”的链接仍为 `/community/case-contributing`。
- CSS 测试确认浅色与深色侧栏专用变量的精确值。
- CSS 测试确认侧栏 hover/focus-visible 使用专用变量，而其他组件继续使用全站中性变量。
- 现有 Vitest、链接检查、素材检查和 VitePress 构建通过。
- 浏览器验证投稿页侧栏恢复、当前项高亮正确，并检查浅色与深色悬停表现。
