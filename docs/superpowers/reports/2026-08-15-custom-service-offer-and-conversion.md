# 定制服务页面验收结果

日期：2026-08-15

## 结果

验收通过。Task 4 未发现需要修改已批准业务的真实缺陷；验收修复将 Vitest 的嵌套副本排除和独立渠道状态验证纳入根项目合同。

## 自动化验证

| 命令 | 结果 |
| --- | --- |
| `./node_modules/.bin/vitest run` | 通过：44 个测试文件、293 个测试；`vitest.config.ts` 保留 Vitest 默认排除项，并排除 `.worktrees/**` 与 `.pnpm-store/**` 的陈旧副本。 |
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
| 1440 × 1000 | [截图](2026-08-15-custom-service-offer-and-conversion/help-1440-light.jpg) | [截图](2026-08-15-custom-service-offer-and-conversion/help-1440-dark.jpg) | 无水平溢出；路径区块清晰；无控制台错误。 |
| 900 × 1000 | [截图](2026-08-15-custom-service-offer-and-conversion/help-900-light.jpg) | [截图](2026-08-15-custom-service-offer-and-conversion/help-900-dark.jpg) | 无水平溢出；服务阶梯为两列；主题菜单可用。 |
| 390 × 844 | [截图](2026-08-15-custom-service-offer-and-conversion/help-390-light.jpg) | [截图](2026-08-15-custom-service-offer-and-conversion/help-390-dark.jpg) | 无水平溢出；服务阶梯单列；文案无重叠或裁切。 |

实测页面宽度分别为 1425/1440、885/900、375/390。键盘焦点从“Skip to content”、品牌、搜索、主导航依次前进；服务主 CTA 和相关案例链接的焦点轮廓为可见的 2px 实线。浏览器控制台错误为 0。

路由验收：`/cases/`、`/community/case-contributing` 和首个相关案例 `/cases/submissions/annual-report-digital-transformation/` 均正常加载。

## 独立就绪状态

根 `tests/service-page.test.ts` 以测试专用配置值挂载组件，并将独立状态作为持久回归合同：

```bash
./node_modules/.bin/vitest run tests/service-page.test.ts
```

结果：1 个测试文件、10 个测试全部通过。

- 仅配置商务微信 QR：只渲染有意义替代文字 `WorkBuddy 商务微信二维码`，表单和企业采购仍为禁用占位。
- 仅配置 HTTPS 报名表：只渲染 `https://forms.example.com/diagnosis`，并具有 `_blank` 与 `noopener noreferrer`；两个 QR 均不渲染。
- 仅配置企业采购 QR：只渲染有意义替代文字 `WorkBuddy 企业采购渠道二维码`，商务微信和报名表仍不可用。
- ready fixture 重置为空值后：三个入口均恢复默认禁用占位。

每次挂载后的空值配置均回到默认禁用占位。真实商务微信 QR、真实企业采购渠道 QR 和经过运营确认的 HTTPS 报名表仍是各自 readiness flag 能够上线前的必需条件，不能以测试值替代。

## 已知限制

`.worktrees/` 与 `.pnpm-store/` 中保留的陈旧测试副本不属于根项目测试集合；Vitest 配置现在显式排除它们，因此标准全量命令可稳定验证根项目。
