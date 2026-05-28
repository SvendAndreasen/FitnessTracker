import { useRef, useState } from 'react'
import { DailyActivityList } from './components/DailyActivityList'
import { WorkoutForm } from './components/WorkoutForm'
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

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadWorkouts())
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleAdd(workout: Workout) {
    setWorkouts((prev) => addWorkoutToList(prev, workout))
  }

  function handleDelete(id: string) {
    setWorkouts((prev) => deleteWorkoutFromList(prev, id))
  }

  function handleUpdate(workout: Workout) {
    setWorkouts((prev) => updateWorkoutInList(prev, workout))
  }

  function handleExport() {
    const all = getAllStoredWorkouts()
    const data = all.length > 0 ? all : workouts
    const summary = downloadWorkoutsCsv(data, todayKey())
    setImportMessage(
      `Exported ${summary.total} rows (${summary.today} today, ${summary.history} in history).`,
    )
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
        parts.push(
          `Imported ${result.added} exercise${result.added === 1 ? '' : 's'}.`,
        )
      }
      if (result.skipped > 0) {
        parts.push(
          `Skipped ${result.skipped} duplicate${result.skipped === 1 ? '' : 's'} (same day and name).`,
        )
      }
      if (result.errors.length > 0) {
        parts.push(result.errors.slice(0, 3).join(' '))
        if (result.errors.length > 3) {
          parts.push(`…and ${result.errors.length - 3} more errors.`)
        }
      }
      if (parts.length === 0) {
        parts.push('No rows were imported.')
      }
      setImportMessage(parts.join(' '))
    } catch {
      setImportMessage('Could not read the file. Use a CSV exported from this app.')
    }
  }

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
                Exercises grouped by date. Edit or skip today&apos;s list; past days are read-only.
              </p>
            </div>
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
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                Import CSV
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={workouts.length === 0}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Export all CSV
              </button>
            </div>
          </div>
          {importMessage && (
            <p
              role="status"
              className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {importMessage}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <section>
          <DailyActivityList
            workouts={workouts}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        </section>

        <WorkoutForm workouts={workouts} onSubmit={handleAdd} />
      </main>
    </div>
  )
}

export default App
