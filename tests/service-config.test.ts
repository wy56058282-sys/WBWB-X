import { describe, expect, it } from 'vitest'
import { serviceCatalog, serviceConfig } from '../docs/.vitepress/service-config'

describe('service conversion configuration', () => {
  it('centralizes the replaceable workshop edition and its supplied poster assets', () => {
    expect(serviceConfig.workshop).toEqual({
      price: 39,
      cadence: '每 2 周一期',
      date: '2026 年 8 月 29 日',
      time: '14:00–18:00',
      capacity: '15–25 人',
      location: '星辉 OPC · 人工智能产业园',
      coverPath: '/article-assets/service/workshop-cover.png',
      registrationPosterPath: '/article-assets/service/workshop-registration.png',
      registrationQrPath: '/article-assets/service/workshop-registration-qr.png',
      activityDetailUrl: 'https://mp.weixin.qq.com/s/Kn-3p5G1mlxDJ7yC-v-fUw',
    })
  })

  it('defines the diagnosis price and exact ten-seat waiver rule', () => {
    expect(serviceCatalog.diagnosis).toEqual({ price: 399, duration: '45 分钟', waivedWithSeatCount: 10 })
  })
})
