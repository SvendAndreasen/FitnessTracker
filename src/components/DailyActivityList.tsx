import { formatDayHeading, todayKey } from '../lib/dates'
import { groupWorkoutsByDay } from '../lib/groupWorkouts'
import type { Workout } from '../types/workout'
import { WorkoutCard } from './WorkoutCard'

type DailyActivityListProps = {
  workouts: Workout[]
  onDelete: (id: string) => void
}

export function DailyActivityList({ workouts, onDelete }: DailyActivityListProps) {
  const groups = groupWorkoutsByDay(workouts)
  const today = todayKey()
  const todayGroup = groups.find((g) => g.date === today)
  const otherGroups = groups.filter((g) => g.date !== today)

  if (workouts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-700">No activities saved yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Add your first exercise below — it will appear under today.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="today-heading">
        <div className="mb-3 flex items-baseline justify-between gap-2">
          <h2
            id="today-heading"
            className="text-lg font-semibold text-slate-900"
          >
            Today
          </h2>
          <span className="text-sm text-slate-500">
            {formatDayHeading(today).replace(/^Today — /, '')}
          </span>
        </div>
        {todayGroup && todayGroup.workouts.length > 0 ? (
          <ul className="space-y-3">
            {todayGroup.workouts.map((workout) => (
              <WorkoutCard
                key={workout.id}
                workout={workout}
                onDelete={onDelete}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm text-slate-600">No activities for today yet.</p>
            <p className="mt-1 text-sm text-slate-500">
              Save a workout with today&apos;s date to see it here.
            </p>
          </div>
        )}
      </section>

      {otherGroups.length > 0 && (
        <section aria-labelledby="past-days-heading">
          <h2
            id="past-days-heading"
            className="mb-4 text-lg font-semibold text-slate-900"
          >
            Previous days
          </h2>
          <div className="space-y-6">
            {otherGroups.map((group) => (
              <div key={group.date}>
                <h3 className="mb-2 text-sm font-medium text-slate-700">
                  {formatDayHeading(group.date)}
                  <span className="ml-2 font-normal text-slate-500">
                    ({group.workouts.length}{' '}
                    {group.workouts.length === 1 ? 'activity' : 'activities'})
                  </span>
                </h3>
                <ul className="space-y-3">
                  {group.workouts.map((workout) => (
                    <WorkoutCard
                      key={workout.id}
                      workout={workout}
                      onDelete={onDelete}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
