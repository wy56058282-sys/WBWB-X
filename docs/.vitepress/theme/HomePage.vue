<script setup lang="ts">
import { withBase } from 'vitepress'
import { brand } from '../brand'

const valueProps = [
  { icon: 'hn-check-box', title: '场景实战', label: 'REAL-WORLD TASKS' },
  { icon: 'hn-refresh', title: '技能叠加', label: 'SKILL STACKING' },
  { icon: 'hn-handshake', title: '社区共创', label: 'COMMUNITY-BUILT' },
  { icon: 'hn-grid', title: '系统沉淀', label: 'SYSTEM BUILDING' },
]

const readingPaths = [
  {
    icon: 'hn-user',
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
          <p class="wbx-pixel-label">REAL TASKS · 27 CHAPTERS · OPEN SOURCE</p>
          <h1 id="wbx-hero-title">{{ brand.contentShortName }}</h1>
          <p class="wbx-hero__summary">
            WorkBuddy能干嘛？一套以真实工作为主线的WorkBuddy实践路径。带你从0到1先用起来，再从1到100把每次成功沉淀为可复用的工作系统，真正把AI变成生产力！
          </p>
          <div class="wbx-hero__actions">
            <a class="wbx-button wbx-button--primary" :href="withBase('/wb-x/')">
              <span>开始阅读</span>
              <i class="hn hn-arrow-right" aria-hidden="true" />
            </a>
            <a class="wbx-button wbx-button--outline" :href="withBase('/reading-guide')">查看阅读路线</a>
          </div>
        </div>

        <div class="wbx-hero__art" aria-label="WorkBuddy 像素图标组合">
          <span class="wbx-hero__monogram">{{ brand.shortMark }}</span>
          <a
            class="wbx-icon-card wbx-icon-card--buddy"
            :href="withBase('/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/')"
            aria-label="查看 Part 1 使用手册"
          >
            <i class="hn hn-face-grin" aria-hidden="true" />
          </a>
          <a
            class="wbx-icon-card wbx-icon-card--book"
            :href="withBase('/reading-guide')"
            aria-label="查看阅读指南"
          >
            <i class="hn hn-book" aria-hidden="true" />
          </a>
          <a
            class="wbx-icon-card wbx-icon-card--flow"
            :href="withBase('/wb-x/第三篇 进阶篇：把案例变成自己的工作系统/')"
            aria-label="查看工作系统进阶篇"
          >
            <i class="hn hn-sitemap" aria-hidden="true" />
          </a>
          <a
            class="wbx-icon-card wbx-icon-card--work"
            :href="withBase('/wb-x/第二篇 案例篇：从一项任务到一支 AI 团队/')"
            aria-label="查看 Part 2 案例篇"
          >
            <i class="hn hn-briefcase" aria-hidden="true" />
          </a>
          <div class="wbx-hero__metrics" aria-label="小白书内容规模">
            <span><b>27</b> CHAPTERS</span>
            <span><b>4</b> PARTS</span>
            <span><b>∞</b> WORKFLOWS</span>
          </div>
        </div>
      </div>

      <div class="wbx-value-strip" aria-label="小白书价值">
        <div v-for="item in valueProps" :key="item.title" class="wbx-value-strip__item">
          <i class="hn" :class="item.icon" aria-hidden="true" />
          <span>
            <b>{{ item.title }}</b>
            <small>{{ item.label }}</small>
          </span>
        </div>
      </div>
    </section>

    <section class="wbx-section wbx-reading" aria-labelledby="wbx-reading-title">
      <div class="wbx-section__heading">
        <div>
          <p class="wbx-pixel-label">READING PATH / 01—04</p>
          <h2 id="wbx-reading-title">四段路径，按你的目标进入</h2>
        </div>
        <p>从个人上手到组织落地，循序渐进，构建你的 WorkBuddy 工作系统。</p>
      </div>
      <div class="wbx-reading-grid">
        <a v-for="path in readingPaths" :key="path.meta" class="wbx-reading-card" :href="withBase(path.href)">
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

    <section class="wbx-section wbx-tasks" aria-labelledby="wbx-tasks-title">
      <div class="wbx-section__heading wbx-section__heading--compact">
        <div>
          <p class="wbx-pixel-label">START WITH A REAL TASK</p>
          <h2 id="wbx-tasks-title">你现在想让 AI 帮你做什么？</h2>
        </div>
        <p>不必从头读。带着问题进来，先跑通一个能验收的结果。</p>
      </div>
      <div class="wbx-task-grid">
        <a v-for="task in taskCategories" :key="task.title" :href="withBase(task.href)">
          <i class="hn" :class="task.icon" aria-hidden="true" />
          <strong>{{ task.title }}</strong>
          <span>{{ task.description }}</span>
        </a>
      </div>
    </section>

    <section class="wbx-section wbx-system" aria-labelledby="wbx-system-title">
      <div class="wbx-system__intro">
        <p class="wbx-pixel-label">FROM TASK TO TEAM</p>
        <h2 id="wbx-system-title">一次成功，不该只发生一次。</h2>
        <p>小白书真正关心的不是“AI 会什么”，而是如何把一个结果沉淀成稳定、可协作、可复用的工作系统。</p>
      </div>
      <ol class="wbx-system__steps">
        <li v-for="step in workflowSteps" :key="step.number">
          <b>{{ step.number }}</b>
          <strong>{{ step.title }}</strong>
          <span>{{ step.description }}</span>
        </li>
      </ol>
    </section>

    <section class="wbx-community" aria-labelledby="wbx-community-title">
      <div>
        <p class="wbx-pixel-label">BUILD IN PUBLIC · LEARN IN PUBLIC</p>
        <h2 id="wbx-community-title">这本小白书，也可以由你继续写下去。</h2>
      </div>
      <div class="wbx-community__actions">
        <a class="wbx-button wbx-button--primary" :href="withBase('/community/contributing')">参与共创</a>
        <a class="wbx-button wbx-button--outline" :href="brand.repository">前往 GitHub</a>
      </div>
      <i class="hn hn-book wbx-community__icon" aria-hidden="true" />
    </section>

  </main>

  <footer class="wbx-home-footer">
    <div class="wbx-home-footer__inner">
      <p>
        以真实任务为主线的 WorkBuddy 社区实战读本 · Pixel icons by
        <a href="https://pixeliconlibrary.com/" target="_blank" rel="noreferrer">HackerNoon</a>
      </p>
      <p>Copyright © 2026 {{ brand.author }}</p>
    </div>
  </footer>
</template>
