<script setup lang="ts">
import { computed } from 'vue'
import { digitTiming, digitTokens } from './analyticsFlipValue'

const props = defineProps<{ value: string }>()
const tokens = computed(() => digitTokens(props.value))
</script>

<template>
  <span class="wbx-flip-value">
    <span class="wbx-sr-only">{{ value }}</span>
    <span class="wbx-flip-value__visual" aria-hidden="true">
      <template v-for="token in tokens" :key="token.id">
        <span v-if="token.kind === 'separator'" class="wbx-flip-value__separator">
          {{ token.char }}
        </span>
        <span
          v-else
          class="wbx-flip-value__digit"
          :data-place="token.place"
          :style="{
            '--wbx-digit-duration': digitTiming(token.place).duration,
            '--wbx-digit-delay': digitTiming(token.place).delay,
          }"
        >
          <Transition name="wbx-digit" appear>
            <span :key="token.char" class="wbx-flip-value__glyph">{{ token.char }}</span>
          </Transition>
        </span>
      </template>
    </span>
  </span>
</template>
