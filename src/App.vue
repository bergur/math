<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import HighScores from './HighScores.vue'
import Quiz from './Quiz.vue'
import { SECRET_CODES, TABLES, TABLE_ANIMALS, TABLE_COLORS, formatTime, isCodeFor } from './tables.ts'

const LAST_TABLE = TABLES[TABLES.length - 1]
const CONFETTI = ['⭐', '🎉', '🌈', '💖', '✨', '🎈', '🍭']

// Opened tables are only remembered until the page is reloaded, so she uses her written list of codes.
const unlocked = ref(new Set([1]))
const table = ref<number | null>(null)
const isPlaying = ref(false)
const isTimed = ref(false)
const isFinished = ref(false)
const finishedTimeMs = ref(0)
// Bumped on every start, so the quiz starts over with new questions.
const attempt = ref(0)
// Only used on narrow screens, where the list of tables is a slide-in menu.
const isMenuOpen = ref(false)

// The secret code popup: which table it is for, what has been typed, and whether it was wrong.
const codeTable = ref<number | null>(null)
const codeInput = ref('')
const codeWrongCount = ref(0)
const codeField = ref<HTMLInputElement | null>(null)

const colors = computed(() => (table.value ? TABLE_COLORS[table.value] : null))
const nextTable = computed(() => (table.value && table.value < LAST_TABLE ? table.value + 1 : null))

const confetti = Array.from({ length: 24 }, (_, i) => ({
  emoji: CONFETTI[i % CONFETTI.length],
  left: `${Math.random() * 100}%`,
  delay: `${Math.random() * 1.5}s`,
  size: `${1.5 + Math.random() * 1.5}rem`,
}))

function openTable(chosen: number) {
  isMenuOpen.value = false
  if (!unlocked.value.has(chosen)) return openCodePopup(chosen)
  table.value = chosen
  isPlaying.value = false
  isFinished.value = false
}

function finishQuiz(elapsedMs: number) {
  isFinished.value = true
  finishedTimeMs.value = elapsedMs
}

function startQuiz(timed: boolean) {
  isPlaying.value = true
  isTimed.value = timed
  isFinished.value = false
  attempt.value++
}

async function openCodePopup(chosen: number) {
  codeTable.value = chosen
  codeInput.value = ''
  codeWrongCount.value = 0
  await nextTick()
  codeField.value?.focus()
}

function closeCodePopup() {
  codeTable.value = null
}

async function submitCode() {
  if (codeTable.value === null) return
  if (!isCodeFor(codeTable.value, codeInput.value)) {
    // The popup is redrawn to wiggle, so focus the new field once it's there.
    codeWrongCount.value++
    codeInput.value = ''
    await nextTick()
    codeField.value?.focus()
    return
  }
  unlocked.value.add(codeTable.value)
  const opened = codeTable.value
  closeCodePopup()
  openTable(opened)
}
</script>

