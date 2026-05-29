import { applyCarryOver } from './carryOver'
import { normalizeWorkouts } from './normalizeWorkout'
import type { Workout } from '../types/workout'

const STORAGE_KEY = 'fitness-tracker-workouts'

function readRawWorkouts(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Workout[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function getAllStoredWorkouts(): Workout[] {
  return readRawWorkouts()
}

export function saveWorkouts(workouts: Workout[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export function loadWorkouts(): Workout[] {
  const stored = readRawWorkouts()
  const withCarryOver = applyCarryOver(stored)
  if (withCarryOver.length !== stored.length) {
    saveWorkouts(withCarryOver)
  }
  return normalizeWorkouts(withCarryOver)
}

export function addWorkoutToList(
  workouts: Workout[],
  workout: Workout,
): Workout[] {
  const next = normalizeWorkouts([workout, ...workouts])
  saveWorkouts(next)
  return next
}

export function updateWorkoutInList(
  workouts: Workout[],
  updated: Workout,
): Workout[] {
  const next = normalizeWorkouts(
    workouts.map((w) => (w.id === updated.id ? updated : w)),
  )
  saveWorkouts(next)
  return next
}

export function deleteWorkoutFromList(
  workouts: Workout[],
  id: string,
): Workout[] {
  const next = normalizeWorkouts(workouts.filter((w) => w.id !== id))
  saveWorkouts(next)
  return next
}
