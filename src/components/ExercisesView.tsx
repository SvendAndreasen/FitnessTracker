import { useRef, useState } from 'react'
import { downloadCatalogCsv } from '../lib/exportCatalogCsv'
import { importCatalogFromCsv } from '../lib/importCatalogCsv'
import { isDuplicateExerciseName } from '../lib/ensureExercise'
import type { Exercise, ExerciseFormData } from '../types/exercise'

type ExercisesViewProps = {
  exercises: Exercise[]
  onAdd: (exercise: Exercise) => void
  onUpdate: (exercise: Exercise) => void
  onDelete: (id: string) => void
  onImportCatalog: (exercises: Exercise[]) => void
  onStatusMessage?: (message: string | null) => void
}

function emptyForm(): ExerciseFormData {
  return { name: '', description: '', active: true }
}

function exerciseToForm(exercise: Exercise): ExerciseFormData {
  return {
    name: exercise.name,
    description: exercise.description ?? '',
    active: exercise.active,
  }
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30'

export function ExercisesView({
  exercises,
  onAdd,
  onUpdate,
  onDelete,
  onImportCatalog,
  onStatusMessage,
}: ExercisesViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [form, setForm] = useState<ExerciseFormData>(emptyForm)
  const [error, setError] = useState<string | null>(null)

  const sorted = [...exercises].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  )
  const activeCount = exercises.filter((e) => e.active).length

  function startAdd() {
    setEditingId(null)
    setIsAdding(true)
    setForm(emptyForm())
    setError(null)
  }

  function startEdit(exercise: Exercise) {
    setIsAdding(false)
    setEditingId(exercise.id)
    setForm(exerciseToForm(exercise))
    setError(null)
  }

  function cancelForm() {
    setIsAdding(false)
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
  }

  function handleSave() {
    const name = form.name.trim()
    if (!name) {
      setError('Name is required.')
      return
    }

    if (isAdding) {
      if (isDuplicateExerciseName(exercises, name)) {
        setError('An exercise with this name already exists.')
        return
      }
      onAdd({
        id: crypto.randomUUID(),
        name,
        description: form.description.trim() || undefined,
        active: form.active,
      })
    } else if (editingId) {
      if (isDuplicateExerciseName(exercises, name, editingId)) {
        setError('An exercise with this name already exists.')
        return
      }
      const existing = exercises.find((e) => e.id === editingId)
      if (!existing) {
        cancelForm()
        return
      }
      onUpdate({
        ...existing,
        name,
        description: form.description.trim() || undefined,
        active: form.active,
      })
    }

    cancelForm()
  }

  function toggleActive(exercise: Exercise) {
    onUpdate({ ...exercise, active: !exercise.active })
  }

  function handleExportCatalog() {
    const summary = downloadCatalogCsv(exercises)
    onStatusMessage?.(
      `Exported catalog: ${summary.total} exercises (${summary.active} active).`,
    )
  }

  function handleImportClick() {
    onStatusMessage?.(null)
    fileInputRef.current?.click()
  }

  async function handleCatalogFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const result = importCatalogFromCsv(text, exercises)
      onImportCatalog(result.exercises)
      const parts: string[] = []
      if (result.added > 0) {
        parts.push(`Added ${result.added}.`)
      }
      if (result.updated > 0) {
        parts.push(`Updated ${result.updated}.`)
      }
      if (result.skipped > 0) {
        parts.push(`Skipped ${result.skipped} unchanged.`)
      }
      if (result.errors.length > 0) {
        parts.push(result.errors.slice(0, 2).join(' '))
      }
      onStatusMessage?.(
        parts.length > 0
          ? `Catalog import: ${parts.join(' ')}`
          : 'No catalog rows imported.',
      )
    } catch {
      onStatusMessage?.('Could not read the catalog file.')
    }
  }

  const showForm = isAdding || editingId !== null

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={handleCatalogFile}
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Exercise catalog</h2>
          <p className="text-sm text-slate-500">
            {activeCount} active · {exercises.length} total. Active exercises appear on
            Today with values from your last session.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleImportClick}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50"
          >
            Import catalog
          </button>
          <button
            type="button"
            onClick={handleExportCatalog}
            disabled={exercises.length === 0}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 disabled:opacity-50"
          >
            Export catalog
          </button>
          {!showForm && (
            <button
              type="button"
              onClick={startAdd}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Add to catalog
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
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
              Name *
            </span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputClass}
              placeholder="e.g. Bench press"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              className={inputClass}
              placeholder="How to perform it, cues, goals…"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Active in training (shown on Today)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelForm}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No exercises in the catalog yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add exercises here, mark them active, and they will appear on Today.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((exercise) => (
            <li
              key={exercise.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{exercise.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        exercise.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {exercise.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {exercise.description && (
                    <p className="mt-2 text-sm text-slate-500 line-clamp-3">
                      {exercise.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleActive(exercise)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {exercise.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(exercise)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-emerald-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Delete "${exercise.name}" from the catalog? Past logs are kept.`,
                        )
                      ) {
                        onDelete(exercise.id)
                        if (editingId === exercise.id) cancelForm()
                      }
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
