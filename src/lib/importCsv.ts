import { hasExerciseOnDate } from './carryOver'
import { parseOptionalFloat, parseOptionalInt } from './workoutValues'
import type { Workout } from '../types/workout'

export type ImportResult = {
  workouts: Workout[]
  added: number
  skipped: number
  errors: string[]
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(field)
      field = ''
      if (row.some((cell) => cell.trim() !== '')) {
        rows.push(row)
      }
      row = []
      if (char === '\r') i++
    } else if (char !== '\r') {
      field += char
    }
  }

  row.push(field)
  if (row.some((cell) => cell.trim() !== '')) {
    rows.push(row)
  }

  return rows
}

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, '_')
}

const HEADER_MAP: Record<string, keyof RowFields> = {
  date: 'date',
  exercise_name: 'exerciseName',
  exercise: 'exerciseName',
  name: 'exerciseName',
  sets: 'sets',
  reps: 'reps',
  weight_kg: 'weight',
  weight: 'weight',
  duration_minutes: 'durationMinutes',
  duration: 'durationMinutes',
  description: 'description',
  notes: 'notes',
  carried_from: 'carriedFrom',
  status: 'status',
}

type RowFields = {
  date: string
  exerciseName: string
  sets: string
  reps: string
  weight: string
  durationMinutes: string
  description: string
  notes: string
  carriedFrom: string
  status: string
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function rowToWorkout(
  fields: Partial<RowFields>,
  rowIndex: number,
): { workout?: Workout; error?: string } {
  const date = fields.date?.trim() ?? ''
  const exerciseName = fields.exerciseName?.trim() ?? ''

  if (!date || !exerciseName) {
    return { error: `Row ${rowIndex}: date and exercise name are required.` }
  }
  if (!isValidDate(date)) {
    return {
      error: `Row ${rowIndex}: date must be YYYY-MM-DD (got "${date}").`,
    }
  }

  const carriedFrom = fields.carriedFrom?.trim()
  const workout: Workout = {
    id: crypto.randomUUID(),
    date,
    exerciseName,
    sets: parseOptionalInt(fields.sets ?? ''),
    reps: parseOptionalInt(fields.reps ?? ''),
    weight: parseOptionalFloat(fields.weight ?? ''),
    durationMinutes: parseOptionalInt(fields.durationMinutes ?? ''),
    description: (fields.description ?? fields.notes)?.trim() || undefined,
    carriedFrom: carriedFrom || undefined,
  }

  return { workout }
}

export function importWorkoutsFromCsv(
  csv: string,
  existing: Workout[],
): ImportResult {
  const rows = parseCsv(csv.trim())
  if (rows.length === 0) {
    return { workouts: existing, added: 0, skipped: 0, errors: ['File is empty.'] }
  }

  const headerRow = rows[0].map(normalizeHeader)
  const hasHeader = headerRow.some((h) => h in HEADER_MAP || h === 'date')
  const dataRows = hasHeader ? rows.slice(1) : rows

  const columnKeys = hasHeader
    ? headerRow.map((h) => HEADER_MAP[h])
    : ([
        'date',
        'exerciseName',
        'sets',
        'reps',
        'weight',
        'durationMinutes',
        'notes',
      ] as const)

  const errors: string[] = []
  const toAdd: Workout[] = []
  let skipped = 0
  const merged = [...existing]

  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i]
    const rowIndex = hasHeader ? i + 2 : i + 1
    const fields: Partial<RowFields> = {}

    columnKeys.forEach((key, colIndex) => {
      if (!key || key === 'status') return
      const value = cells[colIndex] ?? ''
      fields[key as keyof RowFields] = value
    })

    const { workout, error } = rowToWorkout(fields, rowIndex)
    if (error) {
      errors.push(error)
      continue
    }
    if (!workout) continue

    if (hasExerciseOnDate(merged, workout.date, workout.exerciseName)) {
      skipped++
      continue
    }

    toAdd.push(workout)
    merged.unshift(workout)
  }

  return {
    workouts: merged,
    added: toAdd.length,
    skipped,
    errors,
  }
}
