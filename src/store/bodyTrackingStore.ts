import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BodyMeasurement, ProgressPhoto } from '@/types';

interface BodyTrackingStore {
  // State
  measurements: BodyMeasurement[];
  progressPhotos: ProgressPhoto[];

  // Measurement Actions
  addMeasurement: (measurement: Omit<BodyMeasurement, 'id'>) => void;
  updateMeasurement: (id: string, updates: Partial<BodyMeasurement>) => void;
  deleteMeasurement: (id: string) => void;
  getMeasurement: (id: string) => BodyMeasurement | undefined;
  getLatestMeasurement: () => BodyMeasurement | undefined;
  getMeasurementsByDateRange: (
    startDate: Date,
    endDate: Date
  ) => BodyMeasurement[];

  // Progress Photo Actions
  addProgressPhoto: (photo: Omit<ProgressPhoto, 'id'>) => void;
  updateProgressPhoto: (id: string, updates: Partial<ProgressPhoto>) => void;
  deleteProgressPhoto: (id: string) => void;
  getProgressPhoto: (id: string) => ProgressPhoto | undefined;
  getProgressPhotosByType: (type: ProgressPhoto['photoType']) => ProgressPhoto[];

  // Analytics & Trends
  getWeightTrend: () => 'up' | 'down' | 'stable' | null;
  getWeightChange: (days?: number) => number; // kg change
  getMeasurementTrend: (
    field: keyof Omit<BodyMeasurement, 'id' | 'date' | 'notes'>
  ) => 'up' | 'down' | 'stable' | null;

  // Helpers
  clearAllData: () => void;
}

const initialState = {
  measurements: [],
  progressPhotos: [],
};

export const useBodyTrackingStore = create<BodyTrackingStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Measurement CRUD Operations
      addMeasurement: (measurement) => {
        const newMeasurement: BodyMeasurement = {
          ...measurement,
          id: `measurement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        set((state) => ({
          measurements: [...state.measurements, newMeasurement].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        }));
      },

      updateMeasurement: (id, updates) => {
        set((state) => ({
          measurements: state.measurements.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        }));
      },

      deleteMeasurement: (id) => {
        set((state) => ({
          measurements: state.measurements.filter((m) => m.id !== id),
        }));
      },

      getMeasurement: (id) => {
        const state = get();
        return state.measurements.find((m) => m.id === id);
      },

      getLatestMeasurement: () => {
        const state = get();
        if (state.measurements.length === 0) return undefined;
        return state.measurements[0]; // Already sorted by date descending
      },

      getMeasurementsByDateRange: (startDate, endDate) => {
        const state = get();
        const start = startDate.getTime();
        const end = endDate.getTime();

        return state.measurements.filter((m) => {
          const measurementDate = new Date(m.date).getTime();
          return measurementDate >= start && measurementDate <= end;
        });
      },

      // Progress Photo CRUD Operations
      addProgressPhoto: (photo) => {
        const newPhoto: ProgressPhoto = {
          ...photo,
          id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };

        set((state) => ({
          progressPhotos: [...state.progressPhotos, newPhoto].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          ),
        }));
      },

      updateProgressPhoto: (id, updates) => {
        set((state) => ({
          progressPhotos: state.progressPhotos.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },

      deleteProgressPhoto: (id) => {
        set((state) => ({
          progressPhotos: state.progressPhotos.filter((p) => p.id !== id),
        }));
      },

      getProgressPhoto: (id) => {
        const state = get();
        return state.progressPhotos.find((p) => p.id === id);
      },

      getProgressPhotosByType: (type) => {
        const state = get();
        if (!type) return state.progressPhotos;
        return state.progressPhotos.filter((p) => p.photoType === type);
      },

      // Analytics & Trends
      getWeightTrend: () => {
        const state = get();
        if (state.measurements.length < 2) return null;

        const latest = state.measurements[0];
        const previous = state.measurements[1];

        if (!latest.weight || !previous.weight) return null;

        const diff = latest.weight - previous.weight;
        const threshold = 0.5; // kg threshold for "stable"

        if (Math.abs(diff) < threshold) return 'stable';
        return diff > 0 ? 'up' : 'down';
      },

      getWeightChange: (days = 30) => {
        const state = get();
        if (state.measurements.length < 2) return 0;

        const now = Date.now();
        const cutoffDate = new Date(now - days * 24 * 60 * 60 * 1000);

        const latest = state.measurements.find((m) => m.weight);
        const oldestInRange = [...state.measurements]
          .reverse()
          .find((m) => m.weight && new Date(m.date) >= cutoffDate);

        if (!latest?.weight || !oldestInRange?.weight) return 0;

        return latest.weight - oldestInRange.weight;
      },

      getMeasurementTrend: (field) => {
        const state = get();
        if (state.measurements.length < 2) return null;

        const latest = state.measurements[0];
        const previous = state.measurements[1];

        const latestValue = latest[field];
        const previousValue = previous[field];

        if (
          latestValue === undefined ||
          previousValue === undefined ||
          typeof latestValue !== 'number' ||
          typeof previousValue !== 'number'
        ) {
          return null;
        }

        const diff = latestValue - previousValue;
        const threshold = 0.5; // threshold for "stable"

        if (Math.abs(diff) < threshold) return 'stable';
        return diff > 0 ? 'up' : 'down';
      },

      clearAllData: () => {
        set({
          measurements: [],
          progressPhotos: [],
        });
      },
    }),
    {
      name: 'body-tracking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Serialize dates properly
      partialize: (state) => ({
        measurements: state.measurements,
        progressPhotos: state.progressPhotos,
      }),
    }
  )
);
