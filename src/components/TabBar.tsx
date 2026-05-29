export type MainTab = 'today' | 'history'

type TabBarProps = {
  active: MainTab
  onChange: (tab: MainTab) => void
}

export function TabBar({ active, onChange }: TabBarProps) {
  const tabClass = (tab: MainTab) =>
    `flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${
      active === tab
        ? 'bg-emerald-600 text-white shadow-sm'
        : 'text-slate-600 hover:bg-slate-100'
    }`

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white px-4 py-3"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-3xl gap-2">
        <button type="button" className={tabClass('today')} onClick={() => onChange('today')}>
          Today
        </button>
        <button
          type="button"
          className={tabClass('history')}
          onClick={() => onChange('history')}
        >
          History
        </button>
      </div>
    </nav>
  )
}
