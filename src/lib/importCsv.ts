import { normalizeCsvHeader, parseCsv } from './csvParse'
import { findOrCreateExerciseByName } from './ensureExercise'
import { hasExerciseOnDate } from './carryOver'
import { findExerciseById } from './exerciseStorage'
import { parseOptionalFloat, parseOptionalInt } from './workoutValues'
import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'

export type ImportResult = {
  workouts: Workout[]
  exercises: Exercise[]
  added: number
  skipped: number
  errors: string[]
}

const HEADER_MAP: Record<string, keyof RowFields> = {
  date: 'date',
  exercise_id: 'exerciseId',
  exercise_name: 'exerciseName',
  exercise: 'exerciseName',
  name: 'exerciseName',
  sets: 'sets',
  reps: 'reps',
  weight_kg: 'weight',
  weight: 'weight',
  duration_minutes: 'durationMinutes',
  duration: 'durationMinutes',
  carried_from: 'carriedFrom',
  status: 'status',
  entry_type: 'entryType',
}

type RowFields = {
  date: string
  exerciseId: string
  exerciseName: string
  sets: string
  reps: string
  weight: string
  durationMinutes: string
  carriedFrom: string
  status: string
  entryType: string
}

function isValidDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function rowToWorkout(
  fields: Partial<RowFields>,
  exercises: Exercise[],
  rowIndex: number,
): { workout?: Workout; exercises: Exercise[]; error?: string } {
  const date = fields.date?.trim() ?? ''
  const exerciseName = fields.exerciseName?.trim() ?? ''
  const exerciseId = fields.exerciseId?.trim() ?? ''

  if (!date || (!exerciseName && !exerciseId)) {
    return {
      exercises,
      error: `Row ${rowIndex}: date and exercise name or id are required.`,
    }
  }
  if (!isValidDate(date)) {
    return {
      exercises,
      error: `Row ${rowIndex}: date must be YYYY-MM-DD (got "${date}").`,
    }
  }

  let nextExercises = exercises
  let resolvedId = exerciseId
  let resolvedName = exerciseName

  if (exerciseId) {
    const byId = findExerciseById(exercises, exerciseId)
    if (byId) {
      resolvedName = byId.name
    } else if (!exerciseName) {
      return {
        exercises,
        error: `Row ${rowIndex}: unknown exercise_id "${exerciseId}".`,
      }
    }
  }

  if (!resolvedId || !findExerciseById(nextExercises, resolvedId)) {
    const nameForCatalog = resolvedName || exerciseName
    if (!nameForCatalog) {
      return { exercises, error: `Row ${rowIndex}: exercise name is required.` }
    }
    const result = findOrCreateExerciseByName(nextExercises, nameForCatalog)
    nextExercises = result.exercises
    resolvedId = result.exercise.id
    resolvedName = result.exercise.name
  }

  const workout: Workout = {
    id: crypto.randomUUID(),
    exerciseId: resolvedId,
    exerciseName: resolvedName,
    date,
    sets: parseOptionalInt(fields.sets ?? ''),
    reps: parseOptionalInt(fields.reps ?? ''),
    weight: parseOptionalFloat(fields.weight ?? ''),
    durationMinutes: parseOptionalInt(fields.durationMinutes ?? ''),
    carriedFrom: fields.carriedFrom?.trim() || undefined,
  }

  return { workout, exercises: nextExercises }
}

export function importWorkoutsFromCsv(
  csv: string,
  existing: Workout[],
  exercises: Exercise[],
): ImportResult {
  const rows = parseCsv(csv.trim())
  if (rows.length === 0) {
    return {
      workouts: existing,
      exercises,
      added: 0,
      skipped: 0,
      errors: ['File is empty.'],
    }
  }

  const headerRow = rows[0].map(normalizeCsvHeader)
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
      ] as const)

  const errors: string[] = []
  const toAdd: Workout[] = []
  let skipped = 0
  const merged = [...existing]
  let catalog = [...exercises]

  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i]
    const rowIndex = hasHeader ? i + 2 : i + 1
    const fields: Partial<RowFields> = {}

    columnKeys.forEach((key, colIndex) => {
      if (!key || key === 'status' || key === 'entryType') return
      const value = cells[colIndex] ?? ''
      fields[key as keyof RowFields] = value
    })

    const { workout, exercises: nextCatalog, error } = rowToWorkout(
      fields,
      catalog,
      rowIndex,
    )
    catalog = nextCatalog
    if (error) {
      errors.push(error)
      continue
    }
    if (!workout) continue

    if (hasExerciseOnDate(merged, workout.date, workout.exerciseId)) {
      skipped++
      continue
    }

    toAdd.push(workout)
    merged.unshift(workout)
  }

  return {
    workouts: merged,
    exercises: catalog,
    added: toAdd.length,
    skipped,
    errors,
  }
}
