---
title: 提交 WorkBuddy WB-X 案例
description: 通过问卷提交真实、可复现的 WorkBuddy Case，无需 GitHub；熟悉开发流程的贡献者也可选择提交 PR。
breadcrumbTitle: Case 投稿指南
aside: false
outline: false
---

# 提交 WorkBuddy WB-X 案例

社区案例集用于收录大家已经在 WorkBuddy 中实际跑通过的任务。填写问卷即可投稿，无需 GitHub。审核通过后，维护者会协助整理并发布；经过进一步复现和编辑的经典任务，未来可能进入白皮书正文。

## 一个合格的 Case 必须回答什么

1. **场景是什么**：谁在什么情况下遇到了什么问题。
2. **使用了哪些 Skills**：每个 Skill 的用途、来源和所需权限。
3. **在 WorkBuddy 中怎样执行**：输入、关键步骤和任务指令。
4. **最终呈现了什么效果**：交付物、截图、GIF 或其他结果证明。
5. **怎样判断任务完成**：明确且可以复查的验收标准。

::: warning 提交前先检查是否重复
请先搜索[社区案例集](/cases/)和[白皮书目录](/wb-x/)，确认场景或任务是否已经存在。相同目标、相同流程或仅更换输入数据的内容，建议补充现有案例；如果新 Case 使用了明显不同的 Skill、方法或交付方式，请在问卷中说明差异。
:::

## 默认方式：填写问卷

1. 搜索案例集和白皮书，确认任务没有重复。
2. 前往[案例集投稿区](/cases/#submit-case)，打开需求与案例投稿问卷二维码。
3. 在场景描述开头注明“【案例投稿】”。
4. 写清场景、使用的 Skills、操作过程、实际效果、验收标准和可公开范围。
5. 留下联系方式，等待审核或补充信息确认。

我们会协助整理标题、结构和图片，并在发布前确认署名与公开内容。你不需要准备 Markdown、Fork 仓库或运行本地构建。

## 可选方式：通过 GitHub 提交

该方式适合熟悉 GitHub 和 Markdown 的贡献者，可以直接提交结构化内容：

1. Fork [wy56058282-sys/WBWB-X](https://github.com/wy56058282-sys/WBWB-X) 仓库。
2. 复制仓库中的 `.github/CASE_TEMPLATE.md` 案例模板。
3. 新建 `docs/cases/submissions/<case-slug>/index.md` 并添加素材。
4. 本地运行 `pnpm install` 和 `pnpm run build`。
5. 提交 Pull Request，并说明案例场景、可复现步骤和公开范围。

推荐使用简短的英文小写目录名：

```text
docs/cases/submissions/daily-ai-news/
├── index.md
└── assets/
    ├── cover.png
    └── workbuddy-result.png
```

GitHub 投稿者不需要修改案例集合首页。网站构建时会自动读取所有 Case 的标题、日期、产品标签、分类、成果和封面信息。

## Frontmatter 字段

每个 Case 的 `index.md` 必须以这些字段开头：

```yaml
---
title: 用 WorkBuddy 自动整理每日 AI 资讯
productTag: WorkBuddy
date: "2026-07-13"
category: 自动化
outcome: 自动收集多个来源的信息并生成保留来源链接的每日简报。
cover: /article-assets/source-calibration/case-daily-ai-news/001.png
coverAlt: WorkBuddy 生成的每日 AI 资讯热点报告
---
```

其中 `title`、`date`、`productTag`、`category`、`outcome`、`cover` 和 `coverAlt` 是案例目录必填项。`category` 只能是 `数据分析`、`内容创作`、`知识管理` 或 `自动化`；封面必须指向 `docs/public` 下真实存在的本地文件。缺少字段或封面无效时，网站构建会失败，避免不完整的案例被发布。

## 内容结构

正文至少包含：

- 场景描述
- 想要完成的任务
- 使用的 Skill
- 前置条件
- 在 WorkBuddy 中的操作
- 提示词或任务指令
- 在 WorkBuddy 中的效果
- 验收标准
- 遇到的问题
- 安全与限制
- 可以怎样复用

## 图片和结果证明

- 优先提供 WorkBuddy 执行过程和最终交付物的截图。
- 图片使用有意义的英文文件名，避免 `image-1.png`。
- 删除姓名、手机号、账号、内部地址、密钥和其他敏感信息。
- 不要提交无权公开的客户资料、企业数据或版权内容。
- 在保证文字清晰的前提下压缩图片体积。

## 审核与收录

社区案例主要审核真实性、完整性、安全性和可读性，不要求一开始就达到白皮书正式章节的编辑水平。

我们会持续观察案例的可复现性、代表性和读者反馈。进入白皮书正文前，编辑团队会再次验证并与原作者沟通，正式章节会保留作者署名和原始 Case 链接。
