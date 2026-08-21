export interface HomeUpdate {
  date: string
  title: string
  href: string
}

export const homeUpdates = [
  {
    date: '2026-08-17',
    title: '5.3.14：新增 Markdown AI 编辑快捷键提示，支持 Enter 直接发送、Cmd+Enter 换行',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-13',
    title: '5.3.13：新增灵感「一键做同款」，支持快速套版复刻网页',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-12',
    title: '5.3.12：新增灵感分享口令，可复制口令给他人并直达对应灵感详情',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增对话出错时「检查网络」快捷入口，网络异常可一键跳转诊断',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增企微/微信助理逐字流式输出，回复过程实时可见不再等待完整回复',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增企微/微信助理支持先发文件后补文字描述，一次性发起对话',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增对话流显示每轮运行时间，方便感知任务耗时',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增任务列表批量删除与批量归档操作',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增「我安装的」技能页面本地搜索框，快速定位已安装技能',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增 Teams 项目邀请链接免审直接加入',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增支持修改账户昵称',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增开机自启动设置项',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增个性化设置中「显示文件变更过程详情」开关',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增创意设计场景「设计风格/补图方式」选项',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增技能开关切换后 toast 反馈提示',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增资料库支持 deeplink 直接打开指定文档',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-08-07',
    title: '5.3.11：新增 Python 类连接器运行时支持',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
  {
    date: '2026-07-28',
    title: '5.3.6：新增 WorkBuddy 官网登录跳转能力，支持从 www.workbuddy.cn / staging.workbuddy.cn 无缝拉起桌面端登录',
    href: 'https://www.workbuddy.cn/docs/workbuddy/Changelog',
  },
] as const satisfies readonly HomeUpdate[]
