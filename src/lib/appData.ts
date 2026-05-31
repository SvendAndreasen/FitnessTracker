import { applyCarryOver } from './carryOver'
import {
  getAllStoredExercises,
  normalizeExercises,
  saveExercises,
} from './exerciseStorage'
import {
  linkWorkoutsToExercises,
  migrateWorkoutsToExerciseCatalog,
} from './migrateExercises'
import { normalizeWorkouts } from './normalizeWorkout'
import { getAllStoredWorkouts, saveWorkouts } from './storage'
import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'

export type AppData = {
  workouts: Workout[]
  exercises: Exercise[]
}

export function loadAppData(): AppData {
  const rawWorkouts = getAllStoredWorkouts()
  const rawExercises = getAllStoredExercises()

  const { exercises: migratedExercises, workouts: linkedWorkouts } =
    migrateWorkoutsToExerciseCatalog(rawWorkouts, rawExercises)

  const exercises = normalizeExercises(migratedExercises)
  let workouts = normalizeWorkouts(linkWorkoutsToExercises(linkedWorkouts, exercises))

  const withCarryOver = applyCarryOver(workouts, exercises)
  workouts = normalizeWorkouts(withCarryOver)

  if (
    JSON.stringify(rawWorkouts) !== JSON.stringify(workouts) ||
    JSON.stringify(rawExercises) !== JSON.stringify(exercises)
  ) {
    saveWorkouts(workouts)
    saveExercises(exercises)
  }

  return { workouts, exercises }
}
