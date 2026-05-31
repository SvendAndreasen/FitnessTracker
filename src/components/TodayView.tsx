import { formatDayHeading, todayKey } from '../lib/dates'
import { buildTodaySlots } from '../lib/todayPlan'
import { getSkippedExerciseIds } from '../lib/skippedToday'
import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'
import { WorkoutCard } from './WorkoutCard'

type TodayViewProps = {
  workouts: Workout[]
  exercises: Exercise[]
  onAddClick: () => void
  onEditWorkout: (workout: Workout) => void
  onStartExercise: (exerciseId: string) => void
  onSkipExercise: (exerciseId: string) => void
}

export function TodayView({
  workouts,
  exercises,
  onAddClick,
  onEditWorkout,
  onStartExercise,
  onSkipExercise,
}: TodayViewProps) {
  const today = todayKey()
  const slots = buildTodaySlots(
    exercises,
    workouts,
    today,
    getSkippedExerciseIds(today),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {formatDayHeading(today)}
          </h2>
          <p className="text-sm text-slate-500">
            {slots.length} active exercise{slots.length === 1 ? '' : 's'} for today
          </p>
        </div>
        <button
          type="button"
          onClick={onAddClick}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Log other exercise
        </button>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No active exercises in your catalog.</p>
          <p className="mt-1 text-sm text-slate-500">
            Mark exercises as active in the Exercises tab.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {slots.map(({ exercise, workout }) =>
            workout ? (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                description={exercise.description}
                isToday
                onOpen={() => onEditWorkout(workout)}
                onDelete={() => onSkipExercise(exercise.id)}
              />
            ) : (
              <WorkoutCard
                key={exercise.id}
                workout={{
                  id: `pending-${exercise.id}`,
                  exerciseId: exercise.id,
                  exerciseName: exercise.name,
                  date: today,
                }}
                description={exercise.description}
                isToday
                isPending
                onOpen={() => onStartExercise(exercise.id)}
                onDelete={() => onSkipExercise(exercise.id)}
              />
            ),
          )}
        </ul>
      )}
    </div>
  )
}
