export interface ServiceChannelConfig {
  businessWechatQrPath: string
  applicationFormUrl: string
  enterpriseChannelQrPath: string
}

export interface ServiceConfig extends ServiceChannelConfig {
  freeCaseFormUrl: string
}

export const serviceConfig: ServiceConfig = {
  freeCaseFormUrl: '',
  businessWechatQrPath: '',
  applicationFormUrl: '',
  enterpriseChannelQrPath: '',
}

export const serviceCatalog = {
  diagnosis: { price: 399, duration: '45 分钟' },
  training: { priceFrom: 2999, duration: '约 2 小时' },
  fde: { priceFrom: 5999, duration: '半天' },
  implementation: { priceFrom: 12800 },
  ongoingSupport: { billing: '按月' },
  enterpriseSeatPrice: { sourceUrl: '', verifiedAt: '' },
} as const

export function normalizeServiceFormUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url : undefined
  } catch {
    return undefined
  }
}

export function isServiceFormUrl(value: string) {
  return normalizeServiceFormUrl(value) !== undefined
}

export function normalizeLocalArticleAssetPath(value: string) {
  let decoded = value

  for (let attempts = 0; attempts < 8; attempts += 1) {
    if (
      !decoded.startsWith('/')
      || decoded.startsWith('//')
      || /[?#\\\0]/.test(decoded)
      || decoded.split('/').some((segment) => segment === '.' || segment === '..')
    ) {
      return undefined
    }

    let next: string
    try {
      next = decodeURIComponent(decoded)
    } catch {
      return undefined
    }

    if (next === decoded) {
      return decoded.startsWith('/article-assets/') ? decoded : undefined
    }
    decoded = next
  }

  return undefined
}

export function getServiceChannelState(config: ServiceChannelConfig) {
  return {
    businessWechatReady: normalizeLocalArticleAssetPath(config.businessWechatQrPath) !== undefined,
    applicationFormReady: isServiceFormUrl(config.applicationFormUrl),
    enterpriseChannelReady: normalizeLocalArticleAssetPath(config.enterpriseChannelQrPath) !== undefined,
  }
}
