import { resolve } from 'node:path'
import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { brand } from './brand'
import { discoverCaseSidebar } from './case-sidebar'
import { legacyRouteRedirectPlugin } from './legacy-routes'
import { nav } from './navigation'
import { sidebar } from './sidebar'

const casesSidebar = discoverCaseSidebar(resolve('docs/cases/submissions'))

function canonicalPath(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, '/')

  if (normalized === 'index.md') return '/'
  if (normalized.endsWith('/index.md')) return `/${normalized.slice(0, -'index.md'.length)}`
  return `/${normalized.replace(/\.md$/, '')}`
}

export default withMermaid(defineConfig({
  base: process.env.SITE_BASE ?? '/',
  vite: {
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
      copyright: 'Copyright © 2026 WB-X.SparkX',
    },
    socialLinks: [{ icon: 'github', link: brand.repository }],
  },
}))
