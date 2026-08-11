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

export function isPaidServiceReady(config: ServiceConfig) {
  const freeForm = normalizeServiceFormUrl(config.freeCaseFormUrl)
  const paidForm = normalizeServiceFormUrl(config.paidDiagnosticFormUrl)

  if (
    !freeForm
    || !paidForm
    || freeForm.href === paidForm.href
    || !normalizeLocalArticleAssetPath(config.paymentQrPath)
    || !config.confirmationWindow.trim()
    || !config.supportContact.trim()
  ) {
    return false
  }

  return true
}

export function assertPaidServiceReady(config: ServiceConfig) {
  if (!isPaidServiceReady(config)) {
    throw new Error('Paid diagnostic service configuration is incomplete or invalid.')
  }
}
