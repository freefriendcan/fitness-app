/**
 * User profile and settings types
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  profile: UserProfile;
  settings: UserSettings;
  createdAt: Date;
}

export interface UserProfile {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  dateOfBirth?: Date;
  weight?: number; // in kg
  height?: number; // in cm
  fitnessGoal?: FitnessGoal;
  bio?: string;
  // Body tracking history
  bodyMeasurements?: BodyMeasurement[];
  progressPhotos?: ProgressPhoto[];
}

export interface UserSettings {
  units: UnitSystem;
  theme: Theme;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  workout: WorkoutSettings;
}

export type FitnessGoal =
  | 'lose-weight'
  | 'build-muscle'
  | 'increase-endurance'
  | 'improve-flexibility'
  | 'general-fitness';

export type UnitSystem = 'metric' | 'imperial';
export type Theme = 'light' | 'dark' | 'system';

export interface NotificationSettings {
  workoutReminders: boolean;
  achievementAlerts: boolean;
  progressUpdates: boolean;
  reminderTime?: string; // HH:mm format
}

export interface PrivacySettings {
  shareWorkouts: boolean;
  shareProgress: boolean;
  showProfile: boolean;
}

export interface WorkoutSettings {
  defaultRestTime: number; // in seconds
  autoStartTimer: boolean;
  logCompletedWorkouts: boolean;
}

/**
 * Body measurement entry
 * All measurements are stored in metric (kg, cm) and converted for display
 */
export interface BodyMeasurement {
  id: string;
  date: Date; // When measurement was taken
  weight?: number; // kg
  bodyFat?: number; // percentage
  chest?: number; // cm
  waist?: number; // cm
  hips?: number; // cm
  thighs?: number; // cm (left and right average)
  arms?: number; // cm (left and right average)
  neck?: number; // cm
  shoulders?: number; // cm
  calves?: number; // cm (left and right average)
  forearms?: number; // cm (left and right average)
  notes?: string; // Optional notes about this measurement
}

/**
 * Progress photo entry
 */
export interface ProgressPhoto {
  id: string;
  date: Date; // When photo was taken
  photoUri: string; // Local URI to the photo
  notes?: string; // Optional notes about this photo
  photoType?: 'front' | 'side' | 'back' | 'other'; // Type of pose/view
}
