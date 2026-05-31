import type { Workout } from '../types/workout'

/** Legacy workout row text; used when building the exercise catalog from old saves. */
export function getDescription(workout: Workout): string | undefined {
  return workout.description?.trim() || workout.notes?.trim() || undefined
}

export function normalizeWorkout(workout: Workout): Workout {
  const rest = { ...workout }
  const legacyText = getDescription(workout)
  delete rest.notes
  delete rest.description

  let comment = rest.comment?.trim() || legacyText || undefined
  if (comment) {
    rest.comment = comment
  } else {
    delete rest.comment
  }
  return rest
}

export function normalizeWorkouts(workouts: Workout[]): Workout[] {
  return workouts.map(normalizeWorkout)
}
