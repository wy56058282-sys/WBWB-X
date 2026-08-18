import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const localImport = /^\s*@import\s+['"]([^'"]+)['"]\s*;\s*$/gm

export function readThemeStyle(entryPath: string) {
  const absoluteEntry = resolve(entryPath)
  const entry = readFileSync(absoluteEntry, 'utf8')
  const imports = [...entry.matchAll(localImport)].map((match) => match[1])
  if (imports.length === 0) return entry

  const nonImportSource = entry.replace(localImport, '').trim()
  if (nonImportSource !== '') {
    throw new Error(`Theme style entry mixes imports and declarations: ${entryPath}`)
  }

  return imports
    .map((reference) => readFileSync(resolve(dirname(absoluteEntry), reference), 'utf8'))
    .join('')
}

export function readHomeStyle() {
  return readThemeStyle('docs/.vitepress/theme/home.css')
}
