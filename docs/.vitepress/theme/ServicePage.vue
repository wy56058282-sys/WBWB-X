<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import './service.css'

const installGuidePath = '/wb-x/第一篇 使用手册：先把 WorkBuddy 用起来/第 2 章 WorkBuddy的下载、安装、登录与更新/'
const command = ref('')
const currentRequest = ref('')
const consoleStage = ref<'idle' | 'typing' | 'planning' | 'running' | 'complete'>('idle')
const consoleProgress = ref(0)
const consoleLogs = ref<string[]>([])
const consoleAgents = ref<string[]>([])
const consoleBody = ref<HTMLElement | null>(null)
const tickerCount = ref(12_847)
const tickerPulse = ref(false)
const swarmMotionState = ref<'idle' | 'dispatching'>('idle')
const activeAgentIndices = ref<number[]>([])
const completedAgentIndices = ref<number[]>([])
const hotAgentIndices = ref<number[]>([])
const swarmPulse = ref(false)
const remoteStage = ref<'idle' | 'received' | 'running' | 'complete'>('idle')
const compareMotionState = ref<'idle' | 'running' | 'complete'>('idle')
const compareLeftMessages = ref<Array<{ id: string, kind: 'user' | 'assistant', text: string }>>([])
const compareRightMessages = ref<Array<{ id: string, kind: 'user' | 'system', text: string }>>([])
const compareProcessLines = ref<string[]>([])
const compareDeliverablesVisible = ref(false)
let revealObserver: IntersectionObserver | undefined
let motionObserver: IntersectionObserver | undefined

type Timer = ReturnType<typeof setTimeout>
const consoleTimers = new Set<Timer>()
const compareTimers = new Set<Timer>()
const swarmTimers = new Set<Timer>()
const remoteTimers = new Set<Timer>()
const tickerTimers = new Set<Timer>()
let autoScenarioIndex = 0
let consoleAutoCycle = true
let compareStarted = false
let swarmStarted = false
let remoteStarted = false
let swarmFrame: number | undefined
let swarmLastFrame = 0
let swarmCycleIndex = 0

type SwarmPoint = { x: number, y: number }
type SwarmParticle = { id: number, agentIndex: number, progress: number, speed: number }

const swarmCenter = { x: 450, y: 268 } as const
const swarmAgentDefinitions = [
  { abbr: 'DOC', label: '文档写作', task: '撰写报告第 3 章…', radius: 186 },
  { abbr: 'DAT', label: '数据分析', task: '透视表计算中…', radius: 150 },
  { abbr: 'PPT', label: 'PPT 设计', task: '排版 12 页幻灯片…', radius: 190 },
  { abbr: 'WEB', label: '网络调研', task: '抓取 38 篇资料…', radius: 152 },
  { abbr: 'DEV', label: '代码工程', task: '重构 utils.py…', radius: 186 },
  { abbr: 'FS', label: '文件管家', task: '归档 23 个文件…', radius: 150 },
  { abbr: 'VIS', label: '视觉设计', task: '生成 6 张配图…', radius: 190 },
] as const
const swarmNodes = ref<SwarmPoint[]>(swarmAgentDefinitions.map((agent, index) => {
  const angle = (-90 + index * (360 / swarmAgentDefinitions.length)) * Math.PI / 180
  return {
    x: swarmCenter.x + Math.cos(angle) * agent.radius,
    y: swarmCenter.y + Math.sin(angle) * agent.radius,
  }
}))
const swarmParticles = ref<SwarmParticle[]>([])
let swarmParticleId = 0

const scenarios = [
  {
    request: '帮我把桌面发票按月份归档，并生成报销汇总表',
    agents: ['指挥官', '文件管家', 'OCR 识别', '数据专家'],
    logs: ['扫描桌面文件，发现 23 张发票', '提取抬头、金额与日期', '按月份归档并统一重命名', '生成报销汇总表并校验'],
  },
  {
    request: '调研国内 AI 助手市场，做一份 12 页分析 PPT',
    agents: ['指挥官', '网络调研', '数据专家', '视觉专家'],
    logs: ['并行检索 38 篇公开资料', '交叉验证 12 组关键数据', '生成 6 张趋势与对比图', '完成 12 页 PPT 排版导出'],
  },
  {
    request: '分析 6 月销售数据，预测 7 月走势并给出建议',
    agents: ['指挥官', '数据专家', '文档专家'],
    logs: ['读取并清洗 18,402 行销售数据', '构建趋势模型并完成预测', '定位增长与下滑品类', '生成报告、图表与三条建议'],
  },
] as const

const commandComplete = computed(() => consoleStage.value === 'complete')
const remoteComplete = computed(() => remoteStage.value === 'complete')

