import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import CommunityQr, {
  cancelCommunityQrClose,
  openCommunityQr,
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

function mount(component: typeof CommunityQr | typeof Layout) {
  const host = document.createElement('div')
  document.body.append(host)
  const app = createApp(component)
  app.mount(host)
  apps.push(app)
}

function communityTrigger(className = '') {
  const trigger = document.createElement('a')
  trigger.className = className
  trigger.href = '#community'
  trigger.innerHTML = '<span>交流群</span>'
  document.body.append(trigger)
  return trigger
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
  it('previews without stealing focus and renders no interactive close control', async () => {
    const before = document.createElement('button')
    const trigger = document.createElement('a')
    document.body.append(before, trigger)
    mount(CommunityQr)
    before.focus()

    previewCommunityQr(trigger)
    await nextTick()

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    expect(dialog).not.toBeNull()
    expect(document.activeElement).toBe(before)
    expect(dialog?.querySelector('button')).toBeNull()
    expect(dialog?.textContent).toContain('欢迎创客一起共创 · 二维码 9 月 1 日前有效')
  })

  it('delays preview close and cancels it when the pointer re-enters', async () => {
    vi.useFakeTimers()
    const trigger = document.createElement('a')
    document.body.append(trigger)
    mount(CommunityQr)

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
  })

  it('renders the labelled QR resource without locking background scrolling', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mount(CommunityQr)

    await openFrom(trigger)

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    const image = dialog?.querySelector('img')
    expect(dialog?.hasAttribute('aria-modal')).toBe(false)
    expect(dialog?.getAttribute('aria-labelledby')).toBe('wbx-community-qr-title')
    expect(dialog?.getAttribute('aria-describedby')).toBe('wbx-community-qr-help')
    expect(image?.getAttribute('src')).toBe('/community/wechat-group.png')
    expect(image?.getAttribute('width')).toBe('490')
    expect(image?.getAttribute('height')).toBe('490')
    expect(document.body.style.overflow).toBe('')
  })

  it('anchors below the trigger with right edges aligned', async () => {
    const trigger = document.createElement('button')
    trigger.getBoundingClientRect = () => ({ top: 20, right: 800, bottom: 60 } as DOMRect)
    document.body.append(trigger)
    mount(CommunityQr)

    await openFrom(trigger)
    const popover = document.querySelector<HTMLElement>('[role="dialog"]')
    popover!.getBoundingClientRect = () => ({ width: 270, height: 360 } as DOMRect)
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 837 })
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 736 })
    window.dispatchEvent(new Event('resize'))
    await nextTick()

    expect(popover?.style.left).toBe('530px')
    expect(popover?.style.top).toBe('68px')
  })

  it('keeps touch-open content open on repeated trigger activation', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mount(CommunityQr)

    await openFrom(trigger)
    openCommunityQr(trigger)
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('closes touch-open content on outside click and Escape without restoring focus', async () => {
    const before = document.createElement('button')
    const trigger = document.createElement('button')
    document.body.append(before, trigger)
    mount(CommunityQr)
    before.focus()

    openCommunityQr(trigger)
    await nextTick()
    document.querySelector<HTMLElement>('.wbx-community-qr')?.click()
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()

    document.body.click()
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(before)

    openCommunityQr(trigger)
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.activeElement).toBe(before)
  })
})

describe('Layout community triggers', () => {
  it('previews on capable pointer hover and closes after leaving', async () => {
    vi.useFakeTimers()
    mockHoverCapability(true)
    mount(Layout)
    const before = document.createElement('button')
    const trigger = communityTrigger()
    document.body.append(before)
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
    mount(Layout)
    const trigger = communityTrigger()
    const child = trigger.querySelector('span')!
    child.dispatchEvent(new MouseEvent('pointerover', { bubbles: true, relatedTarget: trigger }))
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()

    apps.splice(0).forEach((app) => app.unmount())
    mockHoverCapability(false)
    mount(Layout)
    child.dispatchEvent(new MouseEvent('pointerover', { bubbles: true }))
    await nextTick()
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it('does not open or prevent a desktop click', async () => {
    mockHoverCapability(true)
    mount(Layout)
    const trigger = communityTrigger()
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })

    trigger.dispatchEvent(click)
    await nextTick()

    expect(click.defaultPrevented).toBe(false)
    expect(document.querySelector('[role="dialog"]')).toBeNull()
  })

  it.each([
    { name: 'desktop menu markup', className: 'VPNavBarMenuLink' },
    { name: 'mobile menu markup', className: 'VPNavScreenMenuLink' },
  ])('opens from the $name on a touch-only device', async ({ className }) => {
    mockHoverCapability(false)
    mount(Layout)
    const trigger = communityTrigger(className)
    const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })

    trigger.querySelector('span')?.dispatchEvent(click)
    await nextTick()

    expect(click.defaultPrevented).toBe(true)
    expect(document.querySelector('[role="dialog"]')).not.toBeNull()
  })
})
