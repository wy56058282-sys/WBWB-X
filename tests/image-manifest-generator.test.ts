import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, relative } from 'node:path'
import { spawnSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const repositoryRoot = process.cwd()
const generatorPath = join(repositoryRoot, 'scripts', 'build-image-manifest.mjs')
const sampleImagePath = join(
  repositoryRoot,
  'docs',
  'public',
  'article-assets',
  'source-calibration',
  'ch02',
  '004.png',
)
const csvHeader =
  'id,page,order,purpose,sourceUrl,calibrationPath,replacementPath,sourceWidth,sourceHeight,format,status,notes\n'
const fixtureRoots: string[] = []

interface GeneratorFixture {
  repository: string
  sourceDocs: string
  markdownPaths: string[]
}

function writeFile(path: string, contents: string | Buffer) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, contents)
}

function writeChapter(
  root: string,
  chapter: number,
  imageTarget: string,
) {
  const markdownPath = join(
    root,
    'bluebook',
    '第一篇',
    `第 ${chapter} 章 Demo`,
    'index.md',
  )
  writeFile(markdownPath, `# Chapter ${chapter}\n\n![demo](${imageTarget})\n`)
  return markdownPath
}

function createFixture(options: { missingSecondSource?: boolean } = {}): GeneratorFixture {
  const fixtureRoot = mkdtempSync(join(tmpdir(), 'workbuddy-image-manifest-'))
  fixtureRoots.push(fixtureRoot)
  const repository = join(fixtureRoot, 'repository')
  const sourceDocs = join(fixtureRoot, 'source', 'docs')
  const markdownPaths = [
    writeChapter(join(repository, 'docs'), 1, './assets/demo.png'),
    writeChapter(
      join(repository, 'docs'),
      2,
      options.missingSecondSource ? './assets/missing.png' : './assets/demo.png',
    ),
  ]

  writeChapter(sourceDocs, 1, './assets/demo.png')
  writeChapter(
    sourceDocs,
    2,
    options.missingSecondSource ? './assets/missing.png' : './assets/demo.png',
  )
  cpSync(
    sampleImagePath,
    join(sourceDocs, 'bluebook', '第一篇', '第 1 章 Demo', 'assets', 'demo.png'),
  )
  if (!options.missingSecondSource) {
    cpSync(
      sampleImagePath,
      join(sourceDocs, 'bluebook', '第一篇', '第 2 章 Demo', 'assets', 'demo.png'),
    )
  }

  writeFile(
    join(repository, 'docs', '.vitepress', 'image-manifest.generated.json'),
    '[]\n',
  )
  writeFile(join(repository, 'article-image-replacement-manifest.csv'), csvHeader)

  return { repository, sourceDocs, markdownPaths }
}

function runGenerator(fixture: GeneratorFixture) {
  return spawnSync(process.execPath, [generatorPath], {
    cwd: fixture.repository,
    encoding: 'utf8',
    env: {
      ...process.env,
      WORKBUDDY_SOURCE_DOCS: fixture.sourceDocs,
    },
  })
}

function treeSnapshot(root: string) {
  if (!existsSync(root)) return null
  const snapshot: Record<string, string> = {}

  function visit(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) visit(path)
      else snapshot[relative(root, path)] = readFileSync(path).toString('base64')
    }
  }

  visit(root)
  return snapshot
}

function generatedState(fixture: GeneratorFixture) {
  return {
    markdown: fixture.markdownPaths.map((path) => readFileSync(path, 'utf8')),
    calibration: treeSnapshot(
      join(
        fixture.repository,
        'docs',
        'public',
        'article-assets',
        'source-calibration',
      ),
    ),
    replacements: treeSnapshot(
      join(
        fixture.repository,
        'docs',
        'public',
        'article-assets',
        'replacements',
      ),
    ),
    manifest: readFileSync(
      join(
        fixture.repository,
        'docs',
        '.vitepress',
        'image-manifest.generated.json',
      ),
      'utf8',
    ),
    csv: readFileSync(
      join(fixture.repository, 'article-image-replacement-manifest.csv'),
      'utf8',
    ),
  }
}

