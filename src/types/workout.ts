/**
 * Core workout domain types
 */

export interface Set {
  id: string;
  reps: number;
  weight: number; // in kg or lbs
  completed: boolean;
  notes?: string;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  sets: Set[];
  instructions?: string;
  notes?: string;
  restTime?: number; // in seconds
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  exercises: Exercise[];
  duration: number; // in minutes
  notes?: string;
  completed: boolean;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Omit<Exercise, 'sets'>[];
  createdAt: Date;
}

// Active workout session state
export interface ActiveWorkoutSession {
  workout: Workout;
  startTime: Date;
  currentExerciseIndex: number;
  currentSetIndex: number;
  isResting: boolean;
  restTimeRemaining: number;
}

// Enums
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'legs'
  | 'glutes'
  | 'core'
  | 'cardio'
  | 'full-body';

export type Equipment =
  | 'barbell'
  | 'dumbbells'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'resistance-band'
  | 'other';

// Workout statistics
export interface WorkoutStats {
  totalWorkouts: number;
  totalVolume: number; // weight × reps across all sets
  totalDuration: number; // in minutes
  personalRecords: PersonalRecord[];
  lastWorkoutDate?: Date;
  streakDays: number;
}

export interface PersonalRecord {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  date: Date;
}
