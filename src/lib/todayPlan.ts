import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'

export type TodaySlot = {
  exercise: Exercise
  workout: Workout | null
}

export function buildTodaySlots(
  exercises: Exercise[],
  workouts: Workout[],
  today: string,
  skippedExerciseIds: string[],
): TodaySlot[] {
  const skipped = new Set(skippedExerciseIds)
  const active = exercises
    .filter((e) => e.active && !skipped.has(e.id))
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    )

  const todayByExerciseId = new Map<string, Workout>()
  for (const workout of workouts) {
    if (workout.date === today && workout.exerciseId) {
      todayByExerciseId.set(workout.exerciseId, workout)
    }
  }

  return active.map((exercise) => ({
    exercise,
    workout: todayByExerciseId.get(exercise.id) ?? null,
  }))
}
