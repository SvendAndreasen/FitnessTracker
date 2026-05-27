import { useState, type FormEvent } from 'react'
import type { Workout, WorkoutFormData } from '../types/workout'

type WorkoutFormProps = {
  onSubmit: (workout: Workout) => void
}

const emptyForm = (): WorkoutFormData => ({
  exerciseName: '',
  date: new Date().toISOString().slice(0, 10),
  sets: '',
  reps: '',
  weight: '',
  durationMinutes: '',
  notes: '',
})

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = Number.parseInt(trimmed, 10)
  return Number.isNaN(n) ? undefined : n
}

function parseOptionalFloat(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const n = Number.parseFloat(trimmed)
  return Number.isNaN(n) ? undefined : n
}

export function WorkoutForm({ onSubmit }: WorkoutFormProps) {
  const [form, setForm] = useState<WorkoutFormData>(emptyForm)
  const [error, setError] = useState<string | null>(null)

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

    onSubmit({
      id: crypto.randomUUID(),
      exerciseName,
      date: form.date,
      sets: parseOptionalInt(form.sets),
      reps: parseOptionalInt(form.reps),
      weight: parseOptionalFloat(form.weight),
      durationMinutes: parseOptionalInt(form.durationMinutes),
      notes: form.notes.trim() || undefined,
    })
    setForm(emptyForm())
    setError(null)
  }

  const inputClass =
    'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">Register activity</h2>
      <p className="mt-1 text-sm text-slate-500">
        Saved activities appear under the chosen day. Today is selected by default.
      </p>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Exercise name *
          </span>
          <input
            type="text"
            value={form.exerciseName}
            onChange={(e) => updateField('exerciseName', e.target.value)}
            placeholder="e.g. Bench press"
            className={inputClass}
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Date *
          </span>
          <input
            type="date"
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            className={inputClass}
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
            placeholder="Optional"
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
            placeholder="Optional"
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
            placeholder="Optional"
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
            placeholder="Optional"
            className={inputClass}
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-slate-700">
            Notes
          </span>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Optional"
            className={inputClass}
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-6 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:w-auto"
      >
        Save activity
      </button>
    </form>
  )
}
