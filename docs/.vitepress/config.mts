import { defineConfig } from 'vitepress'
import { brand } from './brand'
import { nav } from './navigation'
import { sidebar } from './sidebar'

function canonicalPath(relativePath: string) {
  const normalized = relativePath.replace(/\\/g, '/')

  if (normalized === 'index.md') return '/'
  if (normalized.endsWith('/index.md')) return `/${normalized.slice(0, -'index.md'.length)}`
  return `/${normalized.replace(/\.md$/, '')}`
}

export default defineConfig({
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
    sidebar: [...sidebar],
    search: {
      provider: 'local',
    },
    editLink: {
      pattern: `${brand.repository}/edit/main/docs/:path`,
      text: '在 GitHub 上改进此页',
    },
    footer: {
      message: '以真实任务为主线的 WorkBuddy 社区实战读本',
      copyright: `Copyright © 2026 ${brand.author}`,
    },
    socialLinks: [{ icon: 'github', link: brand.repository }],
  },
})
