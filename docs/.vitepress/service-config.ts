export interface WorkshopConfig {
  price: number
  cadence: string
  date: string
  time: string
  capacity: string
  location: string
  coverPath: string
  registrationPosterPath: string
  activityDetailUrl: string
}

export interface ServiceChannelConfig {
  businessWechatQrPath: string
  applicationFormUrl: string
  enterpriseChannelQrPath: string
}

export interface ServiceConfig extends ServiceChannelConfig {
  workshop: WorkshopConfig
  freeCaseFormUrl: string
}

export const serviceConfig: ServiceConfig = {
  workshop: {
    price: 39,
    cadence: '每 2 周一期',
    date: '2026 年 8 月 29 日',
    time: '14:00–18:00',
    capacity: '15–25 人',
    location: '星辉 OPC · 人工智能产业园',
    coverPath: '/article-assets/service/workshop-cover.png',
    registrationPosterPath: '/article-assets/service/workshop-registration.png',
    activityDetailUrl: 'https://mp.weixin.qq.com/s/Kn-3p5G1mlxDJ7yC-v-fUw',
  },
  freeCaseFormUrl: '',
  businessWechatQrPath: '',
  applicationFormUrl: '',
  enterpriseChannelQrPath: '',
}

export const serviceCatalog = {
  diagnosis: { price: 399, duration: '45 分钟', waivedWithSeatCount: 10 },
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
    if (!decoded.startsWith('/') || decoded.startsWith('//') || /[?#\\\0]/.test(decoded) || decoded.split('/').some((segment) => segment === '.' || segment === '..')) return undefined
    let next: string
    try { next = decodeURIComponent(decoded) } catch { return undefined }
    if (next === decoded) return decoded.startsWith('/article-assets/') ? decoded : undefined
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
