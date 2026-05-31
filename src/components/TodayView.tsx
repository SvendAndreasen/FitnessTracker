import { formatDayHeading, todayKey } from '../lib/dates'
import { findExerciseById } from '../lib/exerciseStorage'
import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'
import { WorkoutCard } from './WorkoutCard'

type TodayViewProps = {
  workouts: Workout[]
  exercises: Exercise[]
  onAddClick: () => void
  onEditClick: (workout: Workout) => void
  onDelete: (id: string) => void
}

export function TodayView({
  workouts,
  exercises,
  onAddClick,
  onEditClick,
  onDelete,
}: TodayViewProps) {
  const today = todayKey()
  const todayWorkouts = workouts.filter((w) => w.date === today)
  const activeCount = exercises.filter((e) => e.active).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {formatDayHeading(today)}
          </h2>
          <p className="text-sm text-slate-500">
            {activeCount} active in catalog
            {todayWorkouts.length > 0 &&
              ` · ${todayWorkouts.length} on today`}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Log exercise
        </button>
      </div>

      {todayWorkouts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No exercises on today yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            {activeCount > 0
              ? 'Active exercises from your catalog appear here with sets and weight from your last time doing each one.'
              : 'Mark exercises as active in the Exercises tab, or log one manually.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {todayWorkouts.map((workout) => {
            const exercise = workout.exerciseId
              ? findExerciseById(exercises, workout.exerciseId)
              : undefined
            return (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                description={exercise?.description}
                isToday
                onOpen={() => onEditClick(workout)}
                onDelete={onDelete}
              />
            )
          })}
        </ul>
      )}
    </div>
  )
}
