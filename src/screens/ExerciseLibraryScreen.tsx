import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography, Layout } from '@/constants';
import { Card, Input } from '@/components';
import { useExercise } from '@/hooks/useExercise';
import { useDebounce } from '@/hooks/useDebounce';
import type { MuscleGroup, Equipment } from '@/types';
import type { ExercisesStackParamList } from '@/types/navigation';

type NavigationProp = NativeStackNavigationProp<ExercisesStackParamList>;

// Muscle group icons mapping
const MUSCLE_GROUP_ICONS: Record<MuscleGroup, string> = {
  chest: '💪',
  back: '🔄',
  shoulders: '🏋️',
  biceps: '💪',
  triceps: '💪',
  legs: '🦵',
  glutes: '🍑',
  core: '🎯',
  cardio: '🏃',
  'full-body': '🧍',
};

// Muscle group colors for badges
const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  chest: Colors.primary[500],
  back: Colors.secondary[500],
  shoulders: Colors.success[500],
  biceps: Colors.warning[500],
  triceps: Colors.danger[500],
  legs: Colors.primary[600],
  glutes: Colors.secondary[600],
  core: Colors.success[600],
  cardio: Colors.warning[600],
  'full-body': Colors.neutral[700],
};

const EQUIPMENT_OPTIONS: Equipment[] = [
  'barbell',
  'dumbbells',
  'cable',
  'machine',
  'bodyweight',
  'kettlebell',
  'resistance-band',
  'other',
];

const MUSCLE_GROUP_OPTIONS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'legs',
  'glutes',
  'core',
  'cardio',
  'full-body',
];

export const ExerciseLibraryScreen: React.FC = () => {
  const styles = useMemo(() => getStyles(), []);

  const navigation = useNavigation<NavigationProp>();
  const { exercises, getExercisesByMuscleGroup, getExercisesByEquipment, searchExercises } = useExercise();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | undefined>();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | undefined>();

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    let filtered = exercises;

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      filtered = searchExercises(debouncedSearchQuery);
    }

    // Apply muscle group filter
    if (selectedMuscleGroup) {
      filtered = filtered.filter((e) => e.muscleGroup === selectedMuscleGroup);
    }

    // Apply equipment filter
    if (selectedEquipment) {
      filtered = filtered.filter((e) => e.equipment === selectedEquipment);
    }

    return filtered;
  }, [exercises, debouncedSearchQuery, selectedMuscleGroup, selectedEquipment, searchExercises]);

  // Navigate to exercise detail
  const handleExercisePress = (exerciseId: string) => {
    navigation.navigate('ExerciseDetail', { exerciseId });
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedMuscleGroup(undefined);
    setSelectedEquipment(undefined);
    setSearchQuery('');
  };

  const hasActiveFilters = selectedMuscleGroup || selectedEquipment || debouncedSearchQuery;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search exercises..."
          placeholderTextColor={Colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {hasActiveFilters && (
          <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Muscle Group Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Muscle Group</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipContainer}
            contentContainerStyle={styles.chipContent}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                !selectedMuscleGroup && styles.chipActive,
              ]}
              onPress={() => setSelectedMuscleGroup(undefined)}
            >
              <Text
                style={[
                  styles.chipText,
                  !selectedMuscleGroup && styles.chipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {MUSCLE_GROUP_OPTIONS.map((group) => (
              <TouchableOpacity
                key={group}
                style={[
                  styles.chip,
                  selectedMuscleGroup === group && styles.chipActive,
                ]}
                onPress={() => setSelectedMuscleGroup(group)}
              >
                <Text style={styles.chipIcon}>{MUSCLE_GROUP_ICONS[group]}</Text>
                <Text
                  style={[
                    styles.chipText,
                    selectedMuscleGroup === group && styles.chipTextActive,
                  ]}
                >
                  {group}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Equipment Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterTitle}>Equipment</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipContainer}
            contentContainerStyle={styles.chipContent}
          >
            <TouchableOpacity
              style={[
                styles.chip,
                !selectedEquipment && styles.chipActive,
              ]}
              onPress={() => setSelectedEquipment(undefined)}
            >
              <Text
                style={[
                  styles.chipText,
                  !selectedEquipment && styles.chipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {EQUIPMENT_OPTIONS.map((equipment) => (
              <TouchableOpacity
                key={equipment}
                style={[
                  styles.chip,
                  selectedEquipment === equipment && styles.chipActive,
                ]}
                onPress={() => setSelectedEquipment(equipment)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedEquipment === equipment && styles.chipTextActive,
                  ]}
                >
                  {equipment}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Results Count */}
        <View style={styles.resultsSection}>
          <Text style={styles.resultsText}>
            {filteredExercises.length} {filteredExercises.length === 1 ? 'exercise' : 'exercises'} found
          </Text>
        </View>

        {/* Exercise List */}
        {filteredExercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🔍</Text>
            <Text style={styles.emptyStateTitle}>No exercises found</Text>
            <Text style={styles.emptyStateText}>
              Try adjusting your filters or search query
            </Text>
          </View>
        ) : (
          <View style={styles.exerciseList}>
            {filteredExercises.map((exercise) => (
              <TouchableOpacity
                key={exercise.id}
                onPress={() => handleExercisePress(exercise.id)}
                activeOpacity={0.7}
              >
                <Card variant="outlined" style={styles.exerciseCard}>
                  <View style={styles.exerciseCardHeader}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseIcon}>
                        {MUSCLE_GROUP_ICONS[exercise.muscleGroup]}
                      </Text>
                      <View style={styles.exerciseTextContainer}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <View style={styles.exerciseMeta}>
                          <View
                            style={[
                              styles.muscleGroupBadge,
                              { backgroundColor: MUSCLE_GROUP_COLORS[exercise.muscleGroup] },
                            ]}
                          >
                            <Text style={styles.muscleGroupText}>
                              {exercise.muscleGroup}
                            </Text>
                          </View>
                          <Text style={styles.equipmentText}>
                            {exercise.equipment}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom padding for scroll */}
        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateExercise')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchInput: {
    flex: 1,
    height: Layout.inputHeight,
    backgroundColor: Colors.neutral[100],
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.sm,
  },
  clearButtonText: {
    color: Colors.primary[500],
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  filterSection: {
    marginBottom: Spacing.lg,
  },
  filterTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipContainer: {
    marginHorizontal: -Spacing.sm,
  },
  chipContent: {
    paddingHorizontal: Spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  chipActive: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  chipIcon: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.xs,
  },
  chipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  chipTextActive: {
    color: Colors.white,
  },
  resultsSection: {
    marginBottom: Spacing.md,
  },
  resultsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  exerciseList: {
    gap: Spacing.md,
  },
  exerciseCard: {
    padding: Spacing.md,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseIcon: {
    fontSize: Typography.fontSize.xl2,
    marginRight: Spacing.md,
  },
  exerciseTextContainer: {
    flex: 1,
  },
  exerciseName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  muscleGroupBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.sm,
  },
  muscleGroupText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.white,
    textTransform: 'capitalize',
  },
  equipmentText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl3,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyStateTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.shadow.md,
    elevation: 4,
  },
  fabIcon: {
    fontSize: Typography.fontSize.xl3,
    color: Colors.white,
    fontWeight: Typography.fontWeight.light,
  },
});
