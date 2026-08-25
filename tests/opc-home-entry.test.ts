import { describe, expect, it } from 'vitest'
import { useHomePageHarness } from './helpers/home-page-harness'

const harness = useHomePageHarness()

describe('OPC homepage entry', () => {
  it('links to the OPC reading area with the existing reading-card treatment', () => {
    harness.mountHomePage()

    const link = document.querySelector<HTMLAnchorElement>('.wbx-reading-card[href="/opc/"]')
    expect(link?.textContent).toContain('OPC')
    expect(link?.textContent).toContain('一人公司')
    expect(link?.querySelector('.hn-robot')).not.toBeNull()
    expect(link?.querySelector('.hn-rocket')).toBeNull()
  })
})
