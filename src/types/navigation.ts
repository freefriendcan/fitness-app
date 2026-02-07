/**
 * Navigation type definitions
 * Provides type safety for navigation params
 */

import type { Workout, Exercise, WorkoutTemplate } from './workout';

// Root navigation param list
export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

// Tab navigation param list
export type MainTabParamList = {
  HomeStack: undefined;
  WorkoutsStack: undefined;
  ExercisesStack: undefined;
  ProfileStack: undefined;
};

// Home stack param list
export type HomeStackParamList = {
  Home: undefined;
  WorkoutDetail: { workoutId: string };
  StartWorkout: { templateId?: string };
};

// Workouts stack param list
export type WorkoutsStackParamList = {
  WorkoutList: undefined;
  WorkoutHistory: undefined;
  WorkoutTemplates: undefined;
  ActiveWorkout: { workoutId: string };
  CreateWorkout: undefined;
  EditWorkout: { workoutId: string };
};

// Exercises stack param list
export type ExercisesStackParamList = {
  ExerciseLibrary: {
    muscleGroup?: string;
    equipment?: string;
  };
  ExerciseDetail: { exerciseId: string };
  CreateExercise: undefined;
  EditExercise: { exerciseId: string };
};

// Profile stack param list
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Statistics: undefined;
  PersonalRecords: undefined;
  AnalyticsDashboard: undefined;
  ExerciseProgress: undefined;
  MeasurementHistory: undefined;
  LogMeasurement: undefined;
  ProgressPhotos: undefined;
  AddProgressPhoto: undefined;
};

// Navigation type utilities
export type NavigationRoute<T extends keyof any> = T;
