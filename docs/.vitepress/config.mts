import { resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { brand } from './brand'
import { assertServiceChannelAssets } from './build-data-boundaries'
import { discoverCaseSidebar } from './case-sidebar'
import { legacyRouteRedirectPlugin } from './legacy-routes'
import { nav } from './navigation'
import { serviceConfig } from './service-config'
import { sidebar } from './sidebar'

assertServiceChannelAssets(serviceConfig, resolve('docs/public'))
const casesSidebar = discoverCaseSidebar(resolve('docs/cases/submissions'))
const umamiWebsiteId = process.env.VITE_WBX_UMAMI_WEBSITE_ID?.trim()
const umamiShareUrl = process.env.VITE_WBX_UMAMI_SHARE_URL?.trim()
const umamiCollectionStartedAt = process.env.VITE_WBX_UMAMI_COLLECTION_STARTED_AT?.trim()
const umamiTrackingEnabled = Boolean(umamiWebsiteId && umamiShareUrl && umamiCollectionStartedAt)
const BAIDU_ANALYTICS_URL = 'https://hm.baidu.com/hm.js?7a23a8966a0536ac9ba595d6a0544f07'
const workshopBuildTime = new Date().toISOString()

function canonicalPath(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, '/')

  if (normalized === 'index.md') return '/'
  if (normalized.endsWith('/index.md')) return `/${normalized.slice(0, -'index.md'.length)}`
  return `/${normalized.replace(/\.md$/, '')}`
}

export default withMermaid(defineConfig({
  base: process.env.SITE_BASE ?? '/',
  srcExclude: ['superpowers/**', 'maintenance/**'],
  vite: {
    define: {
      __WBX_WORKSHOP_BUILD_TIME__: JSON.stringify(workshopBuildTime),
    },
    plugins: [legacyRouteRedirectPlugin()],
    server: {
      allowedHosts: process.env.WB_PREVIEW_HOST ? [process.env.WB_PREVIEW_HOST] : [],
    },
  },
  lang: 'zh-CN',
  title: brand.seo.title,
  description: brand.seo.description,
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['script', { src: BAIDU_ANALYTICS_URL, async: '' }],
    ['meta', { name: 'author', content: brand.author }],
    ['meta', { name: 'keywords', content: brand.seo.keywords }],
    ['meta', { property: 'og:title', content: brand.seo.title }],
    ['meta', { property: 'og:description', content: brand.seo.description }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: `${brand.origin}${brand.ogImagePath}` }],
    ['meta', { property: 'og:image:width', content: '1280' }],
    ['meta', { property: 'og:image:height', content: '720' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: brand.seo.title }],
    ['meta', { name: 'twitter:description', content: brand.seo.description }],
    ['meta', { name: 'twitter:image', content: `${brand.origin}${brand.ogImagePath}` }],
    ...(umamiTrackingEnabled
      ? [[
          'script',
          {
            defer: '',
            src: 'https://cloud.umami.is/analytics/eu/script.js',
            'data-website-id': umamiWebsiteId,
          },
        ] as [string, Record<string, string>]]
      : []),
  ],
  transformHead({ pageData }) {
    return [
      [
        'link',
        {
          rel: 'canonical',
          href: `${brand.origin}${canonicalPath(pageData.relativePath)}`,
        },
      ],
    ]
  },
  themeConfig: {
    outlineTitle: '本页目录',
    logo: brand.logoPath,
    siteTitle: brand.siteName,
    nav: nav.map((item) => ({ ...item })),
    sidebar: {
      '/wb-x/': [...sidebar],
      '/cases/': casesSidebar,
      '/community/case-contributing': casesSidebar,
    },
    search: {
      provider: 'local',
    },
    footer: {
      message:
        '以真实场景为主线的 WB-X 实战读本 · <a href="https://hackernoon.com/pixel-icon-library" target="_blank" rel="noopener noreferrer">Pixel icons by HackerNoon</a>',
      copyright: 'Copyright © 2026 安徽象限跃迁人工智能科技有限公司',
    },
    socialLinks: [
      {
        icon: {
          svg: '<svg width="20" height="20" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M247.589 175.192C247.588 215.177 215.174 247.59 175.189 247.59H69.0037V310.333C202.286 310.333 310.334 202.286 310.334 69.0034H247.589V175.192Z" fill="currentColor"/><rect width="55.5059" height="130.318" rx="9.6532" transform="matrix(-0.707107 0.707107 0.707107 0.707107 155.822 119.266)" fill="currentColor"/><path d="M252.415 324.815C252.415 284.83 284.83 252.416 324.815 252.416H430.999V189.666C297.717 189.666 189.67 297.713 189.67 430.996H252.415L252.415 324.815Z" fill="currentColor"/><rect width="55.5059" height="130.318" rx="9.6532" transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 343.844 380.395)" fill="currentColor"/></svg>'
        },
        link: 'https://www.sparkx.zone',
        ariaLabel: '星火集'
      }
    ],
  },
}))
