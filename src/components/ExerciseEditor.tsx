import { useState, type FormEvent } from 'react'
import { hasExerciseOnDate } from '../lib/carryOver'
import { todayKey } from '../lib/dates'
import { getDescription } from '../lib/normalizeWorkout'
import {
  formatOptionalFloat,
  formatOptionalInt,
  parseOptionalFloat,
  parseOptionalInt,
} from '../lib/workoutValues'
import type { Workout, WorkoutFormData } from '../types/workout'

type ExerciseEditorProps = {
  mode: 'add' | 'edit'
  workouts: Workout[]
  workout?: Workout
  onSave: (workout: Workout) => void
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
    description: getDescription(workout) ?? '',
  }
}

export function ExerciseEditor({
  mode,
  workouts,
  workout,
  onSave,
  onClose,
}: ExerciseEditorProps) {
  const [form, setForm] = useState<WorkoutFormData>(() => workoutToForm(workout))
  const [error, setError] = useState<string | null>(null)

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
    const exerciseName = form.exerciseName.trim()
    if (!exerciseName) {
      setError('Exercise name is required.')
      return
    }
    if (!form.date) {
      setError('Date is required.')
      return
    }

    const exceptId = mode === 'edit' && workout ? workout.id : undefined
    if (hasExerciseOnDate(workouts, form.date, exerciseName, exceptId)) {
      setError('This exercise is already logged for that day.')
      return
    }

    const saved: Workout = {
      id: mode === 'edit' && workout ? workout.id : crypto.randomUUID(),
      exerciseName,
      date: form.date,
      sets: parseOptionalInt(form.sets),
      reps: parseOptionalInt(form.reps),
      weight: parseOptionalFloat(form.weight),
      durationMinutes: parseOptionalInt(form.durationMinutes),
      description: form.description.trim() || undefined,
      carriedFrom: undefined,
    }

    onSave(saved)
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
          {mode === 'add' ? 'New exercise' : 'Edit exercise'}
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

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className={inputClass}
            placeholder="How to perform it, cues, goals…"
          />
        </label>

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
