<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { brand } from '../brand'
import HomeAnalyticsStrip from './HomeAnalyticsStrip.vue'
import HomeWorkshop from './HomeWorkshop.vue'
import { readHomeAnalyticsConfig } from './homeAnalytics'
import { homeUpdates } from './homeUpdates'
import { marketingReveal as vMarketingReveal } from './marketingReveal'
import './home.css'

const homeAnalyticsConfig = readHomeAnalyticsConfig(import.meta.env)

const sortedHomeUpdates = [...homeUpdates].sort((a, b) =>
  b.date.localeCompare(a.date),
)

const whitepapers = [
  {
    id: 'wbx',
    title: 'WorkBuddy X 白皮书',
    href: '/wb-x/',
    cover: '/whitepapers/workbuddy-x-cover.webp',
  },
  {
    id: 'opc',
    title: 'WorkBuddy OPC 白皮书',
    href: '/opc/',
    cover: '/whitepapers/workbuddy-opc-cover.webp',
  },
]

const rotatingTitles = ['X', 'OPC']
const rotatingTitle = ref('')
let rotatingTitleIndex = 0
let titleTimer: ReturnType<typeof setTimeout> | undefined
let reducedMotionQuery: MediaQueryList | undefined

function clearTitleTimer() {
  if (titleTimer === undefined) return
  clearTimeout(titleTimer)
  titleTimer = undefined
}

function scheduleTitleStep(callback: () => void, delay: number) {
  clearTitleTimer()
  titleTimer = setTimeout(() => {
    titleTimer = undefined
    callback()
  }, delay)
}

function typeTitle() {
  const title = rotatingTitles[rotatingTitleIndex]
  rotatingTitle.value = title.slice(0, rotatingTitle.value.length + 1)

  if (rotatingTitle.value === title) {
    scheduleTitleStep(eraseTitle, 1600)
    return
  }

  scheduleTitleStep(typeTitle, 120)
}

function eraseTitle() {
  rotatingTitle.value = rotatingTitle.value.slice(0, -1)

  if (rotatingTitle.value) {
    scheduleTitleStep(eraseTitle, 80)
    return
  }

  rotatingTitleIndex = (rotatingTitleIndex + 1) % rotatingTitles.length
  scheduleTitleStep(typeTitle, 240)
}

function syncTitleMotion(reduced: boolean) {
  clearTitleTimer()
  rotatingTitleIndex = 0

  if (reduced) {
    rotatingTitle.value = 'X / OPC'
    return
  }

  rotatingTitle.value = ''
  scheduleTitleStep(typeTitle, 120)
}

function handleMotionPreference(event: MediaQueryListEvent) {
  syncTitleMotion(event.matches)
}

onMounted(() => {
  if (typeof globalThis.matchMedia !== 'function') {
    syncTitleMotion(false)
    return
  }

  reducedMotionQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
  syncTitleMotion(reducedMotionQuery.matches)
  reducedMotionQuery.addEventListener('change', handleMotionPreference)
})

onBeforeUnmount(() => {
  clearTitleTimer()
  reducedMotionQuery?.removeEventListener('change', handleMotionPreference)
})

const valueProps = [
  { icon: 'hn-check-box', title: '场景实战', label: 'REAL-WORLD TASKS' },
  { icon: 'hn-refresh', title: '技能叠加', label: 'SKILL STACKING' },
  { icon: 'hn-handshake', title: '社区共创', label: 'COMMUNITY-BUILT' },
  { icon: 'hn-grid', title: '系统沉淀', label: 'SYSTEM BUILDING' },
]

