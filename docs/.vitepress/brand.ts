export interface BrandConfig {
  siteName: string
  contentName: string
  contentShortName: string
  shortMark: string
  accent: `#${string}`
  origin: `https://${string}`
  repository: `https://github.com/${string}`
  author: string
  logoPath: `/${string}`
  qrPath: `/${string}`
  ogImagePath: `/${string}`
  seo: {
    title: string
    description: string
    keywords: string
  }
}

export const brand: BrandConfig = {
  siteName: 'WorkBuddy WB-X',
  contentName: 'WorkBuddy 实战小白书',
  contentShortName: 'WorkBuddy小白书',
  shortMark: 'WBWB-X',
  accent: '#32E6B9',
  origin: 'https://www.wbwb-x.sparkx.zone',
  repository: 'https://github.com/wy56058282-sys/WBWB-X',
  author: 'WorkBuddy WB-X Contributors',
  logoPath: '/brand/wb-x-logo.svg',
  qrPath: '/community/wechat-group.png',
  ogImagePath: '/og/workbuddy-wb-x-guide.png',
  seo: {
    title: 'WorkBuddy 教程与使用指南｜WorkBuddy WB-X 实战小白书',
    description:
      '系统的 WorkBuddy 中文教程与使用指南，涵盖安装入门、真实案例、Skills、连接器、自动化和多智能体实践。',
    keywords:
      'WorkBuddy, WorkBuddy WB-X, WorkBuddy 教程, AI Agent, AI 工作系统, Skills, MCP, 自动化, 多智能体, 职场 AI',
  },
}
