import type { Workout } from '../types/workout'

export function getDescription(workout: Workout): string | undefined {
  return workout.description?.trim() || workout.notes?.trim() || undefined
}

export function normalizeWorkout(workout: Workout): Workout {
  const description = getDescription(workout)
  const rest = { ...workout }
  delete rest.notes
  if (description) {
    rest.description = description
  } else {
    delete rest.description
  }
  return rest
}

export function normalizeWorkouts(workouts: Workout[]): Workout[] {
  return workouts.map(normalizeWorkout)
}
