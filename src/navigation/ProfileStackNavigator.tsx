import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Routes } from '@/constants';
import type { ProfileStackParamList } from './types';
import { ProfileScreen } from '@/screens/ProfileScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { StatisticsScreen } from '@/screens/StatisticsScreen';
import { PersonalRecordsScreen } from '@/screens/PersonalRecordsScreen';
import { AnalyticsDashboardScreen } from '@/screens/AnalyticsDashboardScreen';
import { ExerciseProgressScreen } from '@/screens/ExerciseProgressScreen';
import { MeasurementHistoryScreen } from '@/screens/MeasurementHistoryScreen';
import { LogMeasurementScreen } from '@/screens/LogMeasurementScreen';
import { ProgressPhotosScreen } from '@/screens/ProgressPhotosScreen';
import { AddProgressPhotoScreen } from '@/screens/AddProgressPhotoScreen';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export const ProfileStackNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name={Routes.PROFILE as keyof ProfileStackParamList}
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name={Routes.EDIT_PROFILE as keyof ProfileStackParamList}
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <Stack.Screen
        name={Routes.SETTINGS as keyof ProfileStackParamList}
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name={Routes.ANALYTICS_DASHBOARD as keyof ProfileStackParamList}
        component={AnalyticsDashboardScreen}
        options={{ title: 'Analytics Dashboard' }}
      />
      <Stack.Screen
        name={Routes.EXERCISE_PROGRESS as keyof ProfileStackParamList}
        component={ExerciseProgressScreen}
        options={{ title: 'Exercise Progress' }}
      />
      <Stack.Screen
        name={Routes.STATISTICS as keyof ProfileStackParamList}
        component={StatisticsScreen}
        options={{ title: 'Statistics' }}
      />
      <Stack.Screen
        name={Routes.PERSONAL_RECORDS as keyof ProfileStackParamList}
        component={PersonalRecordsScreen}
        options={{ title: 'Personal Records' }}
      />
      <Stack.Screen
        name={Routes.MEASUREMENT_HISTORY as keyof ProfileStackParamList}
        component={MeasurementHistoryScreen}
        options={{ title: 'Measurement History' }}
      />
      <Stack.Screen
        name={Routes.LOG_MEASUREMENT as keyof ProfileStackParamList}
        component={LogMeasurementScreen}
        options={{ title: 'Log Measurements' }}
      />
      <Stack.Screen
        name={Routes.PROGRESS_PHOTOS as keyof ProfileStackParamList}
        component={ProgressPhotosScreen}
        options={{ title: 'Progress Photos' }}
      />
      <Stack.Screen
        name={Routes.ADD_PROGRESS_PHOTO as keyof ProfileStackParamList}
        component={AddProgressPhotoScreen}
        options={{ title: 'Add Progress Photo' }}
      />
    </Stack.Navigator>
  );
};
