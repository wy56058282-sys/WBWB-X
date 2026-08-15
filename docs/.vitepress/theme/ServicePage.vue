<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from '../case-catalog.data'
import { getServiceChannelState, serviceCatalog, serviceConfig } from '../service-config'

const channelState = getServiceChannelState(serviceConfig)
const relatedCases = data.slice(0, 4)

const serviceLadder = [
  ['需求诊断', `¥${serviceCatalog.diagnosis.price}`, serviceCatalog.diagnosis.duration, '把目标、边界、材料和风险整理成一份固定诊断结论摘要。'],
  ['定制培训', `¥${serviceCatalog.training.priceFrom.toLocaleString()} 起`, serviceCatalog.training.duration, '围绕团队的真实工作流设计线上或线下培训。'],
  ['FDE 现场支持', `¥${serviceCatalog.fde.priceFrom.toLocaleString()} 起`, serviceCatalog.fde.duration, '在约定场景中协助验证工具、资料与协作方式。'],
  ['项目实施', `¥${serviceCatalog.implementation.priceFrom.toLocaleString()} 起`, '', '按确认后的范围交付工作流、资料处理或系统对接成果。'],
  ['持续支持', '', serviceCatalog.ongoingSupport.billing, '为已落地的团队提供复盘、优化和日常答疑支持。'],
] as const

const suitableProblems = [
  '需求还很模糊，需要先理清目标、边界和验收方式',
  '不确定 WorkBuddy 是否能完成，或应该如何拆分任务',
  '需要评估资料、权限、数据安全与实施风险',
  '准备委托后续项目，需要先确认交付物、周期和报价',
]

const deliverables = [
  ['需求边界', '明确本次项目要解决什么，以及暂不解决什么。'],
  ['可行性判断', '根据现有工具、资料和权限判断可实现程度。'],
  ['建议交付物', '列出适合验收的文件、工作流或可运行成果。'],
  ['预估周期', '给出合理的实施阶段与时间预估。'],
  ['关键风险', '提前标记账号、数据、外部系统和结果验证风险。'],
  ['后续建议', '说明适合继续实施、培训或自行完成的下一步。'],
] as const

const process = [
  ['提交需求', '通过商务微信或现有公开入口说明想解决的问题和已有材料。'],
  ['确认范围与时间', '先沟通是否适合承接，再确认服务范围和候选时间。'],
  ['填写报名表', '报名表收集需求与背景、联系方式和 3 个候选时间。'],
  ['发送付款二维码', '服务方确认候选时间后，私下发送 ¥399 付款二维码；完成付款后，预约才锁定。'],
  ['完成诊断', '围绕真实需求进行 45 分钟在线诊断。'],
  ['收到结论', '收到固定诊断结论摘要；如适合继续，同时说明下一步选择。'],
] as const
</script>

