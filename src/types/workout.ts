export type Workout = {
  id: string
  exerciseId: string
  exerciseName: string
  date: string
  sets?: number
  reps?: number
  weight?: number
  durationMinutes?: number
  comment?: string
  /** @deprecated Moved to exercise catalog; migrated to comment on load */
  description?: string
  /** @deprecated Migrated to comment on load */
  notes?: string
  carriedFrom?: string
}

export type WorkoutFormData = {
  exerciseName: string
  date: string
  sets: string
  reps: string
  weight: string
  durationMinutes: string
  comment: string
}
