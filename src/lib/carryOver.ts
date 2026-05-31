import { todayKey } from './dates'
import {
  addSkippedExerciseId,
  getSkippedExerciseIds,
} from './skippedToday'
import { normalizeExerciseName } from './exerciseNames'
import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'

const CARRYOVER_MARKER_KEY = 'fitness-tracker-last-carryover'

export { normalizeExerciseName }

function lastWorkoutForExerciseBefore(
  exerciseId: string,
  beforeDate: string,
  workouts: Workout[],
): Workout | null {
  const history = workouts
    .filter((w) => w.exerciseId === exerciseId && w.date < beforeDate)
    .sort((a, b) => b.date.localeCompare(a.date))

  return history[0] ?? null
}

function copyValuesFromHistory(
  exercise: Exercise,
  source: Workout | null,
  today: string,
): Workout {
  return {
    id: crypto.randomUUID(),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    date: today,
    sets: source?.sets,
    reps: source?.reps,
    weight: source?.weight,
    durationMinutes: source?.durationMinutes,
    carriedFrom: source?.date,
  }
}

function markCarryOverDone(today: string): void {
  localStorage.setItem(CARRYOVER_MARKER_KEY, today)
}

export function applyCarryOver(
  workouts: Workout[],
  exercises: Exercise[],
): Workout[] {
  const today = todayKey()
  const active = exercises.filter((e) => e.active)
  if (active.length === 0) {
    markCarryOverDone(today)
    return workouts
  }

  const skipped = new Set(getSkippedExerciseIds(today))
  const todayByExerciseId = new Map<string, Workout>()
  for (const workout of workouts) {
    if (workout.date === today && workout.exerciseId) {
      todayByExerciseId.set(workout.exerciseId, workout)
    }
  }

  const added: Workout[] = []
  const synced = workouts.map((workout) => {
    if (workout.date !== today || !workout.exerciseId) return workout
    const exercise = exercises.find((e) => e.id === workout.exerciseId)
    if (!exercise) return workout
    if (workout.exerciseName === exercise.name) return workout
    return { ...workout, exerciseName: exercise.name }
  })

  for (const exercise of active) {
    if (skipped.has(exercise.id)) continue
    if (todayByExerciseId.has(exercise.id)) continue

    const last = lastWorkoutForExerciseBefore(exercise.id, today, workouts)
    added.push(copyValuesFromHistory(exercise, last, today))
  }

  markCarryOverDone(today)
  if (added.length === 0) {
    return synced
  }
  return [...added, ...synced]
}

export function hasExerciseOnDate(
  workouts: Workout[],
  date: string,
  exerciseId: string,
  exceptId?: string,
): boolean {
  return workouts.some(
    (w) =>
      w.id !== exceptId && w.date === date && w.exerciseId === exerciseId,
  )
}

export function hasExerciseNameOnDate(
  workouts: Workout[],
  date: string,
  exerciseName: string,
  exceptId?: string,
): boolean {
  const key = normalizeExerciseName(exerciseName)
  return workouts.some(
    (w) =>
      w.id !== exceptId &&
      w.date === date &&
      normalizeExerciseName(w.exerciseName) === key,
  )
}

export function skipWorkoutForToday(workout: Workout): void {
  if (workout.exerciseId) {
    addSkippedExerciseId(workout.exerciseId, workout.date)
  }
}
