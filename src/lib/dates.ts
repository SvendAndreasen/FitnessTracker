export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

export function parseDateKey(key: string): Date | null {
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function formatDayHeading(dateKey: string, reference = new Date()): string {
  const date = parseDateKey(dateKey)
  if (!date) return dateKey

  const today = toDateKey(reference)
  const yesterday = toDateKey(
    new Date(reference.getFullYear(), reference.getMonth(), reference.getDate() - 1),
  )

  const long = date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  if (dateKey === today) return `Today — ${long}`
  if (dateKey === yesterday) return `Yesterday — ${long}`
  return long
}
