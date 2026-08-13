import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import CommunityQr, {
  cancelCommunityQrClose,
  openCommunityQr,
  pinCommunityQr,
  previewCommunityQr,
  scheduleCommunityQrClose,
} from '../docs/.vitepress/theme/CommunityQr.vue'
import Layout from '../docs/.vitepress/theme/Layout.vue'

vi.mock('vitepress', () => ({
  useRoute: () => ({ path: '/wb-x/' }),
  useData: () => ({ site: { value: { base: '/' } } }),
  withBase: (path: string) => path,
}))

vi.mock('vitepress/theme', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    default: {
      Layout: defineComponent({
        name: 'VitePressLayoutShell',
        setup(_, { slots }) {
          return () =>
            h('div', [
              ...(slots['home-hero-before']?.() ?? []),
              ...(slots['layout-bottom']?.() ?? []),
            ])
        },
      }),
    },
  }
})

const apps: App[] = []

function mockHoverCapability(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn(() => ({
      matches,
      media: '(hover: hover) and (pointer: fine)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function mountCommunityQr() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(CommunityQr)
  app.mount(host)
  apps.push(app)
}

function mountLayout() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(Layout)
  app.mount(host)
  apps.push(app)
}

async function openFrom(trigger: HTMLElement) {
  trigger.focus()
  openCommunityQr(trigger)
  await nextTick()
}

afterEach(() => {
  vi.useRealTimers()
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

describe('CommunityQr', () => {
  it('previews without stealing focus and pins without closing', async () => {
    const before = document.createElement('button')
    const trigger = document.createElement('a')
    document.body.append(before, trigger)
    mountCommunityQr()
    before.focus()

    previewCommunityQr(trigger)
    await nextTick()

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(document.activeElement).toBe(before)

    pinCommunityQr(trigger)
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBe(dialog)
    expect(document.activeElement).toBe(dialog)
  })

  it('does not restore focus when a hover preview closes', async () => {
    const before = document.createElement('button')
    const trigger = document.createElement('a')
    document.body.append(before, trigger)
    mountCommunityQr()
    before.focus()

    previewCommunityQr(trigger)
    await nextTick()
    document.querySelector<HTMLButtonElement>('[aria-label="关闭"]')?.click()
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(before)
  })

  it('delays preview close, cancels it on re-entry, and ignores it while pinned', async () => {
    vi.useFakeTimers()
    const trigger = document.createElement('a')
    document.body.append(trigger)
    mountCommunityQr()

    previewCommunityQr(trigger)
    await nextTick()
    scheduleCommunityQrClose()
    vi.advanceTimersByTime(179)
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()

    cancelCommunityQrClose()
    vi.advanceTimersByTime(1)
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()

    scheduleCommunityQrClose()
    vi.advanceTimersByTime(180)
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    pinCommunityQr(trigger)
    await nextTick()
    scheduleCommunityQrClose()
    vi.advanceTimersByTime(180)
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('renders a labelled non-modal QR popover without locking background scrolling', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mountCommunityQr()

    await openFrom(trigger)

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    const image = dialog?.querySelector('img')

    expect(dialog?.hasAttribute('aria-modal')).toBe(false)
    expect(dialog?.getAttribute('aria-labelledby')).toBe('wbx-community-qr-title')
    expect(dialog?.getAttribute('aria-describedby')).toBe('wbx-community-qr-help')
    expect(dialog?.textContent).toContain('加入交流群')
    expect(dialog?.textContent).toContain('欢迎创客一起共创')
    expect(dialog?.textContent).not.toContain('二维码过期后')
    expect(image?.getAttribute('src')).toBe('/community/wechat-group.png')
    expect(image?.getAttribute('width')).toBe('490')
    expect(image?.getAttribute('height')).toBe('490')
    expect(document.body.style.overflow).toBe('')
  })

  it('anchors below the trigger with right edges aligned', async () => {
    const trigger = document.createElement('button')
    trigger.getBoundingClientRect = () =>
      ({ top: 20, right: 800, bottom: 60 } as DOMRect)
    document.body.append(trigger)
    mountCommunityQr()

    await openFrom(trigger)

    const popover = document.querySelector<HTMLElement>('[role="dialog"]')
    popover!.getBoundingClientRect = () =>
      ({ width: 270, height: 360 } as DOMRect)
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 837 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 736 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(popover?.style.left).toBe('530px')
    expect(popover?.style.top).toBe('68px')
  })

  it('restores focus to the most recent trigger', async () => {
    const firstTrigger = document.createElement('button')
    const repeatedTrigger = document.createElement('button')
    document.body.append(firstTrigger, repeatedTrigger)
    mountCommunityQr()

    firstTrigger.focus()
    openCommunityQr(firstTrigger)
    await nextTick()

    repeatedTrigger.focus()
    openCommunityQr(repeatedTrigger)
    await nextTick()

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    expect(dialog).not.toBeNull()

    dialog?.dispatchEvent(
      new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'Escape' }),
    )
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(repeatedTrigger)
  })

  it('closes when clicking outside but not when clicking inside', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mountCommunityQr()

    await openFrom(trigger)
    document.querySelector<HTMLElement>('.wbx-community-qr')?.click()
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()

    document.body.click()
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(document.activeElement).toBe(trigger)
  })

  it('toggles closed when the active trigger is clicked again', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mountCommunityQr()

    await openFrom(trigger)
    openCommunityQr(trigger)
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes from its named close button', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mountCommunityQr()

    await openFrom(trigger)
    document.querySelector<HTMLButtonElement>('[aria-label="关闭"]')?.click()
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})

describe('Layout community triggers', () => {
  it('previews on capable pointer hover and closes after leaving', async () => {
    vi.useFakeTimers()
    mockHoverCapability(true)
    mountLayout()

    const before = document.createElement('button')
    const trigger = document.createElement('a')
    trigger.href = '#community'
    trigger.innerHTML = '<span>交流群</span>'
    document.body.append(before, trigger)
    before.focus()

    trigger.querySelector('span')?.dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, relatedTarget: document.body }),
    )
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.activeElement).toBe(before)

    trigger.dispatchEvent(
      new MouseEvent('pointerout', { bubbles: true, relatedTarget: document.body }),
    )
    vi.advanceTimersByTime(180)
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('ignores internal pointer movement and hover on touch-only devices', async () => {
    mockHoverCapability(true)
    mountLayout()
    const trigger = document.createElement('a')
    const child = document.createElement('span')
    trigger.href = '#community'
    child.textContent = '交流群'
    trigger.append(child)
    document.body.append(trigger)

    child.dispatchEvent(
      new MouseEvent('pointerover', { bubbles: true, relatedTarget: trigger }),
    )
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    apps.splice(0).forEach((app) => app.unmount())
    mockHoverCapability(false)
    mountLayout()
    child.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('pins on click so pointer leave cannot close it', async () => {
    vi.useFakeTimers()
    mockHoverCapability(true)
    mountLayout()
    const trigger = document.createElement('a')
    trigger.href = '#community'
    trigger.textContent = '交流群'
    document.body.append(trigger)

    trigger.click()
    await nextTick()
    trigger.dispatchEvent(new MouseEvent('pointerout', { bubbles: true }))
    vi.advanceTimersByTime(180)
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })

  it('opens after VitePress has already prevented the navigation click', async () => {
    const vitePressNavigationHandler = (event: MouseEvent) => event.preventDefault()
    document.addEventListener('click', vitePressNavigationHandler, true)

    try {
      mountLayout()

      const trigger = document.createElement('a')
      trigger.href = '#community'
      trigger.textContent = '交流群'
      document.body.append(trigger)

      trigger.dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }),
      )
      await nextTick()

      expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    } finally {
      document.removeEventListener('click', vitePressNavigationHandler, true)
    }
  })

  it.each([
    { name: 'desktop menu', className: 'VPNavBarMenuLink' },
    { name: 'mobile menu', className: 'VPNavScreenMenuLink' },
  ])('opens the dialog from the $name 交流群 control', async ({ className }) => {
    mountLayout()

    const trigger = document.createElement('a')
    trigger.className = className
    trigger.href = '#community'
    trigger.innerHTML = '<span>交流群</span>'
    document.body.append(trigger)

    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
    trigger.querySelector('span')?.dispatchEvent(click)
    await nextTick()

    expect(click.defaultPrevented).toBe(true)
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })
})
