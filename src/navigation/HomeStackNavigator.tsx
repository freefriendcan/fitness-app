import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '@/constants';
import { HomeScreen, WorkoutDetailScreen, StartWorkoutScreen } from '@/screens';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={Routes.HOME as never}
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Stack.Screen
        name={Routes.WORKOUT_DETAIL as never}
        component={WorkoutDetailScreen}
        options={{ title: 'Workout Details' }}
      />
      <Stack.Screen
        name={Routes.START_WORKOUT as never}
        component={StartWorkoutScreen}
        options={{ title: 'Start Workout' }}
      />
    </Stack.Navigator>
  );
};
