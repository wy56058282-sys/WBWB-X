<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from '../case-catalog.data'
import { serviceCatalog, serviceConfig } from '../service-config'

const workshop = serviceConfig.workshop
const diagnosis = serviceCatalog.diagnosis
const relatedCases = data.slice(0, 2)
const workshopBenefit = '每 2 周线下面对面交流，收集场景痛点。'
const partnershipBenefit = '企业认证为合作伙伴将免费诊断 3 次。'

const path = [
  { index: '01', title: '参加实战工作坊', price: `¥${workshop.price} / 人`, description: '带着真实办公场景来，在半天内完成一次 AI 智能体实战，先判断方法是否适合你。', benefit: workshopBenefit },
  { index: '02', title: '完成需求诊断', price: `¥${diagnosis.price} / 次`, description: '围绕真实业务场景，把目标、使用对象、流程边界、交付标准和实施风险逐项说清，形成可评估、可执行的需求方案。', benefit: partnershipBenefit },
  { index: '03', title: '进入企业定制项目', price: '按项目评估', description: '针对已确认的业务场景，提供培训、陪跑、实施与持续支持。', benefit: '由专业腾讯官方签约服务商提供技术支持。' },
] as const

const problems = [
  ['不知道从哪里开始', '先在工作坊里体验一个完整场景，找到值得投入的真实问题。'],
  ['需求说不清、范围定不下', '通过需求诊断形成目标、边界、交付物、周期和风险判断。'],
  ['团队需要真正落地', '确认项目后，再进入培训、共创、系统实施与持续运营。'],
] as const
</script>

<template>
  <div class="wbx-service">
    <header class="wbx-service-header">
      <div class="wbx-service-header__title">
        <h1 class="wbx-service-brand-title"><span>WorkBuddy-X</span><span>服务</span></h1>
        <p class="wbx-service-header__summary">从一场工作坊验证真实问题，再进入需求诊断与企业定制落地。</p>
      </div>
    </header>

    <main class="wbx-service-main">
      <section class="wbx-service-section wbx-service-journey" aria-labelledby="service-path-title">
        <div class="wbx-service-section__heading">
          <div class="wbx-service-section__title-group">
            <p class="wbx-service-eyebrow">ONE CLEAR PATH</p>
            <h2 id="service-path-title">从一次体验，到一个可落地项目</h2>
          </div>
          <p class="wbx-service-section__summary">先体验、再诊断、后定制，让每一步投入都建立在真实问题之上。</p>
        </div>
        <ol class="wbx-service-path">
          <li v-for="item in path" :key="item.title" class="wbx-service-path__item" tabindex="0">
            <span>{{ item.index }}</span><h3>{{ item.title }}</h3><strong>{{ item.price }}</strong><p>{{ item.description }}</p>
            <p v-if="'benefit' in item" class="wbx-service-path__benefit">{{ item.benefit }}</p>
          </li>
        </ol>
      </section>

      <section class="wbx-service-section wbx-service-problems" aria-labelledby="problems-title">
        <div class="wbx-service-section__heading">
          <div class="wbx-service-section__title-group">
            <p class="wbx-service-eyebrow">WHY THIS PATH</p>
            <h2 id="problems-title">不同阶段，只解决当下最重要的问题</h2>
          </div>
          <p class="wbx-service-section__summary">从体验、诊断到落地，让每一步只解决当前最关键的问题。</p>
        </div>
        <ul class="wbx-service-problem">
          <li v-for="([title, description], index) in problems" :key="title" class="wbx-service-problem__item">
            <span>{{ String(index + 1).padStart(2, '0') }}</span><h3>{{ title }}</h3><p>{{ description }}</p>
          </li>
        </ul>
      </section>

      <section id="enterprise-custom" class="wbx-service-section wbx-service-enterprise" aria-labelledby="enterprise-title">
        <div class="wbx-service-section__heading">
          <p class="wbx-service-eyebrow">ENTERPRISE CUSTOM</p>
          <h2 id="enterprise-title">诊断确认后，再进入企业定制</h2>
        </div>
        <div class="wbx-service-enterprise__body">
          <p>适合已有明确负责人、真实业务场景和实施意愿的团队。我们先完成 45 分钟需求诊断，再根据范围给出项目建议。</p>
          <p class="wbx-service-enterprise__benefit">{{ partnershipBenefit }}</p>
          <ul><li>团队培训与场景共创</li><li>业务流程陪跑与验证</li><li>工作流、资料与系统实施</li><li>上线后的持续优化支持</li></ul>
          <a class="wbx-service-action wbx-service-action--primary" :href="withBase('/#workshop-registration')">先参加工作坊</a>
        </div>
      </section>

      <section class="wbx-service-section wbx-service-related" aria-labelledby="related-title">
        <div class="wbx-service-section__heading">
          <p class="wbx-service-eyebrow">REAL OUTCOMES</p>
          <h2 id="related-title">看看 WorkBuddy 已经怎样进入真实工作</h2>
        </div>
        <div class="wbx-service-related__grid">
          <a v-for="item in relatedCases" :key="item.route" class="wbx-service-case" :href="withBase(item.route)" :aria-label="`查看案例：${item.title}`">
            <img :src="withBase(item.cover)" :alt="item.coverAlt" loading="lazy"><span><small>{{ item.category }} · {{ item.productTag }}</small><strong>{{ item.title }}</strong><span>{{ item.outcome }}</span></span>
          </a>
        </div>
      </section>
    </main>
  </div>
</template>
