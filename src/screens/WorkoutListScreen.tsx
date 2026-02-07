import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout, useDebounce } from '@/hooks';
import { Card, Input, Button } from '@/components';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { Routes } from '@/constants';
import { formatDate, getRelativeDay, navigateToActiveWorkout, navigateToCreateWorkout } from '@/utils';
import type { WorkoutsStackParamList } from '@/types';

type WorkoutListScreenNavigationProp = NativeStackNavigationProp<
  WorkoutsStackParamList,
  'WorkoutList'
>;

type FilterType = 'all' | 'completed' | 'in-progress';

interface Props {
  navigation: WorkoutListScreenNavigationProp;
}

export const WorkoutListScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useMemo(() => getStyles(), []);

  const { workouts, templates, hasActiveSession, deleteWorkout, startWorkoutSession } = useWorkout();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredWorkouts = workouts.filter((workout) => {
    // Apply filter
    if (filter === 'completed' && !workout.completed) return false;
    if (filter === 'in-progress' && workout.completed) return false;

    // Apply search
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      return (
        workout.name.toLowerCase().includes(query) ||
        workout.exercises.some((exercise) =>
          exercise.name.toLowerCase().includes(query)
        )
      );
    }

    return true;
  });

  const sortedWorkouts = [...filteredWorkouts].sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  );

  const handleWorkoutPress = (workoutId: string) => {
    navigateToActiveWorkout(navigation, workoutId);
  };

  const handleCreatePress = () => {
    navigateToCreateWorkout(navigation);
  };

  const handleCalendarPress = () => {
    navigation.navigate('WorkoutHistory' as never);
  };

  const handleDeleteWorkout = (workoutId: string, workoutName: string) => {
    Alert.alert(
      'Delete Workout',
      `Are you sure you want to delete "${workoutName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteWorkout(workoutId),
        },
      ]
    );
  };

  const renderFilterButton = (filterType: FilterType, label: string) => {
    const isActive = filter === filterType;
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setFilter(filterType)}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.filterButtonText,
            isActive && styles.filterButtonTextActive,
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderWorkoutCard = ({ item }: { item: any }) => {
    const exerciseCount = item.exercises.length;
    const completedSets = item.exercises.reduce(
      (sum: number, exercise: any) =>
        sum + exercise.sets.filter((set: any) => set.completed).length,
      0
    );
    const totalSets = item.exercises.reduce(
      (sum: number, exercise: any) => sum + exercise.sets.length,
      0
    );
    const progress = totalSets > 0 ? completedSets / totalSets : 0;

    return (
      <TouchableOpacity onPress={() => handleWorkoutPress(item.id)} activeOpacity={0.7}>
        <Card
          variant="outlined"
          style={styles.workoutCard}
        >
        <View style={styles.workoutCardHeader}>
          <View style={styles.workoutInfo}>
            <Text style={styles.workoutName}>{item.name}</Text>
            <Text style={styles.workoutDate}>
              {getRelativeDay(item.date)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.completed
                ? styles.statusCompleted
                : styles.statusInProgress,
            ]}
          >
            <Text
              style={[
                styles.statusText,
                item.completed
                  ? styles.statusTextCompleted
                  : styles.statusTextInProgress,
              ]}
            >
              {item.completed ? 'Completed' : 'In Progress'}
            </Text>
          </View>
        </View>

        <View style={styles.workoutStats}>
          <View style={styles.stat}>
            <Ionicons
              name="fitness"
              size={16}
              color={Colors.text.secondary}
            />
            <Text style={styles.statText}>
              {exerciseCount} {exerciseCount === 1 ? 'Exercise' : 'Exercises'}
            </Text>
          </View>
          <View style={styles.stat}>
            <Ionicons
              name="time"
              size={16}
              color={Colors.text.secondary}
            />
            <Text style={styles.statText}>{item.duration} min</Text>
          </View>
        </View>

        {totalSets > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress * 100}%` },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {completedSets}/{totalSets} sets
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteWorkout(item.id, item.name)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.danger[500]} />
        </TouchableOpacity>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (debouncedSearch || sortedWorkouts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons
            name="barbell"
            size={64}
            color={Colors.neutral[300]}
          />
          <Text style={styles.emptyTitle}>
            {debouncedSearch ? 'No Workouts Found' : 'No Workouts Yet'}
          </Text>
          <Text style={styles.emptyText}>
            {debouncedSearch
              ? 'Try a different search term'
              : 'Create your first workout to get started'}
          </Text>
          {!debouncedSearch && (
            <Button
              onPress={handleCreatePress}
              variant="primary"
              style={styles.emptyButton}
            >
              Create Workout
            </Button>
          )}
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Input
            placeholder="Search workouts or exercises..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          <TouchableOpacity
            style={styles.calendarButton}
            onPress={handleCalendarPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All')}
        {renderFilterButton('completed', 'Completed')}
        {renderFilterButton('in-progress', 'In Progress')}
      </View>

      {/* Workout List */}
      <FlatList
        data={sortedWorkouts}
        keyExtractor={(item) => item.id}
        renderItem={renderWorkoutCard}
        contentContainerStyle={[
          styles.listContent,
          sortedWorkouts.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary[500]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      {!hasActiveSession && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreatePress}
          activeOpacity={0.9}
        >
          <Ionicons name="add" size={32} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  searchContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
  },
  calendarButton: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  workoutCard: {
    position: 'relative',
  },
  workoutCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  workoutInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  workoutName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  workoutDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusCompleted: {
    backgroundColor: Colors.success[50],
  },
  statusInProgress: {
    backgroundColor: Colors.warning[50],
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusTextCompleted: {
    color: Colors.success[700],
  },
  statusTextInProgress: {
    color: Colors.warning[700],
  },
  workoutStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  progressContainer: {
    marginTop: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.success[500],
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    textAlign: 'right',
  },
  deleteButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl2,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl2,
  },
  emptyButton: {
    minWidth: 160,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl2,
    right: Spacing.xl2,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.shadow.lg,
    elevation: 8,
  },
});
