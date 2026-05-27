export function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = Number.parseInt(trimmed, 10)
  return Number.isNaN(n) ? undefined : n
}

export function parseOptionalFloat(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = Number.parseFloat(trimmed)
  return Number.isNaN(n) ? undefined : n
}

export function formatOptionalInt(value: number | undefined): string {
  return value == null ? '' : String(value)
}

export function formatOptionalFloat(value: number | undefined): string {
  return value == null ? '' : String(value)
}
