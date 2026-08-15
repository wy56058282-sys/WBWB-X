import { realpathSync, statSync } from 'node:fs'
import { extname, isAbsolute, relative, resolve, sep } from 'node:path'
import { normalizeLocalPath, type CaseCatalogItem } from './case-catalog'
import {
  normalizeLocalArticleAssetPath,
  type ServiceChannelConfig,
} from './service-config'

const qrImageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp'])

function assertRegularFileBelow(
  assetPath: string,
  publicRoot: string,
  allowedRoot: string,
  label: string,
) {
  try {
    const realAllowedRoot = realpathSync(allowedRoot)
    const realAsset = realpathSync(resolve(publicRoot, `.${assetPath}`))
    const relativeAsset = relative(realAllowedRoot, realAsset)

    if (
      relativeAsset === '..'
      || relativeAsset.startsWith(`..${sep}`)
      || isAbsolute(relativeAsset)
      || !statSync(realAsset).isFile()
    ) {
      throw new Error('outside allowed root or not a regular file')
    }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(`${label} must resolve to an existing regular file below ${allowedRoot}: ${reason}`)
  }
}

export function assertServiceChannelAssets(config: ServiceChannelConfig, publicRoot: string) {
  const configuredQrAssets = [
    { path: config.businessWechatQrPath, label: 'business WeChat QR' },
    { path: config.enterpriseChannelQrPath, label: 'enterprise channel QR' },
  ]

  for (const { path, label } of configuredQrAssets) {
    if (!path) continue

    const qrPath = normalizeLocalArticleAssetPath(path)
    if (!qrPath || !qrImageExtensions.has(extname(qrPath).toLowerCase())) {
      throw new Error(`${label} must use a local .png, .jpg, .jpeg, or .webp file`)
    }

    assertRegularFileBelow(
      qrPath,
      publicRoot,
      resolve(publicRoot, 'article-assets'),
      label,
    )
  }
}

export function assertCaseCatalogCovers(
  catalog: readonly CaseCatalogItem[],
  publicRoot: string,
) {
  for (const item of catalog) {
    const cover = normalizeLocalPath(item.cover)
    if (!cover || !/^\/(?:article-assets|brand)\//.test(cover)) {
      throw new Error(`case cover is invalid for ${item.route}: ${item.cover}`)
    }
    assertRegularFileBelow(cover, publicRoot, publicRoot, `case cover for ${item.route}`)
  }
}
