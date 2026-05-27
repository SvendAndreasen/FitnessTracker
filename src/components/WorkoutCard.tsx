import { useState, type FormEvent } from 'react'
import { hasExerciseOnDate } from '../lib/carryOver'
import {
  formatOptionalFloat,
  formatOptionalInt,
  parseOptionalFloat,
  parseOptionalInt,
} from '../lib/workoutValues'
import type { Workout } from '../types/workout'

type WorkoutCardProps = {
  workout: Workout
  workouts: Workout[]
  isToday: boolean
  onDelete?: (id: string) => void
  onUpdate?: (workout: Workout) => void
}

function detailParts(workout: Workout): string[] {
  const parts: string[] = []
  if (workout.sets != null) parts.push(`${workout.sets} sets`)
  if (workout.reps != null) parts.push(`${workout.reps} reps`)
  if (workout.weight != null) parts.push(`${workout.weight} kg`)
  if (workout.durationMinutes != null)
    parts.push(`${workout.durationMinutes} min`)
  return parts
}

export function WorkoutCard({
  workout,
  workouts,
  isToday,
  onDelete,
  onUpdate,
}: WorkoutCardProps) {
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exerciseName, setExerciseName] = useState(workout.exerciseName)
  const [sets, setSets] = useState(formatOptionalInt(workout.sets))
  const [reps, setReps] = useState(formatOptionalInt(workout.reps))
  const [weight, setWeight] = useState(formatOptionalFloat(workout.weight))
  const [durationMinutes, setDurationMinutes] = useState(
    formatOptionalInt(workout.durationMinutes),
  )
  const [notes, setNotes] = useState(workout.notes ?? '')


  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'

  function startEdit() {
    setExerciseName(workout.exerciseName)
    setSets(formatOptionalInt(workout.sets))
    setReps(formatOptionalInt(workout.reps))
    setWeight(formatOptionalFloat(workout.weight))
    setDurationMinutes(formatOptionalInt(workout.durationMinutes))
    setNotes(workout.notes ?? '')
    setError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setError(null)
  }

  function handleSave(e: FormEvent) {
    e.preventDefault()
    const name = exerciseName.trim()
    if (!name) {
      setError('Exercise name is required.')
      return
    }
    if (hasExerciseOnDate(workouts, workout.date, name, workout.id)) {
      setError('Another exercise with this name is already logged for today.')
      return
    }

    onUpdate?.({
      ...workout,
      exerciseName: name,
      sets: parseOptionalInt(sets),
      reps: parseOptionalInt(reps),
      weight: parseOptionalFloat(weight),
      durationMinutes: parseOptionalInt(durationMinutes),
      notes: notes.trim() || undefined,
      carriedFrom: undefined,
    })
    setEditing(false)
    setError(null)
  }

  if (editing && isToday) {
    return (
      <li className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-sm font-medium text-slate-900">Edit exercise</p>
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {error}
            </p>
          )}
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">
              Exercise name
            </span>
            <input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Sets
              </span>
              <input
                type="number"
                min={0}
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Reps
              </span>
              <input
                type="number"
                min={0}
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Weight (kg)
              </span>
              <input
                type="number"
                min={0}
                step="0.5"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-slate-700">
                Duration (min)
              </span>
              <input
                type="number"
                min={0}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className={inputClass}
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-700">
              Notes
            </span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={inputClass}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    )
  }

  const details = detailParts(workout)

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900">{workout.exerciseName}</h3>
          {isToday && workout.carriedFrom && (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
              From last session
            </span>
          )}
        </div>
        {details.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">{details.join(' · ')}</p>
        )}
        {workout.notes && (
          <p className="mt-2 text-sm text-slate-500">{workout.notes}</p>
        )}
      </div>
      {isToday && onDelete && onUpdate && (
        <div className="flex shrink-0 gap-2 self-start">
          <button
            type="button"
            onClick={startEdit}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(workout.id)}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            aria-label={`Skip ${workout.exerciseName}`}
          >
            Skip
          </button>
        </div>
      )}
    </li>
  )
}
