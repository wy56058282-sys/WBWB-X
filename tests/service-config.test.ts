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
    expect(isPaidServiceReady({ ...readyConfig, freeCaseFormUrl: '' })).toBe(false)
    expect(isPaidServiceReady({ ...serviceConfig, paidDiagnosticFormUrl: '' })).toBe(false)
    expect(isPaidServiceReady({ ...serviceConfig, paymentQrPath: '' })).toBe(false)
  })

  it('fails closed when paid diagnostic follow-up details are unavailable', () => {
    const missingConfirmationWindow = { ...readyConfig, confirmationWindow: '' }
    const missingSupportContact = { ...readyConfig, supportContact: '' }

    expect(isPaidServiceReady(missingConfirmationWindow)).toBe(false)
    expect(isPaidServiceReady(missingSupportContact)).toBe(false)
    expect(() => assertPaidServiceReady(missingConfirmationWindow)).toThrow(/paid diagnostic/i)
    expect(() => assertPaidServiceReady(missingSupportContact)).toThrow(/paid diagnostic/i)
  })

  it('rejects insecure, reused, or non-local paid-service inputs', () => {
    expect(isPaidServiceReady({ ...readyConfig, freeCaseFormUrl: 'http://forms.example.com/free' })).toBe(false)
    expect(isPaidServiceReady({ ...readyConfig, paidDiagnosticFormUrl: 'http://forms.example.com/paid' })).toBe(false)
    expect(isPaidServiceReady({ ...readyConfig, paymentQrPath: 'https://cdn.example.com/payment.png' })).toBe(false)
    expect(isPaidServiceReady({ ...readyConfig, paidDiagnosticFormUrl: readyConfig.freeCaseFormUrl })).toBe(false)
    expect(isPaidServiceReady({
      ...readyConfig,
      freeCaseFormUrl: 'https://FORMS.example.com:443/free-case-submission',
      paidDiagnosticFormUrl: 'https://forms.example.com/free-case-submission',
    })).toBe(false)
  })

  it('rejects payment QR path escapes and URL tricks', () => {
    for (const paymentQrPath of [
      '/article-assets/../payment.png',
      '/article-assets/%2e%2e/payment.png',
      '/article-assets/%252e%252e/payment.png',
      '/article-assets/payment.png?next=/outside.png',
      '/article-assets/payment.png%3fnext=/outside.png',
      '/article-assets/payment.png#outside',
      '/article-assets/payment.png%23outside',
      '/article-assets\\..\\payment.png',
      '/brand/payment.png',
      'https://cdn.example.com/payment.png',
    ]) {
      expect(isPaidServiceReady({ ...readyConfig, paymentQrPath }), paymentQrPath).toBe(false)
    }
  })

  it('explains why invalid paid diagnostics cannot be opened', () => {
    expect(() => assertPaidServiceReady({ ...readyConfig, paymentQrPath: '' })).toThrow(/paid diagnostic/i)
  })
})
