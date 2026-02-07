import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { Routes } from '@/constants';
import { HomeStackNavigator } from './HomeStackNavigator';
import { WorkoutsStackNavigator } from './WorkoutsStackNavigator';
import { ExercisesStackNavigator } from './ExercisesStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Simple icon components (replace with actual icons in production)
const HomeIcon = ({ focused }: { focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text>{focused ? '🏠' : '🏠'}</Text>
  </View>
);

const WorkoutsIcon = ({ focused }: { focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text>{focused ? '💪' : '💪'}</Text>
  </View>
);

const ExercisesIcon = ({ focused }: { focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text>{focused ? '🏋️' : '🏋️'}</Text>
  </View>
);

const ProfileIcon = ({ focused }: { focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text>{focused ? '👤' : '👤'}</Text>
  </View>
);

// export const TabNavigator: React.FC = () => {
//   const { Text, View } = require('react-native');
//   const DummyScreen = () => (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Dummy Screen</Text>
//     </View>
//   );
//
//   return (
//     <Tab.Navigator>
//       <Tab.Screen name="Dummy" component={DummyScreen} />
//     </Tab.Navigator>
//   );
// };

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#9E9E9E',
        tabBarStyle: {
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name={Routes.HOME_STACK as keyof MainTabParamList}
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <HomeIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name={Routes.WORKOUTS_STACK as keyof MainTabParamList}
        component={WorkoutsStackNavigator}
        options={{
          tabBarLabel: 'Workouts',
          tabBarIcon: ({ focused }) => <WorkoutsIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name={Routes.EXERCISES_STACK as keyof MainTabParamList}
        component={ExercisesStackNavigator}
        options={{
          tabBarLabel: 'Exercises',
          tabBarIcon: ({ focused }) => <ExercisesIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name={Routes.PROFILE_STACK as keyof MainTabParamList}
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <ProfileIcon focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};
