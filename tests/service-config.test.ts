import { describe, expect, it } from 'vitest'
import {
  getServiceChannelState,
  isServiceFormUrl,
  normalizeLocalArticleAssetPath,
  serviceCatalog,
  serviceConfig,
  type ServiceChannelConfig,
} from '../docs/.vitepress/service-config'

const configuredChannels: ServiceChannelConfig = {
  businessWechatQrPath: '/article-assets/service/business-wechat.png',
  applicationFormUrl: 'https://forms.example.com/diagnosis',
  enterpriseChannelQrPath: '/article-assets/service/enterprise-channel.png',
}

describe('service operations configuration', () => {
  it('defaults every public service channel to a safe unavailable state', () => {
    expect(serviceConfig.freeCaseFormUrl).toBe('')
    expect(getServiceChannelState(serviceConfig)).toEqual({
      businessWechatReady: false,
      applicationFormReady: false,
      enterpriseChannelReady: false,
    })
  })

  it('recognizes only HTTPS application-form URLs', () => {
    expect(isServiceFormUrl('https://forms.example.com/diagnosis')).toBe(true)
    expect(isServiceFormUrl('http://forms.example.com/diagnosis')).toBe(false)
    expect(isServiceFormUrl('/forms/diagnosis')).toBe(false)
    expect(isServiceFormUrl('not a URL')).toBe(false)
  })

  it('recognizes only local article-asset paths for QR channels', () => {
    expect(normalizeLocalArticleAssetPath('/article-assets/service/business-wechat.png'))
      .toBe('/article-assets/service/business-wechat.png')

    for (const value of [
      '/article-assets/../business-wechat.png',
      '/article-assets/%2e%2e/business-wechat.png',
      '/article-assets/business-wechat.png?next=/outside.png',
      'https://cdn.example.com/business-wechat.png',
      '/brand/business-wechat.png',
    ]) {
      expect(normalizeLocalArticleAssetPath(value), value).toBeUndefined()
    }
  })

  it('derives each channel readiness independently', () => {
    expect(getServiceChannelState({
      ...configuredChannels,
      businessWechatQrPath: '',
      enterpriseChannelQrPath: '',
    })).toEqual({
      businessWechatReady: false,
      applicationFormReady: true,
      enterpriseChannelReady: false,
    })

    expect(getServiceChannelState({
      ...configuredChannels,
      applicationFormUrl: 'http://forms.example.com/diagnosis',
      enterpriseChannelQrPath: '',
    })).toEqual({
      businessWechatReady: true,
      applicationFormReady: false,
      enterpriseChannelReady: false,
    })

    expect(getServiceChannelState({
      ...configuredChannels,
      businessWechatQrPath: '',
      applicationFormUrl: '',
    })).toEqual({
      businessWechatReady: false,
      applicationFormReady: false,
      enterpriseChannelReady: true,
    })
  })

  it('centralizes the service-ladder prices and enterprise price provenance', () => {
    expect(serviceCatalog).toMatchObject({
      diagnosis: { price: 399, duration: '45 分钟' },
      training: { priceFrom: 2999, duration: '约 2 小时' },
      fde: { priceFrom: 5999, duration: '半天' },
      implementation: { priceFrom: 12800 },
      ongoingSupport: { billing: '按月' },
      enterpriseSeatPrice: { sourceUrl: '', verifiedAt: '' },
    })
  })
})
