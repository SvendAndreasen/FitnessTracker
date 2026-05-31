import { findExerciseById } from '../lib/exerciseStorage'
import type { Exercise } from '../types/exercise'
import type { Workout } from '../types/workout'

type WorkoutCardProps = {
  workout: Workout
  exercises?: Exercise[]
  description?: string
  isToday: boolean
  isPending?: boolean
  onOpen?: () => void
  onDelete?: () => void
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
  exercises,
  description,
  isToday,
  isPending = false,
  onOpen,
  onDelete,
}: WorkoutCardProps) {
  const details = detailParts(workout)
  const catalogLinked =
    !!workout.exerciseId &&
    (!exercises || !!findExerciseById(exercises, workout.exerciseId))

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <button
          type="button"
          onClick={onOpen}
          disabled={!onOpen}
          className="min-w-0 flex-1 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-default rounded-lg"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{workout.exerciseName}</h3>
            {isPending && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                Not logged yet
              </span>
            )}
            {isToday && !isPending && workout.carriedFrom && (
              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                From last session
              </span>
            )}
            {isToday && !isPending && !workout.carriedFrom && (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Logged
              </span>
            )}
            {!isToday && !catalogLinked && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                Fix exercise link
              </span>
            )}
          </div>
          {isPending && details.length === 0 && (
            <p className="mt-1 text-sm text-slate-500">Tap to log sets and weight</p>
          )}
          {details.length > 0 && (
            <p className="mt-1 text-sm text-slate-600">{details.join(' · ')}</p>
          )}
          {description && (
            <p className="mt-2 line-clamp-2 text-sm text-slate-500">
              <span className="text-xs font-medium text-slate-400">How to: </span>
              {description}
            </p>
          )}
          {workout.comment && (
            <p className="mt-2 line-clamp-3 text-sm text-slate-600">
              <span className="text-xs font-medium text-slate-400">Comment: </span>
              {workout.comment}
            </p>
          )}
          {onOpen && (
            <p className="mt-2 text-xs font-medium text-emerald-700">
              {isPending ? 'Tap to log' : 'Tap to edit'}
            </p>
          )}
        </button>
        {isToday && onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Skip
          </button>
        )}
      </div>
    </li>
  )
}
