<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { caseCategories, filterCaseCatalog } from '../case-catalog'
import { data } from '../case-catalog.data'

const query = ref('')
const category = ref('全部')

const categories = computed(() => caseCategories(data))
const cases = computed(() => filterCaseCatalog(data, query.value, category.value))

function resetFilters() {
  query.value = ''
  category.value = '全部'
}
</script>

<template>
  <section class="wbx-cases" aria-labelledby="case-gallery-title">
    <header class="wbx-cases-header">
      <div>
        <p class="wbx-cases-eyebrow">WORKBUDDY COMMUNITY</p>
        <h1 id="case-gallery-title">WorkBuddy WB-X 案例集</h1>
        <p>从真实场景出发，找到可以带走复用的工作方法。</p>
      </div>
      <nav class="wbx-cases-header__links" aria-label="案例集页面导航">
        <a href="#case-gallery">浏览案例</a>
        <a href="#submit-case">提交案例</a>
      </nav>
    </header>

    <section id="case-gallery" class="wbx-cases-gallery" aria-labelledby="case-gallery-heading">
      <div class="wbx-cases-gallery__topline">
        <div>
          <p class="wbx-cases-eyebrow">CASE GALLERY</p>
          <h2 id="case-gallery-heading">浏览案例</h2>
        </div>
        <label class="wbx-cases-search">
          <span>搜索案例</span>
          <input v-model="query" type="search" placeholder="搜索场景、成果或产品" autocomplete="off">
        </label>
      </div>

      <div class="wbx-cases-categories" aria-label="案例分类">
        <button
          v-for="item in categories"
          :key="item"
          type="button"
          :data-category="item"
          :aria-pressed="category === item"
          @click="category = item"
        >
          {{ item }}
        </button>
      </div>

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

    <section id="submit-case" class="wbx-cases-submit" aria-labelledby="submit-case-title">
      <div>
        <p class="wbx-cases-eyebrow">CONTRIBUTE A CASE</p>
        <h2 id="submit-case-title">把你的工作方法带进案例集</h2>
        <p>分享真实任务、使用过程和结果，让下一位遇到相似问题的人少走一点弯路。</p>
      </div>
      <div class="wbx-cases-submit__actions">
        <a class="wbx-cases-action wbx-cases-action--primary" :href="withBase('/help/#scenario-survey')">填写问卷投稿</a>
        <a class="wbx-cases-action" :href="withBase('/community/case-contributing')">查看投稿指南</a>
      </div>
    </section>
  </section>
</template>
