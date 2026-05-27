import { applyCarryOver } from './carryOver'
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

export function saveWorkouts(workouts: Workout[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export function loadWorkouts(): Workout[] {
  const stored = readRawWorkouts()
  const withCarryOver = applyCarryOver(stored)
  if (withCarryOver.length !== stored.length) {
    saveWorkouts(withCarryOver)
  }
  return withCarryOver
}

export function addWorkoutToList(
  workouts: Workout[],
  workout: Workout,
): Workout[] {
  const next = [workout, ...workouts]
  saveWorkouts(next)
  return next
}

export function updateWorkoutInList(
  workouts: Workout[],
  updated: Workout,
): Workout[] {
  const next = workouts.map((w) => (w.id === updated.id ? updated : w))
  saveWorkouts(next)
  return next
}

export function deleteWorkoutFromList(
  workouts: Workout[],
  id: string,
): Workout[] {
  const next = workouts.filter((w) => w.id !== id)
  saveWorkouts(next)
  return next
}
