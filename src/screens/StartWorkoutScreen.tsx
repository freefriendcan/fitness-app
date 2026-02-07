import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, CardHeader, CardBody, Button } from '@/components';
import { useWorkout } from '@/hooks/useWorkout';
import { Routes, Colors, Spacing, Typography, Layout } from '@/constants';
import { formatDate, navigateToActiveWorkout, navigateToWorkoutTemplates, navigateToCreateWorkout } from '@/utils';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'StartWorkout'>;

export const StartWorkoutScreen: React.FC<Props> = ({ route, navigation }) => {
  const styles = useMemo(() => getStyles(), []);

  const { templateId } = route.params || {};
  const { templates, createWorkoutFromTemplate, createQuickWorkout, startWorkoutSession } = useWorkout();

  const handleQuickStart = () => {
    const quickWorkout = createQuickWorkout('Quick Workout', []);
    startWorkoutSession(quickWorkout);
    navigateToActiveWorkout(navigation, quickWorkout.id);
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      const workout = createWorkoutFromTemplate(template);
      startWorkoutSession(workout);
      navigateToActiveWorkout(navigation, workout.id);
    }
  };

  const handleBrowseTemplates = () => {
    navigateToWorkoutTemplates(navigation);
  };

  const handleCreateTemplate = () => {
    navigateToCreateWorkout(navigation);
  };

  const renderTemplate = ({ item }: { item: typeof templates[0] }) => (
    <View key={item.id}>
      <Card
        variant="outlined"
        padding="md"
        style={styles.templateCard}
      >
        <View style={styles.templateHeader}>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{item.name}</Text>
            <Text style={styles.templateMeta}>
              {item.exercises.length} exercise{item.exercises.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Button
            onPress={() => handleSelectTemplate(item.id)}
            variant="outline"
            size="sm"
            style={styles.selectButton}
          >
            Start
          </Button>
        </View>
        {item.description && (
          <Text style={styles.templateDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.exerciseList}>
          {item.exercises.slice(0, 3).map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseTag}>
              <Text style={styles.exerciseTagText}>
                {index + 1}. {exercise.name}
              </Text>
            </View>
          ))}
          {item.exercises.length > 3 && (
            <Text style={styles.moreExercisesText}>
              +{item.exercises.length - 3} more
            </Text>
          )}
        </View>
      </Card>
    </View>
  );

  const templateList = templateId
    ? templates.filter((t) => t.id === templateId)
    : templates;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Quick Start Section */}
      <Card style={styles.quickStartCard}>
        <CardHeader>
          <Text style={styles.sectionTitle}>Quick Start</Text>
          <Text style={styles.sectionSubtitle}>
            Start an empty workout and add exercises as you go
          </Text>
        </CardHeader>
        <CardBody>
          <Button
            onPress={handleQuickStart}
            variant="primary"
            fullWidth
            icon={<Text style={styles.buttonIcon}>⚡</Text>}
          >
            Quick Start
          </Button>
        </CardBody>
      </Card>

      {/* Templates Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Workout Templates</Text>
            <Text style={styles.sectionSubtitle}>
              {templates.length} template{templates.length !== 1 ? 's' : ''} available
            </Text>
          </View>
        </View>

        {templateList.length > 0 ? (
          <>
            <FlatList
              data={templateList}
              renderItem={renderTemplate}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
              ListFooterComponent={() => (
                <View style={{ height: Spacing.md }} />
              )}
            />
            {templates.length > 3 && !templateId && (
              <Button
                onPress={handleBrowseTemplates}
                variant="outline"
                fullWidth
              >
                Browse All Templates
              </Button>
            )}
          </>
        ) : (
          <Card variant="outlined" padding="lg" style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No templates yet</Text>
            <Text style={styles.emptyText}>
              Create workout templates to quickly start your workouts
            </Text>
            <Button
              onPress={handleCreateTemplate}
              variant="primary"
              style={styles.createButton}
            >
              Create Template
            </Button>
          </Card>
        )}
      </View>

      {/* Browse More Section */}
      {!templateId && templates.length > 0 && (
        <View style={styles.section}>
          <Card variant="outlined" padding="lg">
            <Text style={styles.browseTitle}>Want more options?</Text>
            <Text style={styles.browseText}>
              Browse your full template library or create a new custom workout
            </Text>
            <View style={styles.browseActions}>
              <Button
                onPress={handleBrowseTemplates}
                variant="outline"
                style={styles.browseButton}
              >
                Browse Templates
              </Button>
              <Button
                onPress={handleCreateTemplate}
                variant="outline"
                style={styles.browseButton}
              >
                Create New
              </Button>
            </View>
          </Card>
        </View>
      )}

      {/* Tips Section */}
      <View style={styles.section}>
        <Card variant="outlined" padding="lg" style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Workout Tips</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>💡</Text>
            <Text style={styles.tipText}>
              Use templates to save time on recurring workout routines
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>⏱️</Text>
            <Text style={styles.tipText}>
              Track rest times between sets for optimal performance
            </Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipBullet}>📊</Text>
            <Text style={styles.tipText}>
              Log your sets to track progress and personal records
            </Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const getStyles = () => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl3,
  },
  quickStartCard: {
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  buttonIcon: {
    fontSize: Typography.fontSize.base,
  },
  templateCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary[500],
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  templateMeta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  selectButton: {
    minWidth: 70,
  },
  templateDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.relaxed,
  },
  exerciseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  exerciseTag: {
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  exerciseTagText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary[700],
    fontWeight: Typography.fontWeight.medium,
  },
  moreExercisesText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    alignSelf: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  createButton: {
    minWidth: 180,
  },
  browseTitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  browseText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.lineHeight.relaxed,
  },
  browseActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  browseButton: {
    flex: 1,
  },
  tipsCard: {
    backgroundColor: Colors.secondary[50],
  },
  tipsTitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  tipBullet: {
    fontSize: Typography.fontSize.base,
    marginRight: Spacing.sm,
    marginTop: Spacing.xs,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.relaxed,
  },
});