watch([currentRequest, consoleStage, consoleLogs, consoleAgents], () => {
  if (!consoleBody.value) return
  consoleBody.value.scrollTop = consoleBody.value.scrollHeight
}, { flush: 'post' })

function schedule(timers: Set<Timer>, callback: () => void, delay: number) {
  const timer = setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
}

function clearTimers(timers: Set<Timer>) {
  timers.forEach((timer) => clearTimeout(timer))
  timers.clear()
}

function finishConsole() {
  consoleStage.value = 'complete'
  consoleProgress.value = 100
  consoleAgents.value = consoleAgents.value.map((agent) => `${agent} · 完成`)
  if (consoleAutoCycle) {
    schedule(consoleTimers, () => {
      autoScenarioIndex = (autoScenarioIndex + 1) % scenarios.length
      startAutoScenario()
    }, 4200)
  }
}

function executeScenario(logs: readonly string[]) {
  consoleStage.value = 'running'
  logs.forEach((log, index) => {
    schedule(consoleTimers, () => {
      consoleLogs.value = [...consoleLogs.value, log]
      consoleProgress.value = Math.round(((index + 1) / logs.length) * 100)
      if (index === logs.length - 1) schedule(consoleTimers, finishConsole, 420)
    }, index * 520)
  })
}

function typeScenario(request: string, onComplete: () => void) {
  command.value = ''
  consoleStage.value = 'typing'
  Array.from(request).forEach((character, index, characters) => {
    schedule(consoleTimers, () => {
      command.value += character
      if (index !== characters.length - 1) return
      schedule(consoleTimers, () => {
        currentRequest.value = request
        command.value = ''
        consoleStage.value = 'planning'
        schedule(consoleTimers, onComplete, 420)
      }, 180)
    }, index * 34)
  })
}

function startAutoScenario() {
  clearTimers(consoleTimers)
  const scenario = scenarios[autoScenarioIndex]
  currentRequest.value = ''
  consoleProgress.value = 0
  consoleLogs.value = []
  consoleAgents.value = scenario.agents.slice()
  typeScenario(scenario.request, () => executeScenario(scenario.logs))
}

function runUserScenario(request: string) {
  clearTimers(consoleTimers)
  consoleAutoCycle = false
  currentRequest.value = request
  consoleStage.value = 'planning'
  consoleProgress.value = 0
  consoleLogs.value = []
  consoleAgents.value = ['指挥官', '文档专家', '数据专家']
  const logs = ['理解需求并生成执行计划', '调用工具并处理任务素材', '校验结果并整理交付物', '导出任务成果']
  schedule(consoleTimers, () => executeScenario(logs), 360)
}

function swarmControlPoint(point: SwarmPoint, agentIndex: number) {
  const middleX = (swarmCenter.x + point.x) / 2
  const middleY = (swarmCenter.y + point.y) / 2
  const deltaX = point.x - swarmCenter.x
  const deltaY = point.y - swarmCenter.y
  const length = Math.hypot(deltaX, deltaY) || 1
  const offset = agentIndex % 2 === 0 ? 24 : -24
  return {
    x: middleX - deltaY / length * offset,
    y: middleY + deltaX / length * offset,
  }
}

function swarmPath(agentIndex: number) {
  const point = swarmNodes.value[agentIndex]
  const control = swarmControlPoint(point, agentIndex)
  return `M${swarmCenter.x},${swarmCenter.y} Q${control.x.toFixed(1)},${control.y.toFixed(1)} ${point.x.toFixed(1)},${point.y.toFixed(1)}`
}

function swarmParticlePoint(particle: SwarmParticle) {
  const end = swarmNodes.value[particle.agentIndex]
  const control = swarmControlPoint(end, particle.agentIndex)
  const progress = Math.max(0, Math.min(1, particle.progress))
  const inverse = 1 - progress
  return {
    x: inverse * inverse * swarmCenter.x + 2 * inverse * progress * control.x + progress * progress * end.x,
    y: inverse * inverse * swarmCenter.y + 2 * inverse * progress * control.y + progress * progress * end.y,
  }
}

function swarmAgentStatus(agentIndex: number) {
  if (completedAgentIndices.value.includes(agentIndex)) return '✓ 完成'
  if (activeAgentIndices.value.includes(agentIndex)) return swarmAgentDefinitions[agentIndex].task
  return swarmAgentDefinitions[agentIndex].label
}