function parseCsv(csv: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    if (quoted) {
      if (character === '"' && csv[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"') {
      quoted = true
    } else if (character === ',') {
      row.push(cell)
      cell = ''
    } else if (character === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (character !== '\r') {
      cell += character
    }
  }

  return rows
}

function csvCell(value: string) {
  return /[",\r\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"`
    : value
}

function serializeCsv(rows: string[][]) {
  return `${rows.map((row) => row.map(csvCell).join(',')).join('\n')}\n`
}

afterEach(() => {
  while (fixtureRoots.length > 0) {
    rmSync(fixtureRoots.pop()!, { recursive: true, force: true })
  }
})

describe('image manifest generator transactions', () => {
  it('leaves existing outputs and Markdown unchanged when a source asset is missing', () => {
    const fixture = createFixture({ missingSecondSource: true })
    writeFile(
      join(
        fixture.repository,
        'docs',
        'public',
        'article-assets',
        'source-calibration',
        'sentinel.txt',
      ),
      'existing calibration output',
    )
    const before = generatedState(fixture)

    const result = runGenerator(fixture)

    expect(result.status).not.toBe(0)
    expect(result.stderr).toContain('missing.png')
    expect(generatedState(fixture)).toEqual(before)
    expect(
      readdirSync(fixture.repository).filter((name) =>
        name.startsWith('.image-manifest-staging-'),
      ),
    ).toEqual([])
  })

  it('preserves workflow state and keeps advanced Markdown on replacement paths', () => {
    const fixture = createFixture()
    expect(runGenerator(fixture).status).toBe(0)
    const manifestPath = join(
      fixture.repository,
      'docs',
      '.vitepress',
      'image-manifest.generated.json',
    )
    const csvPath = join(
      fixture.repository,
      'article-image-replacement-manifest.csv',
    )
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    const replacementPath =
      '/article-assets/replacements/ch01/final-approved.png'
    manifest[0].status = 'approved'
    manifest[0].replacementPath = replacementPath
    manifest[1].status = 'replaced'
    const defaultReplacementPath = manifest[1].replacementPath
    writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

    const csv = parseCsv(readFileSync(csvPath, 'utf8'))
    const header = csv[0]
    const record = csv[1]
    record[header.indexOf('notes')] = 'Keep approved crop, with title'
    writeFile(csvPath, serializeCsv(csv))

    const replacementFile = join(
      fixture.repository,
      'docs',
      'public',
      replacementPath,
    )
    writeFile(replacementFile, 'approved replacement bytes')
    const defaultReplacementFile = join(
      fixture.repository,
      'docs',
      'public',
      defaultReplacementPath,
    )
    writeFile(defaultReplacementFile, 'default replacement bytes')

    const result = runGenerator(fixture)

    expect(result.status).toBe(0)
    const regeneratedManifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    expect(regeneratedManifest[0]).toMatchObject({
      id: 'ch01-001',
      status: 'approved',
      replacementPath,
    })
    expect(regeneratedManifest[1]).toMatchObject({
      id: 'ch02-001',
      status: 'replaced',
      replacementPath: defaultReplacementPath,
    })
    const regeneratedCsv = parseCsv(readFileSync(csvPath, 'utf8'))
    const regeneratedHeader = regeneratedCsv[0]
    const regeneratedRecord = regeneratedCsv[1]
    expect(regeneratedRecord[regeneratedHeader.indexOf('status')]).toBe('approved')
    expect(regeneratedRecord[regeneratedHeader.indexOf('replacementPath')]).toBe(
      replacementPath,
    )
    expect(regeneratedRecord[regeneratedHeader.indexOf('notes')]).toBe(
      'Keep approved crop, with title',
    )
    expect(readFileSync(replacementFile, 'utf8')).toBe(
      'approved replacement bytes',
    )
    expect(readFileSync(defaultReplacementFile, 'utf8')).toBe(
      'default replacement bytes',
    )
    expect(readFileSync(fixture.markdownPaths[0], 'utf8')).toContain(
      `![demo](${replacementPath})`,
    )
    expect(readFileSync(fixture.markdownPaths[1], 'utf8')).toContain(
      `![demo](${defaultReplacementPath})`,
    )

    const beforeRerun = generatedState(fixture)
    expect(runGenerator(fixture).status).toBe(0)
    expect(generatedState(fixture)).toEqual(beforeRerun)
  })

  it('rolls back replacement slot scaffolding when a late swap fails', () => {
    const fixture = createFixture()
    expect(runGenerator(fixture).status).toBe(0)
    const manifestPath = join(
      fixture.repository,
      'docs',
      '.vitepress',
      'image-manifest.generated.json',
    )
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
    manifest[0].status = 'approved'
    manifest[0].replacementPath =
      '/article-assets/replacements/ch01/late-swap/final.png'
    writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
    const replacementRoot = join(
      fixture.repository,
      'docs',
      'public',
      'article-assets',
      'replacements',
    )
    const before = treeSnapshot(replacementRoot)
    const vitepressRoot = join(fixture.repository, 'docs', '.vitepress')

    let result
    chmodSync(vitepressRoot, 0o555)
    try {
      result = runGenerator(fixture)
    } finally {
      chmodSync(vitepressRoot, 0o755)
    }

    expect(result.status).not.toBe(0)
    expect(treeSnapshot(replacementRoot)).toEqual(before)
    expect(
      readdirSync(fixture.repository).filter((name) =>
        name.startsWith('.image-manifest-staging-'),
      ),
    ).toEqual([])
  })

  it('produces identical outputs on a successful rerun', () => {
    const fixture = createFixture()
    const first = runGenerator(fixture)
    expect(first.status).toBe(0)
    const before = generatedState(fixture)

    const second = runGenerator(fixture)

    expect(second.status).toBe(0)
    expect(generatedState(fixture)).toEqual(before)
  })
})
