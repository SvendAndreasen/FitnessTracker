import { normalizeExerciseName } from './exerciseNames'
import {
  findExerciseByName,
  normalizeExercises,
  saveExercises,
} from './exerciseStorage'
import type { Exercise } from '../types/exercise'

export function findOrCreateExerciseByName(
  exercises: Exercise[],
  name: string,
  options?: { description?: string; active?: boolean },
): { exercises: Exercise[]; exercise: Exercise } {
  const trimmed = name.trim()
  const existing = findExerciseByName(exercises, trimmed)
  if (existing) {
    const active = options?.active ?? existing.active
    const description = options?.description ?? existing.description
    if (active === existing.active && description === existing.description) {
      return { exercises, exercise: existing }
    }
    const updated: Exercise = {
      ...existing,
      active,
      description: description ?? existing.description,
    }
    const next = normalizeExercises(
      exercises.map((e) => (e.id === updated.id ? updated : e)),
    )
    saveExercises(next)
    return { exercises: next, exercise: updated }
  }

  const exercise: Exercise = {
    id: crypto.randomUUID(),
    name: trimmed,
    description: options?.description?.trim() || undefined,
    active: options?.active ?? true,
  }
  const next = normalizeExercises([exercise, ...exercises])
  saveExercises(next)
  return { exercises: next, exercise }
}

export function isDuplicateExerciseName(
  exercises: Exercise[],
  name: string,
  exceptId?: string,
): boolean {
  const key = normalizeExerciseName(name)
  return exercises.some(
    (e) => e.id !== exceptId && normalizeExerciseName(e.name) === key,
  )
}
