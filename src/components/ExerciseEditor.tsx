import { useMemo, useState, type FormEvent } from 'react'
import { hasExerciseOnDate } from '../lib/carryOver'
import { todayKey } from '../lib/dates'
import { findExerciseById } from '../lib/exerciseStorage'
import {
  formatOptionalFloat,
  formatOptionalInt,
  parseOptionalFloat,
  parseOptionalInt,
} from '../lib/workoutValues'
import type { Exercise } from '../types/exercise'
import type { Workout, WorkoutFormData } from '../types/workout'

type ExerciseEditorProps = {
  mode: 'add' | 'edit'
  workouts: Workout[]
  exercises: Exercise[]
  workout?: Workout
  onSave: (workout: Workout, exercise?: Exercise) => void
  onClose: () => void
}

function workoutToForm(workout?: Workout): WorkoutFormData {
  if (!workout) {
    return {
      exerciseName: '',
      date: todayKey(),
      sets: '',
      reps: '',
      weight: '',
      durationMinutes: '',
      description: '',
    }
  }
  return {
    exerciseName: workout.exerciseName,
    date: workout.date,
    sets: formatOptionalInt(workout.sets),
    reps: formatOptionalInt(workout.reps),
    weight: formatOptionalFloat(workout.weight),
    durationMinutes: formatOptionalInt(workout.durationMinutes),
    description: '',
  }
}

export function ExerciseEditor({
  mode,
  workouts,
  exercises,
  workout,
  onSave,
  onClose,
}: ExerciseEditorProps) {
  const [form, setForm] = useState<WorkoutFormData>(() => workoutToForm(workout))
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(() => {
    if (workout?.exerciseId) return workout.exerciseId
    return ''
  })
  const [useNewName, setUseNewName] = useState(mode === 'add' && !workout)
  const [error, setError] = useState<string | null>(null)

  const catalogSorted = useMemo(
    () =>
      [...exercises].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
      ),
    [exercises],
  )

  const selectedExercise = useMemo(() => {
    if (mode === 'edit' && workout?.exerciseId) {
      return findExerciseById(exercises, workout.exerciseId)
    }
    if (useNewName) return undefined
    return selectedExerciseId
      ? findExerciseById(exercises, selectedExerciseId)
      : undefined
  }, [mode, workout, exercises, useNewName, selectedExerciseId])

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'

  function updateField<K extends keyof WorkoutFormData>(
    key: K,
    value: WorkoutFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    let exerciseId = workout?.exerciseId ?? ''
    let exerciseName = form.exerciseName.trim()

    if (mode === 'edit' && workout) {
      exerciseId = workout.exerciseId
      exerciseName = workout.exerciseName
    } else if (useNewName) {
      if (!exerciseName) {
        setError('Exercise name is required.')
        return
      }
    } else {
      if (!selectedExerciseId) {
        setError('Choose an exercise from the catalog.')
        return
      }
      const picked = findExerciseById(exercises, selectedExerciseId)
      if (!picked) {
        setError('Selected exercise not found.')
        return
      }
      exerciseId = picked.id
      exerciseName = picked.name
    }

    if (!form.date) {
      setError('Date is required.')
      return
    }

    const exceptId = mode === 'edit' && workout ? workout.id : undefined
    if (exerciseId && hasExerciseOnDate(workouts, form.date, exerciseId, exceptId)) {
      setError('This exercise is already on that day.')
      return
    }

    const saved: Workout = {
      id: mode === 'edit' && workout ? workout.id : crypto.randomUUID(),
      exerciseId,
      exerciseName,
      date: form.date,
      sets: parseOptionalInt(form.sets),
      reps: parseOptionalInt(form.reps),
      weight: parseOptionalFloat(form.weight),
      durationMinutes: parseOptionalInt(form.durationMinutes),
      carriedFrom: undefined,
    }

    const newExercise =
      mode === 'add' && useNewName
        ? {
            id: crypto.randomUUID(),
            name: exerciseName,
            active: true,
          }
        : undefined

    if (newExercise) {
      saved.exerciseId = newExercise.id
    }

    onSave(saved, newExercise)
  }

  return (
    <div className="pb-8">
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
        <h2 className="text-lg font-semibold text-slate-900">
          {mode === 'add' ? 'Log exercise' : 'Edit log'}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        {mode === 'edit' ? (
          <div>
            <p className="text-sm font-medium text-slate-700">Exercise</p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {workout?.exerciseName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Change the name in the Exercises tab.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setUseNewName(false)
                  setError(null)
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  !useNewName
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-200 text-slate-600'
                }`}
              >
                From catalog
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseNewName(true)
                  setSelectedExerciseId('')
                  setError(null)
                }}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                  useNewName
                    ? 'bg-emerald-600 text-white'
                    : 'border border-slate-200 text-slate-600'
                }`}
              >
                New name
              </button>
            </div>

            {useNewName ? (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Exercise name *
                </span>
                <input
                  type="text"
                  value={form.exerciseName}
                  onChange={(e) => updateField('exerciseName', e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Bench press"
                />
              </label>
            ) : (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-slate-700">
                  Exercise *
                </span>
                <select
                  value={selectedExerciseId}
                  onChange={(e) => {
                    setSelectedExerciseId(e.target.value)
                    setError(null)
                  }}
                  className={inputClass}
                >
                  <option value="">Select…</option>
                  {catalogSorted.map((exercise) => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                      {!exercise.active ? ' (inactive)' : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        {selectedExercise?.description && (
          <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <p className="text-xs font-medium text-slate-500">Description</p>
            <p className="mt-1">{selectedExercise.description}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Date *
            </span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              className={inputClass}
              disabled={mode === 'edit'}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Duration (minutes)
            </span>
            <input
              type="number"
              min={0}
              value={form.durationMinutes}
              onChange={(e) => updateField('durationMinutes', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Sets
            </span>
            <input
              type="number"
              min={0}
              value={form.sets}
              onChange={(e) => updateField('sets', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Reps
            </span>
            <input
              type="number"
              min={0}
              value={form.reps}
              onChange={(e) => updateField('reps', e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Weight (kg)
            </span>
            <input
              type="number"
              min={0}
              step="0.5"
              value={form.weight}
              onChange={(e) => updateField('weight', e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
