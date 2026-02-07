import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Routes } from '@/constants';
import { Button, Card, IconButton } from '@/components';
import { Layout, Spacing, Typography } from '@/constants';
import { useUserStore, useBodyTrackingStore } from '@/store';
import { useWorkout } from '@/hooks';
import { useTheme } from '@/hooks/useTheme';
import { formatVolume, formatDurationMinutes } from '@/utils';
import type { ProfileStackParamList } from '@/navigation/types';

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'Profile'
>;

interface Props {
  navigation: ProfileScreenNavigationProp;
}

export const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, getUnits } = useUserStore();
  const { getWorkoutStats } = useWorkout();
  const { getLatestMeasurement, getWeightTrend, getWeightChange, progressPhotos } =
    useBodyTrackingStore();
  const { colors } = useTheme();

  const stats = getWorkoutStats();
  const unitSystem = getUnits();
  const latestMeasurement = getLatestMeasurement();
  const weightTrend = getWeightTrend();
  const weightChange = getWeightChange(30);

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background.secondary }]}>
        <Text style={[styles.errorText, { color: colors.danger[500] }]}>No user logged in</Text>
      </View>
    );
  }

  const getInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || user.displayName[0].toUpperCase();
  };

  const handleLogout = () => {
    logout();
  };

  const weightUnit = unitSystem === 'imperial' ? 'lbs' : 'kg';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.secondary }]} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header Card */}
      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {/* Avatar with initials */}
          <View style={[styles.avatar, { backgroundColor: colors.primary[500] }]}>
            <Text style={[styles.avatarText, { color: colors.white }]}>
              {getInitials(user.profile.firstName, user.profile.lastName)}
            </Text>
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <Text style={[styles.displayName, { color: colors.text.primary }]}>
              {user.profile.firstName && user.profile.lastName
                ? `${user.profile.firstName} ${user.profile.lastName}`
                : user.displayName}
            </Text>
            <Text style={[styles.email, { color: colors.text.secondary }]}>{user.email}</Text>
            {user.profile.bio && (
              <Text style={[styles.bio, { color: colors.text.secondary }]}>{user.profile.bio}</Text>
            )}
          </View>
        </View>

        {/* Physical Stats */}
        {(user.profile.weight || user.profile.height) && (
          <View style={[styles.physicalStats, { borderTopColor: colors.border.light }]}>
            {user.profile.weight && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary[500] }]}>
                  {user.profile.weight} {weightUnit}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Weight</Text>
              </View>
            )}
            {user.profile.height && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary[500] }]}>
                  {unitSystem === 'imperial'
                    ? `${Math.round(user.profile.height * 0.3937)}"`
                    : `${user.profile.height} cm`}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Height</Text>
              </View>
            )}
            {user.profile.fitnessGoal && (
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.primary[500] }]}>
                  {formatFitnessGoal(user.profile.fitnessGoal)}
                </Text>
                <Text style={[styles.statLabel, { color: colors.text.secondary }]}>Goal</Text>
              </View>
            )}
          </View>
        )}
      </Card>

      {/* Workout Stats Row */}
      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary[500] }]}>{stats.totalWorkouts}</Text>
          <Text style={[styles.statTitle, { color: colors.text.secondary }]}>Workouts</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary[500] }]}>{stats.streakDays}</Text>
          <Text style={[styles.statTitle, { color: colors.text.secondary }]}>Day Streak</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statNumber, { color: colors.primary[500] }]}>{formatVolume(stats.totalVolume)}</Text>
          <Text style={[styles.statTitle, { color: colors.text.secondary }]}>Total Volume</Text>
        </Card>
      </View>

      {/* Quick Stats */}
      <Card style={styles.quickStatsCard}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Quick Stats</Text>
        <View style={[styles.quickStatRow, { borderBottomColor: colors.border.light }]}>
          <Text style={[styles.quickStatLabel, { color: colors.text.secondary }]}>Total Duration</Text>
          <Text style={[styles.quickStatValue, { color: colors.text.primary }]}>
            {formatDurationMinutes(stats.totalDuration)}
          </Text>
        </View>
        {stats.lastWorkoutDate && (
          <View style={[styles.quickStatRow, { borderBottomColor: colors.border.light }]}>
            <Text style={[styles.quickStatLabel, { color: colors.text.secondary }]}>Last Workout</Text>
            <Text style={[styles.quickStatValue, { color: colors.text.primary }]}>
              {stats.lastWorkoutDate.toLocaleDateString()}
            </Text>
          </View>
        )}
      </Card>

      {/* Body Tracking Section */}
      <Card style={styles.bodyTrackingCard}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Body Tracking</Text>
          <View style={styles.sectionActions}>
            <Text style={[styles.photosCount, { color: colors.text.secondary }]}>
              {progressPhotos.length} photos
            </Text>
          </View>
        </View>

        {/* Latest Measurement */}
        {latestMeasurement && latestMeasurement.weight && (
          <View style={[styles.measurementRow, { borderBottomColor: colors.border.light }]}>
            <View style={styles.measurementLeft}>
              <Text style={[styles.measurementLabel, { color: colors.text.secondary }]}>Latest Weight</Text>
              <View style={styles.weightContainer}>
                <Text style={[styles.measurementValue, { color: colors.text.primary }]}>
                  {unitSystem === 'imperial'
                    ? Math.round(latestMeasurement.weight * 2.20462)
                    : latestMeasurement.weight}{' '}
                  {unitSystem === 'imperial' ? 'lbs' : 'kg'}
                </Text>
                {weightTrend && (
                  <View style={styles.trendBadge}>
                    <Ionicons
                      name={weightTrend === 'up' ? 'arrow-up' : weightTrend === 'down' ? 'arrow-down' : 'remove'}
                      size={16}
                      color={
                        weightTrend === 'up'
                          ? colors.danger[500]
                          : weightTrend === 'down'
                          ? colors.success[500]
                          : colors.neutral[500]
                      }
                    />
                  </View>
                )}
              </View>
            </View>
            <Text style={[styles.measurementDate, { color: colors.text.secondary }]}>
              {new Date(latestMeasurement.date).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Weight Change */}
        {weightChange !== 0 && (
          <View style={[styles.measurementRow, { borderBottomColor: colors.border.light }]}>
            <Text style={[styles.measurementLabel, { color: colors.text.secondary }]}>30-Day Change</Text>
            <Text
              style={[
                styles.weightChangeValue,
                { color: weightChange > 0 ? colors.danger[500] : colors.success[500] },
              ]}
            >
              {weightChange > 0 ? '+' : ''}
              {unitSystem === 'imperial'
                ? Math.round(weightChange * 2.20462)
                : Math.round(weightChange)}{' '}
              {unitSystem === 'imperial' ? 'lbs' : 'kg'}
            </Text>
          </View>
        )}

        {/* Body Tracking Buttons */}
        <View style={styles.bodyTrackingButtons}>
          <Button
            onPress={() => navigation.navigate(Routes.MEASUREMENT_HISTORY as never)}
            variant="outline"
            style={styles.bodyTrackingButton}
            icon={<Ionicons name="fitness" size={18} color={colors.primary[500]} />}
          >
            Measurements
          </Button>

          <Button
            onPress={() => navigation.navigate(Routes.PROGRESS_PHOTOS as never)}
            variant="outline"
            style={styles.bodyTrackingButton}
            icon={<Ionicons name="images" size={18} color={colors.primary[500]} />}
          >
            Progress Photos
          </Button>
        </View>
      </Card>

      {/* Action Buttons */}
      <View style={styles.actionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Actions</Text>

        <Button
          onPress={() => navigation.navigate(Routes.EDIT_PROFILE as never)}
          variant="outline"
          fullWidth
          style={styles.actionButton}
        >
          Edit Profile
        </Button>

        <Button
          onPress={() => navigation.navigate(Routes.SETTINGS as never)}
          variant="outline"
          fullWidth
          style={styles.actionButton}
        >
          Settings
        </Button>

        <Button
          onPress={() => navigation.navigate(Routes.ANALYTICS_DASHBOARD as never)}
          variant="outline"
          fullWidth
          style={styles.actionButton}
        >
          Analytics Dashboard
        </Button>

        <Button
          onPress={() => navigation.navigate(Routes.STATISTICS as never)}
          variant="outline"
          fullWidth
          style={styles.actionButton}
        >
          Statistics
        </Button>

        <Button
          onPress={() => navigation.navigate(Routes.PERSONAL_RECORDS as never)}
          variant="outline"
          fullWidth
          style={styles.actionButton}
        >
          Personal Records
        </Button>

        <Button
          onPress={handleLogout}
          variant="ghost"
          fullWidth
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
};

const formatFitnessGoal = (goal: string): string => {
  const goals: Record<string, string> = {
    'lose-weight': 'Lose Weight',
    'build-muscle': 'Build Muscle',
    'increase-endurance': 'Endurance',
    'improve-flexibility': 'Flexibility',
    'general-fitness': 'Fitness',
  };
  return goals[goal] || goal;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  profileCard: {
    marginBottom: Spacing.lg,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.xl3,
    fontWeight: Typography.fontWeight.bold,
  },
  userInfo: {
    alignItems: 'center',
  },
  displayName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  email: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  bio: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  physicalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  statNumber: {
    fontSize: Typography.fontSize.xl2,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.fontSize.xs,
    textTransform: 'uppercase',
  },
  quickStatsCard: {
    marginBottom: Spacing.lg,
  },
  bodyTrackingCard: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  measurementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  measurementLeft: {
    flex: 1,
  },
  measurementLabel: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.xs,
  },
  weightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  measurementValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  measurementDate: {
    fontSize: Typography.fontSize.sm,
  },
  trendBadge: {
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    padding: 4,
  },
  weightChangeValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  bodyTrackingButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  bodyTrackingButton: {
    flex: 1,
  },
  photosCount: {
    fontSize: Typography.fontSize.sm,
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  quickStatLabel: {
    fontSize: Typography.fontSize.sm,
  },
  quickStatValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  actionsSection: {
    marginTop: Spacing.lg,
  },
  actionButton: {
    marginBottom: Spacing.md,
  },
  logoutButton: {
    marginTop: Spacing.lg,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
});
