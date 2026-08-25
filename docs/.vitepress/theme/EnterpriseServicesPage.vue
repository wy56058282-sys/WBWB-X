<script setup lang="ts">
import { withBase } from 'vitepress'
import AboutPage from './AboutPage.vue'

const contactEmail = 'contact@sparkx.zone'
const services = [
  {
    id: 'training',
    label: '01 · TRAINING',
    title: '团队培训',
    description: '围绕真实工作任务，帮助团队建立 WorkBuddy 的基础使用方法与协作共识。',
    action: '沟通培训需求',
    href: `mailto:${contactEmail}?subject=${encodeURIComponent('WorkBuddy-X 团队培训咨询')}`,
  },
  {
    id: 'workshop',
    label: '02 · WORKSHOP',
    title: '场景工作坊',
    description: '通过线下或线上实战，把一个明确场景拆成可执行、可验收的工作流程。',
    action: '查看近期活动',
    href: withBase('/#workshop-registration'),
  },
  {
    id: 'diagnosis',
    label: '03 · DIAGNOSIS',
    title: '需求诊断',
    description: '一起梳理目标、输入、流程与交付标准，判断下一步适合培训、工作坊还是定制。',
    action: '预约需求诊断',
    href: `mailto:${contactEmail}?subject=${encodeURIComponent('WorkBuddy-X 需求诊断咨询')}`,
  },
  {
    id: 'custom',
    label: '04 · CUSTOM',
    title: '企业定制',
    description: '针对已明确的企业场景，沟通专属 Skill、Agent 协作和工作流程的落地方式。',
    action: '沟通企业场景',
    href: `mailto:${contactEmail}?subject=${encodeURIComponent('WorkBuddy-X 企业定制咨询')}`,
  },
] as const
</script>

<template>
  <div class="wbx-enterprise">
    <header class="wbx-enterprise__hero">
      <p class="wbx-pixel-label">ENTERPRISE SERVICES</p>
      <h1>从真实场景出发，<br>把 AI 变成可交付的工作系统。</h1>
      <p>围绕团队学习、场景验证与企业落地，先把当前最重要的问题说清楚，再选择合适的合作方式。</p>
    </header>

    <section class="wbx-enterprise__services" aria-labelledby="enterprise-services-title">
      <div class="wbx-enterprise__heading">
        <p class="wbx-pixel-label">WHAT WE DO</p>
        <h2 id="enterprise-services-title">企业服务</h2>
      </div>
      <div class="wbx-enterprise__grid">
        <article v-for="service in services" :id="service.id" :key="service.id" class="wbx-enterprise-service">
          <p class="wbx-pixel-label">{{ service.label }}</p>
          <h2>{{ service.title }}</h2>
          <p>{{ service.description }}</p>
          <a :href="service.href">{{ service.action }}</a>
        </article>
      </div>
    </section>

    <AboutPage embedded />
  </div>
</template>
