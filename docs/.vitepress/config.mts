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
  srcExclude: ['superpowers/**'],
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
