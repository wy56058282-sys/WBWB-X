<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from '../case-catalog.data'
import { serviceCatalog, serviceConfig } from '../service-config'

const workshop = serviceConfig.workshop
const diagnosis = serviceCatalog.diagnosis
const relatedCases = data.slice(0, 2)
const [workshopVenue, workshopArea] = workshop.location.split(' · ')
const workshopBenefit = '每 2 周线下面对面交流，收集场景痛点。'
const partnershipBenefit = '企业认证为合作伙伴将免费诊断 3 次。'

const path = [
  { index: '01', title: '参加实战工作坊', price: `¥${workshop.price} / 人`, description: '带着真实办公场景来，在半天内完成一次 AI 智能体实战，先判断方法是否适合你。', benefit: workshopBenefit },
  { index: '02', title: '完成需求诊断', price: `¥${diagnosis.price} / 次`, description: '把目标、边界、交付物和风险说清楚。', benefit: partnershipBenefit },
  { index: '03', title: '进入企业定制项目', price: '按项目评估', description: '针对已确认的业务场景，提供培训、陪跑、实施与持续支持。' },
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
        <p class="wbx-service-header__eyebrow">WORKBUDDY CUSTOM SERVICE</p>
        <h1 class="wbx-service-brand-title"><span>WorkBuddy-X</span><span>定制服务</span></h1>
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

      <section class="wbx-service-hero" aria-label="最近一期工作坊">
        <div class="wbx-service-hero__copy">
          <h2 class="wbx-service-hero__promise">先用一场工作坊，找到值得定制的真问题</h2>
          <p class="wbx-service-hero__lead">每 2 周一期，从 ¥{{ workshop.price }} 的场景实战开始。验证方向后，再进入 ¥{{ diagnosis.price }} 需求诊断与企业定制项目。</p>
          <dl class="wbx-service-hero__facts" aria-label="最近一期工作坊信息">
            <div><dt>时间</dt><dd><span>{{ workshop.date }}</span><span>{{ workshop.time }}</span></dd></div>
            <div><dt>规模</dt><dd>{{ workshop.capacity }}</dd></div>
            <div><dt>地点</dt><dd><span>{{ workshopVenue }}</span><span>{{ workshopArea }}</span></dd></div>
          </dl>
          <div class="wbx-service-actions">
            <div class="wbx-service-registration-trigger">
              <a class="wbx-service-action wbx-service-action--primary" href="#workshop-registration" aria-describedby="workshop-registration-popover">报名最近一期</a>
              <span id="workshop-registration-popover" class="wbx-service-registration-popover" role="tooltip">
                <img :src="withBase(workshop.registrationQrPath)" alt="粗门报名二维码" width="466" height="466">
                <strong>微信扫码报名</strong>
              </span>
            </div>
            <a class="wbx-service-action" href="#enterprise-custom">了解企业服务</a>
          </div>
        </div>
        <figure class="wbx-service-hero__media">
          <a
            class="wbx-service-hero__poster-link"
            :href="workshop.activityDetailUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="查看工作坊活动详情（在新页面打开）"
          >
            <img class="wbx-service-hero__poster" :src="withBase(workshop.coverPath)" alt="WorkBuddy 场景实战工作坊海报" width="1800" height="2400">
          </a>
        </figure>
      </section>

      <section id="workshop-registration" class="wbx-service-section wbx-service-registration" aria-labelledby="registration-title">
        <div class="wbx-service-registration__copy">
          <p class="wbx-service-eyebrow">NEXT WORKSHOP</p>
          <h2 id="registration-title">微信扫码报名并支付</h2>
          <p>小程序将显示本期报名信息与 ¥{{ workshop.price }} 支付入口。席位有限，满员后进入下一期通知。</p>
          <dl>
            <div><dt>日期</dt><dd>{{ workshop.date }}</dd></div>
            <div><dt>时间</dt><dd>{{ workshop.time }}</dd></div>
            <div><dt>人数</dt><dd>{{ workshop.capacity }}</dd></div>
            <div><dt>地点</dt><dd>{{ workshop.location }}</dd></div>
          </dl>
        </div>
        <figure class="wbx-service-registration__poster">
          <img :src="withBase(workshop.registrationPosterPath)" alt="WorkBuddy 工作坊报名海报，含微信小程序二维码" width="1800" height="2400">
          <figcaption>请使用微信扫码，完成报名与支付</figcaption>
        </figure>
      </section>

      <section class="wbx-service-section wbx-service-problems" aria-labelledby="problems-title">
        <div class="wbx-service-section__heading">
          <p class="wbx-service-eyebrow">WHY THIS PATH</p>
          <h2 id="problems-title">不同阶段，只解决当下最重要的问题</h2>
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
          <a class="wbx-service-action wbx-service-action--primary" href="#workshop-registration">先参加工作坊</a>
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
