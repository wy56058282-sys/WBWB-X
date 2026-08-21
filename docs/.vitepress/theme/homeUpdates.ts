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
    date: '2026-08-10',
    title: '第二篇案例目录已校正，11—21 章阅读路线更清晰',
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/',
  },
  {
    date: '2026-08-10',
    title: '旧版小白书链接已恢复，可自动前往新版对应页面',
    href: '/wb-x/',
  },
  {
    date: '2026-08-10',
    title: '站内内容完成清理，搜索结果与公开页面更加准确',
    href: '/wb-x/',
  },
] as const satisfies readonly HomeUpdate[]