<template>
  <div class="flex h-dvh flex-col md:flex-row">
    <!-- The top bar and backdrop only exist on narrow screens. -->
    <header class="flex items-center gap-3 bg-white/70 px-4 py-2 shadow-sm md:hidden">
      <button class="btn border-violet-600 bg-violet-400 px-3 py-1 text-2xl" aria-label="Open the list of tables" @click="isMenuOpen = true">☰</button>
      <span class="truncate text-2xl font-extrabold">{{ table ? `${TABLE_ANIMALS[table]} Table of ${table}` : '⭐ Times Tables' }}</span>
    </header>

    <div v-if="isMenuOpen" class="fixed inset-0 z-10 bg-black/30 md:hidden" @click="isMenuOpen = false"></div>

    <aside
      class="fixed inset-y-0 left-0 z-20 w-[min(260px,80vw)] overflow-y-auto bg-white p-4 shadow-xl transition-transform duration-200 ease-in-out md:static md:w-56 md:shrink-0 md:translate-x-0 md:shadow-md md:transition-none"
      :class="isMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <h2 class="mb-4 text-3xl font-extrabold">⭐ Tables</h2>
      <button
        v-for="item in TABLES"
        :key="item"
        class="btn mb-2.5 flex w-full items-center justify-between"
        :class="[TABLE_COLORS[item].button, { 'ring-4 ring-violet-500 ring-offset-2': table === item }]"
        @click="openTable(item)"
      >
        <span>{{ TABLE_ANIMALS[item] }} Table of {{ item }}</span>
        <span v-if="!unlocked.has(item)" aria-label="Locked">🔒</span>
      </button>
    </aside>

    <main class="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:p-8">
      <!-- Nothing picked yet. -->
      <div v-if="!table" class="flex h-full flex-col items-center justify-center text-center">
        <p class="animate-bounce text-8xl">🌈</p>
        <h1 class="mt-4 text-4xl font-extrabold md:text-5xl">Let's do some maths!</h1>
        <p class="mt-2 text-2xl text-muted">Pick a table to start.</p>
        <button class="btn mt-6 border-violet-600 bg-violet-400 md:hidden" @click="isMenuOpen = true">Show tables</button>
      </div>

      <!-- Finished a table. -->
      <div v-else-if="isFinished" class="flex flex-col items-center text-center">
        <div class="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
          <span
            v-for="(piece, i) in confetti"
            :key="i"
            class="absolute top-0 animate-fall"
            :style="{ left: piece.left, animationDelay: piece.delay, fontSize: piece.size }"
          >{{ piece.emoji }}</span>
        </div>

        <template v-if="isTimed">
          <p class="animate-pop text-8xl">⏱️</p>
          <h1 class="mt-4 text-4xl font-extrabold md:text-5xl">{{ formatTime(finishedTimeMs) }}</h1>
          <HighScores :table="table" :time-ms="finishedTimeMs" />
        </template>
        <template v-else>
          <p class="animate-pop text-8xl">🏆</p>
          <h1 class="mt-4 text-4xl font-extrabold md:text-5xl">You did it!</h1>
        </template>

        <div v-if="nextTable" class="mt-8 w-full max-w-sm rounded-3xl bg-white p-6 shadow-lg">
          <p class="text-xl">Your secret code for the <strong>table of {{ nextTable }}</strong> is:</p>
          <p class="my-4 font-mono text-5xl font-extrabold tracking-[0.3em]" :class="colors!.text">{{ SECRET_CODES[nextTable] }}</p>
          <p class="text-lg text-muted">✏️ Write it down!</p>
        </div>

        <p v-else class="mt-8 text-3xl font-extrabold text-violet-500">🌟 You know ALL the tables! 🌟</p>
      </div>

      <!-- Playing a table. -->
      <Quiz v-else-if="isPlaying" :key="`${table}-${attempt}`" :table="table" :is-timed="isTimed" @finished="finishQuiz" />

      <!-- Picked a table, ready to start. -->
      <div v-else class="flex flex-col items-center text-center">
        <p class="animate-pop text-8xl">{{ TABLE_ANIMALS[table] }}</p>
        <h1 class="mt-2 text-5xl font-extrabold">Table of <span :class="colors!.text">{{ table }}</span></h1>
        <div class="mt-8 flex w-full max-w-sm flex-col gap-4">
          <button class="btn py-5 text-2xl" :class="colors!.button" @click="startQuiz(false)">Start ▶</button>
          <button class="btn py-5 text-2xl" :class="colors!.button" @click="startQuiz(true)">⏱️ Timed mode</button>
        </div>
      </div>
    </main>

    <!-- Secret code popup for a locked table. -->
    <div v-if="codeTable !== null" class="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4" @click.self="closeCodePopup">
      <form
        :key="codeWrongCount"
        class="w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl"
        :class="codeWrongCount ? 'animate-wiggle' : 'animate-pop'"
        @submit.prevent="submitCode"
      >
        <p class="text-6xl">🔒</p>
        <h2 class="mt-2 text-3xl font-extrabold">Secret code</h2>
        <p class="mt-1 text-lg text-muted">for the table of {{ codeTable }}</p>
        <input
          ref="codeField"
          v-model="codeInput"
          maxlength="5"
          autocomplete="off"
          autocapitalize="characters"
          spellcheck="false"
          aria-label="Secret code"
          class="mt-4 w-full rounded-2xl border-4 border-violet-300 px-3 py-2 text-center font-mono text-3xl font-extrabold tracking-[0.3em] uppercase outline-none focus:border-violet-500"
        />
        <p class="mt-2 h-7 text-lg font-bold text-orange-500">
          <span v-if="codeWrongCount">Oops! That's not the code.</span>
        </p>
        <div class="mt-2 flex gap-3">
          <button type="button" class="btn flex-1 border-slate-500 bg-slate-400" @click="closeCodePopup">Close</button>
          <button type="submit" class="btn flex-1 border-emerald-700 bg-emerald-500" :disabled="codeInput.trim().length < 5">Open</button>
        </div>
        <p class="mt-4 text-sm text-muted">Finish the table of {{ codeTable - 1 }} to get the code.</p>
      </form>
    </div>
  </div>
</template>
