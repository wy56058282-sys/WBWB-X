# 网站维护指南

> 本目录是内部维护资料，不生成公开页面，也不进入站内搜索。

## 开始维护

1. 阅读根目录 `README.md` 和 `CONTENT_INVENTORY.md`。
2. 运行 `git status --short --branch`，确认现有改动和未跟踪资料。
3. 使用 pnpm 11.9.0 安装依赖，修改前先运行相关聚焦测试。

## 标准验证

- 聚焦验证：`pnpm exec vitest run <test-file>`。
- 完整验证：`pnpm run check`。
- 本地预览：`pnpm dev`；生产预览：先构建，再运行 `pnpm preview`。

## 指南索引

- [仓库目录与职责](./repository-layout.md)
- [素材与审计资料规则](./assets-and-audits.md)
- [后续优化清单](./future-optimizations.md)

## 内部文档边界

`docs/.vitepress/config.mts` 的 `srcExclude` 同时排除 `superpowers/**` 和 `maintenance/**`；`scripts/verify-publish-boundary.mjs` 在构建后复核目录与标题均未进入产物。
