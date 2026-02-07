import { useCallback } from 'react';
import { useWorkoutStore } from '@/store';
import type { Workout, WorkoutTemplate, Exercise } from '@/types';
import { generateId } from '@/utils';

export function useWorkout() {
  const workouts = useWorkoutStore((state) => state.workouts);
  const templates = useWorkoutStore((state) => state.templates);
  const activeSession = useWorkoutStore((state) => state.activeSession);

  const addWorkout = useWorkoutStore((state) => state.addWorkout);
  const updateWorkout = useWorkoutStore((state) => state.updateWorkout);
  const deleteWorkout = useWorkoutStore((state) => state.deleteWorkout);
  const getWorkoutById = useWorkoutStore((state) => state.getWorkoutById);

  const addTemplate = useWorkoutStore((state) => state.addTemplate);
  const updateTemplate = useWorkoutStore((state) => state.updateTemplate);
  const deleteTemplate = useWorkoutStore((state) => state.deleteTemplate);
  const getTemplateById = useWorkoutStore((state) => state.getTemplateById);

  const startWorkoutSession = useWorkoutStore((state) => state.startWorkoutSession);
  const endWorkoutSession = useWorkoutStore((state) => state.endWorkoutSession);
  const updateActiveSession = useWorkoutStore((state) => state.updateActiveSession);

  const getWorkoutStats = useWorkoutStore((state) => state.getWorkoutStats);

  // Helper to create a new workout from a template
  const createWorkoutFromTemplate = useCallback((template: WorkoutTemplate): Workout => {
    return {
      id: generateId(),
      name: template.name,
      date: new Date(),
      exercises: template.exercises.map((exercise) => ({
        ...exercise,
        sets: [],
      })),
      duration: 0,
      completed: false,
    };
  }, []);

  // Helper to create a quick workout
  const createQuickWorkout = useCallback((name: string, exercises: Exercise[]): Workout => {
    return {
      id: generateId(),
      name,
      date: new Date(),
      exercises: exercises.map((exercise) => ({
        ...exercise,
        sets: [],
      })),
      duration: 0,
      completed: false,
    };
  }, []);

  return {
    // State
    workouts,
    templates,
    activeSession,
    hasActiveSession: !!activeSession,

    // Actions
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutById,

    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplateById,

    startWorkoutSession,
    endWorkoutSession,
    updateActiveSession,

    getWorkoutStats,

    // Helpers
    createWorkoutFromTemplate,
    createQuickWorkout,
  };
}
