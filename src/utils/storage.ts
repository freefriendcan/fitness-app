/**
 * AsyncStorage wrapper utilities
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export const storage = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error reading from storage: ${key}`, error);
      return null;
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to storage: ${key}`, error);
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from storage: ${key}`, error);
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage', error);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return [...keys];
    } catch (error) {
      console.error('Error getting all keys', error);
      return [];
    }
  },

  async multiGet<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const pairs = await AsyncStorage.multiGet(keys);
      return pairs.map(([_, value]) => {
        if (value === null) return null;
        try {
          return JSON.parse(value) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('Error multi-get from storage', error);
      return keys.map(() => null);
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('Error multi-remove from storage', error);
    }
  },
};

// Storage keys constants
export const STORAGE_KEYS = {
  ONBOARDING_COMPLETED: '@fitness_app/onboarding_completed',
  USER_PREFERENCES: '@fitness_app/user_preferences',
  LAST_SYNC: '@fitness_app/last_sync',
} as const;
