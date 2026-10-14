export const TABLES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
export const RANDOM_QUESTION_COUNT = 15

// The code that opens each table, shown after finishing the table before it.
// Hardcoded so they can be written down on paper. Table 1 is always open.
export const SECRET_CODES: Record<number, string> = {
  2: 'TJDNA',
  3: 'AJZNY',
  4: 'NRTBK',
  5: 'NUXXB',
  6: 'YRCYR',
  7: 'AVHWP',
  8: 'AYZJA',
  9: 'SFDZJ',
  10: 'GRYLV',
}

// Full class names, so Tailwind finds them when scanning the source.
export const TABLE_COLORS: Record<number, { fill: string; button: string; soft: string; text: string }> = {
  1: { fill: 'bg-rose-400', button: 'bg-rose-400 border-rose-600', soft: 'bg-rose-100', text: 'text-rose-500' },
  2: { fill: 'bg-orange-400', button: 'bg-orange-400 border-orange-600', soft: 'bg-orange-100', text: 'text-orange-500' },
  3: { fill: 'bg-amber-400', button: 'bg-amber-400 border-amber-600', soft: 'bg-amber-100', text: 'text-amber-500' },
  4: { fill: 'bg-lime-500', button: 'bg-lime-500 border-lime-700', soft: 'bg-lime-100', text: 'text-lime-600' },
  5: { fill: 'bg-emerald-400', button: 'bg-emerald-400 border-emerald-600', soft: 'bg-emerald-100', text: 'text-emerald-500' },
  6: { fill: 'bg-cyan-400', button: 'bg-cyan-400 border-cyan-600', soft: 'bg-cyan-100', text: 'text-cyan-500' },
  7: { fill: 'bg-sky-400', button: 'bg-sky-400 border-sky-600', soft: 'bg-sky-100', text: 'text-sky-500' },
  8: { fill: 'bg-indigo-400', button: 'bg-indigo-400 border-indigo-600', soft: 'bg-indigo-100', text: 'text-indigo-500' },
  9: { fill: 'bg-purple-400', button: 'bg-purple-400 border-purple-600', soft: 'bg-purple-100', text: 'text-purple-500' },
  10: { fill: 'bg-pink-400', button: 'bg-pink-400 border-pink-600', soft: 'bg-pink-100', text: 'text-pink-500' },
}

export const TABLE_ANIMALS: Record<number, string> = {
  1: '🐣', 2: '🐶', 3: '🐱', 4: '🐸', 5: '🦊', 6: '🐼', 7: '🦁', 8: '🐙', 9: '🦄', 10: '🐲',
}

export type Question = { table: number; times: number }

// Random questions, but every number 1–10 is asked at least once.
// The ten numbers go in first, the rest are random picks, then everything is shuffled.
export function questionsRandom(table: number): Question[] {
  const numbers = [...TABLES]
  while (numbers.length < RANDOM_QUESTION_COUNT) {
    numbers.push(TABLES[Math.floor(Math.random() * TABLES.length)])
  }
  return shuffle(numbers).map((times) => ({ table, times }))
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function isCodeFor(table: number, code: string): boolean {
  return code.trim().toUpperCase() === SECRET_CODES[table]
}
