import type { ReactNode } from 'react'
import { formatDayHeading, todayKey } from '../lib/dates'
import { groupWorkoutsByDay } from '../lib/groupWorkouts'
import type { Workout } from '../types/workout'
import { WorkoutCard } from './WorkoutCard'

type DailyActivityListProps = {
  workouts: Workout[]
  onDelete: (id: string) => void
  onUpdate: (workout: Workout) => void
  addExerciseForm: ReactNode
}

function DayExercises({
  group,
  workouts,
  isToday,
  onDelete,
  onUpdate,
}: {
  group: { date: string; workouts: Workout[] }
  workouts: Workout[]
  isToday: boolean
  onDelete: (id: string) => void
  onUpdate: (workout: Workout) => void
}) {
  return (
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
  )
}

export function DailyActivityList({
  workouts,
  onDelete,
  onUpdate,
  addExerciseForm,
}: DailyActivityListProps) {
  const groups = groupWorkoutsByDay(workouts)
  const today = todayKey()
  const todayGroup = groups.find((g) => g.date === today)
  const historyGroups = groups.filter((g) => g.date !== today)

  if (workouts.length === 0) {
    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-700">No activities saved yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Add your first exercise below — it will appear under today.
          </p>
        </div>
        {addExerciseForm}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="today-heading">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="today-heading" className="text-lg font-semibold text-slate-900">
            {formatDayHeading(today)}
          </h2>
          {todayGroup && todayGroup.workouts.length > 0 && (
            <span className="text-sm text-slate-500">
              {todayGroup.workouts.length}{' '}
              {todayGroup.workouts.length === 1 ? 'exercise' : 'exercises'}
            </span>
          )}
        </div>
        {todayGroup && todayGroup.workouts.length > 0 ? (
          <DayExercises
            group={todayGroup}
            workouts={workouts}
            isToday
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <p className="text-sm text-slate-600">No exercises for today yet.</p>
          </div>
        )}
      </section>

      {addExerciseForm}

      {historyGroups.length > 0 && (
        <section aria-labelledby="history-heading" className="space-y-6">
          <h2
            id="history-heading"
            className="text-lg font-semibold text-slate-900"
          >
            History
          </h2>
          {historyGroups.map((group) => (
            <div key={group.date}>
              <h3 className="mb-2 text-sm font-medium text-slate-700">
                {formatDayHeading(group.date)}
                <span className="ml-2 font-normal text-slate-500">
                  ({group.workouts.length}{' '}
                  {group.workouts.length === 1 ? 'exercise' : 'exercises'})
                </span>
              </h3>
              <DayExercises
                group={group}
                workouts={workouts}
                isToday={false}
                onDelete={onDelete}
                onUpdate={onUpdate}
              />
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
