import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { readThemeStyle } from './helpers/read-theme-style'

const fixtures: string[] = []

afterEach(() => {
  while (fixtures.length > 0) rmSync(fixtures.pop()!, { recursive: true })
})

describe('theme style reader', () => {
  it('returns a plain stylesheet unchanged', () => {
    const root = mkdtempSync(join(tmpdir(), 'workbuddy-style-'))
    fixtures.push(root)
    const entry = join(root, 'plain.css')
    writeFileSync(entry, '.plain { color: black; }\n')
    expect(readThemeStyle(entry)).toBe('.plain { color: black; }\n')
  })

  it('concatenates local imports in entry order', () => {
    const root = mkdtempSync(join(tmpdir(), 'workbuddy-style-'))
    fixtures.push(root)
    const entry = join(root, 'entry.css')
    const first = join(root, 'parts', 'first.css')
    const second = join(root, 'parts', 'second.css')
    mkdirSync(dirname(first), { recursive: true })
    writeFileSync(first, '.first { order: 1; }\n')
    writeFileSync(second, '.second { order: 2; }\n')
    writeFileSync(
      entry,
      "@import './parts/first.css';\n@import './parts/second.css';\n",
    )
    expect(readThemeStyle(entry)).toBe(
      '.first { order: 1; }\n.second { order: 2; }\n',
    )
  })
})
