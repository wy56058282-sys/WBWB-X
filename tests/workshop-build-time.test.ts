// @vitest-environment node

import { describe, expect, it } from 'vitest'
import config from '../docs/.vitepress/config.mts'

describe('workshop build reference time', () => {
  it('injects one valid build timestamp into both SSR and client bundles', () => {
    const define = config.vite?.define as Record<string, string>
    const injected = JSON.parse(define.__WBX_WORKSHOP_BUILD_TIME__)

    expect(new Date(injected).toISOString()).toBe(injected)
  })
})
