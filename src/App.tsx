import { useRef, useState } from 'react'
import { ExerciseEditor } from './components/ExerciseEditor'
import { ExercisesView } from './components/ExercisesView'
import { HistoryView } from './components/HistoryView'
import { TabBar, type MainTab } from './components/TabBar'
import { DateNavigator } from './components/DateNavigator'
import { TodayView } from './components/TodayView'
import { loadAppData } from './lib/appData'
import { skipWorkoutForToday } from './lib/carryOver'
import { isBeforeAppDay, todayKey } from './lib/dates'
import { addSkippedExerciseId } from './lib/skippedToday'
import { findOrCreateExerciseByName } from './lib/ensureExercise'
import {
  addExerciseToList,
  saveExercises,
  updateExerciseInList,
  deleteExerciseFromList,
} from './lib/exerciseStorage'
import { downloadWorkoutsCsv } from './lib/exportCsv'
import { importWorkoutsFromCsv } from './lib/importCsv'
import {
  addWorkoutToList,
  deleteWorkoutFromList,
  getAllStoredWorkouts,
  saveWorkouts,
  updateWorkoutInList,
} from './lib/storage'
import { removeSkippedExerciseId } from './lib/skippedToday'
import type { Exercise } from './types/exercise'
import type { Workout } from './types/workout'

type EditorPanel =
  | { mode: 'add'; exerciseId?: string }
  | { mode: 'edit'; workoutId: string }

