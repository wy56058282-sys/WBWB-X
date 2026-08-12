<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import {
  fetchHomeAnalytics,
  type HomeAnalyticsConfig,
  type HomeAnalyticsSnapshot,
} from './homeAnalytics'

const HOME_ANALYTICS_REFRESH_MS = 300_000

const props = defineProps<{ config: HomeAnalyticsConfig }>()
const data = ref<HomeAnalyticsSnapshot | null>(null)
const state = ref<'loading' | 'ready' | 'stale' | 'error'>('loading')
let timer: ReturnType<typeof window.setInterval> | undefined
let requestInFlight = false
let controller: AbortController | undefined

const metrics = [
  ['今日访问', 'todayVisits'],
  ['今日浏览', 'todayPageviews'],
  ['累计访问', 'lifetimeVisits'],
  ['累计浏览', 'lifetimePageviews'],
] as const

function displayValue(key: typeof metrics[number][1]) {
  if (!data.value) return state.value === 'loading' ? '···' : '--'
  return new Intl.NumberFormat('zh-CN').format(data.value[key])
}

async function refresh() {
  if (requestInFlight || document.hidden) return
  requestInFlight = true
  controller = new AbortController()
  try {
    data.value = await fetchHomeAnalytics(props.config, { signal: controller.signal })
    state.value = 'ready'
  } catch (error) {
    if ((error as Error).name !== 'AbortError') state.value = data.value ? 'stale' : 'error'
  } finally {
    requestInFlight = false
  }
}

function handleVisibilityChange() {
  if (!document.hidden && (!data.value || Date.now() - data.value.fetchedAt >= HOME_ANALYTICS_REFRESH_MS)) {
    void refresh()
  }
}

onMounted(() => {
  void refresh()
  timer = window.setInterval(() => { void refresh() }, HOME_ANALYTICS_REFRESH_MS)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  controller?.abort()
})
</script>

<template>
  <section class="wbx-home-analytics" aria-label="网站访问统计">
    <div class="wbx-home-analytics__status">
      <span aria-hidden="true" />
      <strong>LIVE</strong>
      <span class="wbx-sr-only" role="status">
        {{ state === 'ready' ? '统计已同步' : state === 'loading' ? '统计连接中' : '统计暂未同步' }}
      </span>
    </div>
    <dl>
      <div v-for="([label, key]) in metrics" :key="key">
        <dt>{{ label }}</dt>
        <dd>{{ displayValue(key) }}</dd>
        <small>{{ key.includes('Pageviews') ? 'PV' : 'VISITS' }}</small>
      </div>
    </dl>
  </section>
</template>
