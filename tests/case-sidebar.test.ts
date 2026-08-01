// @vitest-environment node

import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { discoverCaseSidebar } from '../docs/.vitepress/case-sidebar'

const temporaryRoots: string[] = []

function createCasesRoot() {
  const root = mkdtempSync(join(tmpdir(), 'workbuddy-cases-'))
  temporaryRoots.push(root)
  return root
}

function writeCase(root: string, folder: string, contents: string) {
  const caseDirectory = join(root, folder)
  mkdirSync(caseDirectory)
  writeFileSync(join(caseDirectory, 'index.md'), contents)
}

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe('discoverCaseSidebar', () => {
  it('discovers cases in descending date order', () => {
    const root = createCasesRoot()
    writeCase(root, 'older', '---\ntitle: 较早案例\ndate: 2026-07-13\n---\n')
    writeCase(root, 'newer', '---\ntitle: 较新案例\ndate: 2026-07-25\n---\n')

    expect(discoverCaseSidebar(root)).toEqual([
      { text: '案例集首页', link: '/cases/' },
      { text: '如何提交 Case', link: '/community/case-contributing' },
      {
        text: '社区 Case',
        items: [
          { text: '较新案例', link: '/cases/submissions/newer/' },
          { text: '较早案例', link: '/cases/submissions/older/' },
        ],
      },
    ])
  })

  it('rejects a case without a title', () => {
    const root = createCasesRoot()
    writeCase(root, 'older', '---\ndate: 2026-07-13\n---\n')

    expect(() => discoverCaseSidebar(root)).toThrow(/older\/index\.md.*title/)
  })

  it('rejects frontmatter that does not begin at byte zero', () => {
    const root = createCasesRoot()
    writeCase(root, 'older', 'intro\n---\ntitle: 较早案例\ndate: 2026-07-13\n---\n')

    expect(() => discoverCaseSidebar(root)).toThrow(/invalid frontmatter/)
  })
})
