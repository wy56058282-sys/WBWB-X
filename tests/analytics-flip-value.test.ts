import { createApp, h, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it } from 'vitest'
import AnalyticsFlipValue from '../docs/.vitepress/theme/AnalyticsFlipValue.vue'
import { digitTiming, digitTokens } from '../docs/.vitepress/theme/analyticsFlipValue'

function mountValue(initialValue: string) {
  const host = document.createElement('div')
  document.body.append(host)
  const value = ref(initialValue)
  const app = createApp({
    setup: () => () => h(AnalyticsFlipValue, { value: value.value }),
  })
  app.mount(host)
  return {
    host,
    value,
    unmount: () => {
      app.unmount()
      host.remove()
    },
  }
}

describe('AnalyticsFlipValue', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('aligns numeric places from the right and keeps separators static', () => {
    expect(digitTokens('12,355')).toEqual([
      { id: 'place-4', char: '1', kind: 'digit', place: 4 },
      { id: 'place-3', char: '2', kind: 'digit', place: 3 },
      { id: 'separator-0', char: ',', kind: 'separator', place: -1 },
      { id: 'place-2', char: '3', kind: 'digit', place: 2 },
      { id: 'place-1', char: '5', kind: 'digit', place: 1 },
      { id: 'place-0', char: '5', kind: 'digit', place: 0 },
    ])
  })

  it('uses bounded place-specific timing and stagger', () => {
    expect([0, 1, 2, 3, 4].map(digitTiming)).toEqual([
      { duration: '360ms', delay: '0ms' },
      { duration: '410ms', delay: '35ms' },
      { duration: '460ms', delay: '70ms' },
      { duration: '500ms', delay: '105ms' },
      { duration: '500ms', delay: '105ms' },
    ])
  })

  it('reuses unchanged places and replaces only the changed glyph', async () => {
    const view = mountValue('1,234')
    const beforeDigits = [...view.host.querySelectorAll('.wbx-flip-value__digit')]
    const beforeGlyphs = beforeDigits.map((node) => node.querySelector('.wbx-flip-value__glyph'))
    view.value.value = '1,235'
    await nextTick()
    const afterDigits = [...view.host.querySelectorAll('.wbx-flip-value__digit')]
    const unchangedGlyphs = afterDigits.slice(0, 3).map((node) => node.querySelector('.wbx-flip-value__glyph'))
    const changedGlyphs = [...afterDigits[3].querySelectorAll('.wbx-flip-value__glyph')]

    expect(afterDigits).toEqual(beforeDigits)
    expect(unchangedGlyphs).toEqual(beforeGlyphs.slice(0, 3))
    expect(changedGlyphs).toHaveLength(2)
    expect(changedGlyphs).toContain(beforeGlyphs[3])
    expect(changedGlyphs.some((node) => node !== beforeGlyphs[3] && node.textContent === '5')).toBe(true)
    expect(view.host.querySelectorAll('.wbx-flip-value__separator')).toHaveLength(1)
    view.unmount()
  })

  it('keeps low-place ids stable when the formatted length changes', () => {
    expect(digitTokens('999').map(({ id }) => id)).toEqual(['place-2', 'place-1', 'place-0'])
    expect(digitTokens('1,000').filter(({ kind }) => kind === 'digit').map(({ id }) => id))
      .toEqual(['place-3', 'place-2', 'place-1', 'place-0'])
  })

  it('keeps one complete accessible value and hides the animated layer', () => {
    const view = mountValue('12,355')
    expect(view.host.querySelector('.wbx-sr-only')?.textContent).toBe('12,355')
    expect(view.host.querySelector('.wbx-flip-value__visual')?.getAttribute('aria-hidden')).toBe('true')
    view.unmount()
  })
})
