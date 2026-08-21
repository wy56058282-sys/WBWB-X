<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { caseCategories, filterCaseCatalog } from '../case-catalog'
import { data } from '../case-catalog.data'
import {
  enterpriseCaseCatalog,
  enterpriseFunctions,
  enterpriseIndustries,
  filterEnterpriseCaseCatalog,
  type EnterpriseCaseKind,
} from '../enterprise-case-catalog'
import { isServiceFormUrl, serviceConfig } from '../service-config'

const query = ref('')
const category = ref('全部')
const audience = ref<'personal' | 'enterprise'>('personal')
const enterpriseKind = ref<EnterpriseCaseKind>('scene')
const industry = ref('')
const businessFunction = ref('')
const toolsColumnAnchor = ref<HTMLElement | null>(null)
const toolsColumn = ref<HTMLElement | null>(null)
const toolsSticky = ref(false)
const toolsFixed = ref(false)
let toolsResizeObserver: ResizeObserver | undefined
let navResizeObserver: ResizeObserver | undefined

const categories = computed(() => caseCategories(data))
const cases = computed(() => filterCaseCatalog(data, query.value, category.value))
const enterpriseCases = computed(() => filterEnterpriseCaseCatalog(
  enterpriseCaseCatalog,
  enterpriseKind.value,
  query.value,
  industry.value,
  businessFunction.value,
))
const categoryIcons: Record<string, string> = {
  '全部': 'hn-grid-solid',
  '内容创作': 'hn-pen-nib-solid',
  '数据分析': 'hn-analytics-solid',
  '知识管理': 'hn-book-bookmark-solid',
  '自动化': 'hn-robot-solid',
}

const enterpriseKindIcons: Record<EnterpriseCaseKind, string> = {
  scene: 'hn-lightbulb-solid',
  case: 'hn-briefcase-solid',
}

function resetFilters() {
  query.value = ''
  category.value = '全部'
  industry.value = ''
  businessFunction.value = ''
}

function selectAudience(next: 'personal' | 'enterprise') {
  audience.value = next
  resetFilters()
}

function selectEnterpriseKind(next: EnterpriseCaseKind) {
  enterpriseKind.value = next
  resetFilters()
}

function moveTab<T extends string>(event: KeyboardEvent, values: readonly T[], current: T, select: (value: T) => void) {
  if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return
  event.preventDefault()
  const direction = event.key === 'ArrowRight' ? 1 : -1
  const next = (values.indexOf(current) + direction + values.length) % values.length
  select(values[next])
  void nextTick(() => (event.currentTarget as HTMLElement)?.parentElement
    ?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus())
}

function updateToolsSticky() {
  if (!toolsColumn.value || !toolsColumnAnchor.value || typeof window === 'undefined') return

  const fallbackNavHeight = Number.parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height'),
  ) || 64
  const nav = document.querySelector<HTMLElement>('.VPNavBar')
  const navRect = nav?.getBoundingClientRect()
  const renderedNavBottom = Math.max(navRect?.bottom ?? 0, navRect?.height ?? 0)
  const stickyTop = Math.max(renderedNavBottom, fallbackNavHeight) + 24
  const availableHeight = window.innerHeight - stickyTop - 24
  const columnRect = toolsColumnAnchor.value.getBoundingClientRect()
  const fitsViewport = toolsColumn.value.getBoundingClientRect().height <= availableHeight

  toolsColumn.value.style.setProperty('--wbx-cases-sticky-top', `${stickyTop}px`)
  toolsColumn.value.style.setProperty('--wbx-cases-fixed-left', `${columnRect.left}px`)
  toolsColumn.value.style.setProperty('--wbx-cases-fixed-width', `${columnRect.width}px`)

  toolsSticky.value = window.innerWidth > 1024
    && fitsViewport
  toolsFixed.value = toolsSticky.value && columnRect.top <= stickyTop
}

onMounted(() => {
  void nextTick(updateToolsSticky)
  window.addEventListener('resize', updateToolsSticky)
  window.addEventListener('scroll', updateToolsSticky, { passive: true })

  if (typeof ResizeObserver === 'function' && toolsColumn.value) {
    toolsResizeObserver = new ResizeObserver(updateToolsSticky)
    toolsResizeObserver.observe(toolsColumn.value)

    const nav = document.querySelector<HTMLElement>('.VPNavBar')
    if (nav) {
      navResizeObserver = new ResizeObserver(updateToolsSticky)
      navResizeObserver.observe(nav)
    }
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateToolsSticky)
  window.removeEventListener('scroll', updateToolsSticky)
  toolsResizeObserver?.disconnect()
  navResizeObserver?.disconnect()
})
</script>