const readingPaths = [
  {
    icon: 'hn-book',
    meta: 'PART 01 · CH. 01—10',
    title: '从 0 到 1：先把 WorkBuddy 用起来',
    description: '安装、界面、第一个任务、Skill、连接器、API 与自动化。',
    tags: ['新手推荐', '先完成一项任务'],
    href: '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/',
  },
  {
    icon: 'hn-briefcase',
    meta: 'PART 02 · CH. 11—21',
    title: '进入真实案例：让任务开始流动',
    description: '办公、文件、远程、资讯、知识、会议、投资和内容增长。',
    tags: ['11 个案例', '任务驱动'],
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/',
  },
  {
    icon: 'hn-sitemap',
    meta: 'PART 03 · CH. 22—25',
    title: '把案例变成可复用的工作系统',
    description: '打造 Skill、多 Agent 系统设计与可靠的自动化工作流。',
    tags: ['系统进阶', '可靠自动化'],
    href: '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/',
  },
  {
    icon: 'hn-users',
    meta: 'PART 04 · CH. 26—27',
    title: '落到岗位与行业，组建 AI 团队',
    description: '从通用能力出发，设计适合不同岗位和行业的工作流。',
    tags: ['团队落地', '行业路线'],
    href: '/wb-x/第四篇 岗位与行业落地/',
  },
  {
    icon: 'hn-robot',
    meta: 'SPECIAL REPORT · 6 CHAPTERS',
    title: 'OPC 专区：一人公司如何拥有一支 AI 团队',
    description: '从 OPC 趋势、商业模式与政策机遇，到 WorkBuddy 解法、真实案例和生态合作。',
    tags: ['一人公司', '超级个体'],
    href: '/opc/',
    featured: true,
  },
]

const taskCategories = [
  {
    icon: 'hn-briefcase',
    title: '办公文档',
    description: 'Word · Excel · PPT',
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/第 11 章 办公三件套：Word、Excel、PPT/',
  },
  {
    icon: 'hn-folder-open',
    title: '文件与远程',
    description: '整理 · 查找 · 执行',
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/第 12 章 从整理桌面文件这些小事做起/',
  },
  {
    icon: 'hn-newspaper',
    title: '资讯与知识',
    description: '收集 · 筛选 · 复用',
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/第 15 章 资讯整合：把信息流变成每日通知/',
  },
  {
    icon: 'hn-chart-line',
    title: '专业分析',
    description: '投资 · 研究 · 诊断',
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/第 18 章 把投资分析变成你的日常/',
  },
  {
    icon: 'hn-video-camera',
    title: '内容生产',
    description: '视频 · 自媒体 · GEO',
    href: '/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/第 19 章 一句话召唤 AI 视频团队/',
  },
  {
    icon: 'hn-robot',
    title: 'AI 工作系统',
    description: 'Skill · Agent · 自动化',
    href: '/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/第 24 章 如何进行多 Agent 系统设计/',
  },
]

const workflowSteps = [
  { number: '01', title: 'TASK', description: '完成一个真实任务' },
  { number: '02', title: 'CASE', description: '复盘成可复现案例' },
  { number: '03', title: 'WORKFLOW', description: '沉淀 Skill 与自动化' },
  { number: '04', title: 'AI TEAM', description: '组合成协作团队' },
]
</script>