function animateSwarm(timestamp: number) {
  const delta = swarmLastFrame ? Math.min(timestamp - swarmLastFrame, 40) : 16
  swarmLastFrame = timestamp
  const time = timestamp / 1000
  swarmNodes.value = swarmAgentDefinitions.map((agent, index) => {
    const angle = (-90 + index * (360 / swarmAgentDefinitions.length)) * Math.PI / 180
    return {
      x: swarmCenter.x + Math.cos(angle) * agent.radius + Math.sin(time * 0.55 + agent.radius) * 7,
      y: swarmCenter.y + Math.sin(angle) * agent.radius + Math.cos(time * 0.48 + agent.abbr.length * 2) * 7,
    }
  })
  swarmParticles.value = swarmParticles.value
    .map((particle) => ({ ...particle, progress: particle.progress + delta / 1000 * particle.speed }))
    .filter((particle) => particle.progress < 1)
  swarmFrame = window.requestAnimationFrame(animateSwarm)
}

function startSwarmFrame() {
  if (swarmFrame !== undefined || typeof window.requestAnimationFrame !== 'function') return
  swarmLastFrame = 0
  swarmFrame = window.requestAnimationFrame(animateSwarm)
}

function dispatchAgents() {
  if (!swarmStarted) return
  swarmMotionState.value = 'dispatching'
  activeAgentIndices.value = []
  completedAgentIndices.value = []
  hotAgentIndices.value = []
  swarmPulse.value = true
  schedule(swarmTimers, () => { swarmPulse.value = false }, 600)

  const targets = swarmCycleIndex % 2 === 0 ? [0, 2, 5] : [1, 3, 6]
  swarmCycleIndex += 1
  targets.forEach((agentIndex, targetIndex) => {
    const stagger = targetIndex * 180
    schedule(swarmTimers, () => {
      hotAgentIndices.value = [...hotAgentIndices.value, agentIndex]
      swarmParticles.value = [
        ...swarmParticles.value,
        { id: swarmParticleId++, agentIndex, progress: 0, speed: 0.82 },
        { id: swarmParticleId++, agentIndex, progress: -0.18, speed: 0.72 },
      ]
    }, stagger)
    schedule(swarmTimers, () => {
      hotAgentIndices.value = hotAgentIndices.value.filter((index) => index !== agentIndex)
    }, 1400 + stagger)
    schedule(swarmTimers, () => {
      activeAgentIndices.value = [...activeAgentIndices.value, agentIndex]
    }, 760 + stagger)
    schedule(swarmTimers, () => {
      activeAgentIndices.value = activeAgentIndices.value.filter((index) => index !== agentIndex)
      completedAgentIndices.value = [...completedAgentIndices.value, agentIndex]
    }, 3400 + stagger)
    schedule(swarmTimers, () => {
      completedAgentIndices.value = completedAgentIndices.value.filter((index) => index !== agentIndex)
      if (targetIndex !== targets.length - 1) return
      swarmMotionState.value = 'idle'
      schedule(swarmTimers, dispatchAgents, 540)
    }, 4300 + stagger)
  })
}

function startSwarmMotion() {
  if (swarmStarted) return
  swarmStarted = true
  startSwarmFrame()
  schedule(swarmTimers, dispatchAgents, 700)
}

function resetRemoteMotion() {
  remoteStage.value = 'idle'
}

function startRemoteCycle() {
  if (!remoteStarted) return
  clearTimers(remoteTimers)
  resetRemoteMotion()
  schedule(remoteTimers, () => { remoteStage.value = 'received' }, 320)
  schedule(remoteTimers, () => { remoteStage.value = 'running' }, 780)
  schedule(remoteTimers, () => { remoteStage.value = 'complete' }, 2460)
  schedule(remoteTimers, startRemoteCycle, 5200)
}

function startRemoteMotion() {
  if (remoteStarted) return
  remoteStarted = true
  startRemoteCycle()
}

const commandChips = [
  '整理合同重点条款',
  '分析销售数据并做成 PPT',
  '归档桌面发票',
] as const

const models = [
  { name: '混元', label: '全栈均衡', description: '日常办公的全能选择，适合指令理解、工具调用和企业微信生态协作。' },
  { name: 'DeepSeek', label: '推理与代码', description: '适合复杂推理、代码生成和结构化问题拆解。' },
  { name: 'GLM', label: '中文任务', description: '适合中文写作、知识问答和通用办公任务。' },
  { name: 'Kimi', label: '长文本处理', description: '擅长长文本阅读、资料梳理和多文档综合分析。' },
  { name: 'MiniMax', label: '创意表达', description: '适合内容创作、营销文案和多轮创意协作。' },
] as const
const selectedModel = ref(0)
const activeModel = computed(() => models[selectedModel.value])

