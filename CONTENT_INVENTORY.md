# WorkBuddy WB-X 网站内容资产与更新手册

> 盘点日期：2026-07-31
>
> 线上地址：<https://wbwbx.sparkx.zone/>
>
> GitHub 仓库：<https://github.com/wy56058282-sys/WBWB-X>
>
> 本次盘点基线：`cd9e1f8`
>
> 用途：记录网站现有内容、内容文件位置、更新方法和后续补充优先级。每次完成较大范围更新后，应同步维护本文件。

## 1. 网站定位

WorkBuddy WB-X 是一本以真实任务为主线的 WorkBuddy 中文社区实战读本。内容从产品入门、任务执行和案例复现，逐步延伸到 Skill、自动化、多 Agent、岗位和行业工作流。

当前内容品牌：

| 项目 | 当前值 |
| --- | --- |
| 网站名称 | WorkBuddy WB-X |
| 内容品牌 | WorkBuddy 实战小白书 |
| 首页内容简称 | WorkBuddy小白书 |
| 品牌短标 | WB-X |
| 品牌色 | `#32E6B9` |
| 内容作者 | WorkBuddy WB-X Contributors |
| 公网域名 | `https://wbwbx.sparkx.zone` |
| GitHub | `wy56058282-sys/WBWB-X` |
| 技术框架 | VitePress 1.6.4、Vue 3、TypeScript |

品牌的唯一配置入口是：

```text
docs/.vitepress/brand.ts
```

## 2. 当前内容规模

截至本次盘点：

| 内容类型 | 数量 | 说明 |
| --- | ---: | --- |
| 对外 Markdown 页面 | 49 | 不含内部设计与实施记录 |
| 小白书正文 | 27 章 | 第一篇 10 章、第二篇 11 章、第三篇 4 章、第四篇 2 章 |
| 额外阅读 | 1 篇 | 《一章看懂 AI 工作系统》 |
| 附录 | 2 篇 | 常用指令模板、场景速查表 |
| 社区案例 | 7 个 | 涵盖资讯、简历、公众号、知识管理、创意开发和数据分析 |
| 支持与共创页面 | 4 个 | 阅读指南、定制服务、参与共创、Case 投稿指南 |
| 图片清单条目 | 270 | 覆盖 35 个页面 |
| 原始校准素材 | 272 个 | 位于 `source-calibration` |
| 替换素材文件 | 36 个 | 位于 `replacements` |

按去除 Markdown 标记后的字符量粗略统计：

- 27 章正文约 7.96 万字符。
- 整个小白书区约 9.35 万字符。
- 7 个社区案例约 2.80 万字符。
- 全部对外 Markdown 内容约 12.64 万字符。

这些数字仅用于判断内容体量，不等同于字数或质量评分。

## 3. 网站信息架构

### 3.1 顶部导航

配置文件：

```text
docs/.vitepress/navigation.ts
```

| 导航 | 路径 | 作用 |
| --- | --- | --- |
| 首页 | `/` | 品牌介绍、四段阅读路径、任务分类和共创入口 |
| 开始阅读 | `/wb-x/` | 小白书总览及 27 章目录 |
| 案例集 | `/cases/` | 社区真实案例及投稿入口 |
| 定制服务 | `/help/` | 说明付费需求诊断与预约状态 |
| 资料 | `/resources/` | 资料整理页 |
| 交流群 | 自定义弹窗 | 展示可定期替换的交流群二维码 |

### 3.2 小白书侧边栏

配置文件：

```text
docs/.vitepress/sidebar.ts
```

侧边栏仅在 `/wb-x/` 路径下显示。`小白书总览`之后紧接`阅读指南`，其页面为
`/wb-x/reading-guide/`；社区、投稿和帮助页面不显示小白书侧边栏。

### 3.3 旧路径兼容现状

仓库中保留了旧 `/bluebook/` 路径的兼容逻辑：

