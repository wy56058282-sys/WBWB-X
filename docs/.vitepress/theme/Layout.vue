<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { computed } from 'vue'
import HomePage from './HomePage.vue'

const route = useRoute()
const isHome = computed(() => route.path === '/')
</script>

<template>
  <DefaultTheme.Layout :class="{ 'wbx-home-layout': isHome }">
    <template #home-hero-before>
      <HomePage v-if="isHome" />
    </template>

    <!-- Task 6 owns the global CommunityQr mount at this layout boundary. -->
  </DefaultTheme.Layout>
</template>
