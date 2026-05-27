import { formatDayHeading, todayKey } from '../lib/dates'
import { groupWorkoutsByDay } from '../lib/groupWorkouts'
import type { Workout } from '../types/workout'
import { WorkoutCard } from './WorkoutCard'

type DailyActivityListProps = {
  workouts: Workout[]
  onDelete: (id: string) => void
  onUpdate: (workout: Workout) => void
}

export function DailyActivityList({
  workouts,
  onDelete,
  onUpdate,
}: DailyActivityListProps) {
  const groups = groupWorkoutsByDay(workouts)
  const today = todayKey()

  if (workouts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <p className="text-sm font-medium text-slate-700">No activities saved yet</p>
        <p className="mt-1 text-sm text-slate-500">
          Add your first exercise below — it will appear under today&apos;s date.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const isToday = group.date === today
        return (
          <section key={group.date} aria-labelledby={`day-${group.date}`}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id={`day-${group.date}`}
                className="text-lg font-semibold text-slate-900"
              >
                {formatDayHeading(group.date)}
              </h2>
              <span className="text-sm text-slate-500">
                {group.workouts.length}{' '}
                {group.workouts.length === 1 ? 'exercise' : 'exercises'}
              </span>
            </div>
            <ul className="space-y-3">
              {group.workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  workouts={workouts}
                  isToday={isToday}
                  onDelete={isToday ? onDelete : undefined}
                  onUpdate={isToday ? onUpdate : undefined}
                />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
