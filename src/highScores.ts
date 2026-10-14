export const HIGH_SCORE_COUNT = 10
export const NAME_MAX_LENGTH = 6

export type HighScore = { name: string; timeMs: number }

// Kept in this browser only, so each phone has its own list, like an arcade machine.
function storageKey(table: number): string {
  return `high-scores-table-${table}`
}

function isHighScore(value: unknown): value is HighScore {
  const score = value as HighScore
  return typeof score?.name === 'string' && typeof score?.timeMs === 'number'
}

// Fastest first. Storage can be blocked or hold something broken, so that just means no scores.
export function loadHighScores(table: number): HighScore[] {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(storageKey(table)) ?? '[]')
    return Array.isArray(stored) ? stored.filter(isHighScore) : []
  } catch {
    return []
  }
}

export function isHighScoreTime(scores: HighScore[], timeMs: number): boolean {
  return scores.length < HIGH_SCORE_COUNT || timeMs < scores[scores.length - 1].timeMs
}

// Returns the new list and the place the new score landed.
// An equal time goes below the older score, so whoever got it first keeps their place.
export function addHighScore(table: number, score: HighScore): { scores: HighScore[]; index: number } {
  const scores = loadHighScores(table)
  const fasterThan = scores.findIndex((existing) => score.timeMs < existing.timeMs)
  const index = fasterThan === -1 ? scores.length : fasterThan
  scores.splice(index, 0, score)
  const top = scores.slice(0, HIGH_SCORE_COUNT)
  try {
    localStorage.setItem(storageKey(table), JSON.stringify(top))
  } catch {
    // Not saved, but the list is still shown for this round.
  }
  return { scores: top, index }
}
