import { formatCsvCell } from './csvParse'
import type { Exercise } from '../types/exercise'

export type CatalogExportSummary = {
  total: number
  active: number
}

export function exercisesToCsv(exercises: Exercise[]): string {
  const headers = ['exercise_id', 'name', 'description', 'active']

  const sorted = [...exercises].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )

  const rows = sorted.map((e) =>
    [
      formatCsvCell(e.id),
      formatCsvCell(e.name),
      formatCsvCell(e.description ?? ''),
      formatCsvCell(e.active),
    ].join(','),
  )

  return [headers.join(','), ...rows].join('\n')
}

export function downloadCatalogCsv(exercises: Exercise[]): CatalogExportSummary {
  const csv = exercisesToCsv(exercises)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'fitness-tracker-catalog.csv'
  link.click()
  URL.revokeObjectURL(url)
  return {
    total: exercises.length,
    active: exercises.filter((e) => e.active).length,
  }
}
