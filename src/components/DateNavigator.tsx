import {
  isUsingTestDate,
  realTodayKey,
  setAppDateOverride,
  shiftDateKey,
  todayKey,
} from '../lib/dates'

type DateNavigatorProps = {
  onDateChange: () => void
}

export function DateNavigator({ onDateChange }: DateNavigatorProps) {
  const activeDate = todayKey()
  const testing = isUsingTestDate()

  function applyDate(next: string) {
    if (next === realTodayKey()) {
      setAppDateOverride(null)
    } else {
      setAppDateOverride(next)
    }
    onDateChange()
  }

  const btnClass =
    'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">Active day</p>
        {testing && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
            Test date
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-slate-500">
        Move between days to test carry-over and history. Reset when done.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={btnClass}
          aria-label="Previous day"
          onClick={() => applyDate(shiftDateKey(activeDate, -1))}
        >
          ←
        </button>
        <input
          type="date"
          value={activeDate}
          onChange={(e) => {
            if (e.target.value) applyDate(e.target.value)
          }}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        />
        <button
          type="button"
          className={btnClass}
          aria-label="Next day"
          onClick={() => applyDate(shiftDateKey(activeDate, 1))}
        >
          →
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => applyDate(realTodayKey())}
        >
          Real today
        </button>
      </div>
    </div>
  )
}
