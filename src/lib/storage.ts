import type { Workout } from '../types/workout'

const STORAGE_KEY = 'fitness-tracker-workouts'

export function loadWorkouts(): Workout[] {
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

export function addWorkout(workout: Workout): Workout[] {
  const workouts = [workout, ...loadWorkouts()]
  saveWorkouts(workouts)
  return workouts
}

export function deleteWorkout(id: string): Workout[] {
  const workouts = loadWorkouts().filter((w) => w.id !== id)
  saveWorkouts(workouts)
  return workouts
}
