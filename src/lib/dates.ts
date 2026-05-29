const APP_DATE_KEY = 'fitness-tracker-app-date'

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function realTodayKey(): string {
  return toDateKey(new Date())
}

export function getAppDateOverride(): string | null {
  try {
    return localStorage.getItem(APP_DATE_KEY)
  } catch {
    return null
  }
}

export function setAppDateOverride(date: string | null): void {
  try {
    if (date) {
      localStorage.setItem(APP_DATE_KEY, date)
    } else {
      localStorage.removeItem(APP_DATE_KEY)
    }
  } catch {
    // ignore
  }
}

/** Active "today" for the app (real date, or test override). */
export function todayKey(): string {
  return getAppDateOverride() ?? realTodayKey()
}

export function isUsingTestDate(): boolean {
  return getAppDateOverride() != null
}

export function parseDateKey(key: string): Date | null {
  const [y, m, d] = key.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function shiftDateKey(key: string, days: number): string {
  const date = parseDateKey(key)
  if (!date) return key
  date.setDate(date.getDate() + days)
  return toDateKey(date)
}

export function formatDayHeading(
  dateKey: string,
  referenceDateKey: string = todayKey(),
): string {
  const date = parseDateKey(dateKey)
  if (!date) return dateKey

  const ref = parseDateKey(referenceDateKey) ?? new Date()
  const today = referenceDateKey
  const yesterday = toDateKey(
    new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() - 1),
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
