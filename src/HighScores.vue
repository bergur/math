<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { TABLE_COLORS, formatTime } from './tables.ts'
import { NAME_MAX_LENGTH, addHighScore, isHighScoreTime, loadHighScores } from './highScores.ts'

const props = defineProps<{ table: number; timeMs: number }>()

const scores = ref(loadHighScores(props.table))
const isEnteringName = ref(isHighScoreTime(scores.value, props.timeMs))
const name = ref('')
// Where the score she just entered landed, so it stands out.
const newIndex = ref<number | null>(null)
const nameField = ref<HTMLInputElement | null>(null)

const colors = computed(() => TABLE_COLORS[props.table])

function saveName() {
  const cleanName = name.value.trim().toUpperCase()
  if (!cleanName) return
  const result = addHighScore(props.table, { name: cleanName, timeMs: props.timeMs })
  scores.value = result.scores
  newIndex.value = result.index
  isEnteringName.value = false
}

onMounted(() => nameField.value?.focus())
</script>

<template>
  <div class="mt-8 w-full max-w-sm rounded-3xl bg-white p-6 shadow-lg">
    <form v-if="isEnteringName" class="mb-6" @submit.prevent="saveName">
      <p class="text-2xl font-extrabold" :class="colors.text">🎉 New high score!</p>
      <p class="mt-1 text-lg text-muted">Write your name</p>
      <input
        ref="nameField"
        v-model="name"
        :maxlength="NAME_MAX_LENGTH"
        autocomplete="off"
        autocapitalize="characters"
        spellcheck="false"
        aria-label="Your name"
        class="mt-3 w-full rounded-2xl border-4 border-violet-300 px-3 py-2 text-center text-3xl font-extrabold tracking-widest uppercase outline-none focus:border-violet-500"
      />
      <button type="submit" class="btn mt-3 w-full border-emerald-700 bg-emerald-500" :disabled="!name.trim()">Save</button>
    </form>

    <h2 class="text-2xl font-extrabold">🏅 High scores</h2>
    <ol v-if="scores.length" class="mt-3 space-y-1 text-xl">
      <li
        v-for="(score, i) in scores"
        :key="i"
        class="grid grid-cols-[2rem_1fr_auto] gap-3 rounded-xl px-3 py-1 text-left"
        :class="i === newIndex ? [colors.soft, 'font-extrabold'] : 'font-semibold'"
      >
        <span class="text-muted">{{ i + 1 }}.</span>
        <span>{{ score.name }}</span>
        <span class="tabular-nums">{{ formatTime(score.timeMs) }}</span>
      </li>
    </ol>
    <p v-else class="mt-3 text-lg text-muted">No scores yet.</p>
  </div>
</template>
