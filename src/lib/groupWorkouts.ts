import { todayKey } from './dates'
import type { Workout } from '../types/workout'

export type DayGroup = {
  date: string
  workouts: Workout[]
}

export function groupWorkoutsByDay(workouts: Workout[]): DayGroup[] {
  const byDate = new Map<string, Workout[]>()

  for (const workout of workouts) {
    const list = byDate.get(workout.date) ?? []
    list.push(workout)
    byDate.set(workout.date, list)
  }

  const today = todayKey()
  const dates = [...byDate.keys()].sort((a, b) => b.localeCompare(a))

  const ordered = dates.includes(today)
    ? [today, ...dates.filter((d) => d !== today)]
    : dates

  return ordered.map((date) => ({
    date,
    workouts: byDate.get(date) ?? [],
  }))
}