```text
docs/public/_redirects
docs/.vitepress/legacy-routes.ts
```

其中 `legacy-routes.ts` 只在 Vite 开发服务器中生效；GitHub Pages 不支持
`_redirects` 规则。2026-07-31 实测
`https://wbwbx.sparkx.zone/bluebook/` 返回 404，因此公网旧路径目前并未真正兼容。

## 4. 首页内容盘点

首页内容组件：

```text
docs/.vitepress/theme/HomePage.vue
docs/.vitepress/theme/home.css
```

首页包含以下模块：

### 4.1 主视觉

- 像素风品牌主视觉。
- 主标题：`WorkBuddy小白书`。
- 文案重点：从 0 到 1 用起来，再从 1 到 100 沉淀为可复用工作系统。
- 主要按钮：开始阅读。
- 次要按钮：查看阅读路线。
- `WB-X` 品牌短标。
- 5 个可点击像素图标：
  - Part 1 使用手册。
  - 阅读指南。
  - Part 2 案例篇。
  - Part 3 进阶篇。
  - Part 4 岗位与行业篇。
- 规模信息：27 Chapters、4 Parts、∞ Workflows。

合作伙伴翻页、遮罩和贴纸面板已经取消。合作伙伴数据和 Logo 暂时保留在仓库中，但首页不导入、不展示：

```text
docs/.vitepress/theme/heroPartners.ts
docs/public/brand/partners/
```

### 4.2 四项价值

- 场景实战 / REAL-WORLD TASKS
- 技能叠加 / SKILL STACKING
- 社区共创 / COMMUNITY-BUILT
- 系统沉淀 / SYSTEM BUILDING

### 4.3 四段阅读路径

| 路径 | 对应章节 | 目标 |
| --- | --- | --- |
| Part 1 | 第 1～10 章 | 从 0 到 1，把 WorkBuddy 用起来 |
| Part 2 | 第 11～21 章 | 进入真实案例，让任务开始流动 |
| Part 3 | 第 22～25 章 | 把案例变成可复用工作系统 |
| Part 4 | 第 26～27 章 | 落到岗位与行业，组建 AI 团队 |

### 4.4 任务分类

- 办公文档
- 文件与远程
- 资讯与知识
- 专业分析
- 内容生产
- AI 工作系统

每个分类直接链接到代表性章节。

### 4.5 工作系统路径

首页用四步表达内容方法：

1. TASK：完成一个真实任务。
2. CASE：复盘成可复现案例。
3. WORKFLOW：沉淀 Skill 与自动化。
4. AI TEAM：组合成协作团队。

### 4.6 共创入口与页脚

- 参与共创。
- 前往 GitHub。
- 社区实战读本说明。
- HackerNoon Pixel Icons 署名。
- WorkBuddy WB-X Contributors 版权信息。

## 5. 小白书完整目录

内容根目录：

```text
docs/wb-x/
```

总览页：

```text
docs/wb-x/index.md
```

### 5.1 第一篇：使用手册

目录：

```text
docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/
```

| 编号 | 内容 |
| --- | --- |
| 导读 | 第一篇 使用手册：先把 WorkBuddy 用起来 |
| 第 1 章 | 初识 WorkBuddy |
| 第 2 章 | WorkBuddy 的下载、安装、登录与更新 |
| 第 3 章 | WorkBuddy 的主界面、任务与工作区 |
| 第 4 章 | 快速完成第一个 WorkBuddy 任务 |
| 第 5 章 | WorkBuddy 加载一个真正用得上的 Skill |
| 第 6 章 | WorkBuddy 的专家和专家团 |
| 第 7 章 | WorkBuddy 使用连接器 |
| 第 8 章 | WorkBuddy 接入小程序与 IM 助理 |
| 第 9 章 | 如何接入外部 API |
| 第 10 章 | WorkBuddy 自动化任务 |
| 课外阅读 | 一章看懂 AI 工作系统 |

