import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const chapterPath = 'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md'
const chapter = readFileSync(chapterPath, 'utf8')
const downloadSection = chapter.match(/## WorkBuddy下载\n\n([\s\S]*?)\n\n!\[\]\(\/article-assets\/source-calibration\/ch02\/001\.png\)/)?.[1]

describe('chapter 2 download links', () => {
  it('shows both official entries on independent list lines in the approved order', () => {
    expect(downloadSection).toBe([
      '下载 WorkBuddy，请选择以下官方入口：',
      '',
      '- [WorkBuddy 官网](https://www.workbuddy.ai/)',
      '',
      '  ![WorkBuddy 官网首页](/article-assets/source-calibration/ch02/018.png)',
      '',
      '- [CodeBuddy 工作台](https://www.codebuddy.cn/work/)',
      '',
      '进入页面后选择 WorkBuddy，点击“下载 WorkBuddy”即可。',
    ].join('\n'))
  })

  it('removes the former inline download sentence', () => {
    expect(chapter).not.toContain('下载WorkBuddy，点击官方地址（https://www.codebuddy.cn/work/）')
  })
})
