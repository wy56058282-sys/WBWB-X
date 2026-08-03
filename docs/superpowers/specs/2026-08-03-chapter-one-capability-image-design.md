# 第一章能力架构图插入设计

## 目标

在《第 1 章 初识 WorkBuddy》的 Mermaid 任务流程图正下方增加用户提供的“WorkBuddy 完整能力架构图”，帮助读者从任务执行流程过渡到完整能力体系。

## 内容与位置

- 新图片紧跟 Mermaid 代码块之后展示。
- 保留后续“例如，用户可以直接告诉 WorkBuddy……”文案及现有销售数据/PPT 截图的位置。
- 不调整本章其他文案、图片和章节结构。

## 素材管理

- 将用户提供的 JPG 复制到 `docs/public/article-assets/source-calibration/ch01/004.jpg`。
- Markdown 使用站点绝对路径 `/article-assets/source-calibration/ch01/004.jpg`，不引用用户下载目录。
- 图片 alt 文本使用“WorkBuddy 完整能力架构图”。

## 展示规则

- 沿用 VitePress 正文图片的默认响应式行为。
- 桌面端在正文内容宽度内完整展示，不增加边框或额外容器。
- 移动端宽度自适应为可用内容宽度，不产生横向滚动。
- 不增加图注、灯箱或点击放大功能。

## 验证

- 回归测试确认第一章 Markdown 在 Mermaid 代码块之后引用新图片及准确 alt 文本。
- 确认素材文件存在且由站点构建收录。
- 运行完整测试和生产构建。
