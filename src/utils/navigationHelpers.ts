/**
 * Navigation Helpers
 * Provides type-safe cross-stack navigation utilities
 */

import type {
  NavigationAction,
  NavigationState,
  PartialState,
  Route,
} from '@react-navigation/native';
import type {
  RootStackParamList,
  MainTabParamList,
  HomeStackParamList,
  WorkoutsStackParamList,
  ExercisesStackParamList,
  ProfileStackParamList,
} from '@/types';

// Combined navigation type for cross-stack navigation
export type CompositeNavigationParamList = {
  Main: MainTabParamList;
  HomeStack: HomeStackParamList;
  WorkoutsStack: WorkoutsStackParamList;
  ExercisesStack: ExercisesStackParamList;
  ProfileStack: ProfileStackParamList;
};

/**
 * Navigate to a screen in a different stack with type safety
 * This handles navigating across tab boundaries
 */
export function navigateToScreen<
  TStack extends keyof CompositeNavigationParamList,
  TScreen extends keyof CompositeNavigationParamList[TStack],
  TParams extends CompositeNavigationParamList[TStack][TScreen]
>(
  navigation: any,
  stackName: TStack,
  screenName: TScreen,
  params?: TParams
): void {
  navigation.navigate(stackName, {
    screen: screenName,
    params: params as any,
  });
}

/**
 * Navigate to the Active Workout screen
 */
export function navigateToActiveWorkout(
  navigation: any,
  workoutId: string
): void {
  navigation.navigate('WorkoutsStack', {
    screen: 'ActiveWorkout',
    params: { workoutId },
  });
}

/**
 * Navigate to Exercise Library
 */
export function navigateToExerciseLibrary(
  navigation: any,
  params?: { muscleGroup?: string; equipment?: string }
): void {
  navigation.navigate('ExercisesStack', {
    screen: 'ExerciseLibrary',
    params,
  });
}

/**
 * Navigate to Exercise Detail
 */
export function navigateToExerciseDetail(
  navigation: any,
  exerciseId: string
): void {
  navigation.navigate('ExercisesStack', {
    screen: 'ExerciseDetail',
    params: { exerciseId },
  });
}

/**
 * Navigate to Workout Detail
 */
export function navigateToWorkoutDetail(
  navigation: any,
  workoutId: string
): void {
  navigation.navigate('WorkoutsStack', {
    screen: 'WorkoutDetail',
    params: { workoutId },
  });
}

/**
 * Navigate to Start Workout screen
 */
export function navigateToStartWorkout(
  navigation: any,
  templateId?: string
): void {
  navigation.navigate('HomeStack', {
    screen: 'StartWorkout',
    params: { templateId },
  });
}

/**
 * Navigate to Settings screen
 */
export function navigateToSettings(navigation: any): void {
  navigation.navigate('ProfileStack', {
    screen: 'Settings',
  });
}

/**
 * Navigate to Statistics screen
 */
export function navigateToStatistics(navigation: any): void {
  navigation.navigate('ProfileStack', {
    screen: 'Statistics',
  });
}

/**
 * Navigate to Profile screen
 */
export function navigateToProfile(navigation: any): void {
  navigation.navigate('ProfileStack', {
    screen: 'Profile',
  });
}

/**
 * Navigate to Analytics Dashboard
 */
export function navigateToAnalyticsDashboard(navigation: any): void {
  navigation.navigate('ProfileStack', {
    screen: 'AnalyticsDashboard',
  });
}

/**
 * Navigate to Personal Records
 */
export function navigateToPersonalRecords(navigation: any): void {
  navigation.navigate('ProfileStack', {
    screen: 'PersonalRecords',
  });
}

/**
 * Navigate to Progress Photos
 */
export function navigateToProgressPhotos(navigation: any): void {
  navigation.navigate('ProfileStack', {
    screen: 'ProgressPhotos',
  });
}

/**
 * Navigate to Workout Templates
 */
export function navigateToWorkoutTemplates(navigation: any): void {
  navigation.navigate('WorkoutsStack', {
    screen: 'WorkoutTemplates',
  });
}

/**
 * Navigate to Workout History
 */
export function navigateToWorkoutHistory(navigation: any): void {
  navigation.navigate('WorkoutsStack', {
    screen: 'WorkoutHistory',
  });
}

/**
 * Navigate to Create Exercise
 */
export function navigateToCreateExercise(navigation: any): void {
  navigation.navigate('ExercisesStack', {
    screen: 'CreateExercise',
  });
}

/**
 * Navigate to Edit Exercise
 */
export function navigateToEditExercise(navigation: any, exerciseId: string): void {
  navigation.navigate('ExercisesStack', {
    screen: 'EditExercise',
    params: { exerciseId },
  });
}

/**
 * Navigate to Create Workout
 */
export function navigateToCreateWorkout(navigation: any): void {
  navigation.navigate('WorkoutsStack', {
    screen: 'CreateWorkout',
  });
}

/**
 * Navigate to Edit Workout
 */
export function navigateToEditWorkout(navigation: any, workoutId: string): void {
  navigation.navigate('WorkoutsStack', {
    screen: 'EditWorkout',
    params: { workoutId },
  });
}
