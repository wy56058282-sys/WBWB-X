<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { data } from '../case-catalog.data'
import { serviceCatalog, serviceConfig } from '../service-config'

const workshop = serviceConfig.workshop
const diagnosis = serviceCatalog.diagnosis
const relatedCases = data.slice(0, 2)
const [workshopVenue, workshopArea] = workshop.location.split(' · ')
const workshopBenefit = '每 2 周线下面对面交流，收集场景痛点。'
const partnershipBenefit = '企业认证为合作伙伴将免费诊断 3 次。'
const guestTeachers = [
  { name: '王翔旭', image: '/article-assets/service/guest-wang-xiangxu.png' },
  { name: '黄学铃', image: '/article-assets/service/guest-huang-xueling.png' },
  { name: '李泽慧', image: '/article-assets/service/guest-li-zehui.png' },
  { name: '王劲松', image: '/article-assets/service/guest-wang-jinsong.png' },
  { name: '刘鹏振', image: '/article-assets/service/guest-liu-pengzhen.png' },
  { name: '丁怡豪', image: '/article-assets/service/guest-ding-yihao.png' },
] as const

const workshopEditions = [
  { id: '815', name: '第一期', date: '08.15', fullDate: '2026 年 8 月 15 日', time: workshop.time, capacity: workshop.capacity, venue: workshopVenue, area: workshopArea, coverPath: '/article-assets/service/workshop-815.png', posterPaths: ['/article-assets/service/workshop-815.png', '/article-assets/service/workshop-815-agenda.png', '/article-assets/service/workshop-815-benefits.png', '/article-assets/service/workshop-815-reminder.png'], activityDetailUrl: 'https://mp.weixin.qq.com/s/q7Bq2kEmsYlgI4pTZ59srw' },
  { id: '829', name: '第二期', date: '08.29', fullDate: workshop.date, time: workshop.time, capacity: workshop.capacity, venue: workshopVenue, area: workshopArea, coverPath: workshop.coverPath, posterPaths: [workshop.coverPath, '/article-assets/service/workshop-829-agenda.png', '/article-assets/service/workshop-829-benefits.png', '/article-assets/service/workshop-829-reminder.png'], activityDetailUrl: workshop.activityDetailUrl },
  { id: '912', name: '第三期', date: '09.12', fullDate: '2026 年 9 月 12 日', time: workshop.time, capacity: workshop.capacity, venue: workshopVenue, area: workshopArea, coverPath: '/article-assets/service/workshop-912.png', posterPaths: ['/article-assets/service/workshop-912.png'], activityDetailUrl: '' },
] as const
const selectedWorkshopIndex = ref(1)
const selectedPosterIndex = ref(0)
const isMentorJoinOpen = ref(false)
const mentorJoin = ref<HTMLElement | null>(null)
const selectedWorkshop = computed(() => workshopEditions[selectedWorkshopIndex.value])
const selectedPosterPath = computed(() => selectedWorkshop.value.posterPaths[selectedPosterIndex.value])

function selectWorkshop(index: number) {
  selectedWorkshopIndex.value = index
  selectedPosterIndex.value = 0
}

function selectAdjacentPoster(offset: -1 | 1) {
  const pageCount = selectedWorkshop.value.posterPaths.length
  selectedPosterIndex.value = (selectedPosterIndex.value + offset + pageCount) % pageCount
}

function closeMentorJoin() {
  isMentorJoinOpen.value = false
}

function handleMentorJoinOutsideClick(event: PointerEvent) {
  if (!mentorJoin.value?.contains(event.target as Node)) closeMentorJoin()
}

onMounted(() => document.addEventListener('pointerdown', handleMentorJoinOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleMentorJoinOutsideClick))

