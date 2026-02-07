import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '@/constants';
import type { ExercisesStackParamList } from './types';
import {
  ExerciseLibraryScreen,
  ExerciseDetailScreen,
  CreateExerciseScreen,
  EditExerciseScreen,
} from '@/screens';

const Stack = createNativeStackNavigator<ExercisesStackParamList>();

export const ExercisesStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={Routes.EXERCISE_LIBRARY as keyof ExercisesStackParamList}
        component={ExerciseLibraryScreen}
        options={{ title: 'Exercise Library' }}
      />
      <Stack.Screen
        name={Routes.EXERCISE_DETAIL as keyof ExercisesStackParamList}
        component={ExerciseDetailScreen}
        options={{ title: 'Exercise Details' }}
      />
      <Stack.Screen
        name={Routes.CREATE_EXERCISE as keyof ExercisesStackParamList}
        component={CreateExerciseScreen}
        options={{ title: 'Create Exercise' }}
      />
      <Stack.Screen
        name={Routes.EDIT_EXERCISE as keyof ExercisesStackParamList}
        component={EditExerciseScreen}
        options={{ title: 'Edit Exercise' }}
      />
    </Stack.Navigator>
  );
};
