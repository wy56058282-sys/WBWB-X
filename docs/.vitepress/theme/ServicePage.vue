<script setup lang="ts">
import { withBase } from 'vitepress'
import { data } from '../case-catalog.data'
import { isPaidServiceReady, serviceConfig } from '../service-config'

const paidServiceReady = isPaidServiceReady(serviceConfig)
const relatedCases = data.slice(0, 4)

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
  ['项目报价', '对可承接的后续项目提供正式范围与报价。'],
] as const

const process = [
  ['阅读规则', '确认服务范围、不包含内容与预约规则。'],
  ['微信支付', '预约开放后，扫码支付 ¥399 并按要求备注。'],
  ['填写表单', '提交联系方式、需求背景、现有材料和付款截图。'],
  ['确认时间', '我们核对信息，并从你提供的候选时段中确认一个。'],
  ['完成诊断', '围绕真实需求进行 45 分钟在线诊断。'],
  ['收到结论', '收到诊断结论；如适合继续，同时收到后续项目报价。'],
] as const
</script>

<template>
  <main class="wbx-service">
    <header class="wbx-service-offer">
      <div class="wbx-service-offer__copy">
        <p class="wbx-service-eyebrow">CUSTOM SERVICE</p>
        <h1>WorkBuddy 需求诊断</h1>
        <p>用一次结构化沟通，把模糊需求变成可判断、可估算、可交付的项目范围。</p>
        <a class="wbx-service-action wbx-service-action--primary" href="#payment-and-application">查看付款与申请步骤</a>
      </div>
      <dl class="wbx-service-offer__facts" aria-label="服务信息">
        <div>
          <dt>价格</dt>
          <dd>¥399 / 次</dd>
        </div>
        <div>
          <dt>时长</dt>
          <dd>45 分钟</dd>
        </div>
        <div>
          <dt>项目抵扣</dt>
          <dd>诊断完成后 7 个自然日内确认同一需求并支付后续项目首款，¥399 全额抵扣项目费用。</dd>
        </div>
      </dl>
    </header>

    <section class="wbx-service-section wbx-service-problems" aria-labelledby="service-problems-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">SUITABLE PROBLEMS</p>
        <h2 id="service-problems-title">适合带着这些问题来</h2>
      </div>
      <ul class="wbx-service-checklist">
        <li v-for="problem in suitableProblems" :key="problem">{{ problem }}</li>
      </ul>
    </section>

    <section class="wbx-service-section wbx-service-deliverables" aria-labelledby="service-deliverables-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">DIAGNOSTIC OUTPUT</p>
        <h2 id="service-deliverables-title">45 分钟诊断会带走什么</h2>
      </div>
      <dl class="wbx-service-output-list">
        <div v-for="([title, description], index) in deliverables" :key="title">
          <dt><span>{{ String(index + 1).padStart(2, '0') }}</span>{{ title }}</dt>
          <dd>{{ description }}</dd>
        </div>
      </dl>
    </section>

    <section class="wbx-service-section wbx-service-exclusions" aria-labelledby="service-exclusions-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">NOT INCLUDED</p>
        <h2 id="service-exclusions-title">本次诊断不包含</h2>
      </div>
      <div>
        <p>诊断是范围与可行性判断，不是当场实施。服务不包含：</p>
        <ul>
          <li>完整解决方案或已完成的项目成果</li>
          <li>可直接执行的提示词、代码或 Skill 文件</li>
          <li>工具配置、资料加工、系统对接及其他实施交付</li>
        </ul>
      </div>
    </section>

    <section class="wbx-service-section wbx-service-process" aria-labelledby="service-process-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">HOW IT WORKS</p>
        <h2 id="service-process-title">从申请到收到结论</h2>
      </div>
      <ol>
        <li v-for="([title, description], index) in process" :key="title">
          <span>{{ String(index + 1).padStart(2, '0') }}</span>
          <h3>{{ title }}</h3>
          <p>{{ description }}</p>
        </li>
      </ol>
    </section>

    <section id="payment-and-application" class="wbx-service-section wbx-service-payment" aria-labelledby="service-payment-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">PAYMENT &amp; APPLICATION</p>
        <h2 id="service-payment-title">付款与申请</h2>
      </div>
      <div v-if="paidServiceReady" class="wbx-service-payment__ready">
        <figure class="wbx-service-payment__qr-wrap">
          <img
            class="wbx-service-payment-qr"
            :src="withBase(serviceConfig.paymentQrPath)"
            alt="微信支付 WorkBuddy 需求诊断费用二维码"
            width="280"
            height="280"
          >
          <figcaption>扫码支付 ¥399，付款备注请填写申请人姓名与手机号后四位。同设备访问时，保存二维码，在微信“扫一扫”中从相册识别；无法完成时联系支持人员。</figcaption>
        </figure>
        <div class="wbx-service-payment__instructions">
          <h3>付款后填写诊断申请表</h3>
          <p>表单需要联系方式、需求背景、目标、现有材料、付款截图和 3 个候选时段。</p>
          <a
            class="wbx-service-action wbx-service-action--primary wbx-service-application-link"
            :href="serviceConfig.paidDiagnosticFormUrl"
            target="_blank"
            rel="noopener noreferrer"
          >打开付费诊断申请表</a>
          <p class="wbx-service-payment__notice">预计 {{ serviceConfig.confirmationWindow }}；如需核对，请联系 {{ serviceConfig.supportContact }}。</p>
        </div>
      </div>
      <div v-else class="wbx-service-payment__closed" role="status">
        <strong>暂未开放预约</strong>
        <p>付款二维码、独立申请表与确认联系方式尚未全部就绪。在这些生产资料经运营方确认前，不接收付款或预约申请。</p>
      </div>
    </section>

    <section class="wbx-service-section wbx-service-rules" aria-labelledby="service-rules-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">SERVICE RULES</p>
        <h2 id="service-rules-title">预约前请确认这些规则</h2>
      </div>
      <dl>
        <div>
          <dt>退款边界</dt>
          <dd>如服务方在诊断开始前确认需求明显不适合承接，可原路退还诊断费；诊断已经开始或完成后不退款。</dd>
        </div>
        <div>
          <dt>改期</dt>
          <dd>需要改期时，请至少在约定时间前 24 小时提出，并重新确认可用时段。</dd>
        </div>
        <div>
          <dt>迟到</dt>
          <dd>迟到不延长预约结束时间；迟到超过 15 分钟，视为放弃当次服务。</dd>
        </div>
        <div>
          <dt>项目抵扣</dt>
          <dd>仅适用于诊断完成后 7 个自然日内确认并支付后续项目首款的同一需求，诊断费 ¥399 全额抵扣。</dd>
        </div>
        <div>
          <dt>资料与隐私</dt>
          <dd>付款截图和需求资料仅限服务人员核对、诊断使用；未成交项目在诊断完成后 30 天删除，成交项目按交付周期保留。请勿提交密码、密钥或无关敏感数据。</dd>
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

    <section id="scenario-survey" class="wbx-service-section wbx-service-survey" aria-labelledby="service-survey-title">
      <div class="wbx-service-section__heading">
        <p class="wbx-service-eyebrow">FREE CASE SUBMISSION</p>
        <h2 id="service-survey-title">免费案例投稿</h2>
      </div>
      <div class="wbx-service-survey__content">
        <div>
          <h3>WorkBuddy 需求与案例投稿问卷</h3>
          <p>这是免费社区共建入口，与付费需求诊断分开。提交案例时，请在场景描述开头注明“【案例投稿】”，无需 GitHub。</p>
          <p>请勿提交密码、密钥、客户隐私或不方便公开的内部资料。</p>
        </div>
        <a
          class="wbx-service-survey__media"
          :href="withBase('/article-assets/source-calibration/help/001.png')"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="查看 WorkBuddy 需求与案例投稿问卷二维码大图"
        >
          <img
            class="wbx-service-survey__image"
            :src="withBase('/article-assets/source-calibration/help/001.png')"
            alt="WorkBuddy 需求与案例投稿问卷二维码"
            loading="lazy"
          >
        </a>
      </div>
    </section>
  </main>
</template>
