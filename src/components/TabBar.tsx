export type MainTab = 'today' | 'history'

type TabBarProps = {
  active: MainTab
  onChange: (tab: MainTab) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  const tabClass = (tab: MainTab) =>
    `flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
      active === tab
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
    }`

  return (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50 p-1"
      role="tablist"
      aria-label="Main navigation"
    >
      <div className="flex gap-1">
        <button
          type="button"
          role="tab"
          aria-selected={active === 'today'}
          aria-controls="today-panel"
          id="today-tab"
          className={tabClass('today')}
          onClick={() => onChange('today')}
        >
          Today
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={active === 'history'}
          aria-controls="history-panel"
          id="history-tab"
          className={tabClass('history')}
          onClick={() => onChange('history')}
        >
          History
        </button>
      </div>
    </div>
  )
}
