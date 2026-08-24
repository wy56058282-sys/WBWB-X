<script setup lang="ts">
import { withBase } from 'vitepress'
import { onBeforeUnmount, onMounted, ref } from 'vue'

const teamMembers = [
  { name: '王翔旭', image: '/article-assets/service/guest-wang-xiangxu.png' },
  { name: '黄学铃', image: '/article-assets/service/guest-huang-xueling.png' },
  { name: '李泽慧', image: '/article-assets/service/guest-li-zehui.png' },
  { name: '王劲松', image: '/article-assets/service/guest-wang-jinsong.png' },
  { name: '刘鹏振', image: '/article-assets/service/guest-liu-pengzhen.png' },
  { name: '丁怡豪', image: '/article-assets/service/guest-ding-yihao.png' },
] as const

const isJoinOpen = ref(false)
const join = ref<HTMLElement | null>(null)

function closeJoin() {
  isJoinOpen.value = false
}

function handleJoinOutsideClick(event: PointerEvent) {
  if (!join.value?.contains(event.target as Node)) closeJoin()
}

onMounted(() => document.addEventListener('pointerdown', handleJoinOutsideClick))
onBeforeUnmount(() => document.removeEventListener('pointerdown', handleJoinOutsideClick))
</script>

<template>
  <div class="wbx-about">
    <header class="wbx-about__header">
      <p class="wbx-pixel-label">ABOUT WORKBUDDY-X</p>
      <h1>关于我们</h1>
    </header>

    <section class="wbx-about__team" aria-labelledby="about-team-title">
      <div class="wbx-about__heading">
        <div>
          <p class="wbx-pixel-label">TEAM</p>
          <h2 id="about-team-title">场景教练和前线部署工程师（FDE）</h2>
        </div>
        <p>来自产品、设计、运营与 AI 实践的一线嘉宾，共同带你完成真实场景实战。</p>
      </div>
      <div class="wbx-about-members">
        <figure v-for="member in teamMembers" :key="member.name" class="wbx-about-member">
          <img :src="withBase(member.image)" :alt="`嘉宾老师${member.name}`" loading="lazy">
        </figure>
      </div>
      <div ref="join" class="wbx-about-join">
        <button
          class="wbx-about-join__trigger"
          type="button"
          aria-controls="about-join-popover"
          :aria-expanded="isJoinOpen"
          @click="isJoinOpen = !isJoinOpen"
          @keydown.esc.stop="closeJoin"
        >加入我们</button>
        <div
          id="about-join-popover"
          class="wbx-about-join__popover"
          :class="{ 'is-open': isJoinOpen }"
          :aria-hidden="!isJoinOpen"
        >
          <strong>主理人微信：NICKY_YI</strong>
          <span>联系主理人沟通确认后加入导师与 FDE 团队</span>
        </div>
      </div>
    </section>
  </div>
</template>
