import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import CommunityQr, { openCommunityQr } from '../docs/.vitepress/theme/CommunityQr.vue'
import Layout from '../docs/.vitepress/theme/Layout.vue'

vi.mock('vitepress', () => ({
  useRoute: () => ({ path: '/wb-x/' }),
  useData: () => ({ site: { value: { base: '/' } } }),
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
  apps.splice(0).forEach((app) => app.unmount())
  document.body.replaceChildren()
  document.body.style.overflow = ''
})

describe('CommunityQr', () => {
  it('renders the labelled QR dialog and locks background scrolling when opened', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mountCommunityQr()

    await openFrom(trigger)

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')
    const image = dialog?.querySelector('img')

    expect(dialog?.getAttribute('aria-modal')).toBe('true')
    expect(dialog?.getAttribute('aria-labelledby')).toBe('wbx-community-qr-title')
    expect(dialog?.textContent).toContain('加入交流群')
    expect(image?.getAttribute('src')).toBe('/community/wechat-group.png')
    expect(image?.getAttribute('width')).toBe('800')
    expect(image?.getAttribute('height')).toBe('800')
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores focus to the trigger that originally opened the dialog', async () => {
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
    expect(document.activeElement).toBe(firstTrigger)
  })

  it('closes when its backdrop is clicked', async () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    mountCommunityQr()

    await openFrom(trigger)
    document.querySelector<HTMLElement>('.wbx-community-qr__backdrop')?.click()
    await nextTick()

    expect(document.querySelector('[role="dialog"]')).toBeNull()
    expect(document.body.style.overflow).toBe('')
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
