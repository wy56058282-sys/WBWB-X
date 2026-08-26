<script setup lang="ts">
import { withBase } from 'vitepress'
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { fdeTeamMembers, type FdeMember } from './fdeTeam'
import './about.css'

withDefaults(defineProps<{
  embedded?: boolean
  teamLabel?: string
  teamTitle?: string
  teamDescription?: string
  fdeMembers?: readonly FdeMember[]
}>(), {
  embedded: false,
  teamLabel: 'AI SERVICE ARCHITECTS',
  teamTitle: 'AI 服务架构师（ASC）',
  teamDescription: '汇集产品、设计、运营与 AI 实践者，为培训、工作坊与企业场景提供架构指导。',
  fdeMembers: () => fdeTeamMembers,
})

const teamMembers = [
  { name: '王翎旭', primaryTitle: 'Quadr-X 产品总监', secondaryTitle: '三分设 主理人', description: '原平安、汇丰产品负责人\n原阿里、腾讯设计专家', image: '/article-assets/service/asc/asc-05.png?v=20260826b', optimizedImage: '/article-assets/service/asc/asc-05.webp?v=20260826b' },
  { name: '黄学铃', primaryTitle: '有言网科 资深运营总监', secondaryTitle: '原阿里、盒马设计专家', image: '/article-assets/service/asc/asc-01.png', optimizedImage: '/article-assets/service/asc/asc-01.webp' },
  { name: '李泽慧', primaryTitle: '教师', secondaryTitle: '合肥大学设计学院', image: '/article-assets/service/asc/asc-03.png', optimizedImage: '/article-assets/service/asc/asc-03.webp' },
  { name: '王劲松', primaryTitle: 'AI 产品体验专家', secondaryTitle: '某互联网大厂', image: '/article-assets/service/asc/asc-04.png', optimizedImage: '/article-assets/service/asc/asc-04.webp' },
  { name: '刘鹏振', primaryTitle: 'dwin 青年 OPC 主理人', secondaryTitle: 'AI 内容创作者、\n青年创业者', image: '/article-assets/service/asc/asc-02.png', optimizedImage: '/article-assets/service/asc/asc-02.webp' },
  { name: '魏心语', primaryTitle: 'WorkBuddy 讲师', secondaryTitle: '合肥大学 硕士', image: '/article-assets/service/asc/asc-07.png', optimizedImage: '/article-assets/service/asc/asc-07.webp' },
  { name: '丁怡豪', primaryTitle: 'AI 研究者', secondaryTitle: '合肥大学', image: '/article-assets/service/asc/asc-06.png', optimizedImage: '/article-assets/service/asc/asc-06.webp' },
] as const

const isJoinOpen = ref(false)
const join = ref<HTMLElement | null>(null)
const joinTrigger = ref<HTMLButtonElement | null>(null)

function closeJoin(restoreFocus = false) {
  if (!isJoinOpen.value) return
  isJoinOpen.value = false
  if (restoreFocus) nextTick(() => joinTrigger.value?.focus())
}

function handleJoinOutsideClick(event: PointerEvent) {
  if (!join.value?.contains(event.target as Node)) closeJoin()
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') closeJoin(true)
}

onMounted(() => {
  document.addEventListener('pointerdown', handleJoinOutsideClick)
  document.addEventListener('keydown', handleEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleJoinOutsideClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <div class="wbx-about">
    <header v-if="!embedded" class="wbx-about__header">
      <p class="wbx-pixel-label">ABOUT WORKBUDDY-X</p>
      <h1>关于我们</h1>
    </header>

    <section id="team" class="wbx-about__team" aria-labelledby="about-team-title">
      <div class="wbx-about__heading">
        <div>
          <p class="wbx-pixel-label">{{ teamLabel }}</p>
          <h2 id="about-team-title">{{ teamTitle }}</h2>
        </div>
        <p>{{ teamDescription }}</p>
      </div>
      <div class="wbx-about-members">
        <article v-for="member in teamMembers" :key="member.name" class="wbx-about-member">
          <div class="wbx-about-member__copy">
            <h3>{{ member.name }}</h3>
            <strong>{{ member.primaryTitle }}</strong>
            <span>{{ member.secondaryTitle }}</span>
            <p v-if="'description' in member">{{ member.description }}</p>
          </div>
          <picture>
            <source type="image/webp" :srcset="withBase(member.optimizedImage)">
            <img :src="withBase(member.image)" :alt="`${member.name} AI 服务架构师照片`" loading="lazy" decoding="async">
          </picture>
        </article>
      </div>
    </section>

    <section id="fde" class="wbx-fde" aria-labelledby="fde-title">
      <div class="wbx-about__heading wbx-fde__heading">
        <div>
          <p class="wbx-pixel-label">FRONTLINE DEPLOYMENT ENGINEERS</p>
          <h2 id="fde-title">前线部署工程师（FDE）</h2>
        </div>
        <p>深入真实业务场景，把需求转化为可执行、可验收、可复用的 AI 工作系统。</p>
      </div>

      <div v-if="fdeMembers.length" class="wbx-fde-members">
        <article v-for="member in fdeMembers" :key="member.name" class="wbx-fde-member">
          <div class="wbx-fde-member__copy">
            <h3>{{ member.name }}</h3>
            <strong>{{ member.primaryTitle }}</strong>
            <span>{{ member.secondaryTitle }}</span>
            <p v-if="member.description">{{ member.description }}</p>
          </div>
          <picture>
            <source type="image/webp" :srcset="withBase(member.optimizedImage)">
            <img :src="withBase(member.image)" :alt="`${member.name}白底照片`" loading="lazy" decoding="async">
          </picture>
        </article>
      </div>

      <div class="wbx-fde-recruit">
        <div>
          <h3 class="wbx-fde-recruit__title">工程师资料将陆续补充，欢迎申请成为 FDE</h3>
          <p>如果你擅长把 AI 能力落进真实业务流程，可以联系主理人沟通入驻。</p>
        </div>
        <div ref="join" class="wbx-about-join">
          <button
            ref="joinTrigger"
            class="wbx-about-join__trigger"
            type="button"
            aria-controls="about-join-popover"
            :aria-expanded="isJoinOpen"
            @click="isJoinOpen = !isJoinOpen"
            @keydown.esc.stop="closeJoin(true)"
          >申请入驻</button>
          <div
            id="about-join-popover"
            class="wbx-about-join__popover"
            :class="{ 'is-open': isJoinOpen }"
            :aria-hidden="!isJoinOpen"
          >
            <strong>主理人微信：NICKY_YI</strong>
            <span>联系主理人沟通确认后申请成为前线部署工程师</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
