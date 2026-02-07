import { useCallback } from 'react';
import { useExerciseStore } from '@/store';
import type { Exercise, MuscleGroup, Equipment } from '@/types';
import { generateId } from '@/utils';

export function useExercise() {
  const exercises = useExerciseStore((state) => state.exercises);

  const addExercise = useExerciseStore((state) => state.addExercise);
  const updateExercise = useExerciseStore((state) => state.updateExercise);
  const deleteExercise = useExerciseStore((state) => state.deleteExercise);

  const getExerciseById = useExerciseStore((state) => state.getExerciseById);
  const getExercisesByMuscleGroup = useExerciseStore((state) => state.getExercisesByMuscleGroup);
  const getExercisesByEquipment = useExerciseStore((state) => state.getExercisesByEquipment);
  const searchExercises = useExerciseStore((state) => state.searchExercises);

  // Helper to create a new exercise
  const createExercise = useCallback((
    name: string,
    muscleGroup: MuscleGroup,
    equipment: Equipment,
    instructions?: string
  ): Exercise => {
    return {
      id: generateId(),
      name,
      muscleGroup,
      equipment,
      sets: [],
      instructions,
    };
  }, []);

  // Helper to get all muscle groups
  const getMuscleGroups = useCallback((): MuscleGroup[] => {
    const uniqueGroups = new Set<MuscleGroup>();
    exercises.forEach((exercise) => {
      uniqueGroups.add(exercise.muscleGroup);
    });
    return Array.from(uniqueGroups).sort();
  }, [exercises]);

  // Helper to get all equipment types
  const getEquipmentTypes = useCallback((): Equipment[] => {
    const uniqueEquipment = new Set<Equipment>();
    exercises.forEach((exercise) => {
      uniqueEquipment.add(exercise.equipment);
    });
    return Array.from(uniqueEquipment).sort();
  }, [exercises]);

  return {
    // State
    exercises,

    // Actions
    addExercise,
    updateExercise,
    deleteExercise,

    // Queries
    getExerciseById,
    getExercisesByMuscleGroup,
    getExercisesByEquipment,
    searchExercises,

    // Helpers
    createExercise,
    getMuscleGroups,
    getEquipmentTypes,
  };
}
