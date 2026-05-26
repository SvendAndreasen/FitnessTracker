import type { Workout } from '../types/workout'

type WorkoutListProps = {
  workouts: Workout[]
  onDelete: (id: string) => void
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-')
  if (!y || !m || !d) return isoDate
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(
    undefined,
    { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' },
  )
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

export function WorkoutList({ workouts, onDelete }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-700">No workouts yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Register your first workout using the form above.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {workouts.map((workout) => {
        const details = detailParts(workout)
        return (
          <li
            key={workout.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-semibold text-slate-900">
                  {workout.exerciseName}
                </h3>
                <time
                  dateTime={workout.date}
                  className="text-sm text-slate-500"
                >
                  {formatDate(workout.date)}
                </time>
              </div>
              {details.length > 0 && (
                <p className="mt-1 text-sm text-slate-600">
                  {details.join(' · ')}
                </p>
              )}
              {workout.notes && (
                <p className="mt-2 text-sm text-slate-500">{workout.notes}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDelete(workout.id)}
              className="shrink-0 self-start rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              Delete
            </button>
          </li>
        )
      })}
    </ul>
  )
}
