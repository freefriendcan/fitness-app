import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UnitSystem, Theme } from '@/types';

interface UserStore {
  // State
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User) => void;
  updateUser: (updates: Partial<User>) => void;
  updateProfile: (updates: Partial<User['profile']>) => void;
  updateSettings: (updates: Partial<User['settings']>) => void;
  logout: () => void;

  // Helpers
  getUnits: () => UnitSystem;
  getTheme: () => Theme;
}

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                profile: { ...state.user.profile, ...updates },
              }
            : null,
        })),

      updateSettings: (updates) =>
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                settings: { ...state.user.settings, ...updates },
              }
            : null,
        })),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      getUnits: () => {
        const state = get();
        return state.user?.settings.units || 'metric';
      },

      getTheme: () => {
        const state = get();
        return state.user?.settings.theme || 'system';
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
