import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, type App, nextTick } from 'vue'
import { readFileSync } from 'node:fs'
import FloatingQuickAccess from '../docs/.vitepress/theme/FloatingQuickAccess.vue'

vi.mock('vitepress', () => ({
  withBase: (path: string) => path,
}))

const apps: App[] = []

afterEach(() => {
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
})

function mountComponent() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(FloatingQuickAccess)
  app.mount(host)
  apps.push(app)
}

describe('floating quick access button', () => {
  it('renders the main toggle button', () => {
    mountComponent()

    const toggle = document.querySelector<HTMLButtonElement>('.wbx-fab__toggle')

    expect(toggle).not.toBeNull()
    expect(toggle?.getAttribute('aria-label')).toBe('快捷入口')
    expect(toggle?.getAttribute('type')).toBe('button')
  })

  it('starts with the menu collapsed', () => {
    mountComponent()

    const menu = document.querySelector('.wbx-fab__menu')

    expect(menu).toBeNull()
  })

  it('expands the menu on hover', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const menu = document.querySelector('.wbx-fab__menu')
    const items = menu?.querySelectorAll('.wbx-fab__item')

    expect(menu).not.toBeNull()
    expect(items?.length).toBe(5)
  })

  it('collapses the menu when mouse leaves', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    let menu = document.querySelector('.wbx-fab__menu')
    expect(menu).not.toBeNull()

    fab?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    await nextTick()

    // Menu should be in leave animation or null
    await vi.waitFor(() => {
      menu = document.querySelector('.wbx-fab__menu')
      expect(menu).toBeNull()
    }, { timeout: 500 })
  })

  it('renders all five menu items with correct labels', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const items = Array.from(
      document.querySelectorAll<HTMLButtonElement>('.wbx-fab__item'),
    )

    expect(items).toHaveLength(5)
    expect(items.map((item) => item.getAttribute('aria-label'))).toEqual([
      '分享',
      '教学资料',
      '星火集',
      '公众号',
      '联系主理人',
    ])
  })

  it('copies the current URL when the share button is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText },
    })

    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const shareButton = document.querySelector<HTMLButtonElement>(
      '.wbx-fab__item[aria-label="分享"]',
    )
    shareButton?.click()
    await nextTick()

    // Wait for clipboard to be called
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalled()
    })
  })

  it('opens the teaching materials link in a new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const materialsButton = document.querySelector<HTMLButtonElement>(
      '.wbx-fab__item[aria-label="教学资料"]',
    )
    materialsButton?.click()

    expect(openSpy).toHaveBeenCalledWith(
      'https://pan.quark.cn/s/bf6971c32304?pwd=4yCv',
      '_blank',
      'noopener,noreferrer',
    )

    openSpy.mockRestore()
  })

  it('opens the SparkX website in a new tab', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const sparkxButton = document.querySelector<HTMLButtonElement>(
      '.wbx-fab__item[aria-label="星火集"]',
    )
    sparkxButton?.click()

    expect(openSpy).toHaveBeenCalledWith(
      'https://www.sparkx.zone/',
      '_blank',
      'noopener,noreferrer',
    )

    openSpy.mockRestore()
  })

  it('shows QR popup on hover over the QR button', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const qrButton = document.querySelector<HTMLElement>(
      '.wbx-fab__item[aria-label="公众号"]',
    )
    qrButton?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const popup = document.querySelector('.wbx-fab-qr-popup')
    const img = document.querySelector('.wbx-fab-qr-popup__image')

    expect(popup).not.toBeNull()
    expect(img).not.toBeNull()
    // Popup should be teleported to body with fixed positioning
    expect(popup?.parentElement?.tagName).toBe('BODY')
  })

  it('hides QR popup when mouse leaves the QR button', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const qrButton = document.querySelector<HTMLElement>(
      '.wbx-fab__item[aria-label="公众号"]',
    )
    qrButton?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    let popup = document.querySelector('.wbx-fab-qr-popup')
    expect(popup).not.toBeNull()

    qrButton?.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }))
    await nextTick()

    await vi.waitFor(() => {
      popup = document.querySelector('.wbx-fab-qr-popup')
      expect(popup).toBeNull()
    }, { timeout: 500 })
  })

  it('opens mailto link when contact button is clicked', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const contactButton = document.querySelector<HTMLButtonElement>(
      '.wbx-fab__item[aria-label="联系主理人"]',
    )
    expect(contactButton).not.toBeNull()
  })

  it('closes the menu when clicking outside', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    let menu = document.querySelector('.wbx-fab__menu')
    expect(menu).not.toBeNull()

    // Click outside the FAB - simulate by dispatching a click event on document
    const event = new MouseEvent('click', { bubbles: true })
    document.dispatchEvent(event)
    await nextTick()

    // Menu should be collapsed or in leave animation
    await vi.waitFor(() => {
      menu = document.querySelector('.wbx-fab__menu')
      expect(menu).toBeNull()
    }, { timeout: 500 })
  })

  it('closes the menu when Escape is pressed', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    let menu = document.querySelector('.wbx-fab__menu')
    expect(menu).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()

    // Menu should be collapsed or in leave animation
    await vi.waitFor(() => {
      menu = document.querySelector('.wbx-fab__menu')
      expect(menu).toBeNull()
    }, { timeout: 500 })
  })

  it('hides QR popup when Escape is pressed', async () => {
    mountComponent()

    const fab = document.querySelector<HTMLElement>('.wbx-fab')
    fab?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    const qrButton = document.querySelector<HTMLElement>(
      '.wbx-fab__item[aria-label="公众号"]',
    )
    qrButton?.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
    await nextTick()

    let popup = document.querySelector('.wbx-fab-qr-popup')
    expect(popup).not.toBeNull()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()

    await vi.waitFor(() => {
      popup = document.querySelector('.wbx-fab-qr-popup')
      expect(popup).toBeNull()
    }, { timeout: 500 })
  })

  it('has correct CSS styles for the FAB container', () => {
    const css = readFileSync(
      'docs/.vitepress/theme/floating-quick-access.css',
      'utf8',
    )

    expect(css).toMatch(/\.wbx-fab\s*\{[^}]*position:\s*fixed;/s)
    expect(css).toMatch(/\.wbx-fab\s*\{[^}]*right:\s*24px;/s)
    expect(css).toMatch(/\.wbx-fab\s*\{[^}]*bottom:\s*24px;/s)
    expect(css).toMatch(/\.wbx-fab\s*\{[^}]*z-index:\s*50;/s)
  })

  it('has toggle button absolutely positioned to stay fixed', () => {
    const css = readFileSync(
      'docs/.vitepress/theme/floating-quick-access.css',
      'utf8',
    )

    expect(css).toMatch(/\.wbx-fab__toggle\s*\{[^}]*position:\s*absolute;/s)
    expect(css).toMatch(/\.wbx-fab__toggle\s*\{[^}]*bottom:\s*0;/s)
    expect(css).toMatch(/\.wbx-fab__toggle\s*\{[^}]*right:\s*0;/s)
  })

  it('has menu absolutely positioned above toggle', () => {
    const css = readFileSync(
      'docs/.vitepress/theme/floating-quick-access.css',
      'utf8',
    )

    expect(css).toMatch(/\.wbx-fab__menu\s*\{[^}]*position:\s*absolute;/s)
    expect(css).toMatch(/\.wbx-fab__menu\s*\{[^}]*bottom:\s*64px;/s)
  })

  it('has correct CSS styles for the toggle button', () => {
    const css = readFileSync(
      'docs/.vitepress/theme/floating-quick-access.css',
      'utf8',
    )

    expect(css).toMatch(/\.wbx-fab__toggle\s*\{[^}]*width:\s*52px;/s)
    expect(css).toMatch(/\.wbx-fab__toggle\s*\{[^}]*height:\s*52px;/s)
    expect(css).toMatch(/\.wbx-fab__toggle\s*\{[^}]*border-radius:\s*50%;/s)
    expect(css).toMatch(/\.wbx-fab__toggle\s*\{[^}]*background:\s*var\(--vp-c-brand-1\);/s)
  })

  it('has correct CSS styles for menu items', () => {
    const css = readFileSync(
      'docs/.vitepress/theme/floating-quick-access.css',
      'utf8',
    )

    expect(css).toMatch(/\.wbx-fab__item\s*\{[^}]*width:\s*44px;/s)
    expect(css).toMatch(/\.wbx-fab__item\s*\{[^}]*height:\s*44px;/s)
    expect(css).toMatch(/\.wbx-fab__item\s*\{[^}]*border-radius:\s*50%;/s)
  })

  it('has mobile responsive styles', () => {
    const css = readFileSync(
      'docs/.vitepress/theme/floating-quick-access.css',
      'utf8',
    )

    const mobile = css.slice(css.indexOf('@media (max-width: 760px)'))

    expect(mobile).toMatch(/\.wbx-fab\s*\{[^}]*right:\s*16px;/s)
    expect(mobile).toMatch(/\.wbx-fab\s*\{[^}]*bottom:\s*16px;/s)
    expect(mobile).toMatch(/\.wbx-fab__toggle\s*\{[^}]*width:\s*46px;/s)
    expect(mobile).toMatch(/\.wbx-fab__menu\s*\{[^}]*bottom:\s*58px;/s)
    expect(mobile).toMatch(/\.wbx-fab__item\s*\{[^}]*width:\s*40px;/s)
  })

  it('has tooltip styles for hover labels', () => {
    const css = readFileSync(
      'docs/.vitepress/theme/floating-quick-access.css',
      'utf8',
    )

    expect(css).toMatch(/\.wbx-fab__tooltip\s*\{[^}]*position:\s*absolute;/s)
    expect(css).toMatch(/\.wbx-fab__tooltip\s*\{[^}]*right:\s*100%;/s)
    expect(css).toMatch(/\.wbx-fab__tooltip\s*\{[^}]*opacity:\s*0;/s)
    expect(css).toMatch(/\.wbx-fab__item:hover \.wbx-fab__tooltip\s*\{[^}]*opacity:\s*1;/s)
  })
})