const capabilities = [
  {
    index: '01',
    title: '自主规划，逐项执行',
    description: '你只负责提需求和验收。调研、起草、计算、排版和导出由指挥官拆成子任务逐项完成。',
    points: ['复杂任务自动拆解', '每一步日志可追溯', '成果直接交付验收'],
    visual: 'plan',
  },
  {
    index: '02',
    title: '文档、表格、图表、PPT，一句话产出',
    description: '从原始数据到完整报告，一条流水线完成分析、写作、画图和排版，拿到的是能直接使用的成品。',
    points: ['数据分析与结论成文', '图表随数据生成', 'PPT 自动排版'],
    visual: 'deliverables',
  },
  {
    index: '03',
    title: '直接处理本地文件',
    description: '经你授权后，WorkBuddy 可以读写本地文件夹，批量清洗 Excel、提取发票并归类重命名。',
    points: ['批量读取和重命名', 'Excel 跨表清洗合并', '权限可控、操作留痕'],
    visual: 'files',
  },
  {
    index: '04',
    title: '按任务切换合适模型',
    description: '五款主流大模型内置任选。写代码、做调研或创作内容，不用换工具，只需切换更合适的模型。',
    points: ['按任务自由切换', '兼容 MCP 技能生态', '能力持续扩展'],
    visual: 'models',
  },
] as const

const skills = [
  '数据清洗', 'PPT 生成', '会议纪要', '邮件草拟', '合同要点抽取', '简历初筛', '舆情监控', '行程规划', '多语翻译', '图片批处理', '报表合并',
  '代码审查', 'Bug 定位', '数据可视化', 'JD 撰写', '营销文案', '访谈整理', '知识库问答', 'Excel 公式', '网页信息采集', '文件重命名',
] as const

function chooseCommand(value: string) {
  command.value = value
}

function runCommand() {
  const nextRequest = command.value.trim()
  if (!nextRequest) return
  command.value = ''
  runUserScenario(nextRequest)
}

function runRemoteDemo() {
  clearTimers(remoteTimers)
  if (remoteComplete.value) {
    remoteStarted = true
    startRemoteCycle()
    return
  }
  remoteStage.value = 'complete'
}

function completeCompareMotion() {
  compareLeftMessages.value = [
    { id: 'left-user', kind: 'user', text: '帮我把桌面的发票整理归档，再做个汇总表' },
    { id: 'left-advice', kind: 'assistant', text: '好的！建议您按以下步骤操作：\n1. 在桌面新建按月份命名的文件夹\n2. 手动筛选出所有发票文件\n3. 逐张打开，核对金额与日期\n4. 分别移动进对应月份文件夹\n… 共 12 条建议，剩余部分需要您继续询问' },
    { id: 'left-follow-up', kind: 'assistant', text: '请问还需要我为您列出更详细的步骤吗？' },
  ]
  compareRightMessages.value = [
    { id: 'right-user', kind: 'user', text: '帮我把桌面的发票整理归档，再做个汇总表' },
    { id: 'right-system', kind: 'system', text: '◉ 指挥官已接管 · 已派发 3 个 Agent' },
  ]
  compareProcessLines.value = [
    '▸ 扫描 ~/Desktop · 发现 23 张发票',
    '▸ OCR 识别 · 提取抬头/金额/日期',
    '▸ 归档完成 · 写入汇总表',
  ]
  compareDeliverablesVisible.value = true
  compareMotionState.value = 'complete'
}

function startCompareMotion() {
  if (compareStarted) return
  compareStarted = true
  compareMotionState.value = 'running'

  schedule(compareTimers, () => compareLeftMessages.value.push({ id: 'left-user', kind: 'user', text: '帮我把桌面的发票整理归档，再做个汇总表' }), 300)
  schedule(compareTimers, () => compareRightMessages.value.push({ id: 'right-user', kind: 'user', text: '帮我把桌面的发票整理归档，再做个汇总表' }), 600)
  schedule(compareTimers, () => compareLeftMessages.value.push({ id: 'left-advice', kind: 'assistant', text: '好的！建议您按以下步骤操作：\n1. 在桌面新建按月份命名的文件夹\n2. 手动筛选出所有发票文件\n3. 逐张打开，核对金额与日期\n4. 分别移动进对应月份文件夹\n… 共 12 条建议，剩余部分需要您继续询问' }), 1700)
  schedule(compareTimers, () => compareLeftMessages.value.push({ id: 'left-follow-up', kind: 'assistant', text: '请问还需要我为您列出更详细的步骤吗？' }), 3200)
  schedule(compareTimers, () => compareRightMessages.value.push({ id: 'right-system', kind: 'system', text: '◉ 指挥官已接管 · 已派发 3 个 Agent' }), 4200)
  ;['▸ 扫描 ~/Desktop · 发现 23 张发票', '▸ OCR 识别 · 提取抬头/金额/日期', '▸ 归档完成 · 写入汇总表'].forEach((line, index) => {
    schedule(compareTimers, () => compareProcessLines.value.push(line), 4900 + index * 700)
  })
  schedule(compareTimers, () => {
    compareDeliverablesVisible.value = true
    compareMotionState.value = 'complete'
  }, 7000)
}

