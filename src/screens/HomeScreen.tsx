import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, Button } from '@/components';
import { useWorkout } from '@/hooks/useWorkout';
import { useUserStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { Routes, Spacing, Typography, Layout } from '@/constants';
import { formatShortDate, formatDurationMinutes, formatVolume, navigateToWorkoutDetail, navigateToStartWorkout, navigateToWorkoutTemplates, navigateToExerciseLibrary } from '@/utils';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { workouts, templates, getWorkoutStats } = useWorkout();
  const user = useUserStore((state) => state.user);
  const { colors } = useTheme();

  // Get user's first name for welcome message
  const firstName = user?.profile.firstName || user?.displayName?.split(' ')[0] || 'Athlete';

  // Get workout statistics
  const stats = getWorkoutStats();

  // Get recent workouts (last 3)
  const recentWorkouts = React.useMemo(() => {
    return [...workouts]
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 3);
  }, [workouts]);

  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle: string,
    icon: string
  ) => (
    <Card style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: colors.text.primary }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.text.primary }]}>{title}</Text>
      <Text style={[styles.statSubtitle, { color: colors.text.secondary }]}>{subtitle}</Text>
    </Card>
  );

  const renderWorkoutItem = React.memo(({ item, onPress }: { item: typeof workouts[0]; onPress: (workout: typeof workouts[0]) => void }) => {
    const { colors } = useTheme();
    return (
      <TouchableOpacity
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <Card
          style={[styles.workoutItem, { borderLeftColor: colors.primary[500] }]}
          variant="outlined"
          padding="md"
        >
          <View style={styles.workoutItemHeader}>
            <View style={styles.workoutItemInfo}>
              <Text style={[styles.workoutItemName, { color: colors.text.primary }]}>{item.name}</Text>
              <Text style={[styles.workoutItemDate, { color: colors.text.secondary }]}>
                {formatShortDate(item.date)}
              </Text>
            </View>
            <View style={[
              styles.statusBadge,
              { backgroundColor: colors.neutral[200] },
              item.completed && { backgroundColor: colors.success[100] }
            ]}>
              <Text style={[
                styles.statusText,
                { color: colors.text.secondary },
                item.completed && { color: colors.success[700] }
              ]}>
                {item.completed ? 'Completed' : 'In Progress'}
              </Text>
            </View>
          </View>
          <View style={styles.workoutItemStats}>
            <Text style={[styles.workoutItemStat, { color: colors.text.secondary }]}>
              {item.exercises.length} exercises
            </Text>
            <Text style={[styles.workoutItemStat, { color: colors.text.secondary }]}>
              {formatDurationMinutes(item.duration)}
            </Text>
          </View>
        </Card>
      </TouchableOpacity>
    );
  }, (prevProps, nextProps) => {
    return prevProps.item.id === nextProps.item.id &&
           prevProps.item.completed === nextProps.item.completed &&
           prevProps.item.name === nextProps.item.name;
  });

  const handleWorkoutPress = (workout: typeof workouts[0]) => {
    navigateToWorkoutDetail(navigation, workout.id);
  };

  const handleStartWorkout = () => {
    navigateToStartWorkout(navigation);
  };

  const handleBrowseExercises = () => {
    navigateToExerciseLibrary(navigation);
  };

  const handleViewAllWorkouts = () => {
    navigation.navigate('WorkoutsStack' as never);
  };

  const handleBrowseTemplates = () => {
    navigateToWorkoutTemplates(navigation);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background.secondary }]} contentContainerStyle={styles.contentContainer}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={[styles.greeting, { color: colors.text.secondary }]}>Welcome back,</Text>
        <Text style={[styles.userName, { color: colors.text.primary }]}>{firstName}!</Text>
      </View>

      {/* Quick Stats Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          {renderStatCard(
            'Total Workouts',
            stats.totalWorkouts,
            'All time',
            '💪'
          )}
          {renderStatCard(
            'Current Streak',
            `${stats.streakDays} days`,
            'Keep it up!',
            '🔥'
          )}
          {renderStatCard(
            'Total Volume',
            formatVolume(stats.totalVolume),
            'Weight × reps',
            '🏋️'
          )}
        </View>
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <Button
            onPress={handleStartWorkout}
            variant="primary"
            fullWidth
            icon={<Text style={styles.buttonIcon}>▶️</Text>}
          >
            Start Workout
          </Button>
          <Button
            onPress={handleBrowseExercises}
            variant="outline"
            fullWidth
            icon={<Text style={styles.buttonIcon}>📚</Text>}
          >
            Browse Exercises
          </Button>
        </View>
      </View>

      {/* Recent Workouts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recent Workouts</Text>
          {workouts.length > 3 && (
            <Button
              onPress={handleViewAllWorkouts}
              variant="ghost"
              size="sm"
            >
              View All
            </Button>
          )}
        </View>
        {recentWorkouts.length > 0 ? (
          <FlatList
            data={recentWorkouts}
            renderItem={({ item }) => renderWorkoutItem({ item, onPress: handleWorkoutPress })}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          />
        ) : (
          <Card variant="outlined" padding="lg">
            <Text style={[styles.emptyText, { color: colors.text.secondary }]}>
              No workouts yet. Start your first workout today!
            </Text>
          </Card>
        )}
      </View>

      {/* Templates Preview */}
      {templates.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Workout Templates</Text>
          <Text style={[styles.templateCount, { color: colors.text.secondary }]}>
            {templates.length} template{templates.length !== 1 ? 's' : ''} available
          </Text>
          <Button
            onPress={handleBrowseTemplates}
            variant="outline"
            fullWidth
          >
            Browse Templates
          </Button>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl3,
  },
  welcomeSection: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.normal,
  },
  userName: {
    fontSize: Typography.fontSize.xl3,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.xl2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.sm,
  },
  statCard: {
    width: '100%',
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.lg,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xl3,
    fontWeight: Typography.fontWeight.bold,
  },
  statTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.xs,
  },
  statSubtitle: {
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.xs,
  },
  actionsContainer: {
    gap: Spacing.md,
  },
  buttonIcon: {
    fontSize: Typography.fontSize.base,
  },
  workoutItem: {
    borderLeftWidth: 4,
  },
  workoutItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  workoutItemInfo: {
    flex: 1,
  },
  workoutItemName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  workoutItemDate: {
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  workoutItemStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  workoutItemStat: {
    fontSize: Typography.fontSize.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    textAlign: 'center',
  },
  templateCount: {
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.md,
  },
});
