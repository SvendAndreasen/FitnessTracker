export type Workout = {
  id: string
  exerciseName: string
  date: string
  sets?: number
  reps?: number
  weight?: number
  durationMinutes?: number
  description?: string
  /** @deprecated Use description; kept for older saves and CSV import */
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
  description: string
}
