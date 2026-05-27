import type { Workout } from '../types/workout'

type WorkoutCardProps = {
  workout: Workout
  onDelete: (id: string) => void
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

export function WorkoutCard({ workout, onDelete }: WorkoutCardProps) {
  const details = detailParts(workout)

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-slate-900">{workout.exerciseName}</h3>
          {workout.carriedFrom && (
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
      <button
        type="button"
        onClick={() => onDelete(workout.id)}
        className="shrink-0 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        aria-label={`Remove ${workout.exerciseName}`}
      >
        Skip
      </button>
    </li>
  )
}
