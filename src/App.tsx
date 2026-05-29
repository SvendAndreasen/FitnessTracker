import { useRef, useState } from 'react'
import { ExerciseEditor } from './components/ExerciseEditor'
import { HistoryView } from './components/HistoryView'
import { TabBar, type MainTab } from './components/TabBar'
import { TodayView } from './components/TodayView'
import { todayKey } from './lib/dates'
import { downloadWorkoutsCsv } from './lib/exportCsv'
import { importWorkoutsFromCsv } from './lib/importCsv'
import {
  addWorkoutToList,
  deleteWorkoutFromList,
  getAllStoredWorkouts,
  loadWorkouts,
  saveWorkouts,
  updateWorkoutInList,
} from './lib/storage'
import type { Workout } from './types/workout'

type Panel =
  | { type: 'tab'; tab: MainTab }
  | { type: 'add' }
  | { type: 'edit'; workoutId: string }

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadWorkouts())
  const [panel, setPanel] = useState<Panel>({ type: 'tab', tab: 'today' })
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showTabBar = panel.type === 'tab'

  function goToTab(tab: MainTab) {
    setPanel({ type: 'tab', tab })
  }

  function handleAdd(workout: Workout) {
    setWorkouts((prev) => addWorkoutToList(prev, workout))
    goToTab('today')
  }

  function handleUpdate(workout: Workout) {
    setWorkouts((prev) => updateWorkoutInList(prev, workout))
    goToTab('today')
  }

  function handleDelete(id: string) {
    setWorkouts((prev) => deleteWorkoutFromList(prev, id))
  }

  function handleExport() {
    const all = getAllStoredWorkouts()
    const data = all.length > 0 ? all : workouts
    const summary = downloadWorkoutsCsv(data, todayKey())
    setImportMessage(
      `Exported ${summary.total} rows (${summary.today} today, ${summary.history} in history).`,
    )
    setPanel({ type: 'tab', tab: panel.type === 'tab' ? panel.tab : 'today' })
  }

  function handleImportClick() {
    setImportMessage(null)
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const result = importWorkoutsFromCsv(text, workouts)
      saveWorkouts(result.workouts)
      setWorkouts(result.workouts)
      const parts: string[] = []
      if (result.added > 0) {
        parts.push(`Imported ${result.added} exercise${result.added === 1 ? '' : 's'}.`)
      }
      if (result.skipped > 0) {
        parts.push(`Skipped ${result.skipped} duplicate(s).`)
      }
      if (result.errors.length > 0) {
        parts.push(result.errors.slice(0, 2).join(' '))
      }
      setImportMessage(parts.join(' ') || 'No rows imported.')
      goToTab('today')
    } catch {
      setImportMessage('Could not read the file.')
    }
  }

  const editingWorkout =
    panel.type === 'edit'
      ? workouts.find((w) => w.id === panel.workoutId)
      : undefined

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Fitness Tracker
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Today and history in tabs. Add or edit exercises in their own screen.
              </p>
            </div>
            {showTabBar && (
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  onClick={handleImportClick}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  Import
                </button>
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={workouts.length === 0}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  Export
                </button>
              </div>
            )}
          </div>
          {importMessage && showTabBar && (
            <p
              role="status"
              className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {importMessage}
            </p>
          )}
        </div>
      </header>

      <main
        className={`mx-auto max-w-3xl px-4 py-8 sm:px-6 ${showTabBar ? 'pb-28' : 'pb-8'}`}
      >
        {panel.type === 'tab' && panel.tab === 'today' && (
          <TodayView
            workouts={workouts}
            onAddClick={() => setPanel({ type: 'add' })}
            onEditClick={(w) => setPanel({ type: 'edit', workoutId: w.id })}
            onDelete={handleDelete}
          />
        )}

        {panel.type === 'tab' && panel.tab === 'history' && (
          <HistoryView workouts={workouts} />
        )}

        {panel.type === 'add' && (
          <ExerciseEditor
            mode="add"
            workouts={workouts}
            onSave={handleAdd}
            onClose={() => goToTab('today')}
          />
        )}

        {panel.type === 'edit' && editingWorkout && (
          <ExerciseEditor
            mode="edit"
            workouts={workouts}
            workout={editingWorkout}
            onSave={handleUpdate}
            onClose={() => goToTab('today')}
          />
        )}

        {panel.type === 'edit' && !editingWorkout && (
          <div className="text-center text-sm text-slate-500">
            Exercise not found.{' '}
            <button
              type="button"
              className="font-medium text-emerald-700"
              onClick={() => goToTab('today')}
            >
              Back to Today
            </button>
          </div>
        )}
      </main>

      {showTabBar && (
        <TabBar
          active={panel.type === 'tab' ? panel.tab : 'today'}
          onChange={goToTab}
        />
      )}
    </div>
  )
}

export default App