onMounted(() => {
  const targets = Array.from(document.querySelectorAll<HTMLElement>('.wbx-service [data-reveal]'))
  const reduceMotion = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    const scenario = scenarios[0]
    currentRequest.value = scenario.request
    consoleAgents.value = scenario.agents.map((agent) => `${agent} · 完成`)
    consoleLogs.value = scenario.logs.slice()
    consoleProgress.value = 100
    consoleStage.value = 'complete'
    compareStarted = true
    completeCompareMotion()
    remoteStage.value = 'complete'
    targets.forEach((target) => target.classList.add('is-visible'))
    return
  }

  schedule(consoleTimers, startAutoScenario, 500)
  schedule(tickerTimers, function tick() {
    tickerCount.value += 2
    tickerPulse.value = true
    schedule(tickerTimers, () => { tickerPulse.value = false }, 380)
    schedule(tickerTimers, tick, 2600)
  }, 2600)

  if (typeof IntersectionObserver === 'undefined') {
    targets.forEach((target) => target.classList.add('is-visible'))
    startCompareMotion()
    startSwarmMotion()
    startRemoteMotion()
    return
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      ;(entry.target as HTMLElement).classList.add('is-visible')
      revealObserver?.unobserve(entry.target)
    })
  }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' })
  targets.forEach((target) => revealObserver?.observe(target))

  motionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      if ((entry.target as HTMLElement).classList.contains('wbx-service-compare')) startCompareMotion()
      if ((entry.target as HTMLElement).classList.contains('wbx-service-swarm')) startSwarmMotion()
      if ((entry.target as HTMLElement).classList.contains('wbx-service-remote')) startRemoteMotion()
    })
  }, { threshold: 0.2 })
  const swarm = document.querySelector('.wbx-service-swarm')
  const remote = document.querySelector('.wbx-service-remote')
  const compare = document.querySelector('.wbx-service-compare')
  if (compare) motionObserver.observe(compare)
  if (swarm) motionObserver.observe(swarm)
  if (remote) motionObserver.observe(remote)
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
  motionObserver?.disconnect()
  ;[consoleTimers, compareTimers, swarmTimers, remoteTimers, tickerTimers].forEach(clearTimers)
  if (swarmFrame !== undefined) window.cancelAnimationFrame(swarmFrame)
})
</script>

