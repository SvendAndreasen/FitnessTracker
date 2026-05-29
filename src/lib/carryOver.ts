import { getDescription } from './normalizeWorkout'
import { todayKey } from './dates'
import type { Workout } from '../types/workout'

const CARRYOVER_MARKER_KEY = 'fitness-tracker-last-carryover'

export function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase()
}

function lastLoggedDateBefore(
  beforeDate: string,
  workouts: Workout[],
): string | null {
  const dates = [
    ...new Set(
      workouts
        .map((w) => w.date)
        .filter((d) => d < beforeDate),
    ),
  ].sort((a, b) => b.localeCompare(a))

  return dates[0] ?? null
}

function uniqueByExerciseName(workouts: Workout[]): Workout[] {
  const seen = new Set<string>()
  const result: Workout[] = []

  for (const workout of workouts) {
    const key = normalizeExerciseName(workout.exerciseName)
    if (seen.has(key)) continue
    seen.add(key)
    result.push(workout)
  }

  return result
}

function copyWorkoutForToday(source: Workout, today: string): Workout {
  const description = getDescription(source)
  return {
    id: crypto.randomUUID(),
    exerciseName: source.exerciseName,
    date: today,
    sets: source.sets,
    reps: source.reps,
    weight: source.weight,
    durationMinutes: source.durationMinutes,
    description,
    carriedFrom: source.date,
  }
}

function carryOverDoneFor(today: string): boolean {
  return localStorage.getItem(CARRYOVER_MARKER_KEY) === today
}

function markCarryOverDone(today: string): void {
  localStorage.setItem(CARRYOVER_MARKER_KEY, today)
}

export function applyCarryOver(workouts: Workout[]): Workout[] {
  const today = todayKey()

  if (carryOverDoneFor(today)) {
    return workouts
  }

  if (workouts.some((w) => w.date === today)) {
    markCarryOverDone(today)
    return workouts
  }

  const sourceDate = lastLoggedDateBefore(today, workouts)
  markCarryOverDone(today)

  if (!sourceDate) {
    return workouts
  }

  const sourceDay = workouts.filter((w) => w.date === sourceDate)
  const templates = uniqueByExerciseName(sourceDay)
  const copied = templates.map((w) => copyWorkoutForToday(w, today))

  return [...copied, ...workouts]
}

export function hasExerciseOnDate(
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

