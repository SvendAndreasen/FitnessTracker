import { useState } from 'react'
import { DailyActivityList } from './components/DailyActivityList'
import { WorkoutForm } from './components/WorkoutForm'
import { todayKey } from './lib/dates'
import { downloadWorkoutsCsv } from './lib/exportCsv'
import {
  addWorkoutToList,
  deleteWorkoutFromList,
  loadWorkouts,
  updateWorkoutInList,
} from './lib/storage'
import type { Workout } from './types/workout'

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadWorkouts())

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
    downloadWorkoutsCsv(workouts, todayKey())
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
            <button
              type="button"
              onClick={handleExport}
              disabled={workouts.length === 0}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
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
