import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Exercise, MuscleGroup, Equipment } from '@/types';

interface ExerciseStore {
  // State
  exercises: Exercise[];

  // Actions
  addExercise: (exercise: Exercise) => void;
  updateExercise: (id: string, updates: Partial<Exercise>) => void;
  deleteExercise: (id: string) => void;

  // Queries
  getExerciseById: (id: string) => Exercise | undefined;
  getExercisesByMuscleGroup: (muscleGroup: MuscleGroup) => Exercise[];
  getExercisesByEquipment: (equipment: Equipment) => Exercise[];
  searchExercises: (query: string) => Exercise[];

  // Cleanup
  reset: () => void;
}

const initialState = {
  exercises: [],
};

// Pre-populated exercise library (basic exercises)
const defaultExercises: Exercise[] = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'chest',
    equipment: 'barbell',
    sets: [],
    instructions: 'Lie on bench, grip bar, lower to chest, press up',
  },
  {
    id: 'squat',
    name: 'Squat',
    muscleGroup: 'legs',
    equipment: 'barbell',
    sets: [],
    instructions: 'Stand with bar on shoulders, squat down, stand up',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'back',
    equipment: 'barbell',
    sets: [],
    instructions: 'Bend at hips, grip bar, stand up straight',
  },
  {
    id: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'shoulders',
    equipment: 'barbell',
    sets: [],
    instructions: 'Press barbell overhead from shoulder height',
  },
  {
    id: 'bicep-curl',
    name: 'Bicep Curl',
    muscleGroup: 'biceps',
    equipment: 'dumbbells',
    sets: [],
    instructions: 'Curl dumbbells from thighs to shoulders',
  },
  {
    id: 'tricep-extension',
    name: 'Tricep Extension',
    muscleGroup: 'triceps',
    equipment: 'dumbbells',
    sets: [],
    instructions: 'Extend dumbbell overhead, bending at elbows',
  },
  {
    id: 'pull-up',
    name: 'Pull Up',
    muscleGroup: 'back',
    equipment: 'bodyweight',
    sets: [],
    instructions: 'Hang from bar, pull yourself up until chin clears bar',
  },
  {
    id: 'push-up',
    name: 'Push Up',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
    sets: [],
    instructions: 'In plank position, lower chest to floor, push back up',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    muscleGroup: 'legs',
    equipment: 'bodyweight',
    sets: [],
    instructions: 'Step forward, lower hips until both knees are 90 degrees',
  },
  {
    id: 'plank',
    name: 'Plank',
    muscleGroup: 'core',
    equipment: 'bodyweight',
    sets: [],
    instructions: 'Hold forearm plank position, keeping body straight',
  },
];

export const useExerciseStore = create<ExerciseStore>()(
  persist(
    (set, get) => ({
      exercises: defaultExercises,

      addExercise: (exercise) =>
        set((state) => ({
          exercises: [...state.exercises, exercise],
        })),

      updateExercise: (id, updates) =>
        set((state) => ({
          exercises: state.exercises.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      deleteExercise: (id) =>
        set((state) => ({
          exercises: state.exercises.filter((e) => e.id !== id),
        })),

      getExerciseById: (id) => {
        const state = get();
        return state.exercises.find((e) => e.id === id);
      },

      getExercisesByMuscleGroup: (muscleGroup) => {
        const state = get();
        return state.exercises.filter((e) => e.muscleGroup === muscleGroup);
      },

      getExercisesByEquipment: (equipment) => {
        const state = get();
        return state.exercises.filter((e) => e.equipment === equipment);
      },

      searchExercises: (query) => {
        const state = get();
        const lowerQuery = query.toLowerCase();
        return state.exercises.filter(
          (e) =>
            e.name.toLowerCase().includes(lowerQuery) ||
            e.muscleGroup.toLowerCase().includes(lowerQuery)
        );
      },

      reset: () => set(initialState),
    }),
    {
      name: 'exercise-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
