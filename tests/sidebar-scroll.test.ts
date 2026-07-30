import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

afterEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
})

describe('desktop sidebar scrolling', () => {
  it('keeps the logo curtain fixed and scrolls only the navigation below it', () => {
    const vitepressDefaults = document.createElement('style')
    vitepressDefaults.textContent = '.VPNavBarTitle .title { border-bottom: 1px solid #d7dbd0; }'
    document.head.append(vitepressDefaults)

    const style = document.createElement('style')
    style.textContent = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
    document.head.append(style)
    document.documentElement.style.setProperty('--wbx-line', '#d7dbd0')

    const sidebar = document.createElement('aside')
    sidebar.className = 'VPSidebar'
    const curtain = document.createElement('div')
    curtain.className = 'curtain'
    const nav = document.createElement('nav')
    nav.className = 'nav'
    const navBarTitle = document.createElement('div')
    navBarTitle.className = 'VPNavBarTitle'
    const title = document.createElement('div')
    title.className = 'title'
    navBarTitle.append(title)
    sidebar.append(curtain, nav)
    document.body.append(sidebar, navBarTitle)

    expect(getComputedStyle(sidebar).overflowY).toBe('hidden')
    expect(getComputedStyle(curtain).borderBottomWidth).toBe('0px')
    expect(getComputedStyle(nav).overflowY).toBe('auto')
    expect(getComputedStyle(nav).scrollbarGutter).toBe('auto')
    expect(getComputedStyle(title).borderBottomWidth).toBe('0px')
  })
})
