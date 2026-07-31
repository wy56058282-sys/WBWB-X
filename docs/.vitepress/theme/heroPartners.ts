export interface HeroStickerPartner {
  name: string
  ariaLabel: string
  logo: string
  href: string
}

export const heroPartners: HeroStickerPartner[] = [
  {
    name: '星火集',
    ariaLabel: '访问星火集',
    logo: '/brand/partners/sparkx.svg',
    href: 'https://www.sparkx.zone/',
  },
  {
    name: 'WorkBuddy',
    ariaLabel: '访问 WorkBuddy',
    logo: '/brand/partners/workbuddy.svg',
    href: 'https://www.workbuddy.ai/',
  },
  {
    name: 'Z.ai',
    ariaLabel: '访问 Z.ai',
    logo: '/brand/partners/z-ai.svg',
    href: 'https://z.ai/subscribe',
  },
]
