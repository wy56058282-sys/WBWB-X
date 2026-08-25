<script setup lang="ts">
import { withBase } from 'vitepress'
import AboutPage from './AboutPage.vue'
import './enterprise-services.css'

const contactEmail = 'contact@sparkx.zone'
const services = [
  {
    id: 'diagnosis',
    label: '01 · DIAGNOSIS',
    title: '需求诊断',
    description: '先明确目标、输入、流程和交付标准，找到最适合当前阶段的合作方式。',
    action: '预约需求诊断',
    href: `mailto:${contactEmail}?subject=${encodeURIComponent('WorkBuddy-X 需求诊断咨询')}`,
    recommended: true,
  },
  {
    id: 'training',
    label: '02 · TRAINING',
    title: '团队培训',
    description: '适合需要统一基础方法和建立协作共识的团队。',
    action: '沟通培训需求',
    href: `mailto:${contactEmail}?subject=${encodeURIComponent('WorkBuddy-X 团队培训咨询')}`,
    recommended: false,
  },
  {
    id: 'workshop',
    label: '03 · WORKSHOP',
    title: '场景工作坊',
    description: '适合已有明确场景、希望通过实战验证工作流程的团队。',
    action: '查看近期活动',
    href: withBase('/#workshop-registration'),
    recommended: false,
  },
  {
    id: 'custom',
    label: '04 · CUSTOM',
    title: '企业定制',
    description: '适合场景已经明确、需要专属 Skill、Agent 和工作流程落地的团队。',
    action: '沟通企业场景',
    href: `mailto:${contactEmail}?subject=${encodeURIComponent('WorkBuddy-X 企业定制咨询')}`,
    recommended: false,
  },
] as const
</script>

<template>
  <div class="wbx-enterprise">
    <header class="wbx-enterprise__hero wbx-page-header">
      <p class="wbx-pixel-label">ENTERPRISE SERVICES</p>
      <h1>企业服务</h1>
      <p>从问题梳理到场景落地，把 AI 变成可执行、可验收、可复用的工作系统。你可以从需求诊断开始，也可以直接选择培训、工作坊或企业定制。</p>
    </header>

    <section class="wbx-enterprise__services" aria-labelledby="enterprise-services-title">
      <div class="wbx-enterprise__heading">
        <p class="wbx-pixel-label">HOW WE WORK</p>
        <h2 id="enterprise-services-title">选择适合你的合作方式</h2>
        <p>还不确定从哪里开始？建议先进行需求诊断。</p>
      </div>
      <div class="wbx-enterprise__grid">
        <article v-for="service in services" :id="service.id" :key="service.id" class="wbx-enterprise-service" :class="{ 'is-recommended': service.recommended }">
          <div class="wbx-enterprise-service__meta">
            <p class="wbx-pixel-label">{{ service.label }}</p>
            <span v-if="service.recommended">推荐起点</span>
          </div>
          <h3>{{ service.title }}</h3>
          <p>{{ service.description }}</p>
          <a :href="service.href">{{ service.action }}</a>
        </article>
      </div>
    </section>

    <AboutPage
      embedded
      team-label="DELIVERY TEAM"
      team-title="场景教练与前线部署工程师（FDE）"
      team-description="汇集产品、设计、运营与 AI 实践者，为培训、工作坊和企业场景落地提供一线支持。"
    />
  </div>
</template>
