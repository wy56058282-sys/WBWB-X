<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  homeWorkshopReferenceTime,
  nextWorkshopRefreshDelay,
  selectRelevantWorkshopEdition,
  workshopEditions,
  type WorkshopEdition,
} from '../workshop-editions'
import './workshop.css'

const props = defineProps<{
  editions?: readonly WorkshopEdition[]
}>()

const editions = computed(() => props.editions ?? workshopEditions)
const currentTime = ref(homeWorkshopReferenceTime)
const relevantSelection = computed(() => selectRelevantWorkshopEdition(editions.value, currentTime.value))
const selectedWorkshopIndex = ref(Math.max(0, editions.value.findIndex((edition) => edition.id === relevantSelection.value?.edition.id)))
const selectedPosterIndex = ref(0)
const selectedWorkshop = computed(() => editions.value[selectedWorkshopIndex.value])
const selectedPosterPath = computed(() => selectedWorkshop.value?.posterPaths[selectedPosterIndex.value])
const selectedDisplayPosterPath = computed(() => selectedWorkshop.value?.displayPosterPaths?.[selectedPosterIndex.value])
const selectedStatus = computed(() => {
  if (!selectedWorkshop.value) return undefined
  return selectRelevantWorkshopEdition([selectedWorkshop.value], currentTime.value)?.status
})
const isRegistrationOpen = ref(false)
const shouldLoadImages = ref(typeof window !== 'undefined' && typeof window.IntersectionObserver !== 'function')
const workshopSection = ref<HTMLElement | null>(null)
const registration = ref<HTMLElement | null>(null)
const trigger = ref<HTMLButtonElement | null>(null)
const recap = ref<HTMLAnchorElement | null>(null)
let refreshTimer: ReturnType<typeof window.setTimeout> | undefined
let imageObserver: IntersectionObserver | undefined

function closeRegistration(restoreFocus = false) {
  isRegistrationOpen.value = false
  if (restoreFocus) nextTick(() => trigger.value?.focus())
}

function toggleRegistration() {
  if (isRegistrationOpen.value) closeRegistration(true)
  else isRegistrationOpen.value = true
}

function handleOutsidePointer(event: PointerEvent) {
  if (!isRegistrationOpen.value || registration.value?.contains(event.target as Node)) return
  const target = event.target as Element
  const keepsOwnFocus = target.closest?.('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
  closeRegistration(!keepsOwnFocus)
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape' && isRegistrationOpen.value) {
    event.preventDefault()
    closeRegistration(true)
  }
}

function selectWorkshop(index: number) {
  closeRegistration()
  selectedWorkshopIndex.value = index
  selectedPosterIndex.value = 0
}

function selectAdjacentPoster(offset: -1 | 1) {
  const pageCount = selectedWorkshop.value.posterPaths.length
  selectedPosterIndex.value = (selectedPosterIndex.value + offset + pageCount) % pageCount
}

function handleWorkshopTabKeydown(event: KeyboardEvent, index: number) {
  const lastIndex = editions.value.length - 1
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

function selectRelevantWorkshop() {
  const nextId = relevantSelection.value?.edition.id
  const nextIndex = editions.value.findIndex((edition) => edition.id === nextId)
  if (nextIndex >= 0 && nextIndex !== selectedWorkshopIndex.value) selectWorkshop(nextIndex)
}

function scheduleWorkshopRefresh() {
  if (refreshTimer !== undefined) {
    window.clearTimeout(refreshTimer)
    refreshTimer = undefined
  }

  const delay = nextWorkshopRefreshDelay(editions.value, currentTime.value)
  if (delay === undefined) return

  refreshTimer = window.setTimeout(() => {
    currentTime.value = new Date()
    selectRelevantWorkshop()
    scheduleWorkshopRefresh()
  }, delay)
}

watch(selectedStatus, (nextStatus) => {
  if (nextStatus !== 'past' || !isRegistrationOpen.value) return
  isRegistrationOpen.value = false
  nextTick(() => recap.value?.focus())
})

onMounted(() => {
  currentTime.value = new Date()
  selectRelevantWorkshop()
  scheduleWorkshopRefresh()
  document.addEventListener('pointerdown', handleOutsidePointer)
  window.addEventListener('keydown', handleEscape)
  if (typeof window.IntersectionObserver !== 'function') {
    shouldLoadImages.value = true
  } else {
    imageObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return
      shouldLoadImages.value = true
      imageObserver?.disconnect()
      imageObserver = undefined
    }, { rootMargin: '600px 0px' })
    if (workshopSection.value) imageObserver.observe(workshopSection.value)
  }
})
onBeforeUnmount(() => {
  if (refreshTimer !== undefined) window.clearTimeout(refreshTimer)
  document.removeEventListener('pointerdown', handleOutsidePointer)
  window.removeEventListener('keydown', handleEscape)
  imageObserver?.disconnect()
})
</script>