<template>
  <article class="wbx-service">
    <header id="top" class="wbx-service-hero">
      <div class="wbx-service-hero__copy" data-reveal>
        <p class="wbx-service-tag">AI-NATIVE DESKTOP AGENT · 桌面智能体工作台</p>
        <h2 class="wbx-service-hero__title">一句话，<br>让 <em>AI</em> 替你上班。</h2>
        <p class="wbx-service-hero__summary">WorkBuddy 是运行在电脑上的智能体工作台。你只需提出任务，它会规划、拆解并执行，交付可直接使用的文件与结果。</p>
        <div class="wbx-service-hero__actions">
          <a class="wbx-service-button wbx-service-button--primary" href="https://www.workbuddy.cn/" target="_blank" rel="noopener noreferrer">
            <i class="hn hn-arrow-right" aria-hidden="true" />
            免费下载 WorkBuddy
          </a>
          <a class="wbx-service-button wbx-service-hero__cases" :href="withBase('/cases/')">查看案例</a>
        </div>
        <p class="wbx-service-live"><span aria-hidden="true" />指挥官就绪 · 7 个 Agent 待命 · 本周已交付 <strong :class="{ 'is-ticking': tickerPulse }">{{ tickerCount.toLocaleString() }}</strong> 个任务</p>
      </div>

      <div class="wbx-service-console" :data-stage="consoleStage" data-reveal>
        <div class="wbx-service-console__bar">
          <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
          <strong>WorkBuddy · 智能体工作台</strong><small>v2.1.0</small>
        </div>
        <div ref="consoleBody" class="wbx-service-console__body" aria-live="polite">
          <p class="wbx-service-console__request">{{ currentRequest ? `“${currentRequest}”` : '等待下一条任务指令…' }}</p>
          <div class="wbx-service-console__agents">
            <span v-for="agent in consoleAgents" :key="agent">{{ agent }}</span>
          </div>
          <ol class="wbx-service-console__log">
            <li v-if="consoleStage === 'planning'"><i class="hn hn-robot" aria-hidden="true" />指挥官正在规划任务…</li>
            <li v-for="log in consoleLogs" :key="log"><i class="hn hn-check-box" aria-hidden="true" />{{ log }}</li>
          </ol>
          <div class="wbx-service-console__progress" role="progressbar" aria-label="任务执行进度" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="consoleProgress"><span><i :style="{ width: `${consoleProgress}%` }" /></span><strong>{{ consoleProgress }}%</strong></div>
          <div v-if="commandComplete" class="wbx-service-console__deliverable">
            <i class="hn hn-book-bookmark-solid" aria-hidden="true" />
            <span><strong>任务成果.zip</strong><small>3 个文件 · 已交付</small></span>
          </div>
        </div>
        <form class="wbx-service-console__form" @submit.prevent="runCommand">
          <div class="wbx-service-console__chips">
            <button v-for="chip in commandChips" :key="chip" type="button" @click="chooseCommand(chip)">{{ chip }}</button>
          </div>
          <label for="service-command" class="wbx-service-sr-only">输入想让 WorkBuddy 完成的任务</label>
          <div class="wbx-service-console__input">
            <input id="service-command" v-model="command" :readonly="consoleStage === 'typing'" placeholder="试着让它干点活……" autocomplete="off">
            <button type="submit" aria-label="发送任务"><i class="hn hn-arrow-right" aria-hidden="true" /></button>
          </div>
        </form>
      </div>
    </header>

    <section id="shift" class="wbx-service-section" aria-labelledby="shift-title">
      <div class="wbx-service-heading" data-reveal>
        <p class="wbx-service-tag">01 · MINDSET</p>
        <h2 id="shift-title">不只给建议，直接交付结果</h2>
        <p>聊天机器人教你怎么做，WorkBuddy 直接替你做完。同样一句话，两种完全不同的结局。</p>
      </div>
      <div class="wbx-service-compare" :data-motion-state="compareMotionState" data-reveal>
        <article class="wbx-service-compare__card is-muted">
          <header><strong>传统聊天机器人</strong><span>仅输出建议</span></header>
          <div class="wbx-service-compare__chat">
            <p v-for="message in compareLeftMessages" :key="message.id" class="wbx-service-compare__message" :class="`is-${message.kind}`">{{ message.text }}</p>
          </div>
          <footer>产出文件：0 · 需要你动手的：全部</footer>
        </article>
        <i class="hn hn-arrow-right wbx-service-compare__arrow" aria-hidden="true" />
        <article class="wbx-service-compare__card is-active">
          <header><strong>WorkBuddy 智能体</strong><span>直接交付</span></header>
          <div class="wbx-service-compare__chat">
            <p v-for="message in compareRightMessages" :key="message.id" class="wbx-service-compare__message" :class="`is-${message.kind}`">{{ message.text }}</p>
            <div v-if="compareProcessLines.length" class="wbx-service-compare__process">
              <span v-for="line in compareProcessLines" :key="line">{{ line }}</span>
            </div>
            <div v-if="compareDeliverablesVisible" class="wbx-service-compare__deliverables">
              <div class="wbx-service-compare__deliverable"><i class="hn hn-chart-line" aria-hidden="true" /><span><strong>报销汇总_2026H1.xlsx</strong><small>23 行 · 4 列 · 含透视表</small></span></div>
              <div class="wbx-service-compare__deliverable"><i class="hn hn-folder-open" aria-hidden="true" /><span><strong>发票归档/</strong><small>6 个子文件夹 · 23 个文件</small></span></div>
            </div>
          </div>
          <footer>产出文件：2 · 需要你动手的：验收 · 耗时 2 分 47 秒</footer>
        </article>
      </div>
    </section>

    <section id="swarm" class="wbx-service-section" aria-labelledby="swarm-title">
      <div class="wbx-service-heading" data-reveal>
        <p class="wbx-service-tag">02 · AGENT SWARM</p>
        <h2 id="swarm-title">一个指令，多个 <em>Agent</em> 协同执行</h2>
        <p>指挥官接收指令后，动态派发给文档、数据、设计等专职 Agent。它们同时开工，再把结果汇总回你面前。</p>
      </div>
      <div class="wbx-service-swarm" :data-motion-state="swarmMotionState" data-reveal>
        <svg class="wbx-service-swarm__map" viewBox="0 0 900 560" role="img" aria-label="指挥官动态派发任务给七个专职 Agent 的协作网络">
          <g class="wbx-service-swarm__grid" aria-hidden="true">
            <circle v-for="radius in [95, 180, 262]" :key="radius" :cx="swarmCenter.x" :cy="swarmCenter.y" :r="radius" />
            <line :x1="swarmCenter.x - 262" :y1="swarmCenter.y" :x2="swarmCenter.x + 262" :y2="swarmCenter.y" />
            <line :x1="swarmCenter.x" :y1="swarmCenter.y - 262" :x2="swarmCenter.x" :y2="swarmCenter.y + 262" />
          </g>
          <g class="wbx-service-swarm__links" aria-hidden="true">
            <path
              v-for="(_, index) in swarmAgentDefinitions"
              :key="`path-${index}`"
              class="wbx-service-swarm__path"
              :class="{ 'is-hot': hotAgentIndices.includes(index) }"
              :d="swarmPath(index)"
            />
          </g>
          <g class="wbx-service-swarm__particles" aria-hidden="true">
            <circle
              v-for="particle in swarmParticles.filter((item) => item.progress >= 0)"
              :key="particle.id"
              class="wbx-service-swarm__particle"
              :cx="swarmParticlePoint(particle).x"
              :cy="swarmParticlePoint(particle).y"
              r="3"
            />
          </g>
          <g class="wbx-service-swarm__agents">
            <g
              v-for="(agent, index) in swarmAgentDefinitions"
              :key="agent.abbr"
              class="wbx-service-swarm__agent"
              :class="{ 'is-active': activeAgentIndices.includes(index), 'is-done': completedAgentIndices.includes(index) }"
              :transform="`translate(${swarmNodes[index].x.toFixed(1)},${swarmNodes[index].y.toFixed(1)})`"
            >
              <g class="wbx-service-swarm__agent-inner">
                <circle r="32" />
                <text class="wbx-service-swarm__abbr" y="4">{{ agent.abbr }}</text>
              </g>
              <text class="wbx-service-swarm__status" y="52">{{ swarmAgentStatus(index) }}</text>
            </g>
            <g class="wbx-service-swarm__core" :class="{ 'is-pulsing': swarmPulse }" :transform="`translate(${swarmCenter.x},${swarmCenter.y})`">
              <g class="wbx-service-swarm__core-inner">
                <circle class="wbx-service-swarm__core-fill" r="46" />
                <circle class="wbx-service-swarm__core-ring" r="37" />
                <text class="wbx-service-swarm__core-symbol" y="6">❯_</text>
              </g>
              <text class="wbx-service-swarm__core-label" y="76">指挥官</text>
              <text class="wbx-service-swarm__core-subtitle" y="93">ORCHESTRATOR</text>
            </g>
          </g>
        </svg>
        <dl><div><dt>7+</dt><dd>专职 Agent 随叫随到</dd></div><div><dt>并行</dt><dd>多任务同时推进</dd></div><div><dt>&lt;1s</dt><dd>任务拆解与派发</dd></div></dl>
      </div>
    </section>

    <section id="capabilities" class="wbx-service-section" aria-labelledby="capabilities-title">
      <div class="wbx-service-heading" data-reveal>
        <p class="wbx-service-tag">03 · CAPABILITIES</p>
        <h2 id="capabilities-title">从任务到交付，全流程<em>自动完成</em></h2>
      </div>

      <article v-for="capability in capabilities" :key="capability.index" class="wbx-service-capability" data-reveal>
        <span class="wbx-service-capability__number">{{ capability.index }}</span>
        <div class="wbx-service-capability__copy">
          <h3>{{ capability.title }}</h3><p>{{ capability.description }}</p>
          <ul><li v-for="point in capability.points" :key="point">{{ point }}</li></ul>
        </div>
        <div class="wbx-service-capability__visual">
          <div v-if="capability.visual === 'plan'" class="wbx-service-flow">
            <strong>“做一份行业分析报告”</strong><span>检索 38 篇公开资料</span><span>交叉验证 12 组数据</span><span>撰写并排版报告</span><b>行业分析报告.docx · 已交付</b>
          </div>
          <div v-else-if="capability.visual === 'deliverables'" class="wbx-service-deliverables">
            <span><i class="hn hn-book" aria-hidden="true" /><b>文档报告</b><small>report.docx</small></span>
            <span><i class="hn hn-grid" aria-hidden="true" /><b>数据表格</b><small>data.xlsx</small></span>
            <span><i class="hn hn-chart-line" aria-hidden="true" /><b>可视化图表</b><small>chart.png</small></span>
            <span><i class="hn hn-video-camera" aria-hidden="true" /><b>演示文稿</b><small>deck.pptx</small></span>
          </div>
          <div v-else-if="capability.visual === 'files'" class="wbx-service-files">
            <p><i class="hn hn-folder-open" aria-hidden="true" /> ~/Desktop · 扫描完成</p>
            <span>发票_0301_scan.jpg <b>✓</b></span><span>差旅发票_apr.pdf <b>✓</b></span><span>餐费_0512.ofd <b>✓</b></span><strong>已归档至 /发票/2026-06/</strong>
          </div>
          <div v-else class="wbx-service-model">
            <div class="wbx-service-model__tabs" role="tablist" aria-label="选择模型">
              <button v-for="(model, index) in models" :key="model.name" type="button" class="wbx-service-model__tab" role="tab" :aria-selected="selectedModel === index" @click="selectedModel = index">{{ model.name }}</button>
            </div>
            <div :key="activeModel.name" class="wbx-service-model__detail" role="tabpanel"><strong>{{ activeModel.name }}</strong><span>{{ activeModel.label }}</span><p>{{ activeModel.description }}</p></div>
          </div>
        </div>
      </article>
    </section>

    <section id="remote" class="wbx-service-section" aria-labelledby="remote-title">
      <div class="wbx-service-heading" data-reveal>
        <p class="wbx-service-tag">04 · REMOTE CONTROL</p>
        <h2 id="remote-title">不在电脑前，任务也能<em>继续</em></h2>
        <p>绑定微信、企业微信、飞书或钉钉，在手机上发一句话，家里的电脑就开始干活，结果直接回到聊天窗口。</p>
      </div>
      <div class="wbx-service-remote" :data-stage="remoteStage" data-reveal>
        <div class="wbx-service-phone">
          <header><i class="hn hn-robot" aria-hidden="true" /><span><strong>WorkBuddy</strong><small>● 在线 · 已绑定你的电脑</small></span></header>
          <p>整理 Q2 销售数据，生成报告发我</p>
          <div v-if="remoteStage === 'received' || remoteStage === 'running'"><strong>{{ remoteStage === 'received' ? '电脑已接收任务' : '3 个 Agent 正在执行' }}</strong><span>{{ remoteStage === 'received' ? '等待执行' : '读取数据 · 分析 · 排版' }}</span></div>
          <div v-if="remoteComplete"><strong>任务完成</strong><span>销售分析报告.pdf · 已交付</span></div>
          <footer>说句话，遥控你的电脑…</footer>
        </div>
        <div class="wbx-service-remote__channels"><span>微信</span><span>企业微信</span><span>飞书</span><span>钉钉</span><i class="hn hn-arrow-right" aria-hidden="true" /></div>
        <div class="wbx-service-laptop">
          <header>REMOTE CMD · 来自微信</header><p>“整理 Q2 销售数据，生成报告发我”</p>
          <strong class="wbx-service-remote__state">{{ remoteStage === 'complete' ? '已交付 · 3 个文件' : remoteStage === 'running' ? '执行中 · 3 个 Agent' : remoteStage === 'received' ? '已接收 · 排队执行' : '等待执行' }}</strong>
          <button class="wbx-service-remote__run" type="button" @click="runRemoteDemo">{{ remoteComplete ? '重新演示' : '运行演示' }}</button>
        </div>
      </div>
    </section>

    <section id="skills" class="wbx-service-section wbx-service-skills" aria-labelledby="skills-title">
      <div class="wbx-service-heading" data-reveal>
        <p class="wbx-service-tag">05 · SKILLS</p>
        <h2 id="skills-title">覆盖更多常见工作场景</h2>
      </div>
      <div class="wbx-service-skills__marquee" data-reveal>
        <div><span v-for="skill in [...skills, ...skills]" :key="`a-${skill}`">{{ skill }}</span></div>
        <div><span v-for="skill in [...skills].reverse().concat([...skills].reverse())" :key="`b-${skill}`">{{ skill }}</span></div>
      </div>
    </section>

    <section id="download" class="wbx-service-section wbx-service-download" aria-labelledby="download-title">
      <div data-reveal>
        <p class="wbx-service-tag">06 · GET STARTED</p>
        <h2 id="download-title">把重复工作交给 WorkBuddy</h2>
        <p>现在安装 WorkBuddy，让第一位数字同事今天入职——不打卡，不摸鱼，随叫随到。</p>
        <div class="wbx-service-download__actions">
          <a class="wbx-service-button wbx-service-button--primary" href="https://www.workbuddy.cn/" target="_blank" rel="noopener noreferrer">前往官网下载</a>
          <a class="wbx-service-button wbx-service-install-guide" :href="withBase(installGuidePath)">阅读安装指南</a>
        </div>
        <small>Windows 10/11 · macOS 10.15+ · 具体版本与安装要求以官网为准</small>
      </div>
    </section>
  </article>
</template>
