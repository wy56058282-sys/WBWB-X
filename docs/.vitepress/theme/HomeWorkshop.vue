<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { selectRelevantWorkshopEdition, workshopEditions } from '../workshop-editions'

const selection = computed(() => selectRelevantWorkshopEdition(workshopEditions, new Date()))
const isRegistrationOpen = ref(false)
const registration = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)

function closeRegistration(restoreFocus = false) {
  isRegistrationOpen.value = false
  if (restoreFocus) nextTick(() => trigger.value?.focus())
}

function toggleRegistration() {
  if (isRegistrationOpen.value) closeRegistration(true)
  else isRegistrationOpen.value = true
}

function handleOutsidePointer(event: PointerEvent) {
  if (isRegistrationOpen.value && !registration.value?.contains(event.target as Node)) closeRegistration(true)
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isRegistrationOpen.value) {
    event.preventDefault()
    closeRegistration(true)
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', handleOutsidePointer)
  window.addEventListener('keydown', handleEscape)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer)
  window.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <section v-if="selection" class="wbx-section wbx-home-workshop" aria-labelledby="home-workshop-title">
    <div class="wbx-home-workshop__copy">
      <p class="wbx-pixel-label">WORKBUDDY X WORKSHOP</p>
      <p v-if="selection.status === 'past'" class="wbx-home-workshop__state">活动回顾</p>
      <h2 id="home-workshop-title">{{ selection.edition.title }} <span>{{ selection.edition.edition }}</span></h2>
      <p class="wbx-home-workshop__audience">面向人群：创业者、管理者、设计师、超级个体、一人公司（OPC）</p>
      <dl class="wbx-home-workshop__facts">
        <div><dt>时间</dt><dd>{{ selection.edition.fullDate }} {{ selection.edition.time }}</dd></div>
        <div><dt>地点</dt><dd>{{ selection.edition.venue }} · {{ selection.edition.area }}</dd></div>
        <div><dt>规模</dt><dd>{{ selection.edition.capacity }}</dd></div>
      </dl>
      <div class="wbx-home-workshop__actions">
        <div v-if="selection.status !== 'past'" ref="registration" class="wbx-home-workshop__registration">
          <button
            ref="trigger"
            class="wbx-home-workshop__registration-trigger"
            type="button"
            aria-controls="home-workshop-registration"
            :aria-expanded="isRegistrationOpen"
            @click="toggleRegistration"
          >报名最近一期</button>
          <div
            id="home-workshop-registration"
            class="wbx-home-workshop__registration-popover"
            :class="{ 'is-open': isRegistrationOpen }"
            :aria-hidden="!isRegistrationOpen"
          >
            <img v-if="isRegistrationOpen" :src="withBase(selection.edition.registrationQrPath)" alt="粗门报名二维码" width="466" height="466">
            <strong>微信扫码报名</strong>
          </div>
        </div>
        <a
          v-else
          class="wbx-home-workshop__recap"
          :href="selection.edition.activityDetailUrl || withBase('/help/#workshop-history')"
          :target="selection.edition.activityDetailUrl ? '_blank' : undefined"
          :rel="selection.edition.activityDetailUrl ? 'noopener noreferrer' : undefined"
        >查看活动回顾</a>
        <a class="wbx-home-workshop__all" :href="withBase('/help/#workshop-registration')">查看全部活动</a>
      </div>
    </div>
    <img class="wbx-home-workshop__poster" :src="withBase(selection.edition.coverPath)" :alt="`WorkBuddy ${selection.edition.title}海报（${selection.edition.edition}）`" width="1800" height="2400">
  </section>
</template>
