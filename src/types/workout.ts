export type Workout = {
  id: string
  exerciseName: string
  date: string
  sets?: number
  reps?: number
  weight?: number
  durationMinutes?: number
  notes?: string
  /** ISO date of the session this entry was copied from (carry-over). */
  carriedFrom?: string
}

export type WorkoutFormData = {
  exerciseName: string
  date: string
  sets: string
  reps: string
  weight: string
  durationMinutes: string
  notes: string
}
