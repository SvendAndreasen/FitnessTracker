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

function statusLabel(workout: Workout, today: string): string {
  if (workout.date !== today) return ''
  return workout.carriedFrom ? 'From last session' : 'Logged'
}

export function workoutsToCsv(workouts: Workout[], today: string): string {
  const headers = [
    'date',
    'exercise_name',
    'sets',
    'reps',
    'weight_kg',
    'duration_minutes',
    'notes',
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
      formatCell(w.exerciseName),
      formatCell(w.sets),
      formatCell(w.reps),
      formatCell(w.weight),
      formatCell(w.durationMinutes),
      formatCell(w.notes ?? ''),
      formatCell(statusLabel(w, today)),
      formatCell(w.carriedFrom ?? ''),
    ].join(','),
  )

  return [headers.join(','), ...rows].join('\n')
}

export function downloadWorkoutsCsv(workouts: Workout[], today: string): void {
  const csv = workoutsToCsv(workouts, today)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fitness-tracker-${today}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
