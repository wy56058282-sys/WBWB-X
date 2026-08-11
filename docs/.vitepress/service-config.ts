export interface ServiceConfig {
  freeCaseFormUrl: string
  paidDiagnosticFormUrl: string
  paymentQrPath: string
  confirmationWindow: string
  supportContact: string
}

export const serviceConfig: ServiceConfig = {
  freeCaseFormUrl: '',
  paidDiagnosticFormUrl: '',
  paymentQrPath: '',
  confirmationWindow: '',
  supportContact: '',
}

export function isServiceFormUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

function isLocalArticleAssetPath(value: string) {
  const segments = value.split('/')

  return value.startsWith('/article-assets/')
    && segments.every((segment) => segment !== '.' && segment !== '..')
    && !value.includes('?')
    && !value.includes('#')
}

export function isPaidServiceReady(config: ServiceConfig) {
  if (!isServiceFormUrl(config.paidDiagnosticFormUrl) || !isLocalArticleAssetPath(config.paymentQrPath)) {
    return false
  }

  return !config.freeCaseFormUrl
    || (isServiceFormUrl(config.freeCaseFormUrl) && config.freeCaseFormUrl !== config.paidDiagnosticFormUrl)
}

export function assertPaidServiceReady(config: ServiceConfig) {
  if (!isPaidServiceReady(config)) {
    throw new Error('Paid diagnostic service configuration is incomplete or invalid.')
  }
}
