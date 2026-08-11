import { describe, expect, it } from 'vitest'
import {
  assertPaidServiceReady,
  isPaidServiceReady,
  serviceConfig,
  type ServiceConfig,
} from '../docs/.vitepress/service-config'

const readyConfig: ServiceConfig = {
  freeCaseFormUrl: 'https://forms.example.com/free-case-submission',
  paidDiagnosticFormUrl: 'https://forms.example.com/paid-diagnostic',
  paymentQrPath: '/article-assets/service/wechat-payment-qr.png',
  confirmationWindow: '1 个工作日内确认',
  supportContact: 'support@example.com',
}

describe('service operations configuration', () => {
  it('keeps free case submissions separate from paid diagnostics', () => {
    expect(serviceConfig.freeCaseFormUrl).toBe('')
    expect(serviceConfig.paidDiagnosticFormUrl).toBe('')
    expect(readyConfig.freeCaseFormUrl).not.toBe(readyConfig.paidDiagnosticFormUrl)
    expect(isPaidServiceReady(readyConfig)).toBe(true)
  })

  it('fails closed when a paid form or payment QR is unavailable', () => {
    expect(isPaidServiceReady({ ...serviceConfig, paidDiagnosticFormUrl: '' })).toBe(false)
    expect(isPaidServiceReady({ ...serviceConfig, paymentQrPath: '' })).toBe(false)
  })

  it('rejects insecure, reused, or non-local paid-service inputs', () => {
    expect(isPaidServiceReady({ ...readyConfig, freeCaseFormUrl: 'http://forms.example.com/free' })).toBe(false)
    expect(isPaidServiceReady({ ...readyConfig, paidDiagnosticFormUrl: 'http://forms.example.com/paid' })).toBe(false)
    expect(isPaidServiceReady({ ...readyConfig, paymentQrPath: 'https://cdn.example.com/payment.png' })).toBe(false)
    expect(isPaidServiceReady({ ...readyConfig, paidDiagnosticFormUrl: readyConfig.freeCaseFormUrl })).toBe(false)
  })

  it('explains why invalid paid diagnostics cannot be opened', () => {
    expect(() => assertPaidServiceReady({ ...readyConfig, paymentQrPath: '' })).toThrow(/paid diagnostic/i)
  })
})