内容目标：解决下载安装、界面认识、第一个任务、Skill、专家团、连接器、IM、API 和自动化等入门问题。

### 5.2 第二篇：实战案例

目录：

```text
docs/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/
```

| 编号 | 内容 |
| --- | --- |
| 导读 | 第二篇 案例篇：从一项任务到一支 AI 团队 |
| 第 11 章 | 办公三件套：Word、Excel、PPT |
| 第 12 章 | 从整理桌面文件这些小事做起 |
| 第 13 章 | 远程控制你的电脑，不用发愁不在电脑前 |
| 第 14 章 | 生活助手的价值，是减少琐碎 |
| 第 15 章 | 资讯整合：把信息流变成每日通知 |
| 第 16 章 | 收藏不是知识管理，能再次用起来才是 |
| 第 17 章 | 会议结束不是终点，工作才刚刚开始 |
| 第 18 章 | 把投资分析变成你的日常 |
| 第 19 章 | 一句话召唤 AI 视频团队 |
| 第 20 章 | 自媒体不只是靠努力，而是一条增长闭环 |
| 第 21 章 | WorkBuddy 也能做 GEO 专家 |

内容目标：从办公、文件、远程、资讯、知识、会议、投资、视频、自媒体和 GEO 等真实任务进入。

### 5.3 第三篇：进阶系统

目录：

```text
docs/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/
```

| 编号 | 内容 |
| --- | --- |
| 导读 | 第三篇 进阶篇：把案例变成自己的工作系统 |
| 第 22 章 | 打造 Skill：将书和视频蒸馏为可执行 Skill |
| 第 23 章 | 其他用法补充：WorkBuddy 实操案例集 |
| 第 24 章 | 如何进行多 Agent 系统设计 |
| 第 25 章 | 自动化工作流的可靠性 |

内容目标：将单次任务整理为 Skill、Agent 团队和可靠自动化。

### 5.4 第四篇：岗位与行业落地

目录：

```text
docs/wb-x/第四篇 岗位与行业落地/
```

| 编号 | 内容 |
| --- | --- |
| 导读 | 第四篇 岗位与行业落地 |
| 第 26 章 | 岗位路线图：不同岗位如何把 WorkBuddy 用深 |
| 第 27 章 | 行业路线图：从通用能力到行业工作流 |

内容目标：把通用能力映射到岗位、团队和行业。

### 5.5 附录

目录：

```text
docs/wb-x/附录/
```

| 编号 | 内容 |
| --- | --- |
| 附录 A | 常用指令模板 |
| 附录 B | 场景速查表 |

## 6. 社区案例盘点

案例目录：

```text
docs/cases/submissions/
```

案例首页：

```text
docs/cases/index.md
```

| 案例 | 作者 | 分类 | 难度 | 主要能力 |
| --- | --- | --- | --- | --- |
| 自动整理每日 AI 资讯 | WorkBuddy WB-X 编辑组 | 资讯整合 | 入门 | AIHot |
| 生成一页好看的简历 | KevinYoung-Kw | 职场效率 | 入门 | Vibe Resume Skill |
| 公众号一键排版并发布草稿 | nikola | 内容创作 | 入门 | wechat-publisher |
| ima + WorkBuddy 构建知识体系 | nikola | 知识管理 | 进阶 | ima 知识库连接器 |
| GSAP 粒子球体作品集网站 | JZCreative | 创意开发 | 进阶 | 本地文件、HTTP 服务、GitHub Pages |
| 清洗 119 份 Excel 并生成看板 | stephenlzc | 数据分析 | 中等 | xlsx |
| 十年年报深度研究 | stephenlzc | 数据分析 | 进阶 | 浏览器、本地文件、Python、Agent Swarm |

Case 标准字段：

```yaml
title:
date:
productTag:
category:
outcome:
cover:
coverAlt:
```

Case 正文应覆盖：

