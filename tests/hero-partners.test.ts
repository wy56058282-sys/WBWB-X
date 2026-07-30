import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { heroPartners } from '../docs/.vitepress/theme/heroPartners'

describe('hero partner stickers', () => {
  it('contains the approved partners and local assets', () => {
    expect(heroPartners).toEqual([
      {
        name: '星火集',
        logo: '/brand/partners/sparkx.svg',
        href: 'https://www.sparkx.zone/',
      },
      {
        name: 'WorkBuddy',
        logo: '/brand/partners/workbuddy.svg',
        href: 'https://www.workbuddy.ai/',
      },
      {
        name: 'Z.ai',
        logo: '/brand/partners/z-ai.svg',
        href: 'https://z.ai/subscribe',
      },
    ])

    for (const partner of heroPartners) {
      expect(existsSync(`docs/public${partner.logo}`)).toBe(true)
    }
  })
})