<template>
  <section
    v-if="selectedWorkshop"
    ref="workshopSection"
    id="workshop-registration"
    class="wbx-section wbx-home-workshop wbx-workshop"
    aria-labelledby="workshop-title"
  >
    <div
      id="workshop-panel"
      class="wbx-workshop__panel"
      role="tabpanel"
      :aria-labelledby="`workshop-tab-${selectedWorkshop.id}`"
    >
      <div class="wbx-workshop__left">
        <div class="wbx-workshop__copy">
          <div class="wbx-workshop__heading">
            <p class="wbx-workshop__eyebrow">WORKBUDDY X WORKSHOP</p>
            <h2 id="workshop-title">WorkBuddy X 工作坊 <span class="wbx-workshop__title-edition">{{ selectedWorkshop.edition }}</span></h2>
            <p class="wbx-workshop__summary">先用一场工作坊，找到值得定制的真问题</p>
          </div>
          <p class="wbx-workshop__audience">面向人群：创业者、管理者、设计师、超级个体、一人公司（OPC）</p>
          <dl class="wbx-workshop__facts" :aria-label="`${selectedWorkshop.edition}工作坊信息`">
            <div><dt>时间</dt><dd><span>{{ selectedWorkshop.fullDate }}</span><span>{{ selectedWorkshop.time }}</span></dd></div>
            <div><dt>规模</dt><dd>{{ selectedWorkshop.capacity }}</dd></div>
            <div><dt>地点</dt><dd><span>{{ selectedWorkshop.venue }}</span><span>{{ selectedWorkshop.area }}</span></dd></div>
          </dl>
          <div class="wbx-workshop__actions">
            <div v-if="selectedStatus !== 'past'" ref="registration" class="wbx-home-workshop__registration">
              <button
                ref="trigger"
                class="wbx-workshop__action wbx-workshop__action--primary wbx-home-workshop__registration-trigger"
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
                <img v-if="isRegistrationOpen" :src="withBase(selectedWorkshop.registrationQrPath)" alt="粗门报名二维码" width="466" height="466">
                <strong>微信扫码报名</strong>
              </div>
            </div>
            <a
              v-else
              ref="recap"
              class="wbx-workshop__action wbx-workshop__action--primary wbx-home-workshop__recap"
              :href="selectedWorkshop.activityDetailUrl || '#workshop-history'"
              :target="selectedWorkshop.activityDetailUrl ? '_blank' : undefined"
              :rel="selectedWorkshop.activityDetailUrl ? 'noopener noreferrer' : undefined"
              :aria-label="selectedWorkshop.activityDetailUrl ? '查看活动回顾（在新页面打开）' : undefined"
            >查看活动回顾</a>
          </div>
          <p class="wbx-workshop__reminder">
            <i class="hn hn-laptop-code" aria-hidden="true" />
            <span>携带电脑</span>
          </p>
        </div>
        <div id="workshop-history" class="wbx-workshop__editions" role="tablist" aria-label="选择工作坊期次">
          <button
            v-for="(edition, index) in editions"
            :id="`workshop-tab-${edition.id}`"
            :key="edition.id"
            class="wbx-workshop__edition"
            type="button"
            role="tab"
            aria-controls="workshop-panel"
            :aria-selected="selectedWorkshopIndex === index"
            :tabindex="selectedWorkshopIndex === index ? 0 : -1"
            :aria-label="`查看${edition.edition} ${edition.date} 工作坊信息`"
            @click="selectWorkshop(index)"
            @keydown="handleWorkshopTabKeydown($event, index)"
          >
            <picture v-if="shouldLoadImages">
              <source v-if="edition.thumbnailPath" type="image/webp" :srcset="withBase(edition.thumbnailPath)">
              <img
                :src="withBase(edition.coverPath)"
                alt=""
                width="1800"
                height="2400"
                loading="lazy"
                decoding="async"
              >
            </picture>
            <span v-else class="wbx-workshop__edition-placeholder" aria-hidden="true" />
            <span><strong>{{ edition.edition }}</strong><span>{{ edition.date }}</span></span>
            <span
              v-if="selectedWorkshopIndex === index"
              class="wbx-workshop__edition-status"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
      <figure class="wbx-workshop__media">
        <a
          v-if="selectedWorkshop.activityDetailUrl"
          class="wbx-workshop__poster-link"
          :href="selectedWorkshop.activityDetailUrl"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="`查看工作坊活动详情（${selectedWorkshop.edition}，在新页面打开）`"
        >
          <picture v-if="shouldLoadImages">
            <source v-if="selectedDisplayPosterPath" type="image/webp" :srcset="withBase(selectedDisplayPosterPath)">
            <img class="wbx-workshop__poster wbx-home-workshop__poster" :src="withBase(selectedPosterPath)" :alt="`WorkBuddy 场景实战工作坊海报（${selectedWorkshop.edition}，第 ${selectedPosterIndex + 1} 页）`" width="1800" height="2400" decoding="async">
          </picture>
          <span v-else class="wbx-workshop__poster-placeholder" aria-hidden="true" />
        </a>
        <div v-else class="wbx-workshop__poster-frame">
          <picture v-if="shouldLoadImages">
            <source v-if="selectedDisplayPosterPath" type="image/webp" :srcset="withBase(selectedDisplayPosterPath)">
            <img class="wbx-workshop__poster wbx-home-workshop__poster" :src="withBase(selectedPosterPath)" :alt="`WorkBuddy 场景实战工作坊海报（${selectedWorkshop.edition}，第 ${selectedPosterIndex + 1} 页）`" width="1800" height="2400" decoding="async">
          </picture>
          <span v-else class="wbx-workshop__poster-placeholder" aria-hidden="true" />
        </div>
      </figure>
      <div class="wbx-workshop__poster-navigation" aria-label="切换海报页面">
        <span class="wbx-workshop__poster-page" aria-live="polite">{{ selectedPosterIndex + 1 }} / {{ selectedWorkshop.posterPaths.length }}</span>
        <div v-if="selectedWorkshop.posterPaths.length > 1" class="wbx-workshop__poster-actions">
          <button class="wbx-workshop__poster-control wbx-workshop__poster-control--previous" type="button" aria-label="查看上一张海报" @click="selectAdjacentPoster(-1)"><span aria-hidden="true">←</span></button>
          <button class="wbx-workshop__poster-control wbx-workshop__poster-control--next" type="button" aria-label="查看下一张海报" @click="selectAdjacentPoster(1)"><span aria-hidden="true">→</span></button>
        </div>
      </div>
    </div>
  </section>
</template>
