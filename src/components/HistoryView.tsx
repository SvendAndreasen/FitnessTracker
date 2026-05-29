import { formatDayHeading, isBeforeAppDay, todayKey } from '../lib/dates'
import { groupWorkoutsByDay } from '../lib/groupWorkouts'
import type { Workout } from '../types/workout'
import { WorkoutCard } from './WorkoutCard'

type HistoryViewProps = {
  workouts: Workout[]
}

export function HistoryView({ workouts }: HistoryViewProps) {
  const today = todayKey()
  const historyGroups = groupWorkoutsByDay(workouts).filter(
    (g) => isBeforeAppDay(g.date, today),
  )

  if (historyGroups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">History</h2>
        <p className="mt-2 text-sm text-slate-500">
          Only days before the active day appear here. Log on an earlier day or move back with the date controls.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">History</h2>
      {historyGroups.map((group) => (
        <section key={group.date}>
          <h3 className="mb-2 text-sm font-medium text-slate-700">
            {formatDayHeading(group.date)}
            <span className="ml-2 font-normal text-slate-500">
              ({group.workouts.length}{' '}
              {group.workouts.length === 1 ? 'exercise' : 'exercises'})
            </span>
          </h3>
          <ul className="space-y-3">
            {group.workouts.map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} isToday={false} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