<template>
  <main class="wbx-home">
    <section class="wbx-hero" aria-labelledby="wbx-hero-title">
      <div class="wbx-hero__stage">
        <div class="wbx-hero__copy">
          <aside class="wbx-update-ticker" aria-label="内容更新">
            <span class="wbx-update-ticker__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M4 10v4h3l8 4V6l-8 4H4Z" />
                <path d="m7 14 2 5h3l-2-4" />
                <path d="M18 9a4 4 0 0 1 0 6" />
              </svg>
            </span>
            <span class="wbx-update-ticker__content">
              <span class="wbx-update-ticker__title-track">
                <span class="wbx-update-ticker__title-group">
                  <a
                    v-for="update in sortedHomeUpdates"
                    :key="`${update.date}-${update.title}`"
                    class="wbx-update-ticker__link"
                    :href="withBase(update.href)"
                    :aria-label="`${update.date} ${update.title}`"
                  >
                    <span class="wbx-update-ticker__title">{{ update.title }}</span>
                  </a>
                </span>
                <span class="wbx-update-ticker__title-group" aria-hidden="true">
                  <a
                    v-for="update in sortedHomeUpdates"
                    :key="`duplicate-${update.date}-${update.title}`"
                    class="wbx-update-ticker__link"
                    :href="withBase(update.href)"
                    tabindex="-1"
                  >
                    <span class="wbx-update-ticker__title">{{ update.title }}</span>
                  </a>
                </span>
              </span>
            </span>
          </aside>
          <p class="wbx-pixel-label">27 CHAPTERS / 4 PARTS / ∞ WORKFLOWS</p>
          <h1 id="wbx-hero-title" aria-label="WorkBuddy X 与 OPC 白皮书">
            <span class="wbx-hero-title__visual" aria-hidden="true">
              <span class="wbx-hero-title__line wbx-hero-title__line--primary">
                <span class="wbx-hero-title__brand">WorkBuddy</span>
                <span class="wbx-hero-title__rotating">{{ rotatingTitle }}</span>
              </span>
              <span class="wbx-hero-title__line wbx-hero-title__line--subtitle">白皮书</span>
            </span>
          </h1>
          <p class="wbx-hero__summary">
            WorkBuddy能干嘛？一套以真实工作为主线的WorkBuddy实践路径。带你从0到1先用起来，再从1到100把每次成功沉淀为可复用的工作系统，真正把AI变成生产力！
          </p>
          <div class="wbx-hero__actions">
            <a class="wbx-button wbx-button--primary wbx-hero-cta" :href="withBase('/wb-x/')">
              <span class="wbx-hero-cta__label">开始阅读</span>
              <span class="wbx-hero-cta__arrow">
                <i class="hn hn-arrow-right" aria-hidden="true" />
              </span>
            </a>
            <a class="wbx-button wbx-button--outline" :href="withBase('/wb-x/reading-guide/')">查看阅读路线</a>
          </div>
        </div>

        <div class="wbx-hero__art" aria-label="WorkBuddy 白皮书">
          <span class="wbx-hero__monogram">{{ brand.shortMark }}</span>
          <div class="wbx-hero__whitepapers">
            <a
              v-for="whitepaper in whitepapers"
              :key="whitepaper.id"
              class="wbx-whitepaper-card"
              :class="`wbx-whitepaper-card--${whitepaper.id}`"
              :href="withBase(whitepaper.href)"
              :aria-label="`阅读 ${whitepaper.title}`"
            >
              <img
                :src="withBase(whitepaper.cover)"
                :alt="`${whitepaper.title}封面`"
                width="720"
                height="1018"
                decoding="async"
              >
            </a>
          </div>
          <a
            class="wbx-hero__sparkx-bubble"
            href="https://www.sparkx.zone/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="访问星火集"
          >
            <img
              class="wbx-hero__sparkx-logo"
              :src="withBase('/brand/partners/sparkx.svg')"
              alt=""
            >
          </a>
          <span class="wbx-hero__official-ip-wrap" aria-hidden="true">
            <img
              class="wbx-hero__official-ip"
              :src="withBase('/brand/workbuddy-official-ip.png')"
              alt=""
            >
          </span>
        </div>
      </div>

      <div class="wbx-value-strip" aria-label="白皮书价值">
        <div v-for="item in valueProps" :key="item.title" class="wbx-value-strip__item">
          <i class="hn" :class="item.icon" aria-hidden="true" />
          <span>
            <b>{{ item.title }}</b>
            <small>{{ item.label }}</small>
          </span>
        </div>
      </div>
    </section>

    <HomeAnalyticsStrip
      v-if="homeAnalyticsConfig"
      v-marketing-reveal
      :config="homeAnalyticsConfig"
    />

    <section v-marketing-reveal class="wbx-section wbx-reading" aria-labelledby="wbx-reading-title">
      <div class="wbx-section__heading">
        <div>
          <p class="wbx-pixel-label">READING PATH / 01—04</p>
          <h2 id="wbx-reading-title">四段路径，按你的目标进入</h2>
        </div>
        <p>从个人上手到组织落地，循序渐进，构建你的 WorkBuddy 工作系统。</p>
      </div>
      <div class="wbx-reading-grid">
        <a
          v-for="(path, index) in readingPaths"
          :key="path.meta"
          v-marketing-reveal
          class="wbx-reading-card wbx-interactive-card"
          :class="{ 'wbx-reading-card--featured': path.featured }"
          :data-reveal-order="index < 3 ? index + 1 : undefined"
          :href="withBase(path.href)"
        >
          <span class="wbx-reading-card__icon">
            <i class="hn" :class="path.icon" aria-hidden="true" />
          </span>
          <span class="wbx-reading-card__content">
            <small>{{ path.meta }}</small>
            <strong>{{ path.title }}</strong>
            <span>{{ path.description }}</span>
            <em>
              <b v-for="tag in path.tags" :key="tag">{{ tag }}</b>
            </em>
          </span>
          <i class="hn hn-arrow-right wbx-reading-card__arrow" aria-hidden="true" />
        </a>
      </div>
    </section>

    <section v-marketing-reveal class="wbx-section wbx-tasks" aria-labelledby="wbx-tasks-title">
      <div class="wbx-section__heading wbx-section__heading--compact">
        <div>
          <p class="wbx-pixel-label">START WITH A REAL TASK</p>
          <h2 id="wbx-tasks-title">你现在想让 AI 帮你做什么？</h2>
        </div>
        <p>不必从头读。带着问题进来，先跑通一个能验收的结果。</p>
      </div>
      <div class="wbx-task-grid">
        <a
          v-for="(task, index) in taskCategories"
          :key="task.title"
          v-marketing-reveal
          class="wbx-interactive-card"
          :data-reveal-order="index < 3 ? index + 1 : undefined"
          :href="withBase(task.href)"
        >
          <i class="hn" :class="task.icon" aria-hidden="true" />
          <strong>{{ task.title }}</strong>
          <span>{{ task.description }}</span>
        </a>
      </div>
    </section>

    <HomeWorkshop v-marketing-reveal />

    <section v-marketing-reveal class="wbx-section wbx-system" aria-labelledby="wbx-system-title">
      <div class="wbx-system__intro">
        <p class="wbx-pixel-label">FROM TASK TO TEAM</p>
        <h2 id="wbx-system-title">AI 时代，一起象限跃迁</h2>
        <p class="wbx-system__description">白皮书真正关心的不是“AI 会什么”，而是如何把一个结果沉淀成稳定、可协作、可复用的工作系统。</p>
        <div class="wbx-system__actions">
          <a
            class="wbx-button wbx-button--primary wbx-system__download"
            href="https://pan.quark.cn/s/4b2488289c79"
            target="_blank"
            rel="noopener noreferrer"
          >教学资料</a>
          <a
            class="wbx-button wbx-button--outline"
            :href="withBase('/community/contributing')"
          >参与共创</a>
        </div>
      </div>
      <ol class="wbx-system__steps">
        <li v-for="step in workflowSteps" :key="step.number">
          <b>{{ step.number }}</b>
          <strong>{{ step.title }}</strong>
          <span>{{ step.description }}</span>
        </li>
      </ol>
    </section>

    <div class="wbx-community-ip" aria-hidden="true">
      <img class="wbx-community__ip" :src="withBase('/brand/workbuddy-ip.png')" alt="" loading="lazy" decoding="async" fetchpriority="low">
    </div>

  </main>

  <footer class="wbx-home-footer">
    <div class="wbx-home-footer__inner">
      <p class="wbx-home-footer__product">
        <span>以真实场景为主线的 WB-X 实战读本</span>
        <span aria-hidden="true"> · </span>
        <a
          href="https://hackernoon.com/pixel-icon-library"
          target="_blank"
          rel="noopener noreferrer"
        >Pixel icons by HackerNoon</a>
      </p>
      <p class="wbx-home-footer__copyright">Copyright © 2026 安徽象限跃迁人工智能科技有限公司</p>
    </div>
  </footer>
</template>
