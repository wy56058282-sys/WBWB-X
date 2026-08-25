<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <section class="wbx-case-service-cta" aria-labelledby="case-service-cta-title">
    <div>
      <p class="wbx-cases-eyebrow">WORKBUDDY SERVICE</p>
      <h2 id="case-service-cta-title">有类似需求？</h2>
      <p>先用一次需求诊断，把目标、范围和下一步理清楚。</p>
    </div>
    <a class="wbx-cases-action wbx-cases-action--primary" :href="withBase('/services/#diagnosis')">预约付费诊断</a>
  </section>
</template>
