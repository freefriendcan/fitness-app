import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { Routes } from '@/constants';
import type { WorkoutsStackParamList } from './types';
import { WorkoutListScreen } from '@/screens/WorkoutListScreen';
import { WorkoutCalendarScreen } from '@/screens/WorkoutCalendarScreen';
import { ActiveWorkoutScreen } from '@/screens/ActiveWorkoutScreen';
import { CreateWorkoutScreen } from '@/screens/CreateWorkoutScreen';
import { EditWorkoutScreen } from '@/screens/EditWorkoutScreen';

const Stack = createNativeStackNavigator<WorkoutsStackParamList>();

// Placeholder screens for routes not yet implemented
const WorkoutTemplatesScreen = () => (
  <View style={styles.container}>
    <Text style={styles.title}>Workout Templates</Text>
    <Text>Your templates will appear here</Text>
  </View>
);

export const WorkoutsStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={Routes.WORKOUT_LIST as keyof WorkoutsStackParamList}
        component={WorkoutListScreen}
        options={{ title: 'My Workouts' }}
      />
      <Stack.Screen
        name={Routes.WORKOUT_HISTORY as keyof WorkoutsStackParamList}
        component={WorkoutCalendarScreen}
        options={{
          title: 'Calendar',
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name={Routes.WORKOUT_TEMPLATES as keyof WorkoutsStackParamList}
        component={WorkoutTemplatesScreen}
        options={{ title: 'Templates' }}
      />
      <Stack.Screen
        name={Routes.ACTIVE_WORKOUT as keyof WorkoutsStackParamList}
        component={ActiveWorkoutScreen}
        options={{ title: 'Active Workout' }}
      />
      <Stack.Screen
        name={Routes.CREATE_WORKOUT as keyof WorkoutsStackParamList}
        component={CreateWorkoutScreen}
        options={{ title: 'Create Workout' }}
      />
      <Stack.Screen
        name={Routes.EDIT_WORKOUT as keyof WorkoutsStackParamList}
        component={EditWorkoutScreen}
        options={{ title: 'Edit Workout' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});
