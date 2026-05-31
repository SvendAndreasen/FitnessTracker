import { normalizeExerciseName } from './exerciseNames'
import {
  isExerciseCatalogMigrated,
  markExerciseCatalogMigrated,
  saveExercises,
} from './exerciseStorage'
import { getDescription } from './normalizeWorkout'
import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'

function latestDescriptionForName(
  workouts: Workout[],
  nameKey: string,
): string | undefined {
  const sorted = [...workouts].sort((a, b) => b.date.localeCompare(a.date))
  for (const workout of sorted) {
    if (normalizeExerciseName(workout.exerciseName) !== nameKey) continue
    const description = getDescription(workout)
    if (description) return description
  }
  return undefined
}

export function migrateWorkoutsToExerciseCatalog(
  workouts: Workout[],
  existing: Exercise[],
): { exercises: Exercise[]; workouts: Workout[] } {
  if (isExerciseCatalogMigrated() && existing.length > 0) {
    return { exercises: existing, workouts: linkWorkoutsToExercises(workouts, existing) }
  }

  const exercises = [...existing]
  const nameToId = new Map<string, string>()

  for (const exercise of exercises) {
    nameToId.set(normalizeExerciseName(exercise.name), exercise.id)
  }

  const namesInWorkouts = new Set(
    workouts.map((w) => normalizeExerciseName(w.exerciseName)),
  )

  for (const nameKey of namesInWorkouts) {
    if (nameToId.has(nameKey)) continue
    const sample = workouts.find(
      (w) => normalizeExerciseName(w.exerciseName) === nameKey,
    )
    if (!sample) continue
    const exercise: Exercise = {
      id: crypto.randomUUID(),
      name: sample.exerciseName.trim(),
      description: latestDescriptionForName(workouts, nameKey),
      active: true,
    }
    exercises.push(exercise)
    nameToId.set(nameKey, exercise.id)
  }

  const linked = workouts.map((workout) => {
    const key = normalizeExerciseName(workout.exerciseName)
    let exerciseId = workout.exerciseId
    if (!exerciseId) {
      exerciseId = nameToId.get(key) ?? ''
    }
    if (!exerciseId) {
      const created: Exercise = {
        id: crypto.randomUUID(),
        name: workout.exerciseName.trim(),
        description: getDescription(workout),
        active: true,
      }
      exercises.push(created)
      nameToId.set(key, created.id)
      exerciseId = created.id
    }
    const catalog = exercises.find((e) => e.id === exerciseId)
    return {
      ...workout,
      exerciseId,
      exerciseName: catalog?.name ?? workout.exerciseName,
    }
  })

  saveExercises(exercises)
  markExerciseCatalogMigrated()
  return { exercises, workouts: linked }
}

export function linkWorkoutsToExercises(
  workouts: Workout[],
  exercises: Exercise[],
): Workout[] {
  return workouts.map((workout) => {
    const byId = workout.exerciseId
      ? exercises.find((e) => e.id === workout.exerciseId)
      : undefined
    if (byId) {
      return { ...workout, exerciseName: byId.name }
    }

    const nameKey = normalizeExerciseName(workout.exerciseName)
    const byName = exercises.find(
      (e) => normalizeExerciseName(e.name) === nameKey,
    )
    if (byName) {
      return { ...workout, exerciseId: byName.id, exerciseName: byName.name }
    }

    return workout
  })
}
