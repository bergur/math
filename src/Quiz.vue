<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { TABLE_COLORS, formatTime, questionsRandom } from './tables.ts'

const props = defineProps<{ table: number; isTimed: boolean }>()
const emit = defineEmits<{ finished: [elapsedMs: number] }>()

// The answer is at most 100, so three digits is enough.
const MAX_DIGITS = 3
const CLOCK_TICK_MS = 100

const questions = questionsRandom(props.table)
const index = ref(0)
const answer = ref('')
const isWrong = ref(false)
// Bumped on every wrong answer, so the wiggle plays again even after two wrong answers in a row.
const wrongCount = ref(0)

const question = computed(() => questions[index.value])
const colors = computed(() => TABLE_COLORS[props.table])

// Timed mode: the clock runs from the first question until the last one is answered right.
const startedAt = Date.now()
const elapsedMs = ref(0)
let clock: number | undefined

function stopClock() {
  clearInterval(clock)
  elapsedMs.value = Date.now() - startedAt
}

function press(digit: string) {
  if (answer.value.length >= MAX_DIGITS) return
  isWrong.value = false
  answer.value += digit
}

function erase() {
  isWrong.value = false
  answer.value = answer.value.slice(0, -1)
}

// A wrong answer is cleared so she can try again; the question only moves on when it's right.
function check() {
  if (answer.value === '') return
  if (Number(answer.value) !== question.value.table * question.value.times) {
    isWrong.value = true
    wrongCount.value++
    answer.value = ''
    return
  }
  // A right answer moves straight on to the next question.
  if (index.value === questions.length - 1) {
    stopClock()
    return emit('finished', elapsedMs.value)
  }
  index.value++
  answer.value = ''
  isWrong.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (/^[0-9]$/.test(event.key)) press(event.key)
  else if (event.key === 'Backspace') erase()
  else if (event.key === 'Enter') check()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  if (props.isTimed) clock = window.setInterval(() => (elapsedMs.value = Date.now() - startedAt), CLOCK_TICK_MS)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  clearInterval(clock)
})
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col items-center gap-5">
    <p v-if="isTimed" class="rounded-full bg-white px-5 py-1 font-mono text-3xl font-extrabold tabular-nums shadow-sm" :class="colors.text">
      ⏱️ {{ formatTime(elapsedMs) }}
    </p>

    <!-- One dot per question: filled when answered. -->
    <div class="flex flex-wrap justify-center gap-1.5">
      <span
        v-for="(_, dot) in questions"
        :key="dot"
        class="size-4 rounded-full transition-colors"
        :class="dot < index ? colors.fill : 'bg-white ring-2 ring-black/10'"
      ></span>
    </div>

    <!-- Pops in for each new question, and wiggles on each wrong answer. -->
    <div :key="index" class="w-full animate-pop">
      <div
        :key="wrongCount"
        class="rounded-3xl bg-white p-6 text-center shadow-lg"
        :class="{ 'animate-wiggle': isWrong }"
      >
        <p class="text-6xl font-extrabold md:text-7xl">
          {{ question.table }} <span :class="colors.text">×</span> {{ question.times }}
        </p>
        <p class="mt-2 text-5xl font-extrabold md:text-6xl">
          = <span class="inline-block min-w-[2.5ch] border-b-4 border-dashed border-current" :class="colors.text">{{ answer || '?' }}</span>
        </p>
        <p class="mt-3 h-9 text-2xl font-bold">
          <span v-if="isWrong" class="text-orange-500">🤔 Not quite, try again!</span>
        </p>
      </div>
    </div>

    <div class="grid w-full grid-cols-3 gap-3">
      <button
        v-for="digit in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
        :key="digit"
        class="btn py-4 text-3xl"
        :class="colors.button"
        @click="press(digit)"
      >
        {{ digit }}
      </button>
      <button class="btn border-slate-500 bg-slate-400 py-4 text-3xl" aria-label="Erase" @click="erase">⌫</button>
      <button class="btn py-4 text-3xl" :class="colors.button" @click="press('0')">0</button>
      <button class="btn border-emerald-700 bg-emerald-500 py-4 text-3xl" aria-label="Check answer" @click="check">✓</button>
    </div>
  </div>
</template>
