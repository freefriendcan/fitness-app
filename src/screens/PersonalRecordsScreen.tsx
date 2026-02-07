import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Routes } from '@/constants';
import { Card } from '@/components';
import { Colors, Layout, Spacing, Typography } from '@/constants';
import { useWorkout } from '@/hooks';
import { formatShortDate } from '@/utils';
import type { ProfileStackParamList } from '@/navigation/types';
import type { MuscleGroup } from '@/types';
import type { PersonalRecord } from '@/types';

type PersonalRecordsScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'PersonalRecords'
>;

interface Props {
  navigation: PersonalRecordsScreenNavigationProp;
}

interface PRByExercise {
  exerciseName: string;
  exerciseId: string;
  muscleGroup: MuscleGroup;
  records: {
    weight: number;
    reps: number;
    date: Date;
  }[];
}

const MUSCLE_GROUPS: (MuscleGroup | 'all')[] = [
  'all',
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

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  'all': 'All Exercises',
  'chest': 'Chest',
  'back': 'Back',
  'shoulders': 'Shoulders',
  'biceps': 'Biceps',
  'triceps': 'Triceps',
  'legs': 'Legs',
  'glutes': 'Glutes',
  'core': 'Core',
  'cardio': 'Cardio',
  'full-body': 'Full Body',
};

export const PersonalRecordsScreen: React.FC<Props> = ({ navigation }) => {
  const styles = useMemo(() => getStyles(), []);

  const { workouts } = useWorkout();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [celebrationAnim] = useState(new Animated.Value(0));

  // Calculate personal records from workout history
  const personalRecords = useMemo(() => {
    const recordsMap = new Map<string, PRByExercise>();

    workouts.forEach((workout) => {
      workout.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (!set.completed) return;

          const key = exercise.id;
          if (!recordsMap.has(key)) {
            recordsMap.set(key, {
              exerciseName: exercise.name,
              exerciseId: exercise.id,
              muscleGroup: exercise.muscleGroup,
              records: [],
            });
          }

          const prData = recordsMap.get(key)!;

          // Check if this is a new PR (heavier weight for same or more reps)
          const existingRecord = prData.records.find((r) => r.reps === set.reps);
          if (existingRecord) {
            if (set.weight > existingRecord.weight) {
              existingRecord.weight = set.weight;
              existingRecord.date = workout.date;
            }
          } else {
            prData.records.push({
              weight: set.weight,
              reps: set.reps,
              date: workout.date,
            });
          }
        });
      });
    });

    // Convert to array and sort by exercise name
    return Array.from(recordsMap.values()).sort((a, b) =>
      a.exerciseName.localeCompare(b.exerciseName)
    );
  }, [workouts]);

  // Filter by muscle group
  const filteredRecords = useMemo(() => {
    if (selectedMuscleGroup === 'all') {
      return personalRecords;
    }
    return personalRecords.filter((pr) => pr.muscleGroup === selectedMuscleGroup);
  }, [personalRecords, selectedMuscleGroup]);

  // Trigger celebration animation
  const triggerCelebration = () => {
    celebrationAnim.setValue(0);
    Animated.timing(celebrationAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const scaleAnim = celebrationAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });

  const rotateAnim = celebrationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Muscle Group Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        {MUSCLE_GROUPS.map((group) => (
          <TouchableOpacity
            key={group}
            style={[
              styles.filterChip,
              selectedMuscleGroup === group && styles.filterChipSelected,
            ]}
            onPress={() => setSelectedMuscleGroup(group)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedMuscleGroup === group && styles.filterChipTextSelected,
              ]}
            >
              {MUSCLE_GROUP_LABELS[group]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* PRs List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredRecords.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Animated.View
              style={{
                transform: [{ scale: scaleAnim }, { rotate: rotateAnim }],
              }}
            >
              <Text style={styles.emptyIcon}>🏆</Text>
            </Animated.View>
            <Text style={styles.emptyTitle}>
              {selectedMuscleGroup === 'all'
                ? 'No Personal Records Yet'
                : `No ${MUSCLE_GROUP_LABELS[selectedMuscleGroup]} PRs Yet`}
            </Text>
            <Text style={styles.emptyText}>
              Start logging workouts to set your first personal record!
            </Text>
          </Card>
        ) : (
          <View style={styles.recordsList}>
            {filteredRecords.map((pr, prIndex) => (
              <Card key={pr.exerciseId} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <Text style={styles.exerciseName}>{pr.exerciseName}</Text>
                  <View style={styles.muscleGroupBadge}>
                    <Text style={styles.muscleGroupText}>
                      {MUSCLE_GROUP_LABELS[pr.muscleGroup]}
                    </Text>
                  </View>
                </View>

                <View style={styles.recordsContainer}>
                  {pr.records
                    .sort((a, b) => b.weight - a.weight)
                    .slice(0, 5) // Show top 5 PRs
                    .map((record, index) => (
                      <View key={index} style={styles.recordItem}>
                        <View style={styles.recordInfo}>
                          <View style={styles.recordRank}>
                            <Text style={styles.recordRankText}>#{index + 1}</Text>
                          </View>
                          <View style={styles.recordDetails}>
                            <Text style={styles.recordWeight}>{record.weight} kg</Text>
                            <Text style={styles.recordReps}>{record.reps} reps</Text>
                          </View>
                        </View>
                        <Text style={styles.recordDate}>
                          {formatShortDate(record.date)}
                        </Text>
                      </View>
                    ))}
                </View>

                {prIndex === 0 && (
                  <TouchableOpacity
                    style={styles.celebrateButton}
                    onPress={triggerCelebration}
                  >
                    <Text style={styles.celebrateButtonText}>🎉 Celebrate!</Text>
                  </TouchableOpacity>
                )}
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const { width } = Dimensions.get('window');

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  filterScroll: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.full,
    backgroundColor: Colors.neutral[100],
    borderWidth: 1,
    borderColor: Colors.border.light,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary[500],
    borderColor: Colors.primary[500],
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  filterChipTextSelected: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: Spacing.xl3,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
  recordsList: {
    gap: Spacing.md,
  },
  recordCard: {
    marginBottom: 0,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  exerciseName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    flex: 1,
  },
  muscleGroupBadge: {
    backgroundColor: Colors.secondary[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  muscleGroupText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.secondary[700],
    textTransform: 'capitalize',
  },
  recordsContainer: {
    gap: Spacing.sm,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: Layout.borderRadius.md,
  },
  recordInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  recordRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  recordRankText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary[700],
  },
  recordDetails: {
    flex: 1,
  },
  recordWeight: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  recordReps: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  recordDate: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing.sm,
  },
  celebrateButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.secondary[100],
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
  },
  celebrateButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.secondary[700],
  },
});
