# WorkBuddy WB-X

WorkBuddy WB-X 是面向真实任务的 WorkBuddy 中文社区实战读本。

- 线上站点：<https://wbx.sparkx.zone/>
- 内容与更新手册：[CONTENT_INVENTORY.md](./CONTENT_INVENTORY.md)
- 维护指南：[docs/maintenance/README.md](./docs/maintenance/README.md)

## 环境

- Node.js 20 或更高版本；CI 使用 Node.js 24。
- pnpm 11.9.0。

## 常用命令

```text
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm run check
pnpm run build
pnpm preview
```

## 仓库结构

- `docs/`：VitePress 内容、主题和公开静态资源。
- `scripts/`：构建、链接、资源和仓库检查脚本。
- `tests/`：单元、源契约和回归测试。
- `audit/`：按日期及主题归档的视觉和维护证据。
- `docs/superpowers/`：内部设计、计划、报告和证据。
- `docs/maintenance/`：内部仓库与内容维护指南。

详细职责见 [仓库目录与职责](./docs/maintenance/repository-layout.md)。

## 维护原则

- 公开 URL 和公开资源路径是稳定契约，调整前必须有明确设计与回归验证。
- pnpm 与 `pnpm-lock.yaml` 是唯一依赖来源。
- 缓存、依赖目录、本地部署状态和工具输出不进入 Git。
- 有复核价值的证据先归档，临时文件不直接删除。
