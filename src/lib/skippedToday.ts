import { todayKey } from './dates'

function storageKey(date: string): string {
  return `fitness-tracker-skipped-${date}`
}

export function getSkippedExerciseIds(date: string = todayKey()): string[] {
  try {
    const raw = localStorage.getItem(storageKey(date))
    if (!raw) return []
    const parsed = JSON.parse(raw) as string[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function addSkippedExerciseId(
  exerciseId: string,
  date: string = todayKey(),
): void {
  const current = getSkippedExerciseIds(date)
  if (current.includes(exerciseId)) return
  localStorage.setItem(
    storageKey(date),
    JSON.stringify([...current, exerciseId]),
  )
}

export function removeSkippedExerciseId(
  exerciseId: string,
  date: string = todayKey(),
): void {
  const current = getSkippedExerciseIds(date).filter((id) => id !== exerciseId)
  if (current.length === 0) {
    localStorage.removeItem(storageKey(date))
  } else {
    localStorage.setItem(storageKey(date), JSON.stringify(current))
  }
}
