import { formatCsvCell } from './csvParse'
import { isBeforeAppDay } from './dates'
import type { Workout } from '../types/workout'

function entryType(workout: Workout, today: string): string {
  if (workout.date === today) return 'today'
  if (isBeforeAppDay(workout.date, today)) return 'history'
  return 'future'
}

function statusLabel(workout: Workout, today: string): string {
  if (isBeforeAppDay(workout.date, today)) return 'History'
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
    history: workouts.filter((w) => isBeforeAppDay(w.date, today)).length,
  }
}

export function workoutsToCsv(workouts: Workout[], today: string): string {
  const headers = [
    'date',
    'entry_type',
    'exercise_id',
    'exercise_name',
    'sets',
    'reps',
    'weight_kg',
    'duration_minutes',
    'status',
    'carried_from',
    'comment',
  ]

  const sorted = [...workouts].sort((a, b) => {
    const byDate = b.date.localeCompare(a.date)
    if (byDate !== 0) return byDate
    return a.exerciseName.localeCompare(b.exerciseName)
  })

  const rows = sorted.map((w) =>
    [
      formatCsvCell(w.date),
      formatCsvCell(entryType(w, today)),
      formatCsvCell(w.exerciseId),
      formatCsvCell(w.exerciseName),
      formatCsvCell(w.sets),
      formatCsvCell(w.reps),
      formatCsvCell(w.weight),
      formatCsvCell(w.durationMinutes),
      formatCsvCell(statusLabel(w, today)),
      formatCsvCell(w.carriedFrom ?? ''),
      formatCsvCell(w.comment ?? ''),
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
  link.download = `fitness-tracker-logs-${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
  return summarizeExport(workouts, today)
}
