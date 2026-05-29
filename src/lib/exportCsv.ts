import { getDescription } from './normalizeWorkout'
import type { Workout } from '../types/workout'

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatCell(value: string | number | undefined): string {
  if (value == null || value === '') return ''
  return escapeCsvField(String(value))
}

function entryType(workout: Workout, today: string): string {
  return workout.date === today ? 'today' : 'history'
}

function statusLabel(workout: Workout, today: string): string {
  if (workout.date !== today) return 'History'
  return workout.carriedFrom ? 'From last session' : 'Logged'
}

export type ExportSummary = {
  total: number
  today: number
  history: number
}

export function summarizeExport(workouts: Workout[], today: string): ExportSummary {
  const todayRows = workouts.filter((w) => w.date === today)
  return {
    total: workouts.length,
    today: todayRows.length,
    history: workouts.length - todayRows.length,
  }
}

export function workoutsToCsv(workouts: Workout[], today: string): string {
  const headers = [
    'date',
    'entry_type',
    'exercise_name',
    'sets',
    'reps',
    'weight_kg',
    'duration_minutes',
    'description',
    'status',
    'carried_from',
  ]

  const sorted = [...workouts].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    if (byDate !== 0) return byDate
    return a.exerciseName.localeCompare(b.exerciseName)
  })

  const rows = sorted.map((w) =>
    [
      formatCell(w.date),
      formatCell(entryType(w, today)),
      formatCell(w.exerciseName),
      formatCell(w.sets),
      formatCell(w.reps),
      formatCell(w.weight),
      formatCell(w.durationMinutes),
      formatCell(getDescription(w) ?? ''),
      formatCell(statusLabel(w, today)),
      formatCell(w.carriedFrom ?? ''),
    ].join(','),
  )

  return [headers.join(','), ...rows].join('\n')
}

export function downloadWorkoutsCsv(
  workouts: Workout[],
  today: string,
): ExportSummary {
  const csv = workoutsToCsv(workouts, today)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fitness-tracker-all-${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
  return summarizeExport(workouts, today)
}
