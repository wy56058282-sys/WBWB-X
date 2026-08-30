import { configDefaults, defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  define: {
    __WBX_WORKSHOP_BUILD_TIME__: JSON.stringify('2026-08-24T04:00:00.000Z'),
  },
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    exclude: [
      ...configDefaults.exclude,
      '**/.worktrees/**',
      '**/.pnpm-store/**',
    ],
  },
})