<template>
  <section class="wbx-cases" aria-labelledby="case-gallery-title">
    <div class="wbx-cases-layout-grid">
      <main class="wbx-cases-main-column">
        <header class="wbx-cases-hero">
          <div class="wbx-cases-hero__copy">
          <h1 id="case-gallery-title"><span class="wbx-cases-brand">WorkBuddy-X</span><span class="wbx-cases-title-line">案例集</span></h1>
          <p>从真实场景出发，找到可以带走复用的工作方法。</p>
          </div>
        </header>

        <div class="wbx-cases-primary-tabs" role="tablist" aria-label="案例受众">
          <button id="personal-cases-tab" type="button" role="tab" :aria-selected="audience === 'personal'" aria-controls="personal-cases-panel" @click="selectAudience('personal')" @keydown="moveTab($event, ['personal', 'enterprise'], audience, selectAudience)">个人</button>
          <button id="enterprise-cases-tab" type="button" role="tab" :aria-selected="audience === 'enterprise'" aria-controls="enterprise-cases-panel" @click="selectAudience('enterprise')" @keydown="moveTab($event, ['personal', 'enterprise'], audience, selectAudience)">企业</button>
        </div>

        <div v-if="audience === 'personal'" id="personal-cases-panel" role="tabpanel" aria-labelledby="personal-cases-tab">
        <div id="case-gallery" class="wbx-cases-categories" aria-label="案例分类">
          <button
            v-for="item in categories"
            :key="item"
            type="button"
            :data-category="item"
            :aria-pressed="category === item"
            @click="category = item"
          >
            <i
              :class="[
                'hn',
                category === item ? 'hn-check-circle-solid' : categoryIcons[item],
                'wbx-cases-category__indicator',
              ]"
              aria-hidden="true"
            />
            {{ item }}
          </button>
        </div>

        <section class="wbx-cases-gallery-results">
          <ul v-if="cases.length" class="wbx-cases-grid" aria-live="polite">
          <li v-for="item in cases" :key="item.route" class="wbx-case-card">
            <a
              class="wbx-case-card__link"
              :href="withBase(item.route)"
              :aria-label="`查看案例：${item.title}`"
            >
              <img class="wbx-case-card__cover" :src="withBase(item.cover)" :alt="item.coverAlt" loading="lazy">
              <span class="wbx-case-card__content">
                <span class="wbx-case-card__meta">
                  <span>{{ item.category }}</span>
                  <time :datetime="item.date">{{ item.date }}</time>
                </span>
                <strong class="wbx-case-card__title">{{ item.title }}</strong>
                <span class="wbx-case-card__outcome">{{ item.outcome }}</span>
                <span class="wbx-case-card__product">{{ item.productTag }}</span>
              </span>
            </a>
          </li>
          </ul>

          <div v-else class="wbx-cases-empty" role="status">
            <p>没有找到匹配的案例</p>
            <button type="button" @click="resetFilters">清除筛选</button>
          </div>
        </section>
        </div>

        <div v-else id="enterprise-cases-panel" class="wbx-enterprise-cases" role="tabpanel" aria-labelledby="enterprise-cases-tab">
          <div class="wbx-enterprise-kind-tabs" role="tablist" aria-label="企业内容类型">
            <button id="enterprise-scenes-tab" type="button" role="tab" :aria-selected="enterpriseKind === 'scene'" aria-controls="enterprise-results" @click="selectEnterpriseKind('scene')" @keydown="moveTab($event, ['scene', 'case'], enterpriseKind, selectEnterpriseKind)">
              <i :class="['hn', enterpriseKind === 'scene' ? 'hn-check-circle-solid' : enterpriseKindIcons.scene, 'wbx-cases-category__indicator']" aria-hidden="true" />
              建议场景
            </button>
            <button id="enterprise-catalog-cases-tab" type="button" role="tab" :aria-selected="enterpriseKind === 'case'" aria-controls="enterprise-results" @click="selectEnterpriseKind('case')" @keydown="moveTab($event, ['scene', 'case'], enterpriseKind, selectEnterpriseKind)">
              <i :class="['hn', enterpriseKind === 'case' ? 'hn-check-circle-solid' : enterpriseKindIcons.case, 'wbx-cases-category__indicator']" aria-hidden="true" />
              客户案例
            </button>
          </div>
          <div class="wbx-enterprise-filter-group" aria-label="行业筛选">
            <span>行业</span>
            <button type="button" :aria-pressed="industry === ''" @click="industry = ''">全部</button>
            <button v-for="item in enterpriseIndustries" :key="item" type="button" :aria-pressed="industry === item" @click="industry = item">{{ item }}</button>
          </div>
          <div class="wbx-enterprise-filter-group" aria-label="职能筛选">
            <span>职能</span>
            <button type="button" :aria-pressed="businessFunction === ''" @click="businessFunction = ''">全部</button>
            <button v-for="item in enterpriseFunctions" :key="item" type="button" :aria-pressed="businessFunction === item" @click="businessFunction = item">{{ item }}</button>
          </div>
          <div class="wbx-enterprise-results-bar">
            <span>共 {{ enterpriseCases.length }} 条</span>
            <button v-if="query || industry || businessFunction" type="button" @click="resetFilters">清空筛选</button>
          </div>
          <section id="enterprise-results" class="wbx-cases-gallery-results" role="tabpanel" :aria-labelledby="enterpriseKind === 'scene' ? 'enterprise-scenes-tab' : 'enterprise-catalog-cases-tab'">
            <ul v-if="enterpriseCases.length" class="wbx-cases-grid" aria-live="polite">
              <li v-for="item in enterpriseCases" :key="`${item.kind}-${item.number}`" class="wbx-case-card wbx-enterprise-case-card">
                <span class="wbx-enterprise-case-card__number">{{ String(item.number).padStart(3, '0') }}</span>
                <span class="wbx-enterprise-case-card__tags"><span>{{ item.industry }}</span><span>{{ item.function }}</span></span>
                <span class="wbx-enterprise-case-card__status">{{ item.sourceStatus }}</span>
                <strong>{{ item.title }}</strong>
                <span class="wbx-enterprise-case-card__summary">{{ item.summary }}</span>
                <span class="wbx-enterprise-case-card__locked">企业案例，保密</span>
              </li>
            </ul>
            <div v-else class="wbx-cases-empty" role="status"><p>没有找到匹配的企业内容</p><button type="button" @click="resetFilters">清空筛选</button></div>
          </section>
        </div>
      </main>

      <aside ref="toolsColumnAnchor" class="wbx-cases-tools-column" aria-label="案例搜索与投稿">
        <div
          ref="toolsColumn"
          :class="['wbx-cases-tools-stack', { 'is-sticky': toolsSticky, 'is-fixed': toolsFixed }]"
        >
        <label class="wbx-cases-search">
          <input v-model="query" type="search" aria-label="搜索案例" :placeholder="audience === 'personal' ? '搜索场景、成果或产品' : '搜索标题、摘要、行业或职能'" autocomplete="off">
        </label>
        <section id="submit-case" class="wbx-cases-submit" aria-labelledby="submit-case-title">
        <div>
          <h2 id="submit-case-title">把你的工作方法带进案例集</h2>
          <p>分享真实任务、使用过程和结果，让下一位遇到相似问题的人少走一点弯路。</p>
        </div>
        <div class="wbx-cases-submit__actions">
          <a
            v-if="isServiceFormUrl(serviceConfig.freeCaseFormUrl)"
            class="wbx-cases-action wbx-cases-action--primary"
            :href="serviceConfig.freeCaseFormUrl"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="填写问卷投稿（在新页面打开）"
          >填写问卷投稿</a>
          <figure
            v-else
            class="wbx-cases-submit__qr-wrap"
          >
            <a
              class="wbx-cases-submit__qr"
              :href="withBase('/article-assets/source-calibration/help/001.png')"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="查看 WorkBuddy 需求与案例投稿问卷二维码大图（在新页面打开）"
            >
              <img
                :src="withBase('/article-assets/source-calibration/help/001.png')"
                alt="WorkBuddy 需求与案例投稿问卷二维码"
                width="1560"
                height="1936"
                loading="lazy"
              >
            </a>
            <figcaption>WorkBuddy 需求与案例投稿问卷。提交时请在场景描述开头注明“【案例投稿】”。</figcaption>
          </figure>
          <a class="wbx-cases-action" :href="withBase('/community/case-contributing')">查看投稿指南</a>
        </div>
        </section>
        </div>
      </aside>
    </div>
  </section>
</template>
