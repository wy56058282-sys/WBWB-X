import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const config = readFileSync('vitest.config.ts', 'utf8')

describe('Vitest workspace boundaries', () => {
  it('excludes nested worktree and package-store test copies', () => {
    expect(config).toMatch(/exclude:\s*\[[\s\S]*?['"]\*\*\/\.worktrees\/\*\*['"][\s\S]*?['"]\*\*\/\.pnpm-store\/\*\*['"]/)
  })
})
