const firstPart = '/bluebook/第一篇 使用手册：先把 WorkBuddy 用起来/'
const secondPart = '/bluebook/第二篇 案例篇：从一项任务到一支 AI 团队/'
const thirdPart = '/bluebook/第三篇 进阶篇：把案例变成自己的工作系统/'
const fourthPart = '/bluebook/第四篇 岗位与行业落地/'
const appendix = '/bluebook/附录/'

export const sidebar = [
  { text: '蓝皮书总览', link: '/bluebook/' },
  {
    text: '第一篇 · 使用手册',
    items: [
      { text: '本篇导读', link: firstPart },
      { text: '第 1 章 初识 WorkBuddy', link: `${firstPart}第 1 章 初识 WorkBuddy/` },
      {
        text: '第 2 章 WorkBuddy的下载、安装、登录与更新',
        link: `${firstPart}第 2 章 WorkBuddy的下载、安装、登录与更新/`,
      },
      {
        text: '第 3 章 WorkBuddy 的主界面、任务与工作区',
        link: `${firstPart}第 3 章 WorkBuddy 的主界面、任务与工作区/`,
      },
      {
        text: '第 4 章 快速完成第一个 WorkBuddy 任务',
        link: `${firstPart}第 4 章 快速完成第一个 WorkBuddy 任务/`,
      },
      {
        text: '第 5 章 WorkBuddy加载一个真正用得上的 Skill',
        link: `${firstPart}第 5 章 WorkBuddy加载一个真正用得上的 Skill/`,
      },
      {
        text: '第 6 章 WorkBuddy的专家和专家团',
        link: `${firstPart}第 6 章 WorkBuddy的专家和专家团/`,
      },
      { text: '第 7 章 WorkBuddy 使用连接器', link: `${firstPart}第 7 章 WorkBuddy 使用连接器/` },
      {
        text: '第 8 章 WorkBuddy 接入小程序与 IM 助理',
        link: `${firstPart}第 8 章 WorkBuddy 接入小程序与 IM 助理/`,
      },
      { text: '第 9 章 如何接入外部 API', link: `${firstPart}第 9 章 如何接入外部 API/` },
      { text: '第 10 章 WorkBuddy 自动化任务', link: `${firstPart}第 10 章 WorkBuddy 自动化任务/` },
      { text: '课外阅读：一章看懂 AI 工作系统', link: `${firstPart}课外阅读：一章看懂 AI 工作系统/` },
    ],
  },
  {
    text: '第二篇 · 实战案例',
    items: [
      { text: '本篇导读', link: secondPart },
      { text: '第 11 章 办公三件套：Word、Excel、PPT', link: `${secondPart}第 11 章 办公三件套：Word、Excel、PPT/` },
      { text: '第 12 章 从整理桌面文件这些小事做起', link: `${secondPart}第 12 章 从整理桌面文件这些小事做起/` },
      { text: '第 13 章 远程控制你的电脑，不用发愁不在电脑前', link: `${secondPart}第 13 章 远程控制你的电脑，不用发愁不在电脑前/` },
      { text: '第 14 章 生活助手的价值，是减少琐碎', link: `${secondPart}第 14 章 生活助手的价值，是减少琐碎/` },
      { text: '第 15 章 资讯整合：把信息流变成每日通知', link: `${secondPart}第 15 章 资讯整合：把信息流变成每日通知/` },
      { text: '第 16 章 收藏不是知识管理，能再次用起来才是', link: `${secondPart}第 16 章 收藏不是知识管理，能再次用起来才是/` },
      { text: '第 17 章 会议结束不是终点，工作才刚刚开始', link: `${secondPart}第 17 章 会议结束不是终点，工作才刚刚开始/` },
      { text: '第 18 章 把投资分析变成你的日常', link: `${secondPart}第 18 章 把投资分析变成你的日常/` },
      { text: '第 19 章 一句话召唤 AI 视频团队', link: `${secondPart}第 19 章 一句话召唤 AI 视频团队/` },
      { text: '第 20 章 自媒体不只是靠努力，而是一条增长闭环', link: `${secondPart}第 20 章 自媒体不只是靠努力，而是一条增长闭环/` },
      { text: '第 21 章 WorkBuddy也能做GEO专家', link: `${secondPart}第 21 章 WorkBuddy也能做GEO专家/` },
    ],
  },
  {
    text: '第三篇 · 进阶系统',
    items: [
      { text: '本篇导读', link: thirdPart },
      { text: '第 22 章 打造skill：将书和视频蒸馏为可执行 Skill', link: `${thirdPart}第 22 章 打造skill：将书和视频蒸馏为可执行 Skill/` },
      { text: '第 23 章 其他用法补充：WorkBuddy 实操案例集', link: `${thirdPart}第 23 章 其他用法补充：WorkBuddy 实操案例集/` },
      { text: '第 24 章 如何进行多 Agent 系统设计', link: `${thirdPart}第 24 章 如何进行多 Agent 系统设计/` },
      { text: '第 25 章 自动化工作流的可靠性', link: `${thirdPart}第 25 章 自动化工作流的可靠性/` },
    ],
  },
  {
    text: '第四篇 · 岗位与行业',
    items: [
      { text: '本篇导读', link: fourthPart },
      { text: '第 26 章 岗位路线图：不同岗位如何把 WorkBuddy 用深', link: `${fourthPart}第 26 章 岗位路线图：不同岗位如何把 WorkBuddy 用深/` },
      { text: '第 27 章 行业路线图：从通用能力到行业工作流', link: `${fourthPart}第 27 章 行业路线图：从通用能力到行业工作流/` },
    ],
  },
  {
    text: '附录',
    items: [
      { text: '附录导读', link: appendix },
      { text: '附录 A 常用指令模板', link: `${appendix}附录 A 常用指令模板/` },
      { text: '附录 B 场景速查表', link: `${appendix}附录 B 场景速查表/` },
    ],
  },
] as const