- 场景描述。
- 任务目标。
- 使用的 Skill。
- 前置条件。
- WorkBuddy 操作过程。
- 提示词或任务指令。
- 结果证明。
- 验收标准。
- 遇到的问题。
- 安全与限制。
- 可复用方式。

## 7. 支持、投稿与共创内容

| 页面 | 文件 | 作用 |
| --- | --- | --- |
| 阅读与学习指南 | `docs/wb-x/reading-guide/index.md` | 小白书侧边栏中紧随总览，为新手、任务实践者和团队负责人提供阅读路线 |
| 定制服务 | `docs/help/index.md` | 说明付费需求诊断与预约状态 |
| 参与共创 | `docs/community/contributing.md` | 说明可贡献的内容和联系方式 |
| Case 投稿指南 | `docs/community/case-contributing.md` | 定义社区案例结构、字段和审核标准 |

当前联系方式：

- 王翊旭 Quadr-X。
- 学铃.Celine。
- 顶部“交流群”使用可替换二维码。

## 8. 品牌、二维码与公共素材

### 8.1 品牌素材

| 素材 | 文件 |
| --- | --- |
| 主 Logo | `docs/public/brand/wb-x-logo.svg` |
| 社交分享图 | `docs/public/og/workbuddy-wb-x-guide.png` |
| 星火集 Logo | `docs/public/brand/partners/sparkx.svg` |
| WorkBuddy Logo | `docs/public/brand/partners/workbuddy.svg` |
| Z.ai Logo | `docs/public/brand/partners/z-ai.svg` |

合作伙伴 Logo 当前不在首页展示，但保留作未来推荐、收藏或合作入口素材。

当前 VitePress 配置没有显式声明 favicon。若补充 favicon，建议将文件放入
`docs/public/brand/`，并在 `docs/.vitepress/config.mts` 的 `head` 中增加
`rel="icon"`。

### 8.2 二维码

| 用途 | 文件 |
| --- | --- |
| 顶部交流群 | `docs/public/community/wechat-group.png` |
| 共创联系人 1 | `docs/public/article-assets/source-calibration/community/001.jpg` |
| 共创联系人 2 | `docs/public/article-assets/replacements/community/002.jpg` |
| 案例投稿问卷 | `docs/public/article-assets/source-calibration/help/001.png` |

顶部交流群二维码过期后，覆盖 `docs/public/community/wechat-group.png`，保持文件名不变即可。替换后应重新构建并用手机实际扫码。

### 8.3 文章图片

图片主要位于：

```text
docs/public/article-assets/source-calibration/
docs/public/article-assets/replacements/
```

图片清单：

```text
article-image-replacement-manifest.csv
docs/.vitepress/image-manifest.generated.json
```

清单当前有 270 条记录，其中：

- `awaiting-replacement`：269 条。
- `replaced`：1 条。

仓库中已经存在 36 个 replacement 文件，说明“文件实际替换情况”和“清单状态”尚未完全同步。后续图片更新应同时检查文件和清单状态。

## 9. SEO、搜索与分享

配置入口：

```text
docs/.vitepress/brand.ts
docs/.vitepress/config.mts
```

当前已配置：

- 中文站点语言。
- SEO 标题、描述和关键词。
- 每页 canonical URL。
- Open Graph 标题、描述和 1280×720 分享图。
- Twitter Card。
- 本地全文搜索。
- GitHub 编辑链接。
- 页面最后更新时间。
- GitHub 社交链接。

## 10. 日常更新操作手册

### 10.1 更新品牌名称、域名、仓库或 SEO

修改：

```text
docs/.vitepress/brand.ts
```

修改域名时还应检查：

- GitHub Pages Custom domain。
- DNS CNAME。
- OG 图片绝对地址。
- canonical 地址。

### 10.2 更新顶部导航

修改：

```text
docs/.vitepress/navigation.ts
tests/navigation.test.ts
```

### 10.3 更新小白书目录

新增、删除或改名章节时同时修改：

