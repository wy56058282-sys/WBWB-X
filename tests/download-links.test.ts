import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const chapterPath = 'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md'
const chapter = readFileSync(chapterPath, 'utf8')
const re = new RegExp('## WorkBuddy\u4e0b\u8f7d\\n\\n([\\s\\S]*?)\\n\\n  !\\[\\]\\(/article-assets/source-calibration/ch02/001\\.png\\)')
const downloadSection = chapter.match(re)?.[1]

describe('chapter 2 download links', () => {
  it('shows all official entries on independent list lines in the approved order', () => {
    expect(downloadSection).toBe([
      '\u4e0b\u8f7d WorkBuddy\uff0c\u8bf7\u9009\u62e9\u4ee5\u4e0b\u5b98\u65b9\u5165\u53e3\uff1a',
      '',
      '- [WorkBuddy\u5b98\u7f51\uff5c\u56fd\u9645\u7ad9](https://www.workbuddy.ai/)',
      '',
      '  \u8fdb\u5165\u9875\u9762\u540e\u70b9\u51fb"\u7acb\u5373\u4e0b\u8f7d"\u5373\u53ef\u3002',
      '',
      '  ![WorkBuddy \u5b98\u7f51\u9996\u9875](/article-assets/source-calibration/ch02/018.png)',
      '',
      '- [WorkBuddy \u5b98\u7f51\uff5c\u4e2d\u56fd\u7ad9](https://www.workbuddy.cn/)',
      '',
      '  \u8fdb\u5165\u9875\u9762\u540e\u70b9\u51fb"\u7acb\u5373\u4e0b\u8f7d"\u5373\u53ef\u3002',
      '',
      '  ![WorkBuddy \u4e2d\u56fd\u7ad9\u9996\u9875](/article-assets/source-calibration/ch02/019.png)',
      '',
      '- [CodeBuddy \u5de5\u4f5c\u53f0](https://www.codebuddy.cn/work/)',
      '',
      '  \u8fdb\u5165\u9875\u9762\u540e\u9009\u62e9 WorkBuddy\uff0c\u70b9\u51fb"\u4e0b\u8f7d WorkBuddy"\u5373\u53ef\u3002',
    ].join('\n'))
  })

  it('removes the former inline download sentence', () => {
    expect(chapter).not.toContain('\u4e0b\u8f7dWorkBuddy\uff0c\u70b9\u51fb\u5b98\u65b9\u5730\u5740\uff08https://www.codebuddy.cn/work/\uff09')
  })
})