<template>
  <div class="wbx-service">
    <header class="wbx-service-offer">
      <div class="wbx-service-offer__copy">
        <p class="wbx-service-eyebrow">CUSTOM SERVICE</p>
        <h1>WorkBuddy 需求诊断</h1>
        <p>用一次结构化沟通，把模糊需求变成可判断、可估算、可交付的项目范围。</p>
        <p>¥{{ serviceCatalog.diagnosis.price }} · {{ serviceCatalog.diagnosis.duration }} · 固定诊断结论摘要</p>
        <a class="wbx-service-action wbx-service-action--primary" href="#service-application">开始需求沟通</a>
      </div>
      <dl class="wbx-service-offer__facts" aria-label="需求诊断服务信息">
        <div>
          <dt>价格</dt>
          <dd>¥{{ serviceCatalog.diagnosis.price }}</dd>
        </div>
        <div>
          <dt>时长</dt>
          <dd>{{ serviceCatalog.diagnosis.duration }}</dd>
        </div>
        <div>
          <dt>固定交付</dt>
          <dd>需求边界、可行性、建议交付物、周期、风险和后续建议的诊断结论摘要。</dd>
        </div>
      </dl>
      <div class="wbx-service-business-wechat" aria-label="商务微信渠道">
        <img
          v-if="channelState.businessWechatReady"
          :src="withBase(serviceConfig.businessWechatQrPath)"
          alt="WorkBuddy 商务微信二维码"
          width="180"
          height="180"
        >
        <span v-if="!channelState.businessWechatReady" aria-disabled="true">
          商务微信即将开放
        </span>
      </div>
    </header>

    <section class="wbx-service-section wbx-service-ladder" aria-labelledby="service-ladder-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">SERVICE LADDER</p>
        <h2 id="service-ladder-title">从诊断到持续支持</h2>
      </div>
      <ol class="wbx-service-ladder__list">
        <li v-for="([title, price, duration, description], index) in serviceLadder" :key="title">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <h3>{{ title }}</h3>
          <p v-if="price || duration"><strong v-if="price">{{ price }}</strong><span v-if="price && duration"> · </span>{{ duration }}</p>
          <p>{{ description }}</p>
        </li>
      </ol>
    </section>

    <section id="enterprise-purchase" class="wbx-service-section wbx-service-enterprise" aria-labelledby="enterprise-purchase-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">ENTERPRISE PURCHASE</p>
        <h2 id="enterprise-purchase-title">腾讯云企业版购买</h2>
      </div>
      <div>
        <p>请先完成腾讯云账号注册及个人实名认证，再通过企业采购渠道咨询适合团队的席位方案。</p>
        <p>企业席位费由腾讯云侧收取，本网站不收取席位费，也不代收工具侧费用。</p>
        <p>购买 20 个及以上席位的团队，可获得一场或两场 90 分钟线上工作坊；无需部署基础设施。简单任务可能获得免费协助，是否提供以实际需求判断为准。</p>
        <div class="wbx-service-enterprise__channel" aria-label="企业采购渠道">
          <img
            v-if="channelState.enterpriseChannelReady"
            :src="withBase(serviceConfig.enterpriseChannelQrPath)"
            alt="WorkBuddy 企业采购渠道二维码"
            width="180"
            height="180"
          >
          <button v-if="!channelState.enterpriseChannelReady" type="button" disabled>企业采购通道准备中</button>
        </div>
      </div>
    </section>

    <section class="wbx-service-section wbx-service-problems" aria-labelledby="service-problems-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">SUITABLE PROBLEMS</p>
        <h2 id="service-problems-title">适合带着这些问题来</h2>
      </div>
      <div>
        <ul class="wbx-service-checklist">
          <li v-for="problem in suitableProblems" :key="problem">
            <i class="hn hn-check-box-solid wbx-service-checklist__icon" aria-hidden="true" />
            <span>{{ problem }}</span>
          </li>
        </ul>
        <h3 id="service-deliverables-title">诊断输出</h3>
        <dl class="wbx-service-output-list" aria-labelledby="service-deliverables-title">
          <div v-for="([title, description], index) in deliverables" :key="title">
            <dt><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ title }}</dt>
            <dd>{{ description }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section id="service-application" class="wbx-service-section wbx-service-process" aria-labelledby="service-process-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">HOW IT WORKS</p>
        <h2 id="service-process-title">先沟通，再确认服务</h2>
      </div>
      <div>
        <ol>
          <li v-for="([title, description], index) in process" :key="title">
            <span>{{ String(index + 1).padStart(2, '0') }}</span>
            <h3>{{ title }}</h3>
            <p>{{ description }}</p>
          </li>
        </ol>
        <a
          v-if="channelState.applicationFormReady"
          class="wbx-service-action wbx-service-action--primary wbx-service-application-link"
          :href="serviceConfig.applicationFormUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="打开需求诊断报名表（在新页面打开）"
        >填写需求诊断报名表</a>
        <button v-if="!channelState.applicationFormReady" type="button" disabled>
          报名表准备中
        </button>
      </div>
    </section>

    <section class="wbx-service-section wbx-service-exclusions" aria-labelledby="service-exclusions-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">NOT INCLUDED</p>
        <h2 id="service-exclusions-title">服务边界</h2>
      </div>
      <div>
        <p>诊断用于范围与可行性判断，不是当场实施。服务不包含：</p>
        <ul>
          <li>完整解决方案或已完成的项目成果</li>
          <li>可直接执行的提示词、代码或 Skill 文件</li>
          <li>工具配置、资料加工、系统对接及其他实施交付</li>
        </ul>
      </div>
    </section>

    <section class="wbx-service-section wbx-service-rules" aria-labelledby="service-rules-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">SERVICE RULES</p>
        <h2 id="service-rules-title">服务规则与隐私</h2>
      </div>
      <dl>
        <div>
          <dt>确认方式</dt>
          <dd>是否承接、服务范围、时间和费用均以双方确认的信息为准。</dd>
        </div>
        <div>
          <dt>改期</dt>
          <dd>需要改期时，请至少在约定时间前 24 小时提出，并重新确认可用时段。</dd>
        </div>
        <div>
          <dt>资料与隐私</dt>
          <dd>资料仅用于本次沟通与服务评估。未完成签约或未进入实施的资料将在 30 天后删除；请勿提交密码、密钥或无关敏感数据。</dd>
        </div>
      </dl>
    </section>

    <section class="wbx-service-section wbx-service-related" aria-labelledby="service-related-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">RELATED CASES</p>
        <h2 id="service-related-title">先看看真实交付结果</h2>
      </div>
      <div class="wbx-service-related__grid">
        <a
          v-for="item in relatedCases"
          :key="item.route"
          class="wbx-service-case"
          :href="withBase(item.route)"
          :aria-label="`查看案例：${item.title}`"
        >
          <img :src="withBase(item.cover)" :alt="item.coverAlt" loading="lazy">
          <span>
            <small>{{ item.category }} · {{ item.productTag }}</small>
            <strong>{{ item.title }}</strong>
            <span>{{ item.outcome }}</span>
          </span>
        </a>
      </div>
    </section>
  </div>
</template>
