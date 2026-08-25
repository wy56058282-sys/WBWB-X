<script setup lang="ts">
import { withBase } from 'vitepress'
import { onMounted } from 'vue'

const props = withDefaults(defineProps<{
  target: string
  preserveHash?: boolean
}>(), {
  preserveHash: false,
})

const targetPath = withBase(props.target)

onMounted(() => {
  const [path, targetHash = ''] = targetPath.split('#')
  const hash = targetHash ? `#${targetHash}` : props.preserveHash ? window.location.hash : ''
  window.location.replace(`${path}${window.location.search}${hash}`)
})
</script>

<template>
  <div class="wbx-legacy-redirect">
    <p>页面已迁移，正在前往新页面。</p>
    <a :href="targetPath">立即前往</a>
  </div>
</template>
