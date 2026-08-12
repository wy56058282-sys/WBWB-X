<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { caseCategories, filterCaseCatalog } from '../case-catalog'
import { data } from '../case-catalog.data'
import { isServiceFormUrl, serviceConfig } from '../service-config'

const query = ref('')
const category = ref('全部')

const categories = computed(() => caseCategories(data))
const cases = computed(() => filterCaseCatalog(data, query.value, category.value))
const categoryIcons: Record<string, string> = {
  '全部': 'hn-grid-solid',
  '内容创作': 'hn-pen-nib-solid',
  '数据分析': 'hn-analytics-solid',
  '知识管理': 'hn-book-bookmark-solid',
  '自动化': 'hn-robot-solid',
}

function resetFilters() {
  query.value = ''
  category.value = '全部'
}
</script>

<template>
  <section class="wbx-cases" aria-labelledby="case-gallery-title">
    <div class="wbx-cases-layout-grid">
      <main class="wbx-cases-main-column">
        <header class="wbx-cases-hero">
          <div class="wbx-cases-hero__copy">
          <h1 id="case-gallery-title"><span class="wbx-cases-brand">WorkBuddy WB-X</span> 案例集</h1>
          <p>从真实场景出发，找到可以带走复用的工作方法。</p>
          </div>
        </header>

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
      </main>

      <aside class="wbx-cases-tools-column" aria-label="案例搜索与投稿">
        <label class="wbx-cases-search">
          <input v-model="query" type="search" aria-label="搜索案例" placeholder="搜索场景、成果或产品" autocomplete="off">
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
      </aside>
    </div>
  </section>
</template>
