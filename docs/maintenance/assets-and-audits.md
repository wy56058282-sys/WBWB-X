# 素材与审计资料规则

> 本文件是内部维护资料。素材整理不改公开 URL，不直接删除未确认资料。

## 源输入

- `WB-X LOGO.svg`：品牌源 Logo。
- `二维码.png`：交流群二维码源图。
- `article-image-replacement-manifest.csv`：文章图片工作流的人工可维护清单。

## 公开资源

`docs/public/` 下的路径会成为站点 URL；`docs/public/article-assets/` 的校准和替换路径是发布契约，变更前必须更新清单、链接测试和浏览器回归。

## 生成清单

`docs/.vitepress/image-manifest.generated.json` 与 CSV 必须保持记录、顺序、状态和路径一致。只通过 `scripts/build-image-manifest.mjs` 的临时目录和原子替换流程更新。

## 截图与审计证据

可复核证据放在 `audit/YYYY-MM-DD-topic/`；历史工具报告和退役源输入放在 `audit/archive/topic/`。不得将文件直接散放在 `audit/` 根目录。

## 替换和归档流程

1. 记录来源、页面、视口和用途。
2. 保持公开路径，替换前运行聚焦测试。
3. 运行 `pnpm run check` 并做真实浏览器验证。
4. 有复核价值的旧文件先归档；临时文件列入忽略或清理清单，不直接删除。
