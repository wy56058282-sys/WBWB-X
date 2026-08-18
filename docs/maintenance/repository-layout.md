# 仓库目录与职责

> 本文件是内部维护资料，不生成公开页面。

## 产品与发布文件

- `docs/`：VitePress 内容、主题和公开资源。
- `scripts/`：构建、链接、资源、重定向和仓库检查。
- `tests/`：行为、源码契约和构建边界测试。
- `.github/`：GitHub Pages 验证与部署。

## 维护和审计文件

- `docs/superpowers/`：设计、实施计划、报告与证据。
- `docs/maintenance/`：长期维护规则。
- `audit/`：按日期和主题保存的复核证据。

## 本地与生成文件

`.pnpm-store/`、`node_modules*/`、`.vercel*/`、`.tools/`、`.qoder/`、`.superpowers/`、VitePress cache/dist 和 coverage 均为本地或生成内容，不进入 Git。

## 首页模块边界

`home.css` 是唯一入口；`home-foundation.css`、`home-hero.css`、`home-sections.css`、`home-responsive.css` 按原级联顺序组合。`HomePage.vue` 仍负责页面结构。

## 图片清单模块边界

`scripts/build-image-manifest.mjs` 负责总体编排；`scripts/lib/image-manifest/` 分别负责 CSV、媒体、路径、工作流状态和原子替换。
