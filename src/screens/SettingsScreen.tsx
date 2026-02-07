import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Routes } from '@/constants';
import { Button, Card } from '@/components';
import { Layout, Spacing, Typography } from '@/constants';
import { useUserStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import type { ProfileStackParamList } from '@/navigation/types';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Settings'
>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

type ThemeOption = 'light' | 'dark' | 'system';
type UnitSystem = 'metric' | 'imperial';

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { user, updateSettings, getUnits, getTheme: getUserTheme } = useUserStore();
  const { theme, setTheme: setAppTheme } = useTheme();

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(getUnits());
  const [themePreference, setThemePreference] = useState<ThemeOption>(getUserTheme());
  const [workoutReminders, setWorkoutReminders] = useState(
    user?.settings.notifications.workoutReminders ?? true
  );
  const [achievementAlerts, setAchievementAlerts] = useState(
    user?.settings.notifications.achievementAlerts ?? true
  );
  const [progressUpdates, setProgressUpdates] = useState(
    user?.settings.notifications.progressUpdates ?? true
  );
  const [reminderTime, setReminderTime] = useState(
    user?.settings.notifications.reminderTime || '09:00'
  );
  const [defaultRestTime, setDefaultRestTime] = useState(
    user?.settings.workout.defaultRestTime || 60
  );
  const [autoStartTimer, setAutoStartTimer] = useState(
    user?.settings.workout.autoStartTimer ?? false
  );
  const [shareWorkouts, setShareWorkouts] = useState(
    user?.settings.privacy.shareWorkouts ?? false
  );
  const [shareProgress, setShareProgress] = useState(
    user?.settings.privacy.shareProgress ?? false
  );
  const [showProfile, setShowProfile] = useState(
    user?.settings.privacy.showProfile ?? true
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Apply theme change immediately
      await setAppTheme(themePreference);

      updateSettings({
        units: unitSystem,
        theme: themePreference,
        notifications: {
          workoutReminders,
          achievementAlerts,
          progressUpdates,
          reminderTime,
        },
        workout: {
          defaultRestTime,
          autoStartTimer,
          logCompletedWorkouts: user?.settings.workout.logCompletedWorkouts ?? true,
        },
        privacy: {
          shareWorkouts,
          shareProgress,
          showProfile,
        },
      });

      Alert.alert('Success', 'Settings saved successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const UnitSystemOption = ({ value, label }: { value: UnitSystem; label: string }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        style={[
          styles.radioOption,
          { backgroundColor: unitSystem === value ? colors.primary[50] : 'transparent' },
        ]}
        onPress={() => setUnitSystem(value)}
      >
        <View style={[styles.radioOuter, { borderColor: colors.neutral[400] }]}>
          {unitSystem === value && <View style={[styles.radioInner, { backgroundColor: colors.primary[500] }]} />}
        </View>
        <Text
          style={[
            styles.radioLabel,
            { color: colors.text.primary },
            unitSystem === value && [styles.radioLabelSelected, { color: colors.primary[700] }],
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const ThemeOption = ({ value, label }: { value: ThemeOption; label: string }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        style={[
          styles.radioOption,
          { backgroundColor: themePreference === value ? colors.primary[50] : 'transparent' },
        ]}
        onPress={() => setThemePreference(value)}
      >
        <View style={[styles.radioOuter, { borderColor: colors.neutral[400] }]}>
          {themePreference === value && <View style={[styles.radioInner, { backgroundColor: colors.primary[500] }]} />}
        </View>
        <Text
          style={[
            styles.radioLabel,
            { color: colors.text.primary },
            themePreference === value && [styles.radioLabelSelected, { color: colors.primary[700] }],
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const ToggleRow = ({
    label,
    value,
    onValueChange,
    description,
  }: {
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    description?: string;
  }) => {
    const { colors } = useTheme();
    return (
      <View style={[styles.toggleRow, { borderBottomColor: colors.border.light }]}>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleLabel, { color: colors.text.primary }]}>{label}</Text>
          {description && (
            <Text style={[styles.toggleDescription, { color: colors.text.secondary }]}>{description}</Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
          thumbColor={colors.white}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Unit System */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Unit System</Text>
          <UnitSystemOption value="metric" label="Metric (kg, cm)" />
          <UnitSystemOption value="imperial" label="Imperial (lbs, in)" />
        </Card>

        {/* Theme */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <ThemeOption value="light" label="Light" />
          <ThemeOption value="dark" label="Dark" />
          <ThemeOption value="system" label="System Default" />
        </Card>

        {/* Notifications */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <ToggleRow
            label="Workout Reminders"
            value={workoutReminders}
            onValueChange={setWorkoutReminders}
            description="Get reminded to workout"
          />

          {workoutReminders && (
            <View style={styles.timePickerContainer}>
              <Text style={styles.timeLabel}>Reminder Time</Text>
              <Button
                onPress={() => {
                  Alert.alert(
                    'Set Reminder Time',
                    'Enter time in HH:MM format (24-hour)',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'OK',
                        onPress: () => {
                          // In a real app, you'd show a proper time picker
                          // For now, just keep the current value
                        },
                      },
                    ]
                  );
                }}
                variant="outline"
                size="sm"
              >
                {reminderTime}
              </Button>
            </View>
          )}

          <ToggleRow
            label="Achievement Alerts"
            value={achievementAlerts}
            onValueChange={setAchievementAlerts}
            description="Celebrate your PRs and milestones"
          />

          <ToggleRow
            label="Progress Updates"
            value={progressUpdates}
            onValueChange={setProgressUpdates}
            description="Weekly progress summaries"
          />
        </Card>

        {/* Workout Settings */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Workout Settings</Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Default Rest Time</Text>
            <Text style={styles.sliderValue}>{defaultRestTime}s</Text>
          </View>
          <View style={styles.sliderTrack}>
            <TouchableOpacity
              style={[styles.sliderThumb, { left: `${((defaultRestTime - 30) / 150) * 100}%` }]}
              onPress={() => {
                // Simple slider interaction - in real app use proper Slider component
                const newValue = Math.min(180, defaultRestTime + 30);
                setDefaultRestTime(newValue);
              }}
            />
          </View>
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderMinMax}>30s</Text>
            <Text style={styles.sliderMinMax}>180s</Text>
          </View>

          <ToggleRow
            label="Auto-start Timer"
            value={autoStartTimer}
            onValueChange={setAutoStartTimer}
            description="Automatically start rest timer after completing a set"
          />
        </Card>

        {/* Privacy */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Privacy</Text>

          <ToggleRow
            label="Share Workouts"
            value={shareWorkouts}
            onValueChange={setShareWorkouts}
            description="Allow others to see your workouts"
          />

          <ToggleRow
            label="Share Progress"
            value={shareProgress}
            onValueChange={setShareProgress}
            description="Share your progress with friends"
          />

          <ToggleRow
            label="Show Profile"
            value={showProfile}
            onValueChange={setShowProfile}
            description="Allow your profile to be visible to others"
          />
        </Card>

        {/* Save Button */}
        <Button
          onPress={handleSave}
          loading={isSaving}
          fullWidth
          style={styles.saveButton}
        >
          Save Settings
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  card: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  radioOptionSelected: {
    borderRadius: Layout.borderRadius.md,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  radioLabel: {
    fontSize: Typography.fontSize.base,
  },
  radioLabelSelected: {
    fontWeight: Typography.fontWeight.semibold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xs,
  },
  toggleDescription: {
    fontSize: Typography.fontSize.sm,
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  timeLabel: {
    fontSize: Typography.fontSize.sm,
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
  },
  sliderValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    marginBottom: Spacing.xs,
  },
  sliderThumb: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderMinMax: {
    fontSize: Typography.fontSize.xs,
  },
  saveButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing.xl2,
  },
});
