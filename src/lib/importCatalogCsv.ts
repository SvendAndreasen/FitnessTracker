import { normalizeCsvHeader, parseCsv } from './csvParse'
import { normalizeExerciseName } from './exerciseNames'
import { findExerciseById, normalizeExercises } from './exerciseStorage'
import type { Exercise } from '../types/exercise'

export type CatalogImportResult = {
  exercises: Exercise[]
  added: number
  updated: number
  skipped: number
  errors: string[]
}

const HEADER_MAP: Record<string, keyof RowFields> = {
  exercise_id: 'id',
  id: 'id',
  name: 'name',
  exercise_name: 'name',
  exercise: 'name',
  description: 'description',
  notes: 'description',
  active: 'active',
}

type RowFields = {
  id: string
  name: string
  description: string
  active: string
}

function parseActive(value: string | undefined): boolean {
  const v = (value ?? '').trim().toLowerCase()
  if (v === '') return true
  if (v === 'false' || v === 'no' || v === '0' || v === 'inactive') return false
  return true
}

function rowToExercise(
  fields: Partial<RowFields>,
  rowIndex: number,
): { exercise?: Exercise; error?: string } {
  const name = fields.name?.trim() ?? ''
  if (!name) {
    return { error: `Row ${rowIndex}: name is required.` }
  }

  const id = fields.id?.trim() || crypto.randomUUID()
  return {
    exercise: {
      id,
      name,
      description: fields.description?.trim() || undefined,
      active: parseActive(fields.active),
    },
  }
}

export function importCatalogFromCsv(
  csv: string,
  existing: Exercise[],
): CatalogImportResult {
  const rows = parseCsv(csv.trim())
  if (rows.length === 0) {
    return {
      exercises: existing,
      added: 0,
      updated: 0,
      skipped: 0,
      errors: ['File is empty.'],
    }
  }

  const headerRow = rows[0].map(normalizeCsvHeader)
  const hasHeader = headerRow.some(
    (h) => h in HEADER_MAP || h === 'name' || h === 'exercise_id',
  )
  const dataRows = hasHeader ? rows.slice(1) : rows

  const columnKeys = hasHeader
    ? headerRow.map((h) => HEADER_MAP[h])
    : (['name', 'active', 'description'] as const)

  const errors: string[] = []
  let added = 0
  let updated = 0
  let skipped = 0
  let merged = [...existing]

  for (let i = 0; i < dataRows.length; i++) {
    const cells = dataRows[i]
    const rowIndex = hasHeader ? i + 2 : i + 1
    const fields: Partial<RowFields> = {}

    columnKeys.forEach((key, colIndex) => {
      if (!key) return
      fields[key as keyof RowFields] = cells[colIndex] ?? ''
    })

    const { exercise, error } = rowToExercise(fields, rowIndex)
    if (error) {
      errors.push(error)
      continue
    }
    if (!exercise) continue

    const byId = exercise.id ? findExerciseById(merged, exercise.id) : undefined
    const byName = merged.find(
      (e) => normalizeExerciseName(e.name) === normalizeExerciseName(exercise.name),
    )

    if (byId && byName && byId.id !== byName.id) {
      errors.push(
        `Row ${rowIndex}: id matches "${byId.name}" but name matches "${byName.name}".`,
      )
      continue
    }

    const target = byId ?? byName
    if (target) {
      const same =
        target.name === exercise.name &&
        target.description === exercise.description &&
        target.active === exercise.active
      if (same && target.id === exercise.id) {
        skipped++
        continue
      }
      merged = merged.map((e) =>
        e.id === target.id
          ? {
              ...e,
              name: exercise.name,
              description: exercise.description,
              active: exercise.active,
            }
          : e,
      )
      updated++
    } else {
      merged.unshift(exercise)
      added++
    }
  }

  return {
    exercises: normalizeExercises(merged),
    added,
    updated,
    skipped,
    errors,
  }
}