```text
docs/wb-x/
docs/.vitepress/sidebar.ts
```

改名会改变 URL，应补充兼容跳转，避免已有链接失效。

### 10.4 更新首页文案、按钮和卡片

修改：

```text
docs/.vitepress/theme/HomePage.vue
docs/.vitepress/theme/home.css
tests/home-hero-icons.test.ts
```

### 10.5 更新正文

每一章位于：

```text
docs/wb-x/<篇名>/<章节名>/index.md
```

更新产品事实时建议记录：

- 核对日期。
- WorkBuddy 版本或界面版本。
- 事实来源。
- 截图是否仍与界面一致。
- 操作所需权限。
- 失败与回退方式。

### 10.6 新增社区 Case

1. 在 `docs/cases/submissions/` 下创建英文小写目录。
2. 新建 `index.md`。
3. 添加完整 frontmatter。
4. 将素材放入对应公共素材目录。
5. 写清输入、步骤、输出、验收、安全和复用方式。
6. 执行全部检查。

### 10.7 替换交流群二维码

覆盖：

```text
docs/public/community/wechat-group.png
```

建议上传：

- PNG 或清晰 JPG。
- 正方形。
- 建议不低于 800×800。
- 四周保留二维码白边。
- 上线前分别用微信和手机相机测试。

### 10.8 本地运行

项目使用 pnpm：

```bash
pnpm install
pnpm dev
```

本地预览：

```bash
pnpm run build
pnpm preview
```

### 10.9 发布前检查

```bash
pnpm test
pnpm run check:links
pnpm run check:assets
pnpm run build
```

当前自动部署工作流：

```text
.github/workflows/deploy-pages.yml
```

推送到 `main` 后，GitHub Actions 会：

1. 安装 pnpm 和 Node。
2. 安装依赖。
3. 运行测试。
4. 构建 VitePress。
5. 发布到 GitHub Pages。

部署完成后应检查：

- `https://wbwbx.sparkx.zone/`
- 首页导航与主视觉。
- 任意一篇中文长路径章节。
- 搜索。
- 交流群二维码。
- 手机端是否横向溢出。

## 11. 当前内容缺口与建议

以下是根据当前文件、内容体量、维护链路和用户路径给出的建议。

### P0：先修复维护链路

#### 1. 补齐仓库贡献文件

网站目前仍引用根目录贡献规范，但仓库中不存在：

```text
CONTRIBUTING.md
```

`.github/CASE_TEMPLATE.md` 已补齐并与案例目录校验字段一致。后续建议补齐：

- 根目录 `CONTRIBUTING.md`。
- Case 专用 Pull Request 模板。
- Issue 模板：内容纠错、失效链接、功能建议、案例投稿。

#### 2. 保持文档中的本地命令与脚本同步

共创和投稿页面已经统一使用：

```text
pnpm install
pnpm run build
```

后续调整 `package.json` 脚本时，应同步检查这两个页面。

#### 3. 完成图片替换与状态同步

269 条图片仍标记为 `awaiting-replacement`。这是目前最大的内容资产风险：

- 旧产品界面可能快速过时。
- 原站校准素材不应长期作为最终品牌内容。
- replacement 文件与清单状态不一致。

建议按“第一篇入门 → 首页和支持页 → 热门案例 → 第二篇 → 第三、四篇”的顺序替换。

#### 4. 补齐公网旧路径兼容

旧 `/bluebook/` 仅在本地开发服务器中重写，公网 GitHub Pages 当前返回 404。
如果旧链接已经被分享或被搜索引擎收录，应生成对应的静态兼容页面，在页面中：

- 保留旧路径。
- 使用 canonical 指向 `/wb-x/` 新路径。
- 自动跳转并提供可点击的新地址。

不能只依赖 `docs/public/_redirects`，因为 GitHub Pages 不读取该规则。

### P1：增强核心内容

#### 5. 补强明显偏短的章节

