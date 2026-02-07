import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Workout, WorkoutTemplate, ActiveWorkoutSession, WorkoutStats } from '@/types';
import { generateId } from '@/utils/helpers';

interface WorkoutStore {
  // State
  workouts: Workout[];
  templates: WorkoutTemplate[];
  activeSession: ActiveWorkoutSession | null;

  // Actions
  addWorkout: (workout: Workout) => void;
  updateWorkout: (id: string, updates: Partial<Workout>) => void;
  deleteWorkout: (id: string) => void;
  getWorkoutById: (id: string) => Workout | undefined;

  // Template actions
  addTemplate: (template: WorkoutTemplate) => void;
  updateTemplate: (id: string, updates: Partial<WorkoutTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplateById: (id: string) => WorkoutTemplate | undefined;

  // Active session actions
  startWorkoutSession: (workout: Workout) => void;
  endWorkoutSession: () => void;
  updateActiveSession: (updates: Partial<ActiveWorkoutSession>) => void;

  // Statistics
  getWorkoutStats: () => WorkoutStats;

  // Cleanup
  reset: () => void;
}

const initialState = {
  workouts: [],
  templates: [],
  activeSession: null,
};

export const useWorkoutStore = create<WorkoutStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addWorkout: (workout) =>
        set((state) => ({
          workouts: [...state.workouts, workout],
        })),

      updateWorkout: (id, updates) =>
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })),

      deleteWorkout: (id) =>
        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
        })),

      getWorkoutById: (id) => {
        const state = get();
        return state.workouts.find((w) => w.id === id);
      },

      addTemplate: (template) =>
        set((state) => ({
          templates: [...state.templates, template],
        })),

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),

      getTemplateById: (id) => {
        const state = get();
        return state.templates.find((t) => t.id === id);
      },

      startWorkoutSession: (workout) =>
        set(() => ({
          activeSession: {
            workout,
            startTime: new Date(),
            currentExerciseIndex: 0,
            currentSetIndex: 0,
            isResting: false,
            restTimeRemaining: 0,
          },
        })),

      endWorkoutSession: () =>
        set((state) => {
          if (state.activeSession) {
            const completedWorkout = {
              ...state.activeSession.workout,
              completed: true,
              duration: Math.floor(
                (Date.now() - state.activeSession.startTime.getTime()) / 60000
              ),
            };
            return {
              activeSession: null,
              workouts: [...state.workouts, completedWorkout],
            };
          }
          return state;
        }),

      updateActiveSession: (updates) =>
        set((state) => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, ...updates }
            : null,
        })),

      getWorkoutStats: () => {
        const state = get();
        const workouts = state.workouts;

        const totalWorkouts = workouts.length;
        const totalVolume = workouts.reduce((sum, workout) => {
          return (
            sum +
            workout.exercises.reduce((exerciseSum, exercise) => {
              return (
                exerciseSum +
                exercise.sets.reduce(
                  (setSum, set) => setSum + set.weight * set.reps,
                  0
                )
              );
            }, 0)
          );
        }, 0);

        const totalDuration = workouts.reduce(
          (sum, workout) => sum + workout.duration,
          0
        );

        const lastWorkoutDate =
          workouts.length > 0
            ? new Date(
                Math.max(...workouts.map((w) => w.date.getTime()))
              )
            : undefined;

        // Calculate streak (consecutive days)
        let streakDays = 0;
        const sortedWorkouts = [...workouts].sort(
          (a, b) => b.date.getTime() - a.date.getTime()
        );
        if (sortedWorkouts.length > 0) {
          streakDays = 1;
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          for (let i = 0; i < sortedWorkouts.length - 1; i++) {
            const current = new Date(sortedWorkouts[i].date);
            const next = new Date(sortedWorkouts[i + 1].date);
            current.setHours(0, 0, 0, 0);
            next.setHours(0, 0, 0, 0);

            const dayDiff =
              (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
            if (dayDiff === 1) {
              streakDays++;
            } else if (dayDiff > 1) {
              break;
            }
          }
        }

        return {
          totalWorkouts,
          totalVolume,
          totalDuration,
          personalRecords: [],
          lastWorkoutDate,
          streakDays,
        };
      },

      reset: () => set(initialState),
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
