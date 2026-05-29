import { formatDayHeading, todayKey } from '../lib/dates'
import type { Workout } from '../types/workout'
import { WorkoutCard } from './WorkoutCard'

type TodayViewProps = {
  workouts: Workout[]
  onAddClick: () => void
  onEditClick: (workout: Workout) => void
  onDelete: (id: string) => void
}

export function TodayView({
  workouts,
  onAddClick,
  onEditClick,
  onDelete,
}: TodayViewProps) {
  const today = todayKey()
  const todayWorkouts = workouts.filter((w) => w.date === today)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {formatDayHeading(today)}
          </h2>
          {todayWorkouts.length > 0 && (
            <p className="text-sm text-slate-500">
              {todayWorkouts.length}{' '}
              {todayWorkouts.length === 1 ? 'exercise' : 'exercises'}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          Add exercise
        </button>
      </div>

      {todayWorkouts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No exercises for today yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Exercises from your last workout day appear here, or tap Add exercise.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {todayWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              isToday
              onOpen={() => onEditClick(workout)}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
