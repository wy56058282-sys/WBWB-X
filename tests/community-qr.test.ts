import { afterEach, describe, expect, it } from 'vitest'
import { createApp, nextTick, type App } from 'vue'
import CommunityQr, { openCommunityQr } from '../docs/.vitepress/theme/CommunityQr.vue'

const apps: App[] = []

function mountCommunityQr() {
  const host = document.createElement('div')
  document.body.append(host)

  const app = createApp(CommunityQr)
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
