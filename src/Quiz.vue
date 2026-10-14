<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { TABLE_COLORS, questionsRandom } from './tables.ts'

const props = defineProps<{ table: number }>()
const emit = defineEmits<{ finished: [] }>()

// The answer is at most 100, so three digits is enough.
const MAX_DIGITS = 3
const NEXT_QUESTION_DELAY_MS = 800

const questions = questionsRandom(props.table)
const index = ref(0)
const answer = ref('')
const feedback = ref<'right' | 'wrong' | null>(null)
// Bumped on every wrong answer, so the wiggle plays again even after two wrong answers in a row.
const wrongCount = ref(0)

const question = computed(() => questions[index.value])
const colors = computed(() => TABLE_COLORS[props.table])

function press(digit: string) {
  if (feedback.value === 'right' || answer.value.length >= MAX_DIGITS) return
  feedback.value = null
  answer.value += digit
}

function erase() {
  if (feedback.value === 'right') return
  feedback.value = null
  answer.value = answer.value.slice(0, -1)
}

// A wrong answer is cleared so she can try again; the question only moves on when it's right.
function check() {
  if (answer.value === '' || feedback.value === 'right') return
  if (Number(answer.value) !== question.value.table * question.value.times) {
    feedback.value = 'wrong'
    wrongCount.value++
    answer.value = ''
    return
  }
  feedback.value = 'right'
  setTimeout(() => {
    if (index.value === questions.length - 1) return emit('finished')
    index.value++
    answer.value = ''
    feedback.value = null
  }, NEXT_QUESTION_DELAY_MS)
}

function onKeydown(event: KeyboardEvent) {
  if (/^[0-9]$/.test(event.key)) press(event.key)
  else if (event.key === 'Backspace') erase()
  else if (event.key === 'Enter') check()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="mx-auto flex w-full max-w-md flex-col items-center gap-5">
    <!-- One dot per question: filled when answered. -->
    <div class="flex flex-wrap justify-center gap-1.5">
      <span
        v-for="(_, dot) in questions"
        :key="dot"
        class="size-4 rounded-full transition-colors"
        :class="dot < index || (dot === index && feedback === 'right') ? colors.fill : 'bg-white ring-2 ring-black/10'"
      ></span>
    </div>

    <!-- Pops in for each new question, and wiggles on each wrong answer. -->
    <div :key="index" class="w-full animate-pop">
      <div
        :key="wrongCount"
        class="rounded-3xl bg-white p-6 text-center shadow-lg"
        :class="{ 'animate-wiggle': feedback === 'wrong' }"
      >
        <p class="text-6xl font-extrabold md:text-7xl">
          {{ question.table }} <span :class="colors.text">×</span> {{ question.times }}
        </p>
        <p class="mt-2 text-5xl font-extrabold md:text-6xl">
          = <span class="inline-block min-w-[2.5ch] border-b-4 border-dashed border-current" :class="colors.text">{{ answer || '?' }}</span>
        </p>
        <p class="mt-3 h-9 text-2xl font-bold">
          <span v-if="feedback === 'right'" class="text-emerald-500">🎉 Yes! Great job!</span>
          <span v-else-if="feedback === 'wrong'" class="text-orange-500">🤔 Not quite, try again!</span>
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
