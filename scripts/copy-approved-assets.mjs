import { copyFile, mkdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const brandConfig = await readFile('docs/.vitepress/brand.ts', 'utf8')

function publicAssetPath(key) {
  const match = brandConfig.match(new RegExp(`${key}:\\s*'(/[^']+)'`))
  if (!match) throw new Error(`Could not read ${key} from brand configuration.`)
  return `docs/public${match[1]}`
}

const logoPath = publicAssetPath('logoPath')
const qrPath = publicAssetPath('qrPath')

await mkdir(dirname(logoPath), { recursive: true })
await mkdir(dirname(qrPath), { recursive: true })
await copyFile('WB-X LOGO.svg', logoPath)
await copyFile('二维码.png', qrPath)