function App() {
  const [workouts, setWorkouts] = useState<Workout[]>(() => loadAppData().workouts)
  const [exercises, setExercises] = useState<Exercise[]>(
    () => loadAppData().exercises,
  )
  const [activeTab, setActiveTab] = useState<MainTab>('today')
  const [editor, setEditor] = useState<EditorPanel | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const logsFileInputRef = useRef<HTMLInputElement>(null)

  function reloadAppData() {
    const data = loadAppData()
    setWorkouts(data.workouts)
    setExercises(data.exercises)
  }

  function handleAdd(workout: Workout, newExercise?: Exercise) {
    let nextExercises = exercises
    if (newExercise) {
      nextExercises = addExerciseToList(exercises, newExercise)
      workout.exerciseId = newExercise.id
      workout.exerciseName = newExercise.name
    } else if (!workout.exerciseId) {
      const result = findOrCreateExerciseByName(exercises, workout.exerciseName, {
        active: true,
      })
      nextExercises = result.exercises
      workout.exerciseId = result.exercise.id
      workout.exerciseName = result.exercise.name
    }
    removeSkippedExerciseId(workout.exerciseId, workout.date)
    setExercises(nextExercises)
    setWorkouts((prev) => addWorkoutToList(prev, workout))
    setEditor(null)
    setActiveTab('today')
  }

  function handleUpdate(workout: Workout) {
    setWorkouts((prev) => updateWorkoutInList(prev, workout))
    setEditor(null)
    setActiveTab(isBeforeAppDay(workout.date, todayKey()) ? 'history' : 'today')
  }

  function refreshForDateChange() {
    reloadAppData()
    setEditor(null)
  }

  function handleSkipActiveExercise(exerciseId: string) {
    const today = todayKey()
    const workout = workouts.find(
      (w) => w.date === today && w.exerciseId === exerciseId,
    )
    if (workout) {
      skipWorkoutForToday(workout)
      setWorkouts((prev) => deleteWorkoutFromList(prev, workout.id))
    } else {
      addSkippedExerciseId(exerciseId, today)
    }
  }

  function handleCatalogAdd(exercise: Exercise) {
    setExercises((prev) => addExerciseToList(prev, exercise))
    reloadAppData()
    setActiveTab('today')
  }

  function handleCatalogUpdate(exercise: Exercise) {
    setExercises((prev) => updateExerciseInList(prev, exercise))
    reloadAppData()
  }

  function handleCatalogDelete(id: string) {
    setExercises((prev) => deleteExerciseFromList(prev, id))
    reloadAppData()
  }

  function handleCatalogImport(next: Exercise[]) {
    saveExercises(next)
    setExercises(next)
    reloadAppData()
    setActiveTab('exercises')
  }

  function handleExportLogs() {
    const all = getAllStoredWorkouts()
    const data = all.length > 0 ? all : workouts
    const summary = downloadWorkoutsCsv(data, todayKey())
    setStatusMessage(
      `Exported logs: ${summary.total} rows (${summary.today} today, ${summary.history} in history).`,
    )
  }

  function handleImportLogsClick() {
    setStatusMessage(null)
    logsFileInputRef.current?.click()
  }

  async function handleLogsFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      const result = importWorkoutsFromCsv(text, workouts, exercises)
      saveWorkouts(result.workouts)
      saveExercises(result.exercises)
      setWorkouts(result.workouts)
      setExercises(result.exercises)
      reloadAppData()
      const parts: string[] = []
      if (result.added > 0) {
        parts.push(`Imported ${result.added} log row${result.added === 1 ? '' : 's'}.`)
      }
      if (result.skipped > 0) {
        parts.push(`Skipped ${result.skipped} duplicate(s).`)
      }
      if (result.errors.length > 0) {
        parts.push(result.errors.slice(0, 2).join(' '))
      }
      setStatusMessage(parts.join(' ') || 'No log rows imported.')
      setActiveTab('today')
      setEditor(null)
    } catch {
      setStatusMessage('Could not read the log file.')
    }
  }

  const editingWorkout =
    editor?.mode === 'edit'
      ? workouts.find((w) => w.id === editor.workoutId)
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
                Today shows active exercises; values come from your last session.
              </p>
            </div>
            {!editor && (
              <div className="flex flex-wrap gap-2">
                <input
                  ref={logsFileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleLogsFileChange}
                />
                <button
                  type="button"
                  onClick={handleImportLogsClick}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50"
                >
                  Import logs
                </button>
                <button
                  type="button"
                  onClick={handleExportLogs}
                  disabled={workouts.length === 0}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 disabled:opacity-50"
                >
                  Export logs
                </button>
              </div>
            )}
          </div>
          {statusMessage && !editor && (
            <p
              role="status"
              className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {statusMessage}
            </p>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {editor ? (
          editor.mode === 'add' ? (
            <ExerciseEditor
              mode="add"
              workouts={workouts}
              exercises={exercises}
              initialExerciseId={editor.exerciseId}
              onSave={handleAdd}
              onClose={() => setEditor(null)}
            />
          ) : editingWorkout ? (
            <ExerciseEditor
              mode="edit"
              workouts={workouts}
              exercises={exercises}
              workout={editingWorkout}
              onSave={handleUpdate}
              onClose={() => setEditor(null)}
            />
          ) : (
            <div className="text-center text-sm text-slate-500">
              Exercise not found.{' '}
              <button
                type="button"
                className="font-medium text-emerald-700"
                onClick={() => setEditor(null)}
              >
                Back
              </button>
            </div>
          )
        ) : (
          <div className="space-y-6">
            <DateNavigator onDateChange={refreshForDateChange} />
            <TabBar active={activeTab} onChange={setActiveTab} />

            {activeTab === 'today' ? (
              <div
                id="today-panel"
                role="tabpanel"
                aria-labelledby="today-tab"
                className="min-h-[40vh]"
              >
                <TodayView
                  workouts={workouts}
                  exercises={exercises}
                  onAddClick={() => setEditor({ mode: 'add' })}
                  onEditWorkout={(w) =>
                    setEditor({ mode: 'edit', workoutId: w.id })
                  }
                  onStartExercise={(exerciseId) =>
                    setEditor({ mode: 'add', exerciseId })
                  }
                  onSkipExercise={handleSkipActiveExercise}
                />
              </div>
            ) : activeTab === 'exercises' ? (
              <div
                id="exercises-panel"
                role="tabpanel"
                aria-labelledby="exercises-tab"
                className="min-h-[40vh]"
              >
                <ExercisesView
                  exercises={exercises}
                  onAdd={handleCatalogAdd}
                  onUpdate={handleCatalogUpdate}
                  onDelete={handleCatalogDelete}
                  onImportCatalog={handleCatalogImport}
                  onStatusMessage={setStatusMessage}
                />
              </div>
            ) : (
              <div
                id="history-panel"
                role="tabpanel"
                aria-labelledby="history-tab"
                className="min-h-[40vh]"
              >
                <HistoryView
                  workouts={workouts}
                  exercises={exercises}
                  onEditWorkout={(w) =>
                    setEditor({ mode: 'edit', workoutId: w.id })
                  }
                />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
