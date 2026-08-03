import { afterEach, describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

afterEach(() => {
  document.head.replaceChildren()
  document.body.replaceChildren()
  document.documentElement.removeAttribute('class')
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

  it('keeps the logo and active sidebar label visible in dark mode', () => {
    const vitepressDefaults = document.createElement('style')
    vitepressDefaults.textContent =
      '.VPSidebarItem.level-1.is-link > .item > .link > .text { color: #1d6b56 !important; }'
    document.head.append(vitepressDefaults)

    const style = document.createElement('style')
    style.textContent = readFileSync('docs/.vitepress/theme/custom.css', 'utf8')
    document.head.append(style)
    document.documentElement.className = 'dark'

    const navBarTitle = document.createElement('div')
    navBarTitle.className = 'VPNavBarTitle'
    const logo = document.createElement('img')
    logo.className = 'logo'
    navBarTitle.append(logo)

    const activeItem = document.createElement('div')
    activeItem.className = 'VPSidebarItem level-1 is-link is-active'
    const item = document.createElement('div')
    item.className = 'item'
    const link = document.createElement('a')
    link.className = 'link'
    const text = document.createElement('p')
    text.className = 'text'
    link.append(text)
    item.append(link)
    activeItem.append(item)
    document.body.append(navBarTitle, activeItem)

    expect(getComputedStyle(logo).filter).toBe('invert(1)')
    expect(getComputedStyle(text).color).toBe('rgb(13, 16, 13)')
  })

  it('keeps reading sidebar links aligned with shared density while the nav remains scrollable', () => {
    const style = document.createElement('style')
    style.textContent = `${readFileSync('docs/.vitepress/theme/custom.css', 'utf8')}\n${readFileSync('docs/.vitepress/theme/reading.css', 'utf8')}`
    document.head.append(style)

    const layout = document.createElement('div')
    layout.className = 'wbx-reading-layout'
    const sidebar = document.createElement('aside')
    sidebar.className = 'VPSidebar'
    const nav = document.createElement('nav')
    nav.className = 'nav'
    const sidebarItem = document.createElement('div')
    sidebarItem.className = 'VPSidebarItem'
    const link = document.createElement('a')
    link.className = 'link'
    sidebarItem.append(link)
    nav.append(sidebarItem)
    sidebar.append(nav)
    layout.append(sidebar)
    document.body.append(layout)

    expect(getComputedStyle(nav).overflowY).toBe('auto')
    expect(getComputedStyle(link).paddingTop).toBe('7px')
    expect(getComputedStyle(link).paddingBottom).toBe('7px')
    expect(getComputedStyle(link).borderRadius).toBe('6px')
  })
})
