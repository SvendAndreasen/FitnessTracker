import { useState } from 'react'
import { WorkoutForm } from './components/WorkoutForm'
import { WorkoutList } from './components/WorkoutList'
import { addWorkout, deleteWorkout, loadWorkouts } from './lib/storage'
import type { Workout } from './types/workout'

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadWorkouts())

  function handleAdd(workout: Workout) {
    setWorkouts(addWorkout(workout))
  }

  function handleDelete(id: string) {
    setWorkouts(deleteWorkout(id))
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Fitness Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Log workouts locally in your browser.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
        <WorkoutForm onSubmit={handleAdd} />

        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            History
          </h2>
          <WorkoutList workouts={workouts} onDelete={handleDelete} />
        </section>
      </main>
    </div>
  )
}

export default App