以下章节相对全书明显偏短，建议优先扩写：

- 第 9 章：外部 API。
- 第 12 章：桌面文件整理。
- 第 26 章：岗位路线图。
- 第 27 章：行业路线图。
- 附录 A：常用指令模板。

建议统一补充：

- 适用人群。
- 前置条件和权限。
- 完整操作步骤。
- 示例输入与交付物。
- 验收清单。
- 常见失败和回退。
- 安全边界。

#### 6. 为岗位与行业篇增加实操证据

第 26、27 章目前更接近路线图，缺少可直接照做的岗位包和行业包。建议至少增加：

- 产品、运营、销售、研究、行政、人力等岗位模板。
- 零售、内容、金融研究、专业服务等行业模板。
- 每个模板对应的输入、Skill、流程、输出、验收和风险。
- 可下载或复制的任务指令。

#### 7. 增加“版本与更新日志”

WorkBuddy 界面和能力会持续变化，但网站目前没有公开的内容版本页。建议新增：

- 网站内容版本。
- 最近更新章节。
- 产品界面变更影响。
- 已知过时截图。
- 下次计划更新。

### P2：改善发现和反馈

#### 8. 增加案例筛选与标签入口

案例已经有 category、difficulty、skills 和 tags，但当前缺少明显的筛选体验。建议增加：

- 按场景分类。
- 按难度。
- 按 Skill。
- 按岗位或行业。
- “新手可复现”标记。

#### 9. 增加页面级反馈

每篇内容底部可以增加：

- 这篇内容是否有帮助。
- 哪一步无法复现。
- 截图是否过时。
- 提交纠错 Issue。

这样可以把内容维护从“编辑主动巡检”变成“读者反馈驱动”。

#### 10. 增加内容效果统计

目前没有发现站点分析配置。建议使用尊重隐私的轻量统计，关注：

- 首页到开始阅读的点击率。
- 搜索关键词。
- 阅读最多和退出最多的章节。
- 案例详情访问。
- 提需求和共创入口点击。
- 404 路径。

不要收集二维码内容、问卷隐私或个人敏感信息。

### P3：长期内容建设

#### 11. 建立术语表与安全清单

建议新增：

- WorkBuddy、Task、Skill、Agent、Connector、MCP、API、Workspace 等术语表。
- 文件修改、账号登录、密钥、外部发布、远程控制等风险清单。
- “必须人工确认”的操作清单。

#### 12. 增加可复制资源中心

把分散在正文中的高价值内容集中索引：

- 提示词模板。
- Skill 模板。
- Case 模板。
- 验收清单。
- 团队 SOP。
- 岗位和行业工作流。

#### 13. 增加作者与贡献者页面

当前有作者字段和二维码，但缺少统一的贡献者说明。可以增加：

- 贡献者列表。
- 贡献过的 Case 或章节。
- 审核和署名规则。
- 联系与隐私边界。

## 12. 推荐的下一轮更新顺序

建议按以下顺序推进：

1. 补齐 `CONTRIBUTING.md` 和 PR/Issue 模板。
2. 保持贡献页面中的 pnpm/build 命令与 `package.json` 同步。
3. 为公网生成 `/bluebook/` 静态兼容页。
4. 建立图片替换进度表，先处理第一篇和支持页。
5. 扩写第 9、12、26、27 章与附录 A。
6. 增加更新日志和过时内容标记。
7. 增加案例筛选、页面反馈和轻量统计。
8. 建立模板资源中心、术语表和贡献者页面。

## 13. 本文件维护规则

出现以下变化时更新本文件：

- 品牌、域名、仓库或二维码变化。
- 导航或页面结构变化。
- 新增、删除或改名章节。
- 新增社区 Case。
- 图片替换状态显著变化。
- 部署流程变化。
- 完成某项内容缺口。

每次更新时修改顶部“盘点日期”和“盘点基线”，并在提交说明中注明：

```text
docs: update content inventory
```
