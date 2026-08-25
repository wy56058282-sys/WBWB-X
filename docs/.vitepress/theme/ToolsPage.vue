<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import ServicePage from './ServicePage.vue'
import './tools.css'

const products = [
  { id: 'workbuddy', name: 'WorkBuddy' },
  { id: 'sparkx', name: 'SparkX' },
  { id: 'sunfun', name: 'SunFun' },
] as const

type ProductId = typeof products[number]['id']

const activeProduct = ref<ProductId>('workbuddy')
const tabButtons = ref<HTMLButtonElement[]>([])

function productFromLocation(): ProductId {
  const product = new URLSearchParams(window.location.search).get('product')
  return products.some((item) => item.id === product) ? product as ProductId : 'workbuddy'
}

function updateFromLocation() {
  activeProduct.value = productFromLocation()
}

function selectProduct(product: ProductId, updateHistory = true) {
  activeProduct.value = product
  if (!updateHistory) return

  const url = new URL(window.location.href)
  url.searchParams.set('product', product)
  window.history.pushState({}, '', `${url.pathname}${url.search}${url.hash}`)
}

async function handleTabKeydown(event: KeyboardEvent, index: number) {
  let nextIndex: number | undefined
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % products.length
  if (event.key === 'ArrowLeft') nextIndex = (index - 1 + products.length) % products.length
  if (event.key === 'Home') nextIndex = 0
  if (event.key === 'End') nextIndex = products.length - 1
  if (nextIndex === undefined) return

  event.preventDefault()
  selectProduct(products[nextIndex].id)
  await nextTick()
  tabButtons.value[nextIndex]?.focus()
}

onMounted(() => {
  updateFromLocation()
  window.addEventListener('popstate', updateFromLocation)
})
onBeforeUnmount(() => window.removeEventListener('popstate', updateFromLocation))
</script>

<template>
  <div class="wbx-tools">
    <header class="wbx-tools__header wbx-page-header">
      <p class="wbx-pixel-label">PRODUCT TOOLKIT</p>
      <h1>工具集</h1>
      <p>汇集 WorkBuddy-X 正在构建的产品，帮助你按任务与场景找到合适的 AI 工具。</p>
    </header>

    <div class="wbx-tools__tabs" role="tablist" aria-label="选择产品">
      <button
        v-for="(product, index) in products"
        :id="`product-tab-${product.id}`"
        :key="product.id"
        :ref="(element) => { if (element) tabButtons[index] = element as HTMLButtonElement }"
        type="button"
        role="tab"
        :aria-controls="`product-panel-${product.id}`"
        :aria-selected="activeProduct === product.id"
        :tabindex="activeProduct === product.id ? 0 : -1"
        @click="selectProduct(product.id)"
        @keydown="handleTabKeydown($event, index)"
      >{{ product.name }}</button>
    </div>

    <section
      v-if="activeProduct === 'workbuddy'"
      id="product-panel-workbuddy"
      role="tabpanel"
      aria-labelledby="product-tab-workbuddy"
      tabindex="0"
      class="wbx-tools__panel"
    >
      <ServicePage />
    </section>
    <section
      v-else
      :id="`product-panel-${activeProduct}`"
      role="tabpanel"
      :aria-labelledby="`product-tab-${activeProduct}`"
      tabindex="0"
      class="wbx-tools__panel wbx-tools__placeholder"
    >
      <p class="wbx-pixel-label">COMING SOON</p>
      <h2>{{ products.find((product) => product.id === activeProduct)?.name }}</h2>
      <p>产品介绍筹备中</p>
    </section>
  </div>
</template>
