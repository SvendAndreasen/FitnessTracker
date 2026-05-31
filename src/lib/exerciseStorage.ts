import { normalizeExerciseName } from './exerciseNames'
import type { Exercise } from '../types/exercise'

const EXERCISES_KEY = 'fitness-tracker-exercises'
const MIGRATION_KEY = 'fitness-tracker-exercises-migrated'

function readRawExercises(): Exercise[] {
  try {
    const raw = localStorage.getItem(EXERCISES_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Exercise[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveExercises(exercises: Exercise[]): void {
  localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises))
}

export function getAllStoredExercises(): Exercise[] {
  return readRawExercises()
}

export function isExerciseCatalogMigrated(): boolean {
  return localStorage.getItem(MIGRATION_KEY) === '1'
}

export function markExerciseCatalogMigrated(): void {
  localStorage.setItem(MIGRATION_KEY, '1')
}

export function normalizeExercise(exercise: Exercise): Exercise {
  const name = exercise.name.trim()
  const description = exercise.description?.trim()
  return {
    ...exercise,
    name,
    description: description || undefined,
  }
}

export function normalizeExercises(exercises: Exercise[]): Exercise[] {
  return exercises.map(normalizeExercise)
}

export function findExerciseById(
  exercises: Exercise[],
  id: string,
): Exercise | undefined {
  return exercises.find((e) => e.id === id)
}

export function findExerciseByName(
  exercises: Exercise[],
  name: string,
): Exercise | undefined {
  const key = normalizeExerciseName(name)
  return exercises.find((e) => normalizeExerciseName(e.name) === key)
}

export function addExerciseToList(
  exercises: Exercise[],
  exercise: Exercise,
): Exercise[] {
  const next = normalizeExercises([exercise, ...exercises])
  saveExercises(next)
  return next
}

export function updateExerciseInList(
  exercises: Exercise[],
  updated: Exercise,
): Exercise[] {
  const next = normalizeExercises(
    exercises.map((e) => (e.id === updated.id ? updated : e)),
  )
  saveExercises(next)
  return next
}

export function deleteExerciseFromList(
  exercises: Exercise[],
  id: string,
): Exercise[] {
  const next = normalizeExercises(exercises.filter((e) => e.id !== id))
  saveExercises(next)
  return next
}
