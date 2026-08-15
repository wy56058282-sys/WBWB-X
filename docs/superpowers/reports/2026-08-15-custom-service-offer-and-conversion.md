# 定制服务页面验收结果

日期：2026-08-15

## 结果

验收通过。Task 4 未发现需要修改 Tasks 1-3 的真实缺陷；本次提交仅包含本报告和浏览器截图证据。

## 自动化验证

| 命令 | 结果 |
| --- | --- |
| `./node_modules/.bin/vitest run` | 未通过：Vitest 会递归收集 `.worktrees/` 与 `.pnpm-store/` 中不属于当前项目的过期测试副本。 |
| `./node_modules/.bin/vitest run --exclude '.worktrees/**' --exclude '.pnpm-store/**'` | 通过：43 个测试文件、289 个测试。 |
| `npm run check:links` | 通过：检查 17 个内部 Markdown 链接，0 个失效。 |
| `npm run check:assets` | 通过：获批替换资产存在，且不含来源热链。 |
| `npm run build` | 通过：VitePress 构建、渲染、旧路由生成和发布边界验证完成。仅有既有的 Rollup 大 chunk 建议。 |
| `git diff --check` | 通过，无输出。 |

## 内容边界审计

运行：

```bash
rg -n "agentos-app|paymentQrPath|微信支付|先支付|半天 FDE" docs tests
```

结果：没有 `agentos-app` 命中。`paymentQrPath`、`微信支付`、`先支付` 与 `半天 FDE` 的命中只出现在 `docs/superpowers/**` 的历史内部规格/计划和断言其不存在的测试中。`docs/.vitepress/config.mts` 使用 `srcExclude: ['superpowers/**']`，production build 的 `/help/` 页面不包含这些内部材料；浏览器检查也确认默认公开页面没有支付二维码或虚构的外部申请/企业渠道链接。

## Production Preview

- 预览命令：`npm run preview -- --host 127.0.0.1 --port 4192`
- URL：`http://127.0.0.1:4192/help/`
- `curl -I http://127.0.0.1:4192/help/`：`HTTP/1.1 200 OK`

## 浏览器验收

默认生产配置下，商务微信显示“商务微信即将开放”，报名表显示不可激活的“报名表准备中”，企业采购显示不可激活的“企业采购通道准备中”。服务阶梯、需求诊断和企业购买区块视觉分离；价格、时长、服务规则、20+ 席位一场或两场 90 分钟线上工作坊、无需部署基础设施，以及 30 天资料删除规则均可见且正确。

| 视口 | Light | Dark | 结果 |
| --- | --- | --- | --- |
| 1440 × 1000 | [截图](2026-08-15-custom-service-offer-and-conversion/help-1440-light.png) | [截图](2026-08-15-custom-service-offer-and-conversion/help-1440-dark.png) | 无水平溢出；路径区块清晰；无控制台错误。 |
| 900 × 1000 | [截图](2026-08-15-custom-service-offer-and-conversion/help-900-light.png) | [截图](2026-08-15-custom-service-offer-and-conversion/help-900-dark.png) | 无水平溢出；服务阶梯为两列；主题菜单可用。 |
| 390 × 844 | [截图](2026-08-15-custom-service-offer-and-conversion/help-390-light.png) | [截图](2026-08-15-custom-service-offer-and-conversion/help-390-dark.png) | 无水平溢出；服务阶梯单列；文案无重叠或裁切。 |

实测页面宽度分别为 1425/1440、885/900、375/390。键盘焦点从“Skip to content”、品牌、搜索、主导航依次前进；服务主 CTA 和相关案例链接的焦点轮廓为可见的 2px 实线。浏览器控制台错误为 0。

路由验收：`/cases/`、`/community/case-contributing` 和首个相关案例 `/cases/submissions/annual-report-digital-transformation/` 均正常加载。

## 独立就绪状态

使用临时、未提交的 `tests/task4-ready-state-audit.test.ts` 挂载组件三次：

```bash
./node_modules/.bin/vitest run --exclude '.worktrees/**' --exclude '.pnpm-store/**' tests/task4-ready-state-audit.test.ts
```

结果：1 个测试文件、3 个测试全部通过。

- 仅配置商务微信 QR：只渲染有意义替代文字 `WorkBuddy 商务微信二维码`，表单和企业采购仍为禁用占位。
- 仅配置 HTTPS 报名表：只渲染 `https://forms.example.com/diagnosis`，并具有 `_blank` 与 `noopener noreferrer`；两个 QR 均不渲染。
- 仅配置企业采购 QR：只渲染有意义替代文字 `WorkBuddy 企业采购渠道二维码`，商务微信和报名表仍不可用。

每次挂载后的空值配置均回到默认禁用占位。真实商务微信 QR、真实企业采购渠道 QR 和经过运营确认的 HTTPS 报名表仍是各自 readiness flag 能够上线前的必需条件，不能以测试值替代。

## 已知限制

仓库根目录内保留的 `.worktrees/` 和 `.pnpm-store/` 测试副本会使未加排除项的 Vitest 全量命令报告旧分支失败；根项目自身的完整套件为 289/289 通过。该目录收集行为不属于 Task 4 的页面或发布代码修改范围。
