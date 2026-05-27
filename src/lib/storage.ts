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

export function loadWorkouts(): Workout[] {
  const stored = readRawWorkouts()
  const withCarryOver = applyCarryOver(stored)
  if (withCarryOver.length !== stored.length) {
    saveWorkouts(withCarryOver)
  }
  return withCarryOver
}

export function saveWorkouts(workouts: Workout[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export function addWorkout(workout: Workout): Workout[] {
  const workouts = [workout, ...readRawWorkouts()]
  saveWorkouts(workouts)
  return workouts
}

export function deleteWorkout(id: string): Workout[] {
  const workouts = readRawWorkouts().filter((w) => w.id !== id)
  saveWorkouts(workouts)
  return workouts
}

export function updateWorkout(workout: Workout): Workout[] {
  const workouts = readRawWorkouts().map((w) =>
    w.id === workout.id ? workout : w,
  )
  saveWorkouts(workouts)
  return workouts
}