function handleWorkshopTabKeydown(event: KeyboardEvent, index: number) {
  const lastIndex = workshopEditions.length - 1
  let nextIndex = index
  if (event.key === 'ArrowRight') nextIndex = index === lastIndex ? 0 : index + 1
  else if (event.key === 'ArrowLeft') nextIndex = index === 0 ? lastIndex : index - 1
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = lastIndex
  else return

  event.preventDefault()
  selectWorkshop(nextIndex)
  const tabs = (event.currentTarget as HTMLElement).parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
  tabs?.[nextIndex]?.focus()
}

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

      <section class="wbx-service-hero" aria-labelledby="workshop-title">
        <div
          id="workshop-panel"
          class="wbx-service-hero__panel"
          role="tabpanel"
          :aria-labelledby="`workshop-tab-${selectedWorkshop.id}`"
        >
          <div class="wbx-service-hero__copy">
            <div class="wbx-service-hero__heading">
              <p class="wbx-service-eyebrow">WORKBUDDY X WORKSHOP</p>
              <h2 id="workshop-title">WorkBuddy X 工作坊 <span class="wbx-service-hero__title-edition">{{ selectedWorkshop.name }}</span></h2>
              <p class="wbx-service-section__summary">先用一场工作坊，找到值得定制的真问题</p>
            </div>
            <h2 class="wbx-service-hero__promise">场景实战工作坊</h2>
            <p class="wbx-service-hero__tagline">掌握 AI · 掌控未来</p>
            <p class="wbx-service-hero__audience">面向人群：创业者、管理者、设计师、超级个体、一人公司（OPC）</p>
            <dl class="wbx-service-hero__facts" :aria-label="`${selectedWorkshop.name}工作坊信息`">
              <div><dt>时间</dt><dd><span>{{ selectedWorkshop.fullDate }}</span><span>{{ selectedWorkshop.time }}</span></dd></div>
              <div><dt>规模</dt><dd>{{ selectedWorkshop.capacity }}</dd></div>
              <div><dt>地点</dt><dd><span>{{ selectedWorkshop.venue }}</span><span>{{ selectedWorkshop.area }}</span></dd></div>
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
              v-if="selectedWorkshop.activityDetailUrl"
              class="wbx-service-hero__poster-link"
              :href="selectedWorkshop.activityDetailUrl"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="`查看工作坊活动详情（${selectedWorkshop.name}，在新页面打开）`"
            >
              <img class="wbx-service-hero__poster" :src="withBase(selectedPosterPath)" :alt="`WorkBuddy 场景实战工作坊海报（${selectedWorkshop.name}，第 ${selectedPosterIndex + 1} 页）`" width="1800" height="2400">
            </a>
            <div v-else class="wbx-service-hero__poster-frame">
              <img class="wbx-service-hero__poster" :src="withBase(selectedPosterPath)" :alt="`WorkBuddy 场景实战工作坊海报（${selectedWorkshop.name}，第 ${selectedPosterIndex + 1} 页）`" width="1800" height="2400">
            </div>
            <div class="wbx-service-hero__poster-navigation" aria-label="切换海报页面">
              <span class="wbx-service-hero__poster-page" aria-live="polite">{{ selectedPosterIndex + 1 }} / {{ selectedWorkshop.posterPaths.length }}</span>
              <div v-if="selectedWorkshop.posterPaths.length > 1" class="wbx-service-hero__poster-actions">
                <button
                  class="wbx-service-hero__poster-control wbx-service-hero__poster-control--previous"
                  type="button"
                  aria-label="查看上一张海报"
                  @click="selectAdjacentPoster(-1)"
                ><span aria-hidden="true">←</span></button>
                <button
                  class="wbx-service-hero__poster-control wbx-service-hero__poster-control--next"
                  type="button"
                  aria-label="查看下一张海报"
                  @click="selectAdjacentPoster(1)"
                ><span aria-hidden="true">→</span></button>
              </div>
            </div>
          </figure>
        </div>
        <div class="wbx-service-editions" role="tablist" aria-label="选择工作坊期次">
          <button
            v-for="(edition, index) in workshopEditions"
            :id="`workshop-tab-${edition.id}`"
            :key="edition.id"
            class="wbx-service-edition"
            type="button"
            role="tab"
            aria-controls="workshop-panel"
            :aria-selected="selectedWorkshopIndex === index"
            :tabindex="selectedWorkshopIndex === index ? 0 : -1"
            :aria-label="`查看${edition.name} ${edition.date} 工作坊信息`"
            @click="selectWorkshop(index)"
            @keydown="handleWorkshopTabKeydown($event, index)"
          >
            <img :src="withBase(edition.coverPath)" alt="" width="1800" height="2400">
            <span><strong>{{ edition.name }}</strong><span>{{ edition.date }}</span><small v-if="selectedWorkshopIndex === index">当前</small></span>
          </button>
        </div>
      </section>

      <section id="workshop-registration" class="wbx-service-section wbx-service-guests" aria-labelledby="guests-title">
        <div class="wbx-service-section__heading">
          <div class="wbx-service-section__title-group">
            <p class="wbx-service-eyebrow">GUEST TEACHERS</p>
            <h2 id="guests-title">场景教练和前线部署工程师（FDE）</h2>
          </div>
          <p class="wbx-service-section__summary">来自产品、设计、运营与 AI 实践的一线嘉宾，共同带你完成真实场景实战。</p>
        </div>
        <div class="wbx-service-guests__grid">
          <figure v-for="guest in guestTeachers" :key="guest.name" class="wbx-service-guest" tabindex="0">
            <img :src="withBase(guest.image)" :alt="`嘉宾老师${guest.name}`" loading="lazy">
          </figure>
        </div>
        <div ref="mentorJoin" class="wbx-service-join">
          <button
            class="wbx-service-action wbx-service-action--primary wbx-service-join__trigger"
            type="button"
            aria-controls="mentor-join-popover"
            :aria-expanded="isMentorJoinOpen"
            @click="isMentorJoinOpen = !isMentorJoinOpen"
            @keydown.esc.stop="closeMentorJoin"
          >加入我们</button>
          <div
            id="mentor-join-popover"
            class="wbx-service-join__popover"
            :class="{ 'is-open': isMentorJoinOpen }"
            :aria-hidden="!isMentorJoinOpen"
          >
            <strong>主理人微信：NICKY_YI</strong>
            <span>联系主理人沟通确认后加入导师与 FDE 团队</span>
          </div>
        </div>
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
