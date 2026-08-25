import { describe, expect, it, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { addLazyImageRendering } from '../docs/.vitepress/markdown-media'

describe('documentation media loading', () => {
  it('adds native lazy loading and async decoding to Markdown images', () => {
    const attributes = new Map<string, string>()
    const fallback = vi.fn(() => '<img>')
    const markdown = {
      renderer: {
        rules: {
          image: fallback,
        },
      },
    }
    const token = {
      attrSet(name: string, value: string) {
        attributes.set(name, value)
      },
    }

    addLazyImageRendering(markdown)
    const result = markdown.renderer.rules.image([token], 0, {}, {}, {})

    expect(result).toBe('<img>')
    expect(attributes).toEqual(new Map([
      ['loading', 'lazy'],
      ['decoding', 'async'],
    ]))
    expect(fallback).toHaveBeenCalledOnce()
  })

  it('does not preload offscreen videos and provides lightweight posters', () => {
    for (const [chapter, poster] of [
      ['第 23 章 其他用法补充：WorkBuddy 实操案例集', '/article-assets/source-calibration/ch23/video-001-poster.webp'],
      ['第 24 章 如何进行多 Agent 系统设计', '/article-assets/source-calibration/ch24/video-001-poster.webp'],
    ]) {
      const source = readFileSync(
        `docs/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/${chapter}/index.md`,
        'utf8',
      )
      expect(source).toContain('preload="none"')
      expect(source).toContain(`poster="${poster}"`)
      expect(source).not.toContain('preload="metadata"')
    }
  })
})
