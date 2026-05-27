import { useState } from 'react'
import { DailyActivityList } from './components/DailyActivityList'
import { WorkoutForm } from './components/WorkoutForm'
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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fitness Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Exercises grouped by date. Edit or skip today&apos;s list; past days are read-only.
          </p>
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
