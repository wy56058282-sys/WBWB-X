# WorkBuddy 下载入口排版设计规格

日期：2026-08-02

## 背景

小白书第 2 章当前把 CodeBuddy 下载地址嵌在一段连续正文中，网址与操作说明混排，不利于快速识别。页面还需要增加 WorkBuddy 官网入口 `https://www.workbuddy.ai/`。

## 目标

- 将两个官方下载入口分别放置在独立行中。
- 增加 WorkBuddy 官网链接。
- 保留现有 CodeBuddy 工作台链接。
- 在桌面与移动端都保持清晰、可点击和易于扫描。

## 文案与顺序

“WorkBuddy下载”标题下的原段落替换为：

```markdown
下载 WorkBuddy，请选择以下官方入口：

- [WorkBuddy 官网](https://www.workbuddy.ai/)
- [CodeBuddy 工作台](https://www.codebuddy.cn/work/)

进入页面后选择 WorkBuddy，点击“下载 WorkBuddy”即可。
```

WorkBuddy 官网排在第一位，CodeBuddy 工作台排在第二位。两个地址使用 Markdown 列表，每个链接自然独占一行，不使用 `<br>` 或裸网址。

## 范围

- 仅修改 `docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md` 的下载入口段落。
- 不修改章节标题、截图、后续设备检测说明或其他章节。
- 两个链接均使用 HTTPS，并保持为外部链接。

## 验收标准

- 生成页面显示两个独立列表项：“WorkBuddy 官网”和“CodeBuddy 工作台”。
- 两个链接分别指向 `https://www.workbuddy.ai/` 与 `https://www.codebuddy.cn/work/`。
- 操作说明单独位于列表之后。
- 内容链接检查、现有测试与 VitePress 构建通过。
- 桌面和 390px 移动视口均无网址挤压或横向溢出。
