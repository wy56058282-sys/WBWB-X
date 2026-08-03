# WorkBuddy Download Links Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Present the WorkBuddy website and CodeBuddy workspace as two clearly labeled, independently rendered download links in chapter 2.

**Architecture:** Replace one prose paragraph in the chapter Markdown with a short introduction, a two-item Markdown list, and a separate instruction paragraph. Add a focused source-level Vitest contract for exact labels, URLs, order, and prose so later content edits cannot collapse or remove the download choices.

**Tech Stack:** Markdown, VitePress 1.6.4, Vitest 2.1.8, Node.js file APIs, in-app browser responsive inspection.

## Global Constraints

- The first list item is exactly `[WorkBuddy 官网](https://www.workbuddy.ai/)`.
- The second list item is exactly `[CodeBuddy 工作台](https://www.codebuddy.cn/work/)`.
- The introductory sentence is exactly `下载 WorkBuddy，请选择以下官方入口：`.
- The instruction after the list is exactly `进入页面后选择 WorkBuddy，点击“下载 WorkBuddy”即可。`.
- Use a Markdown list; do not use `<br>` or bare URLs.
- Modify only the download-entry paragraph in chapter 2; do not change its heading, screenshots, device-detection text, or other chapters.
- Both URLs remain HTTPS external links.

---

## File Structure

- Create `tests/download-links.test.ts`: verifies the exact chapter-2 download block, list order, and removal of the former inline sentence.
- Modify `docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md`: replaces only the first paragraph beneath `## WorkBuddy下载`.

### Task 1: Add the Two-Line Official Download Choices

**Files:**
- Create: `tests/download-links.test.ts`
- Modify: `docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md:3-7`

**Interfaces:**
- Consumes: chapter 2 as UTF-8 Markdown.
- Produces: a `## WorkBuddy下载` section whose opening block contains two ordered external-link list items and a separate instruction paragraph.

- [ ] **Step 1: Write the failing chapter-content test**

Create `tests/download-links.test.ts` with:

```ts
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const chapterPath = 'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md'
const chapter = readFileSync(chapterPath, 'utf8')
const downloadSection = chapter.match(/## WorkBuddy下载\n\n([\s\S]*?)\n\n!\[\]\(\/article-assets\/source-calibration\/ch02\/001\.png\)/)?.[1]

describe('chapter 2 download links', () => {
  it('shows both official entries on independent list lines in the approved order', () => {
    expect(downloadSection).toBe([
      '下载 WorkBuddy，请选择以下官方入口：',
      '',
      '- [WorkBuddy 官网](https://www.workbuddy.ai/)',
      '- [CodeBuddy 工作台](https://www.codebuddy.cn/work/)',
      '',
      '进入页面后选择 WorkBuddy，点击“下载 WorkBuddy”即可。',
    ].join('\n'))
  })

  it('removes the former inline download sentence', () => {
    expect(chapter).not.toContain('下载WorkBuddy，点击官方地址（https://www.codebuddy.cn/work/）')
  })
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/download-links.test.ts
```

Expected: the first test fails because the chapter still contains the former inline paragraph, and the second test fails because that former sentence remains.

- [ ] **Step 3: Replace only the opening download paragraph**

In chapter 2, replace the current sentence directly below `## WorkBuddy下载` with:

```markdown
下载 WorkBuddy，请选择以下官方入口：

- [WorkBuddy 官网](https://www.workbuddy.ai/)
- [CodeBuddy 工作台](https://www.codebuddy.cn/work/)

进入页面后选择 WorkBuddy，点击“下载 WorkBuddy”即可。
```

Leave the immediately following `![](/article-assets/source-calibration/ch02/001.png)` and all later content unchanged.

- [ ] **Step 4: Run the focused and content-link tests**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/download-links.test.ts tests/content-links.test.ts
```

Expected: both selected test files pass; the full Vitest configuration may also execute the remaining test files, all with zero failures.

- [ ] **Step 5: Run the complete project verification**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run check:links
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run check:assets
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run build
git diff --check
```

Expected: all Vitest tests pass, internal-link checking reports zero broken links, approved assets contain no source hotlinks, the VitePress production build completes, and `git diff --check` prints no errors.

- [ ] **Step 6: Verify desktop and mobile rendering**

Start the local development server:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm exec vitepress dev docs --host 127.0.0.1
```

Open chapter 2 at desktop width and at 390px. Confirm the introduction, two separate linked list rows, and instruction paragraph render in that order; both anchors have the exact HTTPS destinations; the screenshot remains immediately afterward; and the document introduces no horizontal overflow.

- [ ] **Step 7: Commit the tested content change**

```bash
git add tests/download-links.test.ts 'docs/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/index.md'
git commit -m "docs: add official WorkBuddy download links"
```
