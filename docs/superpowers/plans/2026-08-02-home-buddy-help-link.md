# Homepage Buddy Help Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the homepage buddy icon card open the existing request-help page with an accurate accessible label.

**Architecture:** Change only the buddy anchor's `withBase(...)` argument and `aria-label` in `HomePage.vue`. Update the existing mounted-component navigation contract so the route and label fail before implementation and remain protected alongside the other four unchanged icon links.

**Tech Stack:** Vue 3.5, VitePress 1.6.4, Vitest 2.1.8, jsdom, in-app browser responsive inspection.

## Global Constraints

- The buddy icon card route is exactly `/help/` through `withBase('/help/')`.
- The buddy icon card `aria-label` is exactly `前往提需求`.
- Keep the buddy icon, class name, position, rotation, animation, hover, and focus styles unchanged.
- Keep the other four Hero icon card routes and accessible labels unchanged.
- Do not modify the top navigation or the help page.
- The route must continue to support VitePress base-path deployments through `withBase`.

---

## File Structure

- Modify `tests/home-hero-icons.test.ts`: update the first expected icon navigation tuple while preserving the remaining four tuples.
- Modify `docs/.vitepress/theme/HomePage.vue`: change only the buddy card route and accessible label.

### Task 1: Route the Buddy Card to the Help Page

**Files:**
- Modify: `tests/home-hero-icons.test.ts:213-234`
- Modify: `docs/.vitepress/theme/HomePage.vue:115-121`

**Interfaces:**
- Consumes: VitePress `withBase(path: string)` and the existing `.wbx-icon-card--buddy` anchor.
- Produces: a buddy anchor whose rendered destination is `/help/` at root deployment and whose accessible name is `前往提需求`; VitePress adds any configured base prefix at runtime.

- [ ] **Step 1: Update the existing navigation expectation first**

In `tests/home-hero-icons.test.ts`, change only the first tuple in `offers five labelled links to distinct site sections` to:

```ts
      ['前往提需求', '/help/'],
```

Leave the following four tuples unchanged.

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/home-hero-icons.test.ts
```

Expected: the icon navigation test fails because the buddy anchor still renders `查看 Part 1 使用手册` and the Part 1 route.

- [ ] **Step 3: Change only the buddy anchor attributes**

In `docs/.vitepress/theme/HomePage.vue`, replace the buddy anchor opening attributes with:

```vue
          <a
            class="wbx-icon-card wbx-icon-card--buddy"
            :href="withBase('/help/')"
            aria-label="前往提需求"
          >
```

Leave its `<i class="hn hn-face-grin" ...>` child and all subsequent icon anchors unchanged.

- [ ] **Step 4: Run the focused homepage tests**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test -- tests/home-hero-icons.test.ts tests/navigation.test.ts
```

Expected: all selected tests pass; the mounted component exposes five icon links, the first is `前往提需求` → `/help/`, and the top navigation still includes its existing help route.

- [ ] **Step 5: Verify the source still uses `withBase`**

Run:

```bash
rg -n -F ":href=\"withBase('/help/')\"" docs/.vitepress/theme/HomePage.vue
```

Expected: exactly one match on the buddy anchor. This protects GitHub Pages base-path support without replacing `withBase` with a raw `href`.

- [ ] **Step 6: Run the complete project verification**

Run:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm test
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run check:links
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run check:assets
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm run build
git diff --check
```

Expected: all Vitest tests pass, internal links report zero broken links, replacement assets contain no source hotlinks, the production build completes, and `git diff --check` prints no errors.

- [ ] **Step 7: Verify desktop and mobile interaction**

Start the local development server:

```bash
PATH=/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:/Users/wangyi/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/fallback:$PATH pnpm exec vitepress dev docs --host 127.0.0.1
```

At desktop width and 390px, confirm the buddy card remains in its existing visual position, exposes the accessible name `前往提需求`, and resolves to `/help/`. Activate it in the local preview and confirm the help page loads. Confirm the other four icon links and their hover/focus presentation remain unchanged.

- [ ] **Step 8: Commit the tested change**

```bash
git add tests/home-hero-icons.test.ts docs/.vitepress/theme/HomePage.vue
git commit -m "fix: route homepage buddy card to help"
```
